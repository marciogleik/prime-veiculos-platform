import { createClient } from "@/lib/supabase/server";
import VeiculoCard from "./VeiculoCard";
import { Vehicle } from "@/types";

export default async function VeiculoGrid() {
  const supabase = await createClient();
  
  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*, brand:brands(*), photos:vehicle_photos(*)")
    .eq("is_featured", true)
    .eq("status", "disponível")
    .limit(8);

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="group relative rounded-antigravity bg-white/[0.03] border border-white/5 overflow-hidden min-h-[400px] flex flex-col justify-end p-8 gap-4 shadow-antigravity hover:border-primary/20 transition-all duration-700">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
              <div className="absolute inset-0 skeleton-premium opacity-10" />
              
              <div className="relative z-20 space-y-2">
                <div className="h-4 w-24 bg-primary/20 rounded-full animate-pulse" />
                <div className="h-8 w-full bg-white/5 rounded-xl" />
                <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5">
                  <div className="h-6 w-16 bg-white/5 rounded-lg" />
                  <span className="text-[10px] font-black tracking-widest text-primary uppercase animate-pulse">PRÓXIMO LOTE</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center py-10 glass-premium p-10 rounded-antigravity-lg border-white/5">
           <p className="text-premium-grey text-lg font-medium">Novas unidades premium em preparação para o catálogo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {vehicles.map((v) => (
        <VeiculoCard key={v.id} veiculo={v as unknown as Vehicle} />
      ))}
    </div>
  );
}
