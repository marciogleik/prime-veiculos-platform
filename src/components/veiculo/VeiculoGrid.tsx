import { createClient } from "@/lib/supabase/server";
import VeiculoCard from "./VeiculoCard";
import { Vehicle } from "@/types";
import { MOCK_VEHICLES } from "@/lib/mock-vehicles";

export default async function VeiculoGrid() {
  const supabase = await createClient();
  
  const { data: dbVehicles } = await supabase
    .from("vehicles")
    .select("*, brand:brands(*), photos:vehicle_photos(*)")
    .eq("is_featured", true)
    .eq("status", "disponível")
    .limit(8);

  const vehicles = (dbVehicles && dbVehicles.length > 0) ? dbVehicles : MOCK_VEHICLES.filter(v => v.is_featured).slice(0, 4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {vehicles.map((v) => (
        <VeiculoCard key={v.id} veiculo={v as unknown as Vehicle} />
      ))}
    </div>
  );
}
