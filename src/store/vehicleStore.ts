import { create } from 'zustand';
import { Vehicle } from '@/types';

interface VehicleStore {
  vehicles: Vehicle[];
  addVehicle: (vehicle: Vehicle) => void;
  setVehicles: (vehicles: Vehicle[]) => void;
}

const prototypeVehicles: Vehicle[] = [
  {
    id: '1',
    brand_id: 'porsche',
    brand: { id: 'porsche', name: 'Porsche' },
    model: '911 Carrera S',
    year_fab: 2023,
    year_model: 2023,
    version: '3.0 Twin-Turbo',
    price: 850000,
    mileage: 5000,
    color: 'Crayon Grey',
    transmission: 'Automático',
    fuel: 'Gasolina',
    description: 'O ícone da engenharia alemã em sua melhor forma. Performance inigualável e design atemporal.',
    status: 'disponível',
    is_featured: true,
    accepts_proposal: true,
    seller_id: '1',
    slug: 'porsche-911-carrera-s-2023',
    photos: [
      { id: 'p1', vehicle_id: '1', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1200', storage_path: '', order_index: 0 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    brand_id: 'audi',
    brand: { id: 'audi', name: 'Audi' },
    model: 'RS6 Avant',
    year_fab: 2024,
    year_model: 2024,
    version: '4.0 V8 Biturbo Performance',
    price: 920000,
    mileage: 1200,
    color: 'Nardo Grey',
    transmission: 'Automático',
    fuel: 'Gasolina',
    description: 'A perua mais rápida do mundo. Espaço, luxo e a fúria de um motor V8 Biturbo.',
    status: 'disponível',
    is_featured: true,
    accepts_proposal: true,
    seller_id: '1',
    slug: 'audi-rs6-avant-2024',
    photos: [
      { id: 'p2', vehicle_id: '2', url: 'https://images.unsplash.com/photo-1606152421802-db97b9c7a11b?auto=format&fit=crop&q=80&w=1200', storage_path: '', order_index: 0 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    brand_id: 'mercedes',
    brand: { id: 'mercedes', name: 'Mercedes-Benz' },
    model: 'G63 AMG',
    year_fab: 2023,
    year_model: 2023,
    version: 'V8 Biturbo Magno',
    price: 1850000,
    mileage: 8500,
    color: 'Matte Black',
    transmission: 'Automático',
    fuel: 'Gasolina',
    description: 'Domine qualquer terreno com o luxo absoluto da AMG. Presença imponente e performance bruta.',
    status: 'disponível',
    is_featured: false,
    accepts_proposal: true,
    seller_id: '1',
    slug: 'mercedes-g63-amg-2023',
    photos: [
      { id: 'p3', vehicle_id: '3', url: 'https://images.unsplash.com/photo-1520031441872-265e4ff70366?auto=format&fit=crop&q=80&w=1200', storage_path: '', order_index: 0 }
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const useVehicleStore = create<VehicleStore>((set) => ({
  vehicles: prototypeVehicles,
  addVehicle: (vehicle) => set((state) => ({ 
    vehicles: [vehicle, ...state.vehicles] 
  })),
  setVehicles: (vehicles) => set({ vehicles }),
}));
