"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getSiteSettingsAction() {
  const supabase = await createClient();
  
  // 1. Buscar configurações
  const { data: settingsData, error: settingsError } = await supabase
    .from("site_settings")
    .select("*")
    .single();

  // 2. Buscar estatísticas da equipe
  const { data: teamData, error: teamError } = await supabase
    .from("sellers")
    .select("is_admin");

  const stats = {
    admins: teamData?.filter(s => s.is_admin).length || 0,
    sellers: teamData?.filter(s => !s.is_admin).length || 0,
    total: teamData?.length || 0
  };

  if (settingsError) {
    console.error("Erro ao buscar configurações:", settingsError);
    return {
      dealership_name: "Prime Veículos",
      dealership_whatsapp: "",
      dealership_email: "",
      dealership_address: "",
      dealership_cnpj: "",
      is_cpf_api_active: false,
      teamStats: stats
    };
  }

  return { ...settingsData, teamStats: stats };
}

export async function updateSiteSettingsAction(formData: any) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autorizado");

  const { data: seller } = await supabase
    .from("sellers")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!seller?.is_admin) {
    throw new Error("Apenas administradores podem alterar as configurações do sistema.");
  }

  // Removemos o is_cpf_api_active daqui para garantir segurança (lockdown)
  // O administrador não consegue mudar isso via formulário comum se quisermos travar no código
  const { error } = await supabase
    .from("site_settings")
    .upsert({
      id: formData.id || undefined,
      dealership_name: formData.dealership_name,
      dealership_whatsapp: formData.dealership_whatsapp,
      dealership_email: formData.dealership_email,
      dealership_address: formData.dealership_address,
      dealership_cnpj: formData.dealership_cnpj,
      updated_at: new Date().toISOString(),
    });

  if (error) throw new Error("Falha ao salvar configurações.");
  
  revalidatePath("/dashboard/configuracoes");
  return { success: true };
}

export async function changePasswordAction(password: string) {
  const supabase = await createClient();
  
  const { error } = await supabase.auth.updateUser({
    password: password
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
