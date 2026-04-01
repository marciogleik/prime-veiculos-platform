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
  Loader2,
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
    <div className="space-y-4 sm:space-y-6">
      {/* Search + filter bar */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-900 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por cliente ou veículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 sm:h-14 rounded-2xl border-gray-100 bg-white shadow-sm focus:ring-primary/20 transition-all text-sm sm:text-base font-medium"
          />
        </div>
        
        {/* Horizontal scrollable status filters for mobile */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 lg:overflow-visible lg:pb-0 lg:mx-0 lg:px-0 no-scrollbar">
          {["all", "novo", "contatado", "negociando", "convertido", "perdido"].map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setSearch(""); }}
              className={cn(
                "h-10 sm:h-12 px-5 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest border transition-all whitespace-nowrap shrink-0",
                filterStatus === s
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                  : "bg-white text-slate-950 border-gray-200 hover:border-slate-400 hover:bg-slate-50"
              )}
            >
              {s === "all" ? "Todos" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats strip — clickable as quick filters */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = leads.filter((l) => l.status === key).length;
          const isActive = filterStatus === key;
          return (
            <button
              key={key}
              onClick={() => { setFilterStatus(isActive ? "all" : key); setSearch(""); }}
              className={cn(
                "bg-white rounded-3xl border p-4 sm:p-5 text-center transition-all hover:shadow-lg group",
                isActive ? "border-slate-900 ring-4 ring-slate-900/5" : "border-gray-100"
              )}
            >
              <p className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:scale-110 transition-transform">{count}</p>
              <Badge className={cn("font-black text-[9px] mt-2 rounded-full px-2 py-0.5", cfg.className)}>
                {cfg.label}
              </Badge>
            </button>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-gray-950">Cliente</TableHead>
              <TableHead className="py-5 font-black uppercase text-[10px] tracking-[0.2em] text-gray-950">Interesse</TableHead>
              <TableHead className="py-5 font-black uppercase text-[10px] tracking-[0.2em] text-gray-950">Responsável</TableHead>
              <TableHead className="py-5 font-black uppercase text-[10px] tracking-[0.2em] text-gray-950 text-center">Status</TableHead>
              <TableHead className="py-5 font-black uppercase text-[10px] tracking-[0.2em] text-gray-950 text-center">Quando</TableHead>
              <TableHead className="px-8 py-5 text-right font-black uppercase text-[10px] tracking-[0.2em] text-gray-950">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <Search className="w-12 h-12 text-gray-100" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum lead encontrado</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((lead) => {
                const s = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.novo;
                return (
                  <TableRow key={lead.id} className="border-gray-50/50 hover:bg-gray-50/30 transition-colors group">
                    <TableCell className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-900 text-base leading-tight">{lead.customer_name}</span>
                        <span className="text-[11px] text-gray-600 font-bold mt-1 tracking-wide">{lead.customer_whatsapp}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex flex-col">
                        <span className="font-black text-sm text-primary group-hover:underline underline-offset-4 decoration-primary/30">
                          {lead.vehicle?.brand?.name} {lead.vehicle?.model}
                        </span>
                        {lead.notes && (
                          <p className="text-[10px] text-gray-950 font-bold uppercase tracking-tight truncate max-w-[200px] mt-1 italic">
                            {lead.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                       <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                            <RefreshCw className="w-3 h-3 text-slate-400" />
                          </div>
                          <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">
                            {lead.seller?.name || "Não atribuído"}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <Badge className={cn("font-black text-[9px] rounded-full gap-1.5 px-3 py-1", s.className)}>
                        {s.icon}
                        {s.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5 text-center">
                      <span className="text-[11px] text-gray-950 font-black uppercase tracking-tighter">{timeAgo(lead.created_at)}</span>
                    </TableCell>
                    <TableCell className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 text-white">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-xl h-10 w-10 bg-green-500 hover:bg-green-600 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-green-500/20"
                          asChild
                        >
                          <a href={`https://wa.me/55${lead.customer_whatsapp.replace(/\D/g, "")}`} target="_blank" title="Abrir WhatsApp">
                            <MessageCircle className="w-5 h-5 text-white" />
                          </a>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 hover:bg-slate-100" disabled={isPending}>
                              {isPending ? (
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                              ) : (
                                <MoreHorizontal className="w-5 h-5 text-gray-600" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 shadow-2xl border-gray-100">
                            <DropdownMenuLabel className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">
                              Alterar Status
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-50 mb-1" />
                            {STATUS_TRANSITIONS.map((t) => (
                              <DropdownMenuItem
                                key={t.value}
                                disabled={lead.status === t.value}
                                className={cn(
                                  "rounded-xl px-4 py-3 cursor-pointer font-bold text-sm gap-3 transition-all",
                                  t.value === "convertido" ? "focus:bg-emerald-50 focus:text-emerald-700" :
                                  t.value === "perdido" ? "focus:bg-red-50 focus:text-red-600 text-red-500" :
                                  "focus:bg-primary/5 focus:text-primary",
                                  lead.status === t.value && "opacity-40 cursor-not-allowed"
                                )}
                                onClick={() => updateStatus(lead.id, t.value)}
                              >
                                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", lead.status === t.value ? "bg-gray-100" : "bg-slate-50")}>
                                   {t.icon}
                                </div>
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

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-4">
        {filtered.map((lead) => {
          const s = STATUS_CONFIG[lead.status] ?? STATUS_CONFIG.novo;
          return (
            <div key={lead.id} className="bg-white rounded-[2rem] border border-gray-100 p-5 shadow-sm active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-950 text-lg leading-tight truncate">{lead.customer_name}</h3>
                  <p className="text-xs text-gray-900 font-bold tracking-tight">{lead.customer_whatsapp}</p>
                </div>
                <Badge className={cn("font-black text-[9px] rounded-full px-3 py-1 shrink-0", s.className)}>
                  {s.label}
                </Badge>
              </div>

              <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
                <p className="text-[9px] font-black uppercase text-gray-950 tracking-widest mb-1">Interesse:</p>
                <p className="font-black text-sm text-primary truncate leading-tight">
                   {lead.vehicle?.brand?.name} {lead.vehicle?.model}
                </p>
                {lead.notes && (
                   <p className="text-[10px] text-slate-950 font-bold mt-1 line-clamp-2 leading-relaxed">
                     "{lead.notes}"
                   </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50/50">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-950" />
                    <span className="text-[11px] text-gray-950 font-black uppercase tracking-tighter">{timeAgo(lead.created_at)} atrás</span>
                  </div>
                 <div className="flex gap-2">
                   {/* WhatsApp Quick Action */}
                   <Button asChild value="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/20 active:scale-90">
                      <a href={`https://wa.me/55${lead.customer_whatsapp.replace(/\D/g, "")}`} target="_blank">
                        <MessageCircle className="w-5 h-5 text-white" />
                      </a>
                   </Button>
                   {/* More Options */}
                   <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-gray-100">
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2">
                        <DropdownMenuLabel className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Gerenciar Lead</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-50 mb-1" />
                        {STATUS_TRANSITIONS.map((t) => (
                          <DropdownMenuItem
                            key={t.value}
                            className="rounded-xl px-4 py-3 font-bold text-sm flex gap-3"
                            onClick={() => updateStatus(lead.id, t.value)}
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                              {t.icon}
                            </div>
                            {t.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                 </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="bg-white rounded-[2.5rem] border border-dashed border-gray-200 p-12 text-center">
             <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Nenhum resultado</p>
          </div>
        )}
      </div>
    </div>
  );
}
