
'use server';

import { syncInventoryFromXML } from '@/lib/integrations/revenda-mais';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function syncInventoryAction() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, errors: ['Não autorizado.'] };
  }

  // Verifica se é administrador (opcional, mas recomendado)
  const { data: seller } = await supabase.from('sellers').select('is_admin').eq('id', user.id).single();
  if (!seller?.is_admin) {
    // Se o usuário não for admin, você pode decidir se permite a sincronia ou não
    // Para simplificar agora, permitiremos apenas para usuários autenticados
  }

  try {
    const result = await syncInventoryFromXML();
    
    // Limpa o cache para que os novos veículos apareçam imediatamente
    revalidatePath('/catalogo');
    revalidatePath('/dashboard/veiculos');
    
    return result;
  } catch (err: any) {
    return { success: false, errors: [err.message], imported: 0, updated: 0 };
  }
}
