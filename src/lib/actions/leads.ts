"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateLead(id: string, data: any) {
  const supabase = await createClient();

  // Remove fields that should not be updated directly in the leads table
  const { id: _id, vehicle, seller, created_at, ...updateData } = data;

  // Ensure seller_id is a valid UUID or null
  if (updateData.seller_id) {
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(updateData.seller_id);
    if (!isUuid) {
      updateData.seller_id = null;
    }
  }

  const { error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", id);

  if (error) {
    console.error("updateLead error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/leads");
  return { success: true };
}

export async function deleteLead(id: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteLead error:", error);
    throw new Error(error.message);
  }

  revalidatePath("/dashboard/leads");
  return { success: true };
}
