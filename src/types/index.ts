export interface Brand {
  id: string
  name: string
  logo_url?: string
}

export interface Seller {
  id: string
  name: string
  whatsapp: string
  avatar_url?: string
  is_active: boolean
  is_admin: boolean
}

export interface VehiclePhoto {
  id: string
  vehicle_id: string
  url: string
  storage_path: string
  order_index: number
}

export interface Vehicle {
  id: string
  brand_id: string
  brand?: Brand
  model: string
  year_fab: number
  year_model: number
  version?: string
  price: number
  mileage: number
  color?: string
  transmission: 'Manual' | 'Automático' | 'CVT'
  fuel: 'Flex' | 'Gasolina' | 'Elétrico' | 'Diesel'
  doors?: number
  description?: string
  optionals?: string[]
  status: 'disponível' | 'reservado' | 'vendido'
  is_featured: boolean
  accepts_proposal: boolean
  seller_id: string
  seller?: Seller
  slug: string
  photos?: VehiclePhoto[]
  created_at: string
  updated_at: string
}

export interface Lead {
  id: string
  vehicle_id: string
  vehicle?: Pick<Vehicle, 'brand' | 'model' | 'year_fab' | 'slug'>
  seller_id: string
  seller?: Pick<Seller, 'name' | 'whatsapp'>
  customer_name: string
  customer_whatsapp: string
  status: 'novo' | 'contatado' | 'negociando' | 'convertido' | 'perdido'
  notes?: string
  created_at: string
  updated_at: string
}

export interface FiltrosCatalogo {
  marca?: string
  modelo?: string
  ano_de?: number
  ano_ate?: number
  preco_de?: number
  preco_ate?: number
  combustivel?: string[]
  cambio?: string[]
  cor?: string
  km_de?: number
  km_ate?: number
  ordenacao?: 'preco_asc' | 'preco_desc' | 'recente' | 'destaque'
}
