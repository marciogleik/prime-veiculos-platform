"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function inviteSellerAction(formData: {
  email: string;
  name: string;
  whatsapp: string;
  isAdmin: boolean;
}) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // 1. Check if requester is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const { data: requester } = await supabase
    .from("sellers")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!requester?.is_admin) throw new Error("Apenas administradores podem convidar membros.");

  // 2. Find user in auth.users by email
  const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
  
  if (listError) throw new Error("Erro ao listar usuários");

  const targetUser = users.find(u => u.email === formData.email);

  if (!targetUser) {
    throw new Error("Usuário não encontrado. O membro deve primeiro criar uma conta na plataforma.");
  }

  // 3. Upsert into public.sellers
  const { error: upsertError } = await adminClient
    .from("sellers")
    .upsert({
      id: targetUser.id,
      name: formData.name,
      whatsapp: formData.whatsapp,
      is_admin: formData.isAdmin,
      is_active: true,
    });

  if (upsertError) throw new Error("Erro ao atualizar permissões");

  revalidatePath("/dashboard/vendedores");
  return { success: true };
}

export async function toggleSellerStatusAction(id: string, active: boolean) {
  const supabase = await createClient();
  
  // Basic check (more robust RLS could also handle this)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const { error } = await supabase
    .from("sellers")
    .update({ is_active: active })
    .eq("id", id);

  if (error) throw new Error("Erro ao alterar status");
  
  revalidatePath("/dashboard/vendedores");
  return { success: true };
}
