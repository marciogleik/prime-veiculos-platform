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
  // Using admin client to list users and find the target by email (case-insensitive)
  const { data: { users }, error: listError } = await adminClient.auth.admin.listUsers();
  
  if (listError) {
    console.error("Erro listing users:", listError);
    throw new Error("Erro ao acessar diretório de usuários.");
  }

  const targetUser = users.find(u => u.email?.toLowerCase() === formData.email.toLowerCase());

  if (!targetUser) {
    throw new Error("E-mail não encontrado. O membro deve primeiro criar uma conta na plataforma ou o e-mail está incorreto.");
  }

  // 3. Upsert into public.sellers
  // We include the 'email' column which should have been added via SQL migration
  const { error: upsertError } = await adminClient
    .from("sellers")
    .upsert({
      id: targetUser.id,
      name: formData.name,
      email: formData.email.toLowerCase(),
      whatsapp: formData.whatsapp,
      is_admin: formData.isAdmin,
      is_active: true,
      updated_at: new Date().toISOString(),
    });

  if (upsertError) {
    console.error("Erro no upsert de vendedor:", upsertError);
    throw new Error("Erro ao salvar permissões no banco de dados. Verifique se a coluna 'email' foi adicionada.");
  }

  revalidatePath("/dashboard/vendedores");
  revalidatePath("/dashboard/configuracoes"); // Update stats in settings too
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
