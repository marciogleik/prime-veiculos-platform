import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zllitpmsdfjgtbuittvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbGl0cG1zZGZqZ3RidWl0dHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Mzg3ODcsImV4cCI6MjA5MDIxNDc4N30.E52X33vRbNJb8CODN-hMLAge-xp79aZFlqNIaQry3qY'
)

async function seedVehicle() {
  // 1. Get Brand
  const { data: brand } = await supabase.from('brands').select('id').eq('name', 'Porsche').single()
  if (!brand) {
    console.log('Porsche brand not found.')
    return
  }

  // 2. Insert Vehicle
  console.log('Inserting sample vehicle...')
  const { data: vehicle, error: vError } = await supabase.from('vehicles').insert([
    {
      brand_id: brand.id,
      model: '911 Carrera S',
      version: '3.0 Bi-Turbo',
      year_fab: 2023,
      year_model: 2024,
      price: 890000,
      mileage: 1200,
      color: 'Giz Grey',
      transmission: 'Automático',
      fuel: 'Gasolina',
      description: 'Estado de zero quilômetro. Único dono.',
      status: 'disponível',
      is_featured: true,
      slug: 'porsche-911-carrera-s-' + Math.random().toString(36).substring(7),
      accepts_proposal: true
    }
  ]).select().single()

  if (vError) {
    console.error('Error inserting vehicle:', vError)
    return
  }

  // 3. Insert Photos
  if (vehicle) {
    console.log('Inserting vehicle photos...')
    await supabase.from('vehicle_photos').insert([
      {
        vehicle_id: vehicle.id,
        url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800',
        storage_path: 'temp/porsche.jpg',
        order_index: 0
      }
    ])
    console.log('Vehicle and photos seeded successfully.')
  }
}

seedVehicle()
