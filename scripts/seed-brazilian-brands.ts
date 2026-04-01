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

const brands = [
  'Chevrolet', 'Fiat', 'Volkswagen', 'Toyota', 'Honda', 
  'Hyundai', 'Jeep', 'Renault', 'Nissan', 'Ford', 
  'Mitsubishi', 'Peugeot', 'Citroën', 'Caoa Chery', 'BMW', 
  'Mercedes-Benz', 'Audi', 'Volvo', 'Land Rover', 'Porsche',
  'Ferrari', 'Lamborghini', 'Maserati', 'Jaguar', 'Kia',
  'Suzuki', 'Subaru', 'BYD', 'GWM'
]

async function seed() {
  console.log('Seeding brands with Service Role...')
  
  for (const name of brands) {
    const { data, error } = await supabase
      .from('brands')
      .upsert({ name }, { onConflict: 'name' })
      .select()
    
    if (error) {
      console.error(`Error seeding ${name}:`, error.message)
    } else {
      console.log(`Seeded: ${name}`)
    }
  }

  console.log('Done.')
}

seed()
