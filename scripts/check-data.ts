import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://zllitpmsdfjgtbuittvy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpsbGl0cG1zZGZqZ3RidWl0dHZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2Mzg3ODcsImV4cCI6MjA5MDIxNDc4N30.E52X33vRbNJb8CODN-hMLAge-xp79aZFlqNIaQry3qY'
)

async function debugBrands() {
  const { data: brands, error } = await supabase.from('brands').select('*')
  console.log('Brands found:', brands)
  if (error) console.error('Error:', error)
  
  if (!brands || brands.length === 0) {
    console.log('Inserting brands...')
    const { data, error: iError } = await supabase.from('brands').insert([
      { name: 'Porsche' },
      { name: 'BMW' }
    ]).select()
    console.log('Inserted:', data, iError)
  }
}

debugBrands()
