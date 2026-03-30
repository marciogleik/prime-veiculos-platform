import { createClient } from "@/lib/supabase/server";
import VeiculoDataTable from "@/components/admin/VeiculoDataTable";
import { Vehicle } from "@/types";

export const metadata = {
  title: "Gestão de Veículos | Prime Veículos",
};

export default async function VeiculosPage() {
  const supabase = await createClient();

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*, brand:brands(name), photos:vehicle_photos(*)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Gestão de Estoque</h1>
        <p className="text-gray-400 mt-2">Gerencie seu inventário de veículos premium</p>
      </div>

      <VeiculoDataTable initialData={(vehicles || []) as unknown as Vehicle[]} />
    </div>
  );
}
