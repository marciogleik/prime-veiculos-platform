import { createClient } from '@supabase/supabase-js';
import { createAdminClient } from '../supabase/admin';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export interface SyncResult {
  success: boolean;
  imported: number;
  updated: number;
  errors: string[];
}

/**
 * Normalizes text from Revenda Mais (lowercase/no accent) to a premium look.
 * Example: "honda cb250f twister" -> "Honda CB250F Twister"
 */
function beautifyText(str: string | undefined): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Keep acronyms like BMW, AMG, GTS, ACC, CVT in upper case
      const acronyms = ['bmw', 'amg', 'gts', 'acc', 'cvt', 'abs', 'led', 'usb', 'tcs', 'esp'];
      if (acronyms.includes(word)) return word.toUpperCase();
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Maps Revenda Mais fuel tags to system enums.
 */
function mapFuel(fuel?: string): "Gasolina" | "Flex" | "Diesel" | "Elétrico" {
  if (!fuel) return 'Gasolina';
  const f = fuel.toLowerCase();
  if (f.includes('flex')) return 'Flex';
  if (f.includes('diesel')) return 'Diesel';
  if (f.includes('eletrico') || f.includes('elétrico')) return 'Elétrico';
  return 'Gasolina';
}

/**
 * Maps Revenda Mais gear tags to system enums.
 */
function mapTransmission(trans?: string): "Manual" | "Automático" | "CVT" {
  if (!trans) return 'Automático';
  const t = trans.toLowerCase();
  if (t.includes('manual')) return 'Manual';
  if (t.includes('cvt')) return 'CVT';
  return 'Automático';
}

function generateSlug(brand: string, model: string, year: string, id: string) {
  const base = `${brand}-${model}-${year}`.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${id.substring(0, 4)}`;
}

export async function syncInventoryFromXML(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    imported: 0,
    updated: 0,
    errors: [],
  };

  try {
    console.log('--- INICIANDO SINCRONIZAÇÃO PREMIUM XML (BLINDAGEM 5.0) ---');
    
    const xmlUrl = process.env.REVENDA_MAIS_XML_URL;
    if (!xmlUrl) throw new Error('REVENDA_MAIS_XML_URL não configurada.');

    const supabase = getSupabase();
    if (!supabase) throw new Error('Credenciais Supabase não encontradas.');

    const response = await axios.get(xmlUrl, {
      timeout: 30000,
      headers: { 
        'Accept': 'application/xml, text/xml',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.data || typeof response.data !== 'string') {
      throw new Error('O servidor do Revenda Mais retornou um arquivo vazio.');
    }

    if (response.data.trim().toLowerCase().startsWith('<!doctype html')) {
      throw new Error('O link fornecido retornou HTML. Aguarde a Revenda Mais gerar o XML.');
    }

    const parsed = await parseStringPromise(response.data);
    const vehiclesData = parsed.ADS?.AD || [];
    
    if (vehiclesData.length === 0) {
      result.success = true;
      return result;
    }

    const adminSupabase = createAdminClient();

    for (const ad of vehiclesData) {
      try {
        const externalId = ad.ID?.[0];
        if (!externalId) continue;

        const rawBrand = ad.MAKE?.[0] || 'Outros';
        const rawModel = ad.MODEL?.[0] || 'Modelo não informado';
        
        // 1. Map/Find Brand (Normalizing to Title Case)
        const brandName = beautifyText(rawBrand);
        let { data: brand } = await supabase.from('brands').select('id').eq('name', brandName).single();
        
        if (!brand) {
          const { data: newBrand } = await supabase.from('brands').insert({ name: brandName }).select('id').single();
          brand = newBrand;
        }

        const brandId = brand?.id;

        // 2. Prepare Normalized Vehicle Data
        const vehicleData = {
          external_id: externalId,
          brand_id: brandId,
          model: beautifyText(rawModel),
          version: ad.BASE_MODEL?.[0] || null, // Best approximation for version if VERSAO is missing
          year_fab: parseInt(ad.FABRIC_YEAR?.[0] || '0'),
          year_model: parseInt(ad.YEAR?.[0] || '0'),
          price: parseFloat(ad.PRICE?.[0] || '0'),
          mileage: parseInt(ad.MILEAGE?.[0] || '0'),
          color: beautifyText(ad.COLOR?.[0]),
          fuel: mapFuel(ad.FUEL?.[0]),
          transmission: mapTransmission(ad.GEAR?.[0]),
          description: ad.DESCRIPTION?.[0] || '',
          optionals: ad.ACCESSORIES?.[0] ? ad.ACCESSORIES[0].split(',').map((s: string) => s.trim()) : [],
          plate: ad.PLATE?.[0] || null,
          status: 'disponível',
          updated_at: new Date().toISOString(),
          slug: generateSlug(brandName, rawModel, ad.YEAR?.[0], externalId)
        };

        // 3. Upsert Vehicle (Discovery-based)
        let { data: existing } = await supabase
          .from('vehicles')
          .select('id, slug, sync_photos, external_id')
          .eq('external_id', externalId)
          .single();

        if (!existing) {
          const { data: bySlug } = await supabase.from('vehicles').select('id, slug, sync_photos, external_id').eq('slug', vehicleData.slug).single();
          if (bySlug) {
            existing = bySlug;
            if (existing) {
              await supabase.from('vehicles').update({ external_id: externalId }).eq('id', existing.id);
            }
          }
        }

        let vehicleId: string;
        let shouldSyncPhotos = true;

        if (existing) {
          const { slug, ...updateData } = vehicleData;
          await supabase.from('vehicles').update(updateData).eq('id', existing.id);
          vehicleId = existing.id;
          shouldSyncPhotos = existing.sync_photos !== false;
          result.updated++;
        } else {
          const { data: inserted, error: insErr } = await supabase.from('vehicles').insert(vehicleData).select('id').single();
          if (insErr) throw insErr;
          vehicleId = inserted.id;
          result.imported++;
        }

        // 4. Photos Sync (Using High Quality IMAGE_URL_LARGE)
        if (shouldSyncPhotos) {
          // Large images priority
          let photoUrls = ad.IMAGES_LARGE?.[0]?.IMAGE_URL_LARGE || ad.IMAGES?.[0]?.IMAGE_URL || [];
          
          if (photoUrls.length > 0) {
            // Unrestricted deletion with admin power
            await adminSupabase.from('vehicle_photos').delete().eq('vehicle_id', vehicleId);
            
            const photosToInsert = photoUrls.map((url: string, index: number) => ({
              vehicle_id: vehicleId,
              url: url,
              storage_path: 'external',
              order_index: index
            }));

            await adminSupabase.from('vehicle_photos').insert(photosToInsert);
          } else {
            console.log(`[INFO] Veículo ${externalId} (${rawBrand} ${rawModel}) sem fotos no XML.`);
          }
        }

      } catch (err: any) {
        result.errors.push(`Erro no veículo ${ad.ID?.[0]}: ${err.message}`);
      }
    }

    result.success = true;
  } catch (err: any) {
    result.errors.push(`ERRO GERAL: ${err.message}`);
  }

  return result;
}
