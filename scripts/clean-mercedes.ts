
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanMercedes() {
  const targetId = 'cc31ef73-b994-40ac-86c5-5c6e36e6c6a8';
  console.log('--- LIMPANDO GALERIA MERCEDES G 63 ---');
  
  // 1. Delete ALL current photos for this vehicle to start clean
  const { error: delErr } = await supabase.from('vehicle_photos').delete().eq('vehicle_id', targetId);
  if (delErr) console.error('Erro ao deletar:', delErr.message);

  // 2. Insert only the CORRECT photo with sequential order
  const photosToInsert = [
    {
       vehicle_id: targetId,
       url: 'https://zllitpmsdfjgtbuittvy.supabase.co/storage/v1/object/public/vehicle-photos/cc31ef73-b994-40ac-86c5-5c6e36e6c6a8/0.6944148036537414.jpg',
       storage_path: 'cc31ef73-b994-40ac-86c5-5c6e36e6c6a8/0.6944148036537414.jpg',
       order_index: 0
    }
  ];

  const { error: insErr } = await supabase.from('vehicle_photos').insert(photosToInsert);
  if (insErr) console.error('Erro ao inserir:', insErr.message);
  
  // 3. Ensure shield is ON
  await supabase.from('vehicles').update({ sync_photos: false }).eq('id', targetId);

  console.log('✅ MERCEDES LIMPA E BLINDADA DEFINITIVAMENTE!');
}

cleanMercedes();
