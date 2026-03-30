import { createClient } from "@/lib/supabase/server";
import VeiculoForm from "@/components/admin/VeiculoForm";

export default async function NovoVeiculoPage() {
  const supabase = await createClient();
  const { data: brands } = await supabase.from("brands").select("*").order("name");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-400">Novo</h1>
        <h2 className="text-4xl font-display font-bold">ADICIONAR VEÍCULO</h2>
      </div>

      <VeiculoForm brands={brands || []} />
    </div>
  );
}
