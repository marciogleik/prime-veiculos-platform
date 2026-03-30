import { createClient } from "@/lib/supabase/server";
import VeiculoDataTable from "@/components/admin/VeiculoDataTable";
import { Vehicle } from "@/types";
import { MOCK_VEHICLES } from "@/lib/mock-vehicles";

export const metadata = {
  title: "Gestão de Veículos | Prime Veículos",
};

export default async function VeiculosPage() {
  const supabase = await createClient();

  const { data: dbVehicles } = await supabase
    .from("vehicles")
    .select("*, brand:brands(name), photos:vehicle_photos(*)")
    .order("created_at", { ascending: false });

  const vehicles: Vehicle[] = (dbVehicles && dbVehicles.length > 0)
    ? (dbVehicles as unknown as Vehicle[])
    : MOCK_VEHICLES;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Administração</p>
        <h1 className="text-4xl font-display font-black tracking-tighter">Gestão de Estoque</h1>
        <p className="text-gray-400 mt-2 font-medium">Gerencie seu inventário de veículos premium</p>
      </div>

      <VeiculoDataTable initialData={vehicles} />
    </div>
  );
}

