import { createClient } from "@/lib/supabase/server";
import VeiculoDataTable from "@/components/admin/VeiculoDataTable";
import { Vehicle } from "@/types";

export const metadata = {
  title: "Gestão de Veículos | Prime Veículos",
};

export default async function VeiculosPage() {
  const supabase = await createClient();

  // Fetch real vehicles from database
  const { data: dbVehicles } = await supabase
    .from("vehicles")
    .select("*, brand:brands(name), photos:vehicle_photos(*)")
    .order("created_at", { ascending: false });

  // Use real data only, or empty array if none found
  const vehicles: Vehicle[] = (dbVehicles || []) as unknown as Vehicle[];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 leading-none">Administração</p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950">Gestão de Estoque</h1>
        <p className="text-gray-500 mt-3 font-bold text-sm">Gerencie seu inventário de veículos premium</p>
      </div>

      <VeiculoDataTable initialData={vehicles} />
    </div>
  );
}
