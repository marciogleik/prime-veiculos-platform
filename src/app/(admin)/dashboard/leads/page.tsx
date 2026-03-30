import { createClient } from "@/lib/supabase/server";
import LeadsTable from "@/components/admin/LeadsTable";

const MOCK_LEADS = [
  { id: "l1", customer_name: "Rafael Monteiro", customer_whatsapp: "11999990001", notes: "Interessado em test drive", vehicle: { brand: { name: "Porsche" }, model: "911 GT3 RS" }, seller: null, status: "novo", created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "l2", customer_name: "Beatriz Almeida", customer_whatsapp: "21999990002", notes: "Proposta enviada", vehicle: { brand: { name: "Lamborghini" }, model: "Huracán STO" }, seller: null, status: "negociando", created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: "l3", customer_name: "Carlos Eduardo Nunes", customer_whatsapp: "11999990003", notes: "Aguardando aprovação bancária", vehicle: { brand: { name: "BMW" }, model: "M4 Competition" }, seller: null, status: "contatado", created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: "l4", customer_name: "Fernanda Lima", customer_whatsapp: "51999990004", notes: "Precisa de financiamento", vehicle: { brand: { name: "Mercedes-AMG" }, model: "G 63 Edition 1" }, seller: null, status: "novo", created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
  { id: "l5", customer_name: "Thiago Ramos", customer_whatsapp: "31999990005", notes: "Concluído com êxito", vehicle: { brand: { name: "Audi" }, model: "RS6 Avant" }, seller: null, status: "convertido", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  { id: "l6", customer_name: "Mariana Costa", customer_whatsapp: "11999990006", notes: "Optou por outro modelo", vehicle: { brand: { name: "Ferrari" }, model: "Roma Spider" }, seller: null, status: "perdido", created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

export const metadata = {
  title: "Gestão de Leads | Prime Veículos",
};

export default async function LeadsPage() {
  const supabase = await createClient();

  const { data: dbLeads } = await supabase
    .from("leads")
    .select("*, vehicle:vehicles(model, brand:brands(name)), seller:sellers(name)")
    .order("created_at", { ascending: false });

  const leads = (dbLeads && dbLeads.length > 0) ? dbLeads : MOCK_LEADS;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">CRM</p>
        <h1 className="text-4xl font-display font-black tracking-tighter">Gestão de Leads</h1>
        <p className="text-gray-400 mt-2 font-medium">
          {leads.length} {leads.length === 1 ? "lead registrado" : "leads registrados"}
        </p>
      </div>

      <LeadsTable initialLeads={leads as any} />
    </div>
  );
}
