"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const vehicleSchema = z.object({
  brand_id: z.string().uuid(),
  model: z.string().min(2),
  year_fab: z.number(),
  year_model: z.number(),
  version: z.string().optional(),
  price: z.number(),
  mileage: z.number(),
  color: z.string().optional(),
  transmission: z.string(),
  fuel: z.string(),
  description: z.string().optional(),
  optionals: z.array(z.string()).optional(),
  status: z.string(),
  is_featured: z.boolean(),
  accepts_proposal: z.boolean(),
});

function generateSlug(brand: string, model: string, year: number, id: string) {
  const base = `${brand}-${model}-${year}`.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${id.substring(0, 4)}`;
}

export async function saveVehicle(formData: any, vehicleId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado");

  const validated = vehicleSchema.parse(formData);
  
  // Get brand name for slug
  const { data: brand } = await supabase.from("brands").select("name").eq("id", validated.brand_id).single();
  
  const idValue = vehicleId || crypto.randomUUID();
  const slug = generateSlug(brand?.name || "carro", validated.model, validated.year_model, idValue);

  const vehicleData = {
    ...validated,
    id: idValue,
    slug,
    seller_id: user.id,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("vehicles")
    .upsert(vehicleData);

  if (error) throw error;

  revalidatePath("/catalogo");
  revalidatePath(`/veiculo/${slug}`);
  revalidatePath("/dashboard/veiculos");
  
  return { success: true, id: idValue, slug };
}

export async function deleteVehicle(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  
  if (error) throw error;
  
  revalidatePath("/catalogo");
  revalidatePath("/dashboard/veiculos");
}

export async function deletePhoto(photoId: string, storagePath: string) {
  const supabase = await createClient();
  
  // Remove from DB
  await supabase.from("vehicle_photos").delete().eq("id", photoId);
  
  // Remove from Storage
  await supabase.storage.from("vehicle-photos").remove([storagePath]);
}
