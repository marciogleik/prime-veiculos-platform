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
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import FotoUpload from "./FotoUpload";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";

const vehicleSchema = z.object({
  brand_id: z.string().uuid("Selecione a marca"),
  model: z.string().min(2, "Modelo obrigatório"),
  year_fab: z.coerce.number().min(1900),
  year_model: z.coerce.number().min(1900),
  version: z.string().optional(),
  price: z.coerce.number().min(100),
  mileage: z.coerce.number().min(0),
  color: z.string().optional(),
  transmission: z.enum(['Manual', 'Automático', 'CVT']),
  fuel: z.enum(['Flex', 'Gasolina', 'Elétrico', 'Diesel']),
  description: z.string().optional(),
  optionals: z.array(z.string()).optional(),
  status: z.enum(['disponível', 'reservado', 'vendido']),
  is_featured: z.boolean().default(false),
  accepts_proposal: z.boolean().default(false),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

const OPTIONALS_LIST = [
  "Ar-condicionado", "Direção elétrica", "Vidros elétricos", "Teto solar",
  "Multimídia", "Câmera de ré", "Sensor de estacionamento", "Bancos em couro"
];

import { saveVehicle } from "@/app/(admin)/dashboard/veiculos/actions";
import { createClient } from "@/lib/supabase/client";

export default function VeiculoForm({ 
  initialData, 
  brands 
}: { 
  initialData?: Vehicle, 
  brands: Brand[] 
}) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<any[]>(
    initialData?.photos?.map(p => ({
      id: p.id,
      url: p.url,
      storage_path: p.storage_path
    })) || []
  );

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData ? {
      ...initialData,
      // @ts-ignore
      brand_id: initialData.brand_id,
      status: initialData.status as any,
      transmission: initialData.transmission as any,
      fuel: initialData.fuel as any,
    } : {
      status: 'disponível',
      transmission: 'Automático',
      fuel: 'Flex',
      optionals: [],
    }
  });

  const onSubmit = async (data: VehicleFormValues) => {
    setLoading(true);
    try {
      // 1. Save Vehicle (get ID/Slug)
      const result = await saveVehicle(data, initialData?.id);
      
      if (result.success) {
        // 2. Upload new photos to storage
        for (let i = 0; i < photos.length; i++) {
          const photo = photos[i];
          if (photo.file) {
            const fileExt = photo.file.name.split('.').pop();
            const fileName = `${result.id}/${Math.random()}.${fileExt}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("vehicle-photos")
              .upload(fileName, photo.file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
              .from("vehicle-photos")
              .getPublicUrl(fileName);

            // Save photo record to DB
            await supabase.from("vehicle_photos").insert({
              vehicle_id: result.id,
              url: publicUrl,
              storage_path: fileName,
              order_index: i
            });
          } else {
            // Update order index for existing photos
            await supabase.from("vehicle_photos")
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
        <div className="lg:col-span-8 space-y-12">
          {/* Informações Básicas */}
          <Card className="rounded-3xl border-none shadow-sm">
            <CardContent className="p-8 space-y-8">
              <h2 className="text-xl font-display font-bold">Informações Básicas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Select 
                    defaultValue={watch("brand_id")}
                    onValueChange={(val) => setValue("brand_id", val as string)}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.brand_id && <p className="text-xs text-red-500">{errors.brand_id.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Modelo</Label>
                  <Input {...register("model")} placeholder="Ex: Corolla" className="h-12 rounded-xl" />
                  {errors.model && <p className="text-xs text-red-500">{errors.model.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Versão</Label>
                  <Input {...register("version")} placeholder="Ex: Altis Premium Hybrid" className="h-12 rounded-xl" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ano Fab.</Label>
                    <Input {...register("year_fab")} type="number" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ano Modelo</Label>
                    <Input {...register("year_model")} type="number" className="h-12 rounded-xl" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fotos Dashboard (Complex Component) */}
          <Card className="rounded-3xl border-none shadow-sm">
            <CardContent className="p-8">
              <FotoUpload onPhotosChange={setPhotos} />
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
                </div>
                <div className="space-y-2">
                  <Label>Quilometragem</Label>
                  <Input {...register("mileage")} type="number" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Input {...register("color")} placeholder="Ex: Branco" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Câmbio</Label>
                  <Select defaultValue={watch("transmission")} onValueChange={(v) => setValue("transmission", v as any)}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automático">Automático</SelectItem>
                      <SelectItem value="CVT">CVT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Combustível</Label>
                  <Select defaultValue={watch("fuel")} onValueChange={(v) => setValue("fuel", v as any)}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Flex">Flex</SelectItem>
                      <SelectItem value="Gasolina">Gasolina</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Elétrico">Elétrico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <Card className="rounded-3xl border-none shadow-sm sticky top-32">
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer">Destaque na Home</Label>
                  <Checkbox 
                    checked={watch("is_featured")} 
                    onCheckedChange={(c) => setValue("is_featured", !!c)} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="cursor-pointer">Aceita Proposta</Label>
                  <Checkbox 
                    checked={watch("accepts_proposal")} 
                    onCheckedChange={(c) => setValue("accepts_proposal", !!c)} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status do Veículo</Label>
                <Select defaultValue={watch("status")} onValueChange={(v) => setValue("status", v as any)}>
                  <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="disponível">Disponível</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                    <SelectItem value="vendido">Vendido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full h-16 font-bold text-lg rounded-2xl shadow-xl shadow-primary/20 gap-2"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {initialData ? "SALVAR ALTERAÇÕES" : "PUBLICAR VEÍCULO"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
