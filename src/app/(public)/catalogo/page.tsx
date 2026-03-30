import { createClient } from "@/lib/supabase/server";
import VeiculoCard from "@/components/veiculo/VeiculoCard";
import VeiculoFiltros from "@/components/veiculo/VeiculoFiltros";
import { Vehicle, Brand, FiltrosCatalogo } from "@/types";
import { Suspense } from "react";
import SkeletonCard from "@/components/shared/SkeletonCard";

export const metadata = {
  title: "Catálogo de Veículos | Prime Veículos",
  description: "Confira nosso estoque completo de veículos premium revisados e com garantia.",
};

interface CatalogoPageProps {
  searchParams: Promise<FiltrosCatalogo>;
}

async function CatalogoGrid({ searchParams }: { searchParams: FiltrosCatalogo }) {
  const supabase = await createClient();
  
  let query = supabase
    .from("vehicles")
    .select("*, brand:brands(*), photos:vehicle_photos(*)")
    .eq("status", "disponível");

  if (searchParams.marca) query = query.eq("brands.name", searchParams.marca);
  if (searchParams.modelo) query = query.ilike("model", `%${searchParams.modelo}%`);
  if (searchParams.preco_de) query = query.gte("price", searchParams.preco_de);
  if (searchParams.preco_ate) query = query.lte("price", searchParams.preco_ate);
  
  // Handlers for combustion/gearbox arrays...
  if (searchParams.combustivel && searchParams.combustivel.length > 0) {
    query = query.in("fuel", searchParams.combustivel);
  }

  const { data: vehicles } = await query.order("created_at", { ascending: false });

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="bg-gray-50 p-6 rounded-full mb-6">
          <FilterX className="w-12 h-12 text-gray-300" />
        </div>
        <h3 className="text-2xl font-display font-bold mb-2">Nenhum veículo encontrado</h3>
        <p className="text-gray-500 max-w-sm">
          Tente ajustar seus filtros ou buscar por outro modelo para encontrar o carro dos seus sonhos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {vehicles.map((v) => (
        <VeiculoCard key={v.id} veiculo={v as unknown as Vehicle} />
      ))}
    </div>
  );
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const supabase = await createClient();
  const sp = await searchParams; // Next.js 15 searchParams is a Promise

  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name");

  return (
    <div className="pt-32 pb-20 container mx-auto px-4">
      <div className="mb-12">
        <span className="text-primary font-bold uppercase tracking-widest text-sm mb-4 block">
          Nosso Estoque
        </span>
        <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tighter">
          CATÁLOGO DE <span className="text-primary italic">VEÍCULOS</span>
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        <VeiculoFiltros brands={brands || []} />
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
            <p className="text-gray-500 font-medium">
              Mostrando veículos disponíveis para você
            </p>
            {/* TODO: Add sort dropdown */}
          </div>

          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          }>
            <CatalogoGrid searchParams={sp} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

import { FilterX } from "lucide-react";
