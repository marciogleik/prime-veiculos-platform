"use client";

import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MoreHorizontal,
  MessageCircle,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Lead = {
  id: string;
  customer_name: string;
  customer_whatsapp: string;
  notes?: string;
  status: string;
  created_at: string;
  vehicle?: { brand?: { name: string }; model: string } | null;
  seller?: { name: string } | null;
};

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  novo:       { label: "NOVO",       className: "bg-primary",      icon: <Clock className="w-3 h-3" /> },
  contatado:  { label: "CONTATADO", className: "bg-blue-500",     icon: <MessageCircle className="w-3 h-3" /> },
  negociando: { label: "NEGOCIANDO",className: "bg-orange-500",   icon: <RefreshCw className="w-3 h-3" /> },
  convertido: { label: "CONVERTIDO",className: "bg-emerald-500",  icon: <CheckCircle className="w-3 h-3" /> },
  perdido:    { label: "PERDIDO",   className: "bg-gray-400",     icon: <XCircle className="w-3 h-3" /> },
};

const STATUS_TRANSITIONS = [
  { value: "contatado",  label: "Marcar como Contatado",   icon: <MessageCircle className="w-4 h-4" /> },
  { value: "negociando", label: "Em Negociação",            icon: <RefreshCw className="w-4 h-4" /> },
  { value: "convertido", label: "✅ CONVERTIDO (Vendido)",  icon: <CheckCircle className="w-4 h-4" /> },
  { value: "perdido",    label: "❌ Lead Perdido",           icon: <XCircle className="w-4 h-4" /> },
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export default function LeadsTable({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  const filtered = leads.filter((l) => {
    const matchSearch =
      search === "" ||
      l.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      `${l.vehicle?.brand?.name} ${l.vehicle?.model}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || l.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (leadId: string, newStatus: string) => {
    startTransition(async () => {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) {
        toast.error("Erro ao atualizar status");
        return;
      }

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
      );
      toast.success("Status atualizado!");
    });
  };

  return (
    <div className="space-y-6">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar cliente ou veículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 rounded-xl"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "novo", "contatado", "negociando", "convertido", "perdido"].map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setSearch(""); }}
              className={cn(
                "h-12 px-4 rounded-xl text-xs font-black uppercase tracking-wider border transition-all",
                filterStatus === s
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-gray-200 hover:border-slate-400"
              )}
            >
              {s === "all" ? "Todos" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip — clickable as quick filters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = leads.filter((l) => l.status === key).length;
          const isActive = filterStatus === key;
          return (
            <button
              key={key}
              onClick={() => { setFilterStatus(isActive ? "all" : key); setSearch(""); }}
              className={cn(
                "bg-white rounded-2xl border p-4 text-center transition-all hover:shadow-md",
                isActive ? "border-slate-900 ring-2 ring-slate-900/10" : "border-gray-100"
              )}
            >
              <p className="text-2xl font-black text-slate-900">{count}</p>
              <Badge className={cn("font-black text-[9px] mt-1 rounded-full", cfg.className)}>
                {cfg.label}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-50">
              <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest">Cliente</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Interesse</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest">Responsável</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Status</TableHead>
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Quando</TableHead>
              <TableHead className="px-8 font-black uppercase text-[10px] tracking-widest text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-gray-400">
                  Nenhum lead encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((lead) => {
                const s = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.novo;
                return (
                  <TableRow key={lead.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <TableCell className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{lead.customer_name}</span>
                        <span className="text-xs text-gray-400 font-medium">{lead.customer_whatsapp}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-primary">
                          {lead.vehicle?.brand?.name} {lead.vehicle?.model}
                        </span>
                        {lead.notes && (
                          <span className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[180px]">
                            {lead.notes}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium text-gray-600">
                        {lead.seller?.name || "Não atribuído"}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={cn("font-black text-[10px] rounded-full gap-1", s.className)}>
                        {s.icon}
                        {s.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-xs text-gray-400 font-bold">{timeAgo(lead.created_at)}</span>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-full border-green-100 hover:bg-green-50 text-green-600"
                          asChild
                        >
                          <a
                            href={`https://wa.me/55${lead.customer_whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full" disabled={isPending}>
                              <MoreHorizontal className="w-5 h-5 text-gray-400" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2">
                            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase text-gray-400 tracking-widest">
                              Alterar Status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-50" />
                            {STATUS_TRANSITIONS.map((t) => (
                              <DropdownMenuItem
                                key={t.value}
                                disabled={lead.status === t.value}
                                className={cn(
                                  "rounded-xl px-3 py-2 cursor-pointer font-bold text-sm gap-2",
                                  t.value === "convertido"
                                    ? "focus:bg-emerald-50 focus:text-emerald-700"
                                    : t.value === "perdido"
                                    ? "focus:bg-red-50 focus:text-red-600 text-red-500"
                                    : "focus:bg-primary/5 focus:text-primary",
                                  lead.status === t.value && "opacity-40 cursor-not-allowed"
                                )}
                                onClick={() => updateStatus(lead.id, t.value)}
                              >
                                {t.icon}
                                {t.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
