import { createClient } from "@/lib/supabase/server";
import VeiculoForm from "@/components/admin/VeiculoForm";
import { notFound } from "next/navigation";
import { Vehicle } from "@/types";
import { MOCK_VEHICLES } from "@/lib/mock-vehicles";

interface EditarVeiculoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarVeiculoPage({ params }: EditarVeiculoPageProps) {
  const { id } = await params;
  const isMock = id.startsWith("mock-");
  const supabase = await createClient();

  let originalVehicle: Vehicle | null = null;
  const [bResult] = await Promise.all([
    supabase.from("brands").select("*").order("name"),
  ]);

  if (isMock) {
    originalVehicle = MOCK_VEHICLES.find(v => v.id === id) || null;
  } else {
    const { data } = await supabase
      .from("vehicles")
      .select("*, brand:brands(name), photos:vehicle_photos(*)")
      .eq("id", id)
      .single();
    originalVehicle = data as unknown as Vehicle;
  }

  if (!originalVehicle) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-400">
          {isMock ? "Transformar em Real" : "Editar"}
        </h1>
        <h2 className="text-4xl font-display font-bold">{originalVehicle.model}</h2>
      </div>

      <VeiculoForm 
        initialData={originalVehicle} 
        brands={bResult.data || []} 
      />
    </div>
  );
}
