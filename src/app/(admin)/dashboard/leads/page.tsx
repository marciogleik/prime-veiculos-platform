import { createClient } from "@/lib/supabase/server";
import LeadsTable from "@/components/admin/LeadsTable";

export const metadata = {
  title: "Gestão de Leads | Prime Veículos",
};

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data: dbLeads } = await supabase
    .from("leads")
    .select("*, vehicle:vehicles(model, brand:brands(name), photos:vehicle_photos(url)), seller:sellers(name)")
    .order("created_at", { ascending: false });

  const { data: sellers } = await supabase
    .from("sellers")
    .select("id, name")
    .order("name");

  // Removed MOCK_LEADS to follow user request for 100% real data
  const leads = dbLeads || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2 leading-none">CRM</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950">Gestão de Leads</h1>
          <p className="text-gray-500 mt-3 font-bold text-sm">
            {leads.length} {leads.length === 1 ? "lead registrado" : "leads registrados"} em sua base
          </p>
        </div>
      </div>

      <LeadsTable initialLeads={leads as any} sellers={sellers || []} />
    </div>
  );
}
