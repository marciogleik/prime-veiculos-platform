
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagMercedes() {
  console.log('--- DIAGNÓSTICO MERCEDES G 63 ---');
  const { data: v, error } = await supabase
    .from('vehicles')
    .select('id, model, sync_photos, external_id, vehicle_photos(id, url, storage_path, order_index)')
    .ilike('model', '%G 63%');
  
  if (error) {
    console.error('Erro:', error.message);
    return;
  }

  if (!v || v.length === 0) {
    console.log('Nenhuma Mercedes encontrada.');
    return;
  }

  v.forEach(veh => {
    console.log(`ID: ${veh.id} | ExtID: ${veh.external_id} | Shield: ${veh.sync_photos} | Fotos: ${veh.vehicle_photos?.length}`);
    console.log('Fotos Info:', veh.vehicle_photos);
  });
}

diagMercedes();
