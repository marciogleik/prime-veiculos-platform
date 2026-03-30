import { createClient } from "@/lib/supabase/server";
import CatalogoHeader from "@/components/veiculo/CatalogoHeader";
import CatalogoClient from "@/components/veiculo/CatalogoClient";
import { MOCK_VEHICLES } from "@/lib/mock-vehicles";
import { Vehicle } from "@/types";

export const metadata = {
  title: "Catálogo de Veículos | Prime Veículos",
  description: "Confira nosso estoque completo de veículos premium revisados e com garantia.",
};

export default async function CatalogoPage() {
  const supabase = await createClient();

  const { data: dbVehicles } = await supabase
    .from("vehicles")
    .select("*, brand:brands(*), photos:vehicle_photos(*)")
    .eq("status", "disponível")
    .order("created_at", { ascending: false });

  // Use DB data if available, otherwise fall back to all mock vehicles
  const vehicles: Vehicle[] = (dbVehicles && dbVehicles.length > 0)
    ? (dbVehicles as unknown as Vehicle[])
    : MOCK_VEHICLES;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-white">
      <div className="container mx-auto px-4">
        <CatalogoHeader />
        <CatalogoClient vehicles={vehicles} />
      </div>
    </div>
  );
}
