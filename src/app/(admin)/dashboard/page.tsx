import { createClient } from "@/lib/supabase/server";
import DashboardCharts from "@/components/admin/DashboardCharts";
import { 
  Car, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MOCK_VEHICLES } from "@/lib/mock-vehicles";

const MOCK_LEADS = [
  { id: "l1", customer_name: "Rafael Monteiro", customer_whatsapp: "11999990001", vehicle: { brand: { name: "Porsche" }, model: "911 GT3 RS" }, status: "novo", created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  { id: "l2", customer_name: "Beatriz Almeida", customer_whatsapp: "21999990002", vehicle: { brand: { name: "Lamborghini" }, model: "Huracán STO" }, status: "contatado", created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: "l3", customer_name: "Carlos Eduardo Nunes", customer_whatsapp: "11999990003", vehicle: { brand: { name: "BMW" }, model: "M4 Competition" }, status: "negociando", created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() },
  { id: "l4", customer_name: "Fernanda Lima", customer_whatsapp: "51999990004", vehicle: { brand: { name: "Mercedes-AMG" }, model: "G 63 Edition 1" }, status: "novo", created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString() },
  { id: "l5", customer_name: "Thiago Ramos", customer_whatsapp: "31999990005", vehicle: { brand: { name: "Audi" }, model: "RS6 Avant" }, status: "convertido", created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
];

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  novo:       { label: "NOVO",       className: "bg-primary" },
  contatado:  { label: "CONTATADO", className: "bg-blue-500" },
  negociando: { label: "NEGOCIANDO",className: "bg-orange-500" },
  convertido: { label: "CONVERTIDO",className: "bg-green-500" },
  perdido:    { label: "PERDIDO",   className: "bg-gray-400" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min atrás`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h atrás`;
  return `${Math.floor(hrs / 24)}d atrás`;
}

export default async function DashboardPage() {
  const supabase = await createClient();

  const { count: totalVehicles } = await supabase.from("vehicles").select("*", { count: "exact", head: true });
  const { count: totalLeads } = await supabase.from("leads").select("*", { count: "exact", head: true });
  const { data: dbLeads } = await supabase
    .from("leads")
    .select("*, vehicle:vehicles(model, brand:brands(name))")
    .order("created_at", { ascending: false })
    .limit(5);

  // Use real data if available, mock otherwise
  const vehicleCount = totalVehicles || MOCK_VEHICLES.length;
  const leadCount = totalLeads || MOCK_LEADS.length;
  const recentLeads = (dbLeads && dbLeads.length > 0) ? dbLeads : MOCK_LEADS;

  const stats = [
    { label: "Veículos em Estoque", value: vehicleCount, icon: Car, color: "bg-slate-900", trend: "+2" },
    { label: "Leads Recebidos", value: leadCount, icon: MessageSquare, color: "bg-primary", trend: "+5" },
    { label: "Taxa de Conversão", value: "18,5%", icon: TrendingUp, color: "bg-emerald-500", trend: "+1.2%" },
    { label: "Tempo Médio de Venda", value: "21 dias", icon: Clock, color: "bg-orange-500", trend: "-3d" },
  ];

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-[11px] sm:text-xs font-black text-gray-500 uppercase tracking-[0.3em] mb-2 leading-none">Visão Geral</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-950">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-gray-600 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm self-start sm:self-auto">
          <Clock className="w-4 h-4 text-primary" />
          Sincronizado agora
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-[2rem] border-none shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-center justify-between mb-6 sm:mb-7">
                <div className={`${stat.color} p-3 sm:p-4 rounded-2xl sm:rounded-[1.5rem] shadow-lg shadow-black/10`}>
                  <stat.icon className="text-white size-5 sm:size-6" />
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 font-black text-[10px] sm:text-[11px] rounded-full px-3 py-1">
                  {stat.trend}
                </Badge>
              </div>
              <p className="text-gray-600 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <p className="text-3xl sm:text-4xl font-black text-gray-950">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <DashboardCharts />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <Card className="lg:col-span-2 rounded-[2rem] border-none shadow-sm overflow-hidden">
          <CardHeader className="p-6 sm:p-8 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-lg sm:text-xl font-display font-black">Últimos Leads</CardTitle>
            <Button asChild variant="ghost" className="text-primary font-bold text-xs sm:text-sm h-8 sm:h-9 rounded-xl px-2 sm:px-4">
              <Link href="/dashboard/leads" className="flex items-center">
                Ver Todos <ChevronRight className="ml-1 w-3 h-3 sm:w-4 sm:h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 mt-4 overflow-x-auto">
            <div className="min-w-[600px] lg:min-w-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-gray-100">
                    <TableHead className="px-8 sm:px-10 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.2em] text-gray-500 py-6">Cliente</TableHead>
                    <TableHead className="font-black uppercase text-[10px] sm:text-[11px] tracking-[0.2em] text-gray-500 py-6">Veículo</TableHead>
                    <TableHead className="font-black uppercase text-[10px] sm:text-[11px] tracking-[0.2em] text-gray-500 text-center py-6">Status</TableHead>
                    <TableHead className="px-8 sm:px-10 font-black uppercase text-[10px] sm:text-[11px] tracking-[0.2em] text-gray-500 text-right py-6">Quando</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLeads.map((lead: any) => {
                    const s = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.novo;
                    return (
                      <TableRow key={lead.id} className="border-gray-100 hover:bg-gray-50/50 transition-colors group">
                        <TableCell className="px-8 sm:px-10 py-6">
                          <p className="font-black text-sm sm:text-base text-gray-900 leading-tight">{lead.customer_name}</p>
                          <p className="text-[11px] text-primary font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">Detalhes técnicos →</p>
                        </TableCell>
                        <TableCell className="py-6">
                          <div className="text-gray-700 font-bold text-xs sm:text-sm truncate max-w-[180px]">
                            {lead.vehicle?.brand?.name} {lead.vehicle?.model}
                          </div>
                        </TableCell>
                        <TableCell className="py-6 text-center">
                          <Badge className={cn("font-black text-[10px] sm:text-[11px] tracking-widest rounded-md px-3 py-1 shadow-sm", s.className)}>
                            {s.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-8 sm:px-10 py-6 text-right text-gray-600 text-xs font-bold">
                          {timeAgo(lead.created_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Quick actions / Stock alert */}
        <Card className="rounded-[2.5rem] border-none shadow-sm bg-black text-white p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="text-primary w-5 h-5" />
            <h3 className="text-lg font-display font-black">Ações Rápidas</h3>
          </div>
          <div className="space-y-3">
            {[
              { label: "Adicionar Veículo", href: "/dashboard/veiculos/novo", color: "bg-primary" },
              { label: "Ver Todos os Leads", href: "/dashboard/leads", color: "bg-white/10" },
              { label: "Gerenciar Equipe", href: "/dashboard/vendedores", color: "bg-white/10" },
              { label: "Consulta CPF", href: "/dashboard/consulta-cpf", color: "bg-white/10" },
            ].map((a) => (
              <Link key={a.href} href={a.href}
                className={cn("flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-sm transition-all hover:opacity-80", a.color)}
              >
                {a.label}
                <ChevronRight className="w-4 h-4 opacity-60" />
              </Link>
            ))}
          </div>
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              <span className="text-primary font-black">{vehicleCount} veículos</span> ativos no catálogo. Mantenha os dados sempre atualizados para melhores resultados.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
