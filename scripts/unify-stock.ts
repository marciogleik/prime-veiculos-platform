
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseKey!);

async function unifyStock() {
  console.log('--- INICIANDO FAXINA DE ESTOQUE (UNIFICAÇÃO) ---');
  
  const { data: vehicles, error } = await supabase
    .from('vehicles')
    .select('*, vehicle_photos(id, url, storage_path, order_index)');
    
  if (error || !vehicles) {
    console.error('Erro ao buscar estoque:', error?.message);
    return;
  }

  // Map to group by simplified model + year
  const groups = new Map<string, typeof vehicles>();

  vehicles.forEach(v => {
    const key = `${v.model.toLowerCase().trim()}_${v.year_fab}`;
    const group = groups.get(key) || [];
    group.push(v);
    groups.set(key, group);
  });

  for (const [key, group] of groups.entries()) {
    if (group.length > 1) {
      console.log(`\n📦 Agrupando duplicatas para: ${key} (${group.length} registros)`);
      
      // Select the best candidate (Target)
      // Priorities: 1. Manual sync protected, 2. Has external_id, 3. Most photos
      const target = group.sort((a, b) => {
        if (a.sync_photos === false && b.sync_photos !== false) return -1;
        if (b.sync_photos === false && a.sync_photos !== false) return 1;
        if (a.external_id && !b.external_id) return -1;
        if (b.external_id && !a.external_id) return 1;
        return (b.vehicle_photos?.length || 0) - (a.vehicle_photos?.length || 0);
      })[0];

      console.log(`🎯 Registro Principal Selecionado: ${target.id} (Fotos: ${target.vehicle_photos?.length || 0})`);

      const others = group.filter(v => v.id !== target.id);

      for (const other of others) {
        console.log(`🗑️ Movendo fotos e removendo duplicata: ${other.id} (Fotos: ${other.vehicle_photos?.length || 0})`);
        
        // Transfer photos if target has few or if we want to merge galleries
        if (other.vehicle_photos && other.vehicle_photos.length > 0) {
           // We just re-parent the photos in the DB
           const photoIds = other.vehicle_photos.map((p: any) => p.id);
           const { error: photoErr } = await supabase
             .from('vehicle_photos')
             .update({ vehicle_id: target.id })
             .in('id', photoIds);
             
           if (photoErr) console.error(`   Erro ao mover fotos:`, photoErr.message);
        }

        // Transfer LEADS to target
        const { error: leadErr } = await supabase
          .from('leads')
          .update({ vehicle_id: target.id })
          .eq('vehicle_id', other.id);
        
        if (leadErr) console.error(`   Erro ao mover leads:`, leadErr.message);

        // Transfer External ID if target doesn't have it
        if (!target.external_id && other.external_id) {
           target.external_id = other.external_id;
           await supabase.from('vehicles').update({ external_id: other.external_id }).eq('id', target.id);
           console.log(`   Recuperado ID Externo: ${other.external_id}`);
        }

        // Delete the redundant vehicle
        const { error: delErr } = await supabase.from('vehicles').delete().eq('id', other.id);
        if (delErr) console.error(`   Erro ao deletar duplicata:`, delErr.message);
      }
    }
  }

  // Special Cleanup: Fix "Modelo não informado" if possible or delete orphans
  const { error: cleanErr } = await supabase.from('vehicles').delete().eq('model', 'Modelo não informado');
  if (cleanErr) console.error('Erro ao limpar modelos não informados:', cleanErr.message);

  console.log('\n✅ Faxina Concluída!');
}

unifyStock();
