import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import CatalogoHeader from "@/components/veiculo/CatalogoHeader";
import CatalogoClient from "@/components/veiculo/CatalogoClient";
import { MOCK_VEHICLES } from "@/lib/mock-vehicles";
import { Vehicle, Brand } from "@/types";

export const metadata = {
  title: "Catálogo de Veículos | Prime Veículos",
  description: "Confira nosso estoque completo de veículos premium revisados e com garantia.",
};

export default async function CatalogoPage() {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();

  const { data: dbVehicles } = await supabase
    .from("vehicles")
    .select("*, brand:brands(*), photos:vehicle_photos(*)")
    .eq("status", "disponível")
    .order("created_at", { ascending: false });

  const { data: dbBrands } = await adminSupabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true });

  const vehicles: Vehicle[] = (dbVehicles && dbVehicles.length > 0)
    ? (dbVehicles as unknown as Vehicle[])
    : MOCK_VEHICLES;

  const brands: Brand[] = (dbBrands as Brand[]) || [];

  return (
    <div className="pt-28 pb-20 min-h-screen bg-white">
      <div className="container mx-auto px-4">
        <CatalogoHeader />
        <CatalogoClient vehicles={vehicles} brands={brands} />
      </div>
    </div>
  );
}
