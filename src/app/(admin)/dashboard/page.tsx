import { createClient } from "@/lib/supabase/server";
import DashboardCharts from "@/components/admin/DashboardCharts";
import { 
  Car, 
  MessageSquare, 
  TrendingUp, 
  AlertCircle,
  ChevronRight,
  User
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

export default async function DashboardPage() {
  const supabase = await createClient();

  // Fetch Stats (Mock logic for now, real queries soon)
  const { count: totalVehicles } = await supabase.from("vehicles").select("*", { count: "exact", head: true });
  const { count: totalLeads } = await supabase.from("leads").select("*", { count: "exact", head: true });
  const { data: recentLeads } = await supabase
    .from("leads")
    .select("*, vehicle:vehicles(model, brand:brands(name))")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { label: "Total em Estoque", value: totalVehicles || 0, icon: Car, color: "bg-blue-500" },
    { label: "Leads Recebidos", value: totalLeads || 0, icon: MessageSquare, color: "bg-primary" },
    { label: "Taxa de Conversão", value: "12.5%", icon: TrendingUp, color: "bg-green-500" },
    { label: "Média Permanência", value: "24 dias", icon: TrendingUp, color: "bg-orange-500" },
  ];

  return (
    <div className="space-y-12">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-2xl`}>
                  <stat.icon className="text-white w-6 h-6" />
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 font-bold">+2.4%</Badge>
              </div>
              <div>
                <span className="text-gray-400 text-sm font-bold uppercase tracking-widest">{stat.label}</span>
                <p className="text-3xl font-display font-bold mt-1">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Charts */}
      <DashboardCharts />

      {/* Recent Activity Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 rounded-3xl border-none shadow-sm overflow-hidden">
          <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-display font-bold">Últimos Leads</CardTitle>
            <Button asChild variant="ghost" className="text-primary font-bold">
              <Link href="/dashboard/leads"> Ver Todos <ChevronRight className="ml-1 w-4 h-4" /> </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-gray-50">
                  <TableHead className="px-8 font-bold uppercase text-[10px] tracking-widest">Cliente</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest">Veículo</TableHead>
                  <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center">Status</TableHead>
                  <TableHead className="px-8 text-right font-bold uppercase text-[10px] tracking-widest">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentLeads?.map((lead) => (
                  <TableRow key={lead.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <TableCell className="px-8 py-4 font-bold">{lead.customer_name}</TableCell>
                    <TableCell className="py-4">
                      <span className="font-medium text-gray-500">
                        {lead.vehicle?.brand?.name} {lead.vehicle?.model}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Badge className={cn(
                        "font-bold text-[10px]",
                        lead.status === 'novo' ? 'bg-primary' : 'bg-gray-400'
                      )}>
                        {lead.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-8 py-4 text-right text-gray-400 text-sm">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Inventory Alert */}
        <Card className="rounded-3xl border-none shadow-sm bg-black text-white p-8 group">
          <div className="flex items-center gap-3 mb-8">
            <AlertCircle className="text-primary w-6 h-6" />
            <h3 className="text-xl font-display font-bold">Alerta de Estoque</h3>
          </div>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Você possui <span className="text-primary font-bold">3 veículos</span> há mais de 60 dias no estoque sem proposta.
          </p>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
                <div className="w-10 h-10 rounded-xl bg-gray-800" />
                <div className="flex-1">
                  <span className="block text-sm font-bold">BMW 320i M Sport</span>
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest">Aguardando Venda</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-primary transition-colors" />
              </div>
            ))}
          </div>
          <Button className="w-full mt-10 h-14 bg-white text-black font-bold hover:bg-primary hover:text-white transition-all rounded-xl">
            REVISAR ESTOQUE ANTIGO
          </Button>
        </Card>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
