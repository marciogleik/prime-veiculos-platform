
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function diagVehicle() {
  console.log('--- DIAGNÓSTICO DE VEÍCULO ---');
  
  const { data: v, error } = await supabase
    .from('vehicles')
    .select('id, model, sync_photos, vehicle_photos(id, url)')
    .ilike('model', '%S10%')
    .limit(1)
    .single();
    
  if (error) {
    console.error('Erro ao buscar veículo:', error.message);
    return;
  }

  console.log('Veículo:', v.model);
  console.log('ID:', v.id);
  console.log('Sync Photos Status:', v.sync_photos);
  console.log('Quantidade de Fotos:', v.vehicle_photos?.length || 0);
  console.log('Fotos:', v.vehicle_photos);
}

diagVehicle();
