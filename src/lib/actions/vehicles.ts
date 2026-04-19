"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
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
  plate: z.string().optional().nullable(),
  renavam: z.string().optional().nullable(),
  sync_photos: z.boolean().optional().default(true),
});

function generateSlug(brand: string, model: string, year: number, id: string) {
  const base = `${brand}-${model}-${year}`.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${id.substring(0, 4)}`;
}

export async function saveVehicle(formData: any, vehicleId?: string, photosData?: { url: string, storage_path: string, order_index: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Não autorizado. Faça login novamente.");

  // Basic validation
  const validated = vehicleSchema.parse(formData);
  
  let finalBrandId = validated.brand_id;
  let brandName = "Carro";
  
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(finalBrandId);
  
  if (isUuid) {
    const { data: b } = await supabase.from("brands").select("id, name").eq("id", finalBrandId).single();
    if (b) {
      brandName = b.name;
    }
  } else {
    const { data: allBrands } = await supabase.from("brands").select("id, name");
    const searchName = finalBrandId.toLowerCase().trim();
    const matchedBrand = allBrands?.find(b => {
      const dbName = b.name.toLowerCase();
      return searchName.includes(dbName) || dbName.includes(searchName) || 
             searchName.split(/[\s-]/)[0] === dbName.split(/[\s-]/)[0];
    });

    if (matchedBrand) {
      finalBrandId = matchedBrand.id;
      brandName = matchedBrand.name;
    } else {
       const { data: newBrand, error: brandErr } = await supabase.from("brands").insert({
          id: crypto.randomUUID(),
          name: finalBrandId.trim(),
       }).select("id, name").single();
       
       if (brandErr) throw new Error(`A marca '${finalBrandId}' não pôde ser criada.`);
       if (newBrand) {
          finalBrandId = newBrand.id;
          brandName = newBrand.name;
       }
    }
  }
  
  const { data: seller } = await supabase.from("sellers").select("id").eq("id", user.id).single();
  if (!seller) throw new Error("Usuário vendedor não encontrado.");

  const idValue = (vehicleId && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(vehicleId)) 
    ? vehicleId 
    : crypto.randomUUID();
    
  // Fetch existing external_id to preserve the link with Revenda Mais
  let existingExternalId = null;
  if (vehicleId) {
    const { data: v } = await supabase.from("vehicles").select("external_id").eq("id", idValue).single();
    if (v) existingExternalId = v.external_id;
  }

  const slug = generateSlug(brandName, validated.model, validated.year_model, idValue);

  const vehicleData = {
    id: idValue,
    external_id: existingExternalId,
    brand_id: finalBrandId,
    model: validated.model,
    year_fab: validated.year_fab,
    year_model: validated.year_model,
    version: validated.version || null,
    price: validated.price,
    mileage: validated.mileage,
    color: validated.color || null,
    transmission: validated.transmission,
    fuel: validated.fuel,
    description: validated.description || null,
    optionals: validated.optionals || [],
    status: validated.status,
    is_featured: validated.is_featured,
    accepts_proposal: validated.accepts_proposal,
    plate: validated.plate || null,
    renavam: validated.renavam || null,
    sync_photos: validated.sync_photos,
    slug,
    seller_id: user.id, 
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("vehicles").upsert(vehicleData);
  if (error) throw new Error(`Falha ao salvar veículo: ${error.message}`);

  // PHOTO SYNC (Atomicly handled on server with ADMIN privileges)
  if (photosData) {
    const adminSupabase = createAdminClient();
    
    // 1. Clear current photos for this vehicle strictly in DB (Bypassing RLS)
    const { error: delErr } = await adminSupabase.from("vehicle_photos").delete().eq("vehicle_id", idValue);
    if (delErr) console.error("Erro ao deletar fotos antigas:", delErr.message);

    // 2. Insert new ordered list (Bypassing RLS)
    if (photosData.length > 0) {
      const photosToInsert = photosData.map(p => ({
        vehicle_id: idValue,
        url: p.url,
        storage_path: p.storage_path,
        order_index: p.order_index
      }));
      const { error: insErr } = await adminSupabase.from("vehicle_photos").insert(photosToInsert);
      if (insErr) throw new Error(`Falha ao salvar fotos: ${insErr.message}`);
    }
  }

  revalidatePath("/catalogo");
  revalidatePath(`/veiculo/${slug}`);
  revalidatePath("/dashboard/veiculos");
  
  return { success: true, id: idValue, slug };
}

export async function deleteVehicle(id: string) {
  const adminSupabase = createAdminClient();
  
  // 1. Manually delete leads for this vehicle (resolves FK 23503)
  const { error: leadsErr } = await adminSupabase.from("leads").delete().eq("vehicle_id", id);
  if (leadsErr) console.error("Erro ao limpar leads do veículo:", leadsErr.message);

  // 2. Delete the vehicle (photos will cascade normally)
  const { error } = await adminSupabase.from("vehicles").delete().eq("id", id);
  
  if (error) throw error;
  
  revalidatePath("/catalogo");
  revalidatePath("/dashboard/veiculos");
}

export async function deletePhoto(photoId: string, storagePath: string) {
  const supabase = await createClient();
  
  await supabase.from("vehicle_photos").delete().eq("id", photoId);
  await supabase.storage.from("vehicle-photos").remove([storagePath]);
}

export async function duplicateVehicle(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const { data: v, error: vErr } = await supabase
    .from("vehicles")
    .select("*, brand:brands(name), photos:vehicle_photos(*)")
    .eq("id", id)
    .single();
  if (vErr || !v) throw new Error("Veículo não encontrado");

  const newId = crypto.randomUUID();
  const brandName = v.brand?.name || "Veículo";
  const newSlug = generateSlug(brandName, v.model, v.year_model, newId);

  const { photos, brand, created_at, updated_at, ...rest } = v;
  
  const duplicatedData = {
    ...rest,
    id: newId,
    slug: newSlug,
    plate: null,
    seller_id: user.id,
    status: 'disponível',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error: insErr } = await supabase.from("vehicles").insert(duplicatedData);
  if (insErr) throw insErr;

  if (photos && photos.length > 0) {
    const newPhotos = photos.map((p: any) => ({
      vehicle_id: newId,
      url: p.url,
      storage_path: p.storage_path || "",
      order_index: p.order_index
    }));
    await supabase.from("vehicle_photos").insert(newPhotos);
  }

  revalidatePath("/dashboard/veiculos");
  revalidatePath("/catalogo");
  
  return { success: true, id: newId, slug: newSlug };
}
