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
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { saveVehicle } from "@/app/(admin)/dashboard/veiculos/actions";
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
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

const BRAND_SUGGESTIONS = [
  "Porsche", "BMW", "Mercedes-Benz", "Mercedes-AMG", "Audi", "Lamborghini",
  "Ferrari", "McLaren", "Bentley", "Rolls-Royce", "Maserati", "Jaguar",
  "Land Rover", "Lexus", "Toyota", "Honda", "Volkswagen", "Chevrolet",
  "Ford", "Hyundai", "Kia", "Volvo", "Alfa Romeo",
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
  const [brandInput, setBrandInput] = useState(initialData?.brand?.name || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [photos, setPhotos] = useState<any[]>(
    initialData?.photos?.map((p) => ({
      id: p.id,
      url: p.url,
      storage_path: p.storage_path,
    })) || []
  );

  const filteredSuggestions = BRAND_SUGGESTIONS.filter(
    (b) => b.toLowerCase().includes(brandInput.toLowerCase()) && brandInput.length > 0
  );

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          brand_id: initialData.brand_id,
          status: initialData.status as any,
          transmission: initialData.transmission as any,
          fuel: initialData.fuel as any,
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
      const result = await saveVehicle(data, initialData?.id);

      if (result.success) {
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main fields */}
        <div className="lg:col-span-8 space-y-8">
          {/* Informações Básicas */}
          <Card className="rounded-3xl border-none shadow-sm">
            <CardContent className="p-8 space-y-8">
              <h2 className="text-xl font-display font-bold">Informações Básicas</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Brand */}
                <div className="space-y-2 relative">
                  <Label>Marca</Label>
                  {brands.length > 0 ? (
                    <Select
                      defaultValue={watch("brand_id") ?? undefined}
                      onValueChange={(val) => setValue("brand_id", val as string)}
                    >
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Selecione a marca..." />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
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
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                        placeholder="Ex: Porsche, BMW, Mercedes..."
                        className="h-12 rounded-xl"
                      />
                      {showSuggestions && filteredSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                          {filteredSuggestions.map((b) => (
                            <button
                              key={b}
                              type="button"
                              className="w-full text-left px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
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
                    <p className="text-xs text-red-500">{errors.brand_id.message}</p>
                  )}
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input
                    {...register("model")}
                    placeholder="Ex: 911 GT3 RS"
                    className="h-12 rounded-xl"
                  />
                  {errors.model && (
                    <p className="text-xs text-red-500">{errors.model.message}</p>
                  )}
                </div>

                {/* Version */}
                <div className="space-y-2">
                  <Label>Versão</Label>
                  <Input
                    {...register("version")}
                    placeholder="Ex: Pacote Weissach · 525cv"
                    className="h-12 rounded-xl"
                  />
                </div>

                {/* Year */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ano Fab.</Label>
                    <Input
                      {...register("year_fab")}
                      type="number"
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ano Modelo</Label>
                    <Input
                      {...register("year_model")}
                      type="number"
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fotos */}
          <Card className="rounded-3xl border-none shadow-sm">
            <CardContent className="p-8">
              <FotoUpload onPhotosChange={setPhotos} initialPhotos={photos} />
            </CardContent>
          </Card>

          {/* Especificações Técnicas */}
          <Card className="rounded-3xl border-none shadow-sm">
            <CardContent className="p-8 space-y-8">
              <h2 className="text-xl font-display font-bold">Especificações Técnicas</h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Preço (R$)</Label>
                  <Input {...register("price")} type="number" className="h-12 rounded-xl" />
                  {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Quilometragem</Label>
                  <Input {...register("mileage")} type="number" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Input {...register("color")} placeholder="Ex: Branco Carrara" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Câmbio</Label>
                  <Select
                    defaultValue={watch("transmission")}
                    onValueChange={(v) => setValue("transmission", v as any)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automático">Automático</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Combustível</Label>
                  <Select
                    defaultValue={watch("fuel")}
                    onValueChange={(v) => setValue("fuel", v as any)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flex">Flex</SelectItem>
                      <SelectItem value="Gasolina">Gasolina</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Elétrico">Elétrico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label>Descrição do Veículo</Label>
                <Textarea
                  {...register("description")}
                  placeholder="Descreva os detalhes, diferenciais e história do veículo..."
                  className="min-h-[120px] resize-none rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-3xl border-none shadow-sm sticky top-32">
            <CardContent className="p-8 space-y-8">
              <h3 className="text-base font-display font-bold">Publicação</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <Label className="cursor-pointer font-bold text-sm">Destaque na Home</Label>
                    <p className="text-xs text-gray-400 mt-0.5">Exibe no grid principal</p>
                  </div>
                  <Checkbox
                    checked={watch("is_featured")}
                    onCheckedChange={(c) => setValue("is_featured", !!c)}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <Label className="cursor-pointer font-bold text-sm">Aceita Proposta</Label>
                    <p className="text-xs text-gray-400 mt-0.5">Habilita botão no site</p>
                  </div>
                  <Checkbox
                    checked={watch("accepts_proposal")}
                    onCheckedChange={(c) => setValue("accepts_proposal", !!c)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status do Veículo</Label>
                <Select
                  defaultValue={watch("status")}
                  onValueChange={(v) => setValue("status", v as any)}
                >
                  <SelectTrigger className="h-12 rounded-xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponível">✅ Disponível</SelectItem>
                    <SelectItem value="reservado">🔒 Reservado</SelectItem>
                    <SelectItem value="vendido">✔️ Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full h-14 font-bold text-base rounded-2xl shadow-xl shadow-primary/20 gap-2"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {initialData ? "SALVAR ALTERAÇÕES" : "PUBLICAR VEÍCULO"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
