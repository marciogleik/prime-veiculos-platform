
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkPeugeot() {
  console.log('--- VISTORIA PEUGEOT 206 ---');
  const { data: v, error } = await supabase
    .from('vehicles')
    .select('id, model, sync_photos, external_id, vehicle_photos(id, url, order_index)')
    .eq('id', '586d877c-b900-4b6c-9e18-7474667a823f')
    .single();
  
  if (error) {
    console.error('Erro:', error.message);
    return;
  }

  if (v) {
    console.log(`MODELO: ${v.model}`);
    console.log(`Sync Photos (Shield): ${v.sync_photos}`);
    console.log(`Fotos Totais: ${v.vehicle_photos?.length}`);
    console.log('Fotos:', v.vehicle_photos);
  }
}

checkPeugeot();
