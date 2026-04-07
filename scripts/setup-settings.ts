import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env: Record<string, string> = {}
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=')
  if (key && value) env[key.trim()] = value.trim()
})

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

async function setupSettings() {
  console.log('--- Setting up Site Settings ---')
  
  // Create table if not exists (using RPC if available, or just trying to select)
  // Since we can't easily create tables via JS client without an RPC like exec_sql,
  // we will check if it exists. If not, we'll advise the user to run the SQL.
  
  const { error: checkError } = await supabase.from('site_settings').select('id').limit(1)
  
  if (checkError) {
    console.log('Table site_settings missing or error:', checkError.message)
    console.log('Attempting to create table via RPC exec_sql...')
    
    const sql = `
      CREATE TABLE IF NOT EXISTS site_settings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        dealership_name text NOT NULL DEFAULT 'Prime Veículos',
        dealership_whatsapp text,
        dealership_email text,
        dealership_address text,
        dealership_cnpj text,
        is_cpf_api_active boolean DEFAULT false,
        updated_at timestamptz DEFAULT now()
      );
      
      ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
      
      DROP POLICY IF EXISTS "Configurações visíveis para autenticados" ON site_settings;
      CREATE POLICY "Configurações visíveis para autenticados" ON site_settings
        FOR SELECT USING (auth.role() = 'authenticated');
      
      DROP POLICY IF EXISTS "Administradores gerenciam configurações" ON site_settings;
      CREATE POLICY "Administradores gerenciam configurações" ON site_settings
        FOR ALL USING (
          EXISTS (SELECT 1 FROM sellers WHERE id = auth.uid() AND is_admin = true)
        );
        
      INSERT INTO site_settings (dealership_name) 
      SELECT 'Prime Veículos' 
      WHERE NOT EXISTS (SELECT 1 FROM site_settings);
    `
    
    const { error: rpcError } = await supabase.rpc('exec_sql', { query: sql })
    
    if (rpcError) {
      console.error('Failed to create table via RPC:', rpcError.message)
      console.log('Please manualy run the SQL in your Supabase Dashboard.')
    } else {
      console.log('Table and policies created successfully!')
    }
  } else {
    console.log('Table site_settings already exists.')
  }
}

setupSettings()
