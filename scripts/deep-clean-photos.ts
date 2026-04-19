
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepCleanPhotos() {
  console.log('--- FAXINA PROFUNDA DE FOTOS (BLINDAGEM 4.0) ---');
  
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('id, model, vehicle_photos(id, url, order_index, storage_path)');
    
  if (error || !vehicles) {
    console.error('Erro ao buscar estoque:', error?.message);
    return;
  }

  for (const veh of vehicles) {
    const photos = veh.vehicle_photos || [];
    if (photos.length === 0) continue;

    // Check for anomalies: 
    // 1. Multiple photos with same index
    // 2. Duplicate URLs
    const indices = photos.map(p => p.order_index);
    const urls = photos.map(p => p.url);
    const hasAnomaly = (new Set(indices)).size !== indices.length || (new Set(urls)).size !== urls.length;

    if (hasAnomaly) {
      console.log(`\n🧹 Limpando anomalias em: ${veh.model} (${veh.id})`);
      
      // Select UNIQUE photos by URL, preserving order
      const uniquePhotos: any[] = [];
      const seenUrls = new Set();
      
      // Sort existing to try to keep some order if possible
      const sorted = [...photos].sort((a,b) => a.order_index - b.order_index);

      sorted.forEach(p => {
        if (!seenUrls.has(p.url)) {
          uniquePhotos.push(p);
          seenUrls.add(p.url);
        }
      });

      console.log(`   De: ${photos.length} fotos -> Para: ${uniquePhotos.length} fotos únicas.`);

      // 1. Wipe current photos using admin power
      await supabase.from('vehicle_photos').delete().eq('vehicle_id', veh.id);

      // 2. Re-insert with clean sequential order
      const cleanList = uniquePhotos.map((p, idx) => ({
        vehicle_id: veh.id,
        url: p.url,
        storage_path: p.storage_path,
        order_index: idx
      }));

      const { error: insErr } = await supabase.from('vehicle_photos').insert(cleanList);
      if (insErr) console.error(`   Erro ao re-inserir fotos:`, insErr.message);
      else console.log(`   ✅ Galeria restaurada com sucesso.`);
    }
  }

  console.log('\n✨ FAXINA PROFUNDA CONCLUÍDA!');
}

deepCleanPhotos();
