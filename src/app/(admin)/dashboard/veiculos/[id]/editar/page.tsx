import { createClient } from "@/lib/supabase/server";
import VeiculoForm from "@/components/admin/VeiculoForm";
import { notFound } from "next/navigation";
import { Vehicle } from "@/types";

interface EditarVeiculoPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditarVeiculoPage({ params }: EditarVeiculoPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const [vResult, bResult] = await Promise.all([
    supabase.from("vehicles").select("*, photos:vehicle_photos(*)").eq("id", id).single(),
    supabase.from("brands").select("*").order("name"),
  ]);

  if (vResult.error || !vResult.data) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-400">Editar</h1>
        <h2 className="text-4xl font-display font-bold">{vResult.data.model}</h2>
      </div>

      <VeiculoForm 
        initialData={vResult.data as unknown as Vehicle} 
        brands={bResult.data || []} 
      />
    </div>
  );
}
