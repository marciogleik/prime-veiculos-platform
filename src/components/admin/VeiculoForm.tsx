"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Vehicle, Brand } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import FotoUpload from "./FotoUpload";
import { Loader2, Save, Car, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveVehicle } from "@/lib/actions/vehicles";
import { createClient } from "@/lib/supabase/client";

const vehicleSchema = z.object({
  brand_id: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(2, "Modelo obrigatório"),
  year_fab: z.coerce.number().min(1900),
  year_model: z.coerce.number().min(1900),
  version: z.string().optional(),
  price: z.coerce.number().min(100),
  mileage: z.coerce.number().min(0),
  color: z.string().optional(),
  transmission: z.enum(["Manual", "Automático", "CVT"]),
  fuel: z.enum(["Flex", "Gasolina", "Elétrico", "Diesel"]),
  description: z.string().optional(),
  optionals: z.array(z.string()).optional(),
  status: z.enum(["disponível", "reservado", "vendido"]),
  is_featured: z.boolean().default(false),
  accepts_proposal: z.boolean().default(false),
  plate: z.string().max(8, "Placa inválida").optional().nullable(),
  renavam: z.string().max(11, "Renavam inválido").optional().nullable(),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

const BRAND_SUGGESTIONS = [
  "Porsche", "BMW", "Mercedes-Benz", "Mercedes-AMG", "Audi", "Lamborghini",
  "Ferrari", "McLaren", "Bentley", "Rolls-Royce", "Maserati", "Jaguar",
  "Land Rover", "Lexus", "Toyota", "Honda", "Volkswagen", "Chevrolet",
  "Ford", "Hyundai", "Kia", "Volvo", "Alfa Romeo",
];

const PREMIUM_OPTIONALS = [
  "Banco em Couro", "Teto Solar", "Rodas Aro 20+", "Sistema de Som Premium", 
  "Faróis Full LED", "Câmera 360", "Park Assist", "Controle de Cruzeiro Adaptativo", 
  "Assistente de Faixa", "Head-up Display", "Pacote Esportivo", "Volante Multifuncional", 
  "Conexão Bluetooth", "Apple CarPlay", "Android Auto"
];

export default function VeiculoForm({
  initialData,
  brands,
}: {
  initialData?: Vehicle;
  brands: Brand[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [removedPhotoIds, setRemovedPhotoIds] = useState<{id: string, path: string}[]>([]);
  const [brandInput, setBrandInput] = useState(initialData?.brand?.name || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [photos, setPhotos] = useState<any[]>(
    initialData?.photos?.map((p) => ({
      id: p.id,
      url: p.url,
      storage_path: p.storage_path,
    })) || []
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [displayPrice, setDisplayPrice] = useState(initialData?.price ? (initialData.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : "");
  const [displayKm, setDisplayKm] = useState(initialData?.mileage ? initialData.mileage.toLocaleString('pt-BR') : "");

  const filteredSuggestions = BRAND_SUGGESTIONS.filter(
    (b) => b.toLowerCase().includes(brandInput.toLowerCase()) && brandInput.length > 0
  );

  // Resolve brand_id: mock vehicles use names like "porsche" instead of UUIDs
  const resolvedBrandId = (() => {
    const bid = initialData?.brand_id;
    if (!bid) return "";
    
    // If it's already a UUID, use as is
    if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(bid)) {
      return bid;
    }
    
    // Fuzzy search: try exact match first
    let match = brands.find(b => b.name.toLowerCase() === bid.toLowerCase());
    
    // If no exact match, try if DB brand is contained in mock brand string
    if (!match) {
      match = brands.find(b => bid.toLowerCase().includes(b.name.toLowerCase()));
    }
    
    // Or if mock brand is contained in DB brand
    if (!match) {
      match = brands.find(b => b.name.toLowerCase().includes(bid.toLowerCase()));
    }
    
    return match?.id || ""; // Return found UUID or empty string (to force selection)
  })();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          brand_id: resolvedBrandId,
          status: initialData.status as any,
          transmission: initialData.transmission as any,
          fuel: initialData.fuel as any,
          plate: initialData.plate || "",
          renavam: initialData.renavam || "",
        }
      : {
          status: "disponível",
          transmission: "Automático",
          fuel: "Flex",
          optionals: [],
          brand_id: "",
          year_fab: new Date().getFullYear(),
          year_model: new Date().getFullYear(),
          mileage: 0,
        },
  });

  const onSubmit = async (data: VehicleFormValues) => {
    setLoading(true);
    try {
      // If it's a mock vehicle, we treat it as a NEW creation (don't pass initialData.id)
      const saveId = initialData?.id?.startsWith("mock-") ? undefined : initialData?.id;
      const result = await saveVehicle(data, saveId);

      if (result.success) {
        // 1. Delete removed photos from Supabase
        for (const photo of removedPhotoIds) {
          await supabase.from("vehicle_photos").delete().eq("id", photo.id);
          await supabase.storage.from("vehicle-photos").remove([photo.path]);
        }

        // 2. Handle current photos (Upload new ones, Update order of existing ones)
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          if (photo.file) {
            const fileExt = photo.file.name.split(".").pop();
            const fileName = `${result.id}/${Math.random()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from("vehicle-photos")
              .upload(fileName, photo.file);

            if (uploadError) throw uploadError;

            const {
              data: { publicUrl },
            } = supabase.storage.from("vehicle-photos").getPublicUrl(fileName);

            await supabase.from("vehicle_photos").insert({
              vehicle_id: result.id,
              url: publicUrl,
              storage_path: fileName,
              order_index: i,
            });
          } else {
            await supabase
              .from("vehicle_photos")
              .update({ order_index: i })
              .eq("id", photo.id);
          }
        }

        router.push("/dashboard/veiculos");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao salvar veículo");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotosChange = (newPhotos: any[]) => {
    // Identify which existing photos were removed
    const removed = photos.filter(p => p.id && !newPhotos.find(np => np.id === p.id));
    
    // Store their IDs and storage paths for deletion on submit
    const photoDeletions = removed
      .filter(p => p.storage_path)
      .map(p => ({ id: p.id, path: p.storage_path }));
    
    setRemovedPhotoIds(prev => [...prev, ...photoDeletions]);
    setPhotos(newPhotos);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 sm:space-y-12 pb-10 sm:pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
        {/* Main fields */}
        <div className="lg:col-span-8 space-y-6 sm:space-y-8">
          {/* Informações Básicas */}
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Car className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-display font-black tracking-tight text-slate-900">Informações Básicas</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                {/* Brand */}
                <div className="space-y-2 relative">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Marca</Label>
                  {brands.length > 0 ? (
                    <Select
                      value={watch("brand_id") ?? undefined}
                      onValueChange={(val) => {
                        setValue("brand_id", val as string);
                        const sel = brands.find(b => b.id === val);
                        if (sel) setBrandInput(sel.name);
                      }}
                    >
                      <SelectTrigger className="h-12 sm:h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-primary/20 transition-all font-bold text-gray-900">
                        <SelectValue placeholder="Selecione a marca...">
                          {brands.find(b => b.id === watch("brand_id"))?.name}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl shadow-2xl border-gray-100 bg-white dark:bg-slate-900 opacity-100 relative z-[70] min-w-[200px]">
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id} className="rounded-xl py-3 font-bold">
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <Input
                        value={brandInput}
                        onChange={(e) => {
                          setBrandInput(e.target.value);
                          setValue("brand_id", e.target.value);
                          setShowSuggestions(true);
                        }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Ex: Porsche, BMW..."
                        className="h-12 sm:h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-primary/20 transition-all font-bold text-gray-900"
                      />
                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto p-2">
                          {filteredSuggestions.map((b) => (
                            <button
                              key={b}
                              type="button"
                              className="w-full text-left px-4 py-3 text-sm font-bold rounded-xl hover:bg-primary/5 hover:text-primary transition-all mb-1"
                              onMouseDown={() => {
                                setBrandInput(b);
                                setValue("brand_id", b);
                                setShowSuggestions(false);
                              }}
                            >
                              {b}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {errors.brand_id && (
                    <p className="text-[10px] sm:text-xs text-red-500 font-bold ml-1">{errors.brand_id.message}</p>
                  )}
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Modelo</Label>
                  <Input
                    {...register("model")}
                    placeholder="Ex: 911 GT3 RS"
                    className="h-12 sm:h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-primary/20 transition-all font-bold"
                  />
                  {errors.model && (
                    <p className="text-[10px] sm:text-xs text-red-500 font-bold ml-1">{errors.model.message}</p>
                  )}
                </div>

                {/* Version */}
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Versão / Detalhes</Label>
                  <Input
                    {...register("version")}
                    placeholder="Ex: Pacote Weissach · 525cv"
                    className="h-12 sm:h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-primary/20 transition-all font-bold"
                  />
                </div>

                {/* Year */}
                <div className="grid grid-cols-2 gap-4 sm:col-span-2">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ano Fab.</Label>
                    <Input
                      {...register("year_fab")}
                      type="number"
                      className="h-12 sm:h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-primary/20 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Ano Modelo</Label>
                    <Input
                      {...register("year_model")}
                      type="number"
                      className="h-12 sm:h-14 rounded-2xl border-gray-100 bg-gray-50/50 focus:ring-primary/20 transition-all font-bold"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fotos */}
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
            <CardContent className="p-6 sm:p-8">
              <FotoUpload onPhotosChange={handlePhotosChange} initialPhotos={photos} />
            </CardContent>
          </Card>

          {/* Especificações Técnicas */}
          <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                  <Settings className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-display font-black tracking-tight text-slate-900">Especificações Técnicas</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                <div className="space-y-2 lg:col-span-1">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Preço (R$)</Label>
                  <Input 
                    value={displayPrice}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const num = Number(value) / 100;
                      setDisplayPrice(num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
                      setValue("price", num);
                    }}
                    type="text" 
                    placeholder="R$ 0,00"
                    className="h-12 sm:h-14 rounded-2xl border-gray-100 bg-primary/5 text-primary font-black text-lg focus:ring-primary/20 transition-all" 
                  />
                  {errors.price && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Quilometragem</Label>
                  <Input 
                    value={displayKm}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      const num = Number(value);
                      setDisplayKm(num.toLocaleString('pt-BR'));
                      setValue("mileage", num);
                    }}
                    type="text" 
                    placeholder="0 km"
                    className="h-12 sm:h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" 
                  />
                  {errors.mileage && <p className="text-[9px] text-red-500 font-bold ml-1">{errors.mileage.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Cor</Label>
                  <Input {...register("color")} placeholder="Ex: Branco Carrara" className="h-12 sm:h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Câmbio</Label>
                  <Select
                    defaultValue={watch("transmission")}
                    onValueChange={(v) => setValue("transmission", v as any)}
                  >
                    <SelectTrigger className="h-12 sm:h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl border-gray-100">
                      <SelectItem value="Manual" className="rounded-xl py-3 font-bold">Manual</SelectItem>
                      <SelectItem value="Automático" className="rounded-xl py-3 font-bold">Automático</SelectItem>
                      <SelectItem value="CVT" className="rounded-xl py-3 font-bold">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Combustível</Label>
                  <Select
                    defaultValue={watch("fuel")}
                    onValueChange={(v) => setValue("fuel", v as any)}
                  >
                    <SelectTrigger className="h-12 sm:h-14 rounded-2xl border-gray-100 bg-gray-50/50 font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl shadow-2xl border-gray-100">
                      <SelectItem value="Flex" className="rounded-xl py-3 font-bold">Flex</SelectItem>
                      <SelectItem value="Gasolina" className="rounded-xl py-3 font-bold">Gasolina</SelectItem>
                      <SelectItem value="Diesel" className="rounded-xl py-3 font-bold">Diesel</SelectItem>
                      <SelectItem value="Elétrico" className="rounded-xl py-3 font-bold">Elétrico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Opcionais */}
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Opcionais (Tags Mágicas)</Label>
                <div className="flex flex-wrap gap-2">
                  {PREMIUM_OPTIONALS.map(opt => {
                    const currentOptionals = watch("optionals") || [];
                    const isSelected = currentOptionals.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => {
                          const newOptionals = isSelected 
                            ? currentOptionals.filter(o => o !== opt)
                            : [...currentOptionals, opt];
                          setValue("optionals", newOptionals);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected 
                            ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105" 
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Descrição Detalhada</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsGeneratingAi(true);
                      const brand = brandInput || "Veículo Exclusivo";
                      const model = watch("model") || "";
                      const version = watch("version") || "";
                      const year = watch("year_model") || "";
                      const km = watch("mileage") ? `${watch("mileage")} km` : "0 km";
                      const optionals = watch("optionals")?.join(", ") || "";
                      setTimeout(() => {
                        setValue("description", `Uma obra prima sobre rodas. Este incrível ${brand} ${model} ${version} ${year} alia performance, requinte e sofisticação inigualável.\n\nCom apenas ${km}, o veículo encontra-se em estado impecável, configurado com maestria.\n\nDestaques desta unidade:\n${optionals ? optionals.split(", ").map(opt => `• ${opt}`).join("\n") : "• Configuração Exclusiva"}\n\nDisponível no showroom da Prime Veículos para você viver a verdadeira Premium Experience.`);
                        setIsGeneratingAi(false);
                      }, 1000);
                    }}
                    disabled={isGeneratingAi}
                    className="h-8 bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100 rounded-lg text-[10px] font-black uppercase tracking-widest"
                  >
                    {isGeneratingAi ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : "🪄 Gerar Texto Mágico"}
                  </Button>
                </div>
                <Textarea
                  {...register("description")}
                  placeholder="Descreva os diferenciais, opcionais e história do veículo..."
                  className="min-h-[160px] sm:min-h-[200px] resize-none rounded-2xl border-gray-100 bg-gray-50/30 p-5 font-medium leading-relaxed focus:ring-primary/10 transition-all"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-lg lg:sticky lg:top-28 overflow-hidden bg-slate-900 text-white">
            <CardContent className="p-6 sm:p-8 space-y-6 sm:space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                  <Save className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-display font-black tracking-tight">Publicação</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <Label className="cursor-pointer font-black text-sm block">Destaque na Home</Label>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">Página Inicial</p>
                  </div>
                  <Checkbox
                    checked={watch("is_featured")}
                    onCheckedChange={(c) => setValue("is_featured", !!c)}
                    className="border-white/20 data-[state=checked]:bg-primary rounded-md w-5 h-5"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                  <div>
                    <Label className="cursor-pointer font-black text-sm block">Aceita Proposta</Label>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wide">Botão no Site</p>
                  </div>
                  <Checkbox
                    checked={watch("accepts_proposal")}
                    onCheckedChange={(c) => setValue("accepts_proposal", !!c)}
                    className="border-white/20 data-[state=checked]:bg-primary rounded-md w-5 h-5"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status Público</Label>
                <Select
                  defaultValue={watch("status")}
                  onValueChange={(v) => setValue("status", v as any)}
                >
                  <SelectTrigger className="h-14 rounded-2xl font-black bg-white/10 border-white/10 hover:bg-white/15 transition-all text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-white/10 bg-slate-900 text-white">
                    <SelectItem value="disponível" className="rounded-xl py-3 font-black text-sm focus:bg-primary/20">✅ Disponível</SelectItem>
                    <SelectItem value="reservado" className="rounded-xl py-3 font-black text-sm focus:bg-primary/20">🔒 Reservado</SelectItem>
                    <SelectItem value="vendido" className="rounded-xl py-3 font-black text-sm focus:bg-primary/20">✔️ Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Controle Interno (Privado)</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase text-gray-500 ml-1">Placa</Label>
                    <Input 
                      {...register("plate")} 
                      placeholder="ABC-1D23"
                      className="h-11 rounded-xl bg-white/5 border-white/10 text-white font-bold uppercase placeholder:text-white/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[9px] font-bold uppercase text-gray-500 ml-1">Renavam</Label>
                    <Input 
                      {...register("renavam")} 
                      placeholder="000...000"
                      className="h-11 rounded-xl bg-white/5 border-white/10 text-white font-bold placeholder:text-white/20"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="h-16 sm:h-20 font-black text-xs sm:text-sm rounded-2xl sm:rounded-3xl border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all uppercase tracking-widest"
                  disabled={loading}
                >
                  CANCELAR
                </Button>
                <Button
                  type="submit"
                  className="w-full h-16 sm:h-20 font-black text-base sm:text-lg rounded-2xl sm:rounded-3xl shadow-2xl shadow-primary/40 gap-3 bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Save className="w-6 h-6" />
                  )}
                  SALVAR
                </Button>
              </div>
            </CardContent>
          </Card>

          <p className="px-6 text-[10px] text-center text-gray-400 font-bold uppercase tracking-[0.2em] leading-relaxed">
            Ao salvar, o veículo será atualizado instantaneamente no catálogo público para seus clientes.
          </p>
        </div>
      </div>
    </form>
  );
}
