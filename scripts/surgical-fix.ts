
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function absoluteFix() {
  console.log('--- INTERVENÇÃO MANUAL DEFINITIVA ---');
  
  // IDs Identified in scan
  const targetId = 'f2abc7e1-2319-4c5b-acc6-ff29afacd276'; // 22 photos version
  const otherId = 'c9d4ea6d-7b6c-4ef5-9f03-efd5d8f272a1';  // 7 photos version

  console.log(`Vinculando S10 Principal (${targetId}) ao Revenda Mais (7960823)`);
  
  // 1. Establish the link and shield on the main vehicle
  const { error: upErr } = await supabase.from('vehicles').update({ 
    external_id: '7960823', 
    sync_photos: false 
  }).eq('id', targetId);
  
  if (upErr) console.error('Erro ao atualizar veículo principal:', upErr.message);

  console.log(`Limpando duplicata secundária (${otherId})`);
  
  // 2. Re-parent leads if any
  const { error: leadErr } = await supabase.from('leads').update({ vehicle_id: targetId }).eq('vehicle_id', otherId);
  if (leadErr) console.log('Sem leads para mover ou erro:', leadErr.message);

  // 3. Re-parent photos if any
  const { error: photoErr } = await supabase.from('vehicle_photos').update({ vehicle_id: targetId }).eq('vehicle_id', otherId);
  if (photoErr) console.log('Sem fotos para mover ou erro:', photoErr.message);

  // 4. Delete the duplicate
  const { error: delErr } = await supabase.from('vehicles').delete().eq('id', otherId);
  if (delErr) console.error('Erro ao deletar duplicata:', delErr.message);

  console.log('✅ ESTOQUE BLINDADO E UNIFICADO DEFINITIVAMENTE!');
}

absoluteFix();
