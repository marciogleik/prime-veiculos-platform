"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const vehicleSchema = z.object({
  brand_id: z.string().min(1),
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
  
  // Resolve or create brand
  let finalBrandId = validated.brand_id;
  let brandName = "Carro";
  
  // Check if brand_id is actually a UUID. If not, try to find or create the brand by name.
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(finalBrandId);
  
  if (isUuid) {
    const { data: b } = await supabase.from("brands").select("id, name").eq("id", finalBrandId).single();
    if (b) {
      brandName = b.name;
    }
  } else {
    // Try to find by name, case-insensitive, or create
    const { data: existingBrand } = await supabase.from("brands").select("id, name").ilike("name", finalBrandId).maybeSingle();
    if (existingBrand) {
      finalBrandId = existingBrand.id;
      brandName = existingBrand.name;
    } else {
       // Insert new brand
       const { data: newBrand, error: brandErr } = await supabase.from("brands").insert({
          id: crypto.randomUUID(),
          name: finalBrandId,
          slug: finalBrandId.toLowerCase().replace(/\s+/g, '-'),
       }).select("id, name").single();
       
       if (!brandErr && newBrand) {
          finalBrandId = newBrand.id;
          brandName = newBrand.name;
       }
    }
  }
  
  const idValue = vehicleId || crypto.randomUUID();
  const slug = generateSlug(brandName, validated.model, validated.year_model, idValue);

  const vehicleData = {
    ...validated,
    brand_id: finalBrandId,
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
