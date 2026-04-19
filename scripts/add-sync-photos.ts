
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function addSyncPhotosColumn() {
  console.log('--- ADICIONANDO COLUNA sync_photos AO BANCO ---');
  
  try {
    const { error } = await supabase.from('vehicles').select('sync_photos').limit(1);
    
    if (!error) {
      console.log('✅ A coluna sync_photos já existe.');
      return;
    }

    console.log('A coluna sync_photos não foi encontrada. Por favor, execute o seguinte comando no SQL Editor do Supabase:');
    console.log('\nALTER TABLE vehicles ADD COLUMN sync_photos boolean DEFAULT true;\n');
    
  } catch (err: any) {
    console.error('Erro ao verificar coluna:', err.message);
  }
}

addSyncPhotosColumn();
