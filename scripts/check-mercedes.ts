
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMercedes() {
  console.log('--- RELATÓRIO FINAL MERCEDES G 63 ---');
  const { data: v, error } = await supabase
    .from('vehicles')
    .select('id, model, sync_photos, external_id, vehicle_photos(id, url, order_index)')
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
    console.log(`\nVEÍCULO: ${veh.model}`);
    console.log(`ID: ${veh.id}`);
    console.log(`Shield: ${veh.sync_photos}`);
    console.log(`Total de Fotos: ${veh.vehicle_photos?.length}`);
    
    // Check for duplicates in photo URLs
    const urls = (veh.vehicle_photos || []).map(p => p.url);
    const uniqueUrls = new Set(urls);
    if (urls.length !== uniqueUrls.size) {
      console.log('⚠️ ALERTA: Existem fotos duplicadas na galeria deste veículo!');
    }

    console.log('Lista de fotos (Ordem):');
    (veh.vehicle_photos || []).sort((a,b) => a.order_index - b.order_index).forEach(p => {
      console.log(`  - [Index: ${p.order_index}] ID: ${p.id.substring(0,8)}... URL: ${p.url.substring(p.url.length - 20)}`);
    });
  });
}

checkMercedes();
