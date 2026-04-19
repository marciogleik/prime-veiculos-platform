
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function scanInventory() {
  console.log('--- VARREDURA DE ESTOQUE COMPLETA ---');
  
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('id, model, external_id, slug, sync_photos, vehicle_photos(count)');
    
  if (error) {
    console.error('Erro na varredura:', error.message);
    return;
  }

  if (!vehicles || vehicles.length === 0) {
    console.log('Nenhum veículo encontrado no banco de dados.');
    return;
  }

  // Check for duplicate external_ids
  const externalIds = new Map<string, string[]>();
  
  vehicles.forEach(v => {
    if (v.external_id) {
      const ids = externalIds.get(v.external_id) || [];
      ids.push(v.id);
      externalIds.set(v.external_id, ids);
    }
    
    console.log(`[VEÍCULO] ${v.model.padEnd(30)} | ExtID: ${(v.external_id || 'NULO').padEnd(10)} | Shield: ${v.sync_photos === false ? 'TRAVADO' : 'ABERTO '} | Fotos: ${v.vehicle_photos?.[0]?.count || 0} | ID: ${v.id}`);
  });

  console.log('\n--- VERIFICAÇÃO DE DUPLICATAS ---');
  externalIds.forEach((ids, extId) => {
    if (ids.length > 1) {
      console.log(`⚠️ ALERTA: O External ID [${extId}] possui ${ids.length} registros: ${ids.join(', ')}`);
    }
  });
}

scanInventory();
