import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8')
  envFile.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) process.env[key.trim()] = value.trim()
  })
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function fixRLS() {
  console.log('Applying RLS fix for brands...')
  
  // Directly run SQL via rpc if possible, but for RLS we often need to run it in the dashboard.
  // Since I can't be sure if there is an RPC for this, I'll attempt to use the admin client
  // but RLS for public select is usually set once in the DB.
  // I will check if I can just use a "create policy" via a raw query if enabled, 
  // but usually Supabase doesn't allow raw SQL via JS client for security.
  
  // If I can't run SQL, I will have to assume the user might need to run it, 
  // OR I can try to use a script that uses a library that can talk to Postgres directly if credentials are known.
  
  console.log('Note: Admin client can bypass RLS for data seeding, but for public access,')
  console.log('a SELECT policy must be added in the Supabase Dashboard SQL Editor:')
  console.log('CREATE POLICY "Marcas públicas" ON brands FOR SELECT USING (true);')
  
  // I'll try to use a common RPC if it exists (some templates have `exec_sql`)
  const { error } = await supabase.rpc('exec_sql', { 
    query: 'CREATE POLICY "Marcas públicas" ON brands FOR SELECT USING (true);' 
  })
  
  if (error) {
    console.error('Error applying policy via RPC (expected if exec_sql is missing):', error.message)
    console.log('Please run this in your Supabase SQL Editor:')
    console.log('ALTER TABLE brands ENABLE ROW LEVEL SECURITY;')
    console.log('CREATE POLICY "Marcas públicas" ON brands FOR SELECT USING (true);')
  } else {
    console.log('Applied successfully!')
  }
}

fixRLS()
