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
  Trash2,
  Edit2,
  Phone,
  ArrowRight,
  Car,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { deleteLead, updateLead } from "@/lib/actions/leads";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Lead = {
  id: string;
  customer_name: string | null;
  customer_whatsapp: string | null;
  notes?: string | null;
  status: string | null;
  created_at: string;
  vehicle?: { 
    brand?: { name: string }; 
    model: string;
    photos?: { url: string }[];
  } | null;
  seller?: { id?: string; name: string } | null;
  seller_id?: string | null;
};

type Seller = {
  id: string;
  name: string;
};

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  novo:       { label: "NOVO",       className: "bg-red-600 text-white shadow-lg shadow-red-600/20",      icon: <Clock className="w-3 h-3" /> },
  contatado:  { label: "CONTATADO", className: "bg-blue-600 text-white shadow-lg shadow-blue-600/20",     icon: <MessageCircle className="w-3 h-3" /> },
  negociando: { label: "NEGOCIANDO",className: "bg-amber-500 text-white shadow-lg shadow-amber-500/20",    icon: <RefreshCw className="w-3 h-3" /> },
  convertido: { label: "CONVERTIDO",className: "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20",  icon: <CheckCircle className="w-3 h-3" /> },
  perdido:    { label: "PERDIDO",   className: "bg-slate-900 text-white shadow-lg shadow-slate-900/10",     icon: <XCircle className="w-3 h-3" /> },
};

const STATUS_OPTIONS = [
  { value: "novo",       label: "Novo Lead",        icon: <Clock className="w-4 h-4" /> },
  { value: "contatado",  label: "Contatado",        icon: <MessageCircle className="w-4 h-4" /> },
  { value: "negociando", label: "Em Negociação",    icon: <RefreshCw className="w-4 h-4" /> },
  { value: "convertido", label: "Convertido",       icon: <CheckCircle className="w-4 h-4" /> },
  { value: "perdido",    label: "Perdido",          icon: <XCircle className="w-4 h-4" /> },
];

function timeAgo(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  } catch (e) {
    return "---";
  }
}

export default function LeadsTable({ initialLeads, sellers }: { initialLeads: Lead[], sellers: Seller[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  const filtered = (leads || []).filter((l) => {
    const customerName = l.customer_name || "";
    const vehicleBrand = l.vehicle?.brand?.name || "";
    const vehicleModel = l.vehicle?.model || "";
    const status = l.status || "novo";

    const matchSearch =
      search === "" ||
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      `${vehicleBrand} ${vehicleModel}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || status === filterStatus;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (leadId: string, newStatus: string) => {
    startTransition(async () => {
      try {
        await updateLead(leadId, { status: newStatus });
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
        toast.success("Status atualizado!");
      } catch (e) {
        toast.error("Erro ao atualizar status");
      }
    });
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLead) return;

    setIsSaving(true);
    try {
      const { id, vehicle, seller: sellerData, created_at, ...updateData } = editingLead;
      
      const cleanData = {
        ...updateData,
        customer_name: updateData.customer_name || "",
        customer_whatsapp: updateData.customer_whatsapp || "",
        status: updateData.status || "novo",
      };

      await updateLead(id, cleanData);
      
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...editingLead } : l))
      );
      
      toast.success("Lead atualizado com sucesso!");
      setEditingLead(null);
    } catch (e) {
      toast.error("Erro ao salvar alterações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o lead de ${name}?`)) return;

    startTransition(async () => {
      try {
        await deleteLead(id);
        setLeads((prev) => prev.filter((l) => l.id !== id));
        toast.success("Lead excluído");
      } catch (e) {
        toast.error("Erro ao excluir lead");
      }
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col lg:flex-row gap-3 md:gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-950 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Buscar por cliente ou veículo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-12 md:h-14 lg:h-16 rounded-2xl md:rounded-3xl border-slate-200 bg-white shadow-sm focus:ring-primary/20 transition-all text-sm md:text-base lg:text-lg font-bold text-slate-950 placeholder:text-slate-300"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {["all", "novo", "contatado", "negociando", "convertido", "perdido"].map((s) => (
            <button
              key={s}
              onClick={() => { setFilterStatus(s); setSearch(""); }}
              className={cn(
                "h-12 md:h-14 lg:h-16 px-5 md:px-7 lg:px-8 rounded-2xl md:rounded-3xl text-[9px] md:text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] border transition-all whitespace-nowrap",
                filterStatus === s
                  ? "bg-slate-950 text-white border-slate-950 shadow-2xl shadow-slate-950/20"
                  : "bg-white text-slate-950 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
              )}
            >
              {s === "all" ? "Todos" : STATUS_CONFIG[s]?.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = leads.filter((l) => l.status === key).length;
          const isActive = filterStatus === key;
          return (
            <button
              key={key}
              onClick={() => { setFilterStatus(isActive ? "all" : key); setSearch(""); }}
              className={cn(
                "bg-white rounded-[1.5rem] md:rounded-[2.5rem] border p-4 md:p-6 lg:p-8 text-left transition-all hover:scale-[1.02] active:scale-95 group relative overflow-hidden",
                isActive ? "border-slate-950 ring-2 md:ring-4 ring-slate-950/5 shadow-2xl" : "border-slate-100"
              )}
            >
              <div className={cn("absolute top-0 right-0 w-12 md:w-16 lg:w-20 h-12 md:h-16 lg:h-20 opacity-10 -mr-4 -mt-4", cfg.className)} />
              <p className="text-2xl md:text-4xl lg:text-5xl font-display font-black text-slate-950 mb-1 md:mb-2 leading-none">{count}</p>
              <span className={cn("inline-flex items-center gap-1 md:gap-2 font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] rounded-full px-2 md:px-4 py-1.5", cfg.className)}>
                {cfg.icon}
                {cfg.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-[3rem] border-2 border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-slate-100 bg-slate-50/80">
              <TableHead className="px-10 py-8 font-black uppercase text-[11px] tracking-[0.4em] text-slate-900 border-r border-slate-100/50">Cliente</TableHead>
              <TableHead className="py-8 font-black uppercase text-[11px] tracking-[0.4em] text-slate-900">Interesse</TableHead>
              <TableHead className="py-8 font-black uppercase text-[11px] tracking-[0.4em] text-slate-900">Consultor</TableHead>
              <TableHead className="py-8 font-black uppercase text-[11px] tracking-[0.4em] text-slate-900 text-center">Status</TableHead>
              <TableHead className="py-8 font-black uppercase text-[11px] tracking-[0.4em] text-slate-900 text-center">Entrada</TableHead>
              <TableHead className="px-10 py-8 text-right font-black uppercase text-[11px] tracking-[0.4em] text-slate-900">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-40">
                  <div className="flex flex-col items-center gap-8">
                    <div className="w-24 h-24 bg-slate-100 rounded-[3rem] flex items-center justify-center animate-bounce">
                      <Search className="w-10 h-10 text-slate-300" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-display font-black text-slate-950 tracking-tight">Nenhum lead encontrado</h3>
                      <p className="text-slate-950 font-bold text-base mt-2">Tente buscar por outro nome ou ajuste o filtro de status.</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((lead) => {
                const status = lead.status || "novo";
                const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.novo;
                const vehicleImage = lead.vehicle?.photos?.[0]?.url;

                return (
                  <TableRow key={lead.id} className="border-slate-50 hover:bg-slate-50/50 transition-all group">
                    <TableCell className="px-10 py-8 border-r border-slate-50">
                      <div className="flex flex-col">
                        <span className="font-black text-slate-950 text-lg tracking-tighter leading-none">{lead.customer_name}</span>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="bg-green-100 p-1 rounded-md">
                            <Phone className="w-3 h-3 text-green-700" />
                          </div>
                          <span className="text-xs text-slate-950 font-black tracking-tight">{lead.customer_whatsapp}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-8">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-md shrink-0 flex items-center justify-center">
                          {vehicleImage ? (
                            <img src={vehicleImage} alt={lead.vehicle?.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          ) : (
                            <Car className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-base text-slate-950 group-hover:text-primary transition-colors">
                            {lead.vehicle?.brand?.name} {lead.vehicle?.model}
                          </span>
                          {lead.notes && (
                            <div className="flex items-center gap-2 mt-1.5 max-w-[280px]">
                              <ArrowRight className="w-3 h-3 text-primary" />
                              <p className="text-[11px] text-slate-600 font-bold italic truncate">
                                {lead.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-8">
                       <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full bg-slate-950 flex items-center justify-center font-black text-xs text-white border-2 border-white shadow-sm overflow-hidden uppercase">
                            {lead.seller?.name?.substring(0, 2) || "?"}
                          </div>
                          <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest leading-none">
                            {lead.seller?.name || "Livre"}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell className="py-8 text-center">
                      <Select value={status} onValueChange={(val) => val && updateStatus(lead.id, val)} disabled={isPending}>
                        <SelectTrigger className={cn("h-11 border-0 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] px-5 gap-3 focus:ring-4 focus:ring-slate-900/5 shadow-md", s.className)}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-3xl border-slate-200 shadow-2xl p-2 bg-white">
                          {STATUS_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="rounded-2xl font-black py-4 px-5 text-[10px] uppercase tracking-widest focus:bg-slate-50">
                              <div className="flex items-center gap-3">
                                {opt.icon}
                                {opt.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="py-8 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm text-slate-950 font-black tracking-tighter tabular-nums">{timeAgo(lead.created_at)}</span>
                        <div className="h-1 w-4 bg-slate-200 rounded-full mt-1" />
                      </div>
                    </TableCell>
                    <TableCell className="px-10 py-8 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          className="rounded-2xl h-12 w-12 md:h-14 md:w-14 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-xl shadow-emerald-500/30 active:scale-90 transition-all"
                          asChild
                        >
                          <a href={`https://wa.me/55${(lead.customer_whatsapp ?? "").replace(/\D/g, "")}`} target="_blank" title="Falar agora">
                            <MessageCircle className="w-6 h-6 md:w-7 md:h-7" />
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingLead(lead)}
                          className="rounded-2xl h-12 w-12 md:h-14 md:w-14 bg-slate-950 hover:bg-black text-white border-0 shadow-xl shadow-slate-950/20 active:scale-90 transition-all font-black text-xs"
                          title="Editar"
                        >
                          <Edit2 className="w-5 h-5 md:w-6 md:h-6" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white border-2 border-slate-100 shadow-sm hover:border-red-600 hover:bg-red-50 group transition-all duration-300">
                              <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-slate-300 group-hover:text-red-300" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64 rounded-[2rem] p-4 border-slate-100 shadow-2xl bg-white">
                             <DropdownMenuItem
                                onClick={() => handleDelete(lead.id, lead.customer_name || "Cliente")}
                                className="rounded-2xl py-4 px-5 font-black text-xs text-red-600 hover:bg-red-50 cursor-pointer gap-4"
                              >
                                <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                                  <Trash2 className="w-5 h-5" />
                                </div>
                                EXCLUIR DEFINITIVAMENTE
                              </DropdownMenuItem>
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

      {/* Mobile View - High Contrast Cards */}
      <div className="lg:hidden space-y-4 md:space-y-6">
        {filtered.map((lead) => {
          const vehicleImage = lead.vehicle?.photos?.[0]?.url;
          const statusKey = lead.status || "novo";
          return (
            <div key={lead.id} className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-5 sm:p-7 md:p-8 border md:border-2 border-slate-100 shadow-xl relative overflow-hidden active:scale-[0.98] transition-transform">
              <div className="flex justify-between items-start mb-4 md:mb-6">
                <div className="flex flex-col">
                  <span className="font-black text-lg sm:text-2xl text-slate-950 tracking-tighter leading-tight">{lead.customer_name}</span>
                  <div className="flex items-center gap-2 mt-1 md:mt-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] md:text-[10px] font-black text-slate-950 uppercase tracking-widest">{timeAgo(lead.created_at)} atrás</span>
                  </div>
                </div>
                <Badge className={cn("font-black text-[8px] md:text-[10px] rounded-full px-3 md:px-4 py-1.5 md:py-2 uppercase tracking-widest border-0 shadow-lg", STATUS_CONFIG[statusKey].className)}>
                  {STATUS_CONFIG[statusKey].label}
                </Badge>
              </div>

              <div className="bg-slate-50 rounded-2xl md:rounded-3xl p-4 md:p-5 mb-5 md:mb-8 border border-slate-100 flex items-center gap-3 md:gap-4">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl md:rounded-2xl bg-white overflow-hidden shadow-sm shrink-0 flex items-center justify-center">
                   {vehicleImage ? (
                      <img src={vehicleImage} alt={lead.vehicle?.model || "Carro"} className="w-full h-full object-cover" />
                   ) : (
                      <Car className="w-6 h-6 sm:w-8 sm:h-8 text-slate-200" />
                   )}
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[10px] font-black text-slate-950 uppercase tracking-[0.2em] mb-1">Interesse</span>
                  <p className="font-black text-sm sm:text-base text-slate-950 leading-tight">{lead.vehicle?.brand?.name} {lead.vehicle?.model}</p>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:gap-3">
                <Button asChild className="h-12 sm:h-14 md:h-16 rounded-2xl md:rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white font-black tracking-widest text-[9px] md:text-[11px] shadow-2xl shadow-emerald-500/20">
                   <a href={`https://wa.me/55${(lead.customer_whatsapp ?? "").replace(/\D/g, "")}`} target="_blank">
                      <MessageCircle className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
                      CHAMAR NO WHATSAPP
                   </a>
                </Button>
                <div className="grid grid-cols-2 gap-2 md:gap-3">
                  <Button onClick={() => setEditingLead(lead)} className="h-12 sm:h-14 md:h-16 rounded-2xl md:rounded-3xl bg-slate-950 text-white font-black tracking-widest text-[9px] md:text-[11px] hover:bg-black shadow-xl">
                     <Edit2 className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                     EDITAR
                  </Button>
                  <Select value={lead.status || "novo"} onValueChange={(val) => updateStatus(lead.id, val)}>
                     <SelectTrigger className={cn("h-12 sm:h-14 md:h-16 rounded-2xl md:rounded-3xl border-0 font-black text-[9px] md:text-[10px] uppercase tracking-widest shadow-xl", STATUS_CONFIG[lead.status || "novo"].className)}>
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent className="rounded-2xl md:rounded-3xl p-2 border-0 bg-white shadow-2xl">
                        {STATUS_OPTIONS.map((opt) => (
                           <SelectItem key={opt.value} value={opt.value} className="rounded-xl md:rounded-2xl py-3 md:py-4 font-black text-[9px] md:text-[10px] uppercase tracking-widest">
                              {opt.label}
                           </SelectItem>
                        ))}
                     </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Edit Lead Dialog - Modern & Ultra Responsive */}
      <Dialog open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
        <DialogContent className="w-[95%] sm:max-w-[680px] rounded-[2rem] md:rounded-[3.5rem] p-6 sm:p-10 md:p-12 border-0 shadow-[0_0_100px_rgba(0,0,0,0.15)] bg-white overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
          <div className="absolute top-0 left-0 w-full h-2 bg-slate-950" />
          
          <DialogHeader className="mb-6 md:mb-10 text-left">
            <div className="flex items-center gap-4 md:gap-7 mb-2 md:mb-4">
              <div className="w-14 h-14 md:w-20 md:h-20 bg-slate-950 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-slate-950/30">
                <Edit2 className="w-7 h-7 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <span className="text-[10px] md:text-xs font-black text-primary uppercase tracking-[0.4em]">CRM Administrador</span>
                <DialogTitle className="text-2xl md:text-4xl font-display font-black tracking-tighter text-slate-950 mt-1">
                  Editar <span className="text-primary italic">Lead</span>
                </DialogTitle>
              </div>
            </div>
          </DialogHeader>
          
          {editingLead && (
            <form onSubmit={handleSaveEdit} className="space-y-6 md:space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 ml-1">Nome Completo</Label>
                  <Input 
                    value={editingLead.customer_name as string || ""}
                    onChange={(e) => setEditingLead({...editingLead, customer_name: e.target.value})}
                    className="h-14 md:h-16 rounded-xl md:rounded-2xl border-2 border-slate-100 bg-slate-50 font-black text-slate-950 focus-visible:ring-slate-950/20 focus-visible:border-slate-950 transition-all text-sm md:text-base px-6"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 ml-1">WhatsApp</Label>
                  <Input 
                    value={editingLead.customer_whatsapp as string || ""}
                    onChange={(e) => setEditingLead({...editingLead, customer_whatsapp: e.target.value})}
                    className="h-14 md:h-16 rounded-xl md:rounded-2xl border-2 border-slate-100 bg-slate-50 font-black text-slate-950 focus-visible:ring-slate-950/20 focus-visible:border-slate-950 transition-all text-sm md:text-base px-6"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-3">
                  <Label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 ml-1">Consultor</Label>
                  <Select
                    value={editingLead.seller_id as string || "none"}
                    onValueChange={(val) => {
                      const sel = sellers.find(s => s.id === val);
                      setEditingLead({
                        ...editingLead, 
                        seller_id: val === "none" ? "" : val,
                        seller: val === "none" ? null : { name: sel?.name || "" }
                      });
                    }}
                  >
                    <SelectTrigger className="h-14 md:h-16 rounded-xl md:rounded-2xl border-2 border-slate-100 bg-slate-50 font-black text-[10px] md:text-xs text-slate-950 uppercase tracking-[0.1em] px-6 shadow-sm overflow-hidden whitespace-nowrap">
                      <SelectValue placeholder="Selecione um vendedor..." />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl md:rounded-3xl border-slate-100 shadow-2xl p-2 md:p-3 bg-white">
                      <SelectItem value="none" className="rounded-xl md:rounded-2xl py-3 md:py-4 text-slate-400 font-bold italic">Ninguém atribuído</SelectItem>
                      {sellers.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="rounded-xl md:rounded-2xl py-3 md:py-4 font-black text-[10px] md:text-xs uppercase tracking-widest focus:bg-slate-50 uppercase">{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 ml-1">Estágio</Label>
                  <Select
                    value={(editingLead.status as string) || "novo"}
                    onValueChange={(val) => setEditingLead({...editingLead, status: val})}
                  >
                    <SelectTrigger className="h-14 md:h-16 rounded-xl md:rounded-2xl border-2 border-slate-100 bg-slate-50 font-black text-[10px] md:text-xs text-slate-950 uppercase tracking-[0.1em] px-6 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl md:rounded-3xl border-slate-100 shadow-2xl p-2 md:p-3 bg-white">
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="rounded-xl md:rounded-2xl py-3 md:py-4 font-black text-[10px] md:text-xs uppercase tracking-widest focus:bg-slate-50">
                           <div className="flex items-center gap-2 md:gap-3">
                              {opt.icon}
                              {opt.label}
                           </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 ml-1">Notas da Negociação</Label>
                <Textarea 
                  value={editingLead.notes || ""}
                  onChange={(e) => setEditingLead({...editingLead, notes: e.target.value})}
                  placeholder="Quais são as intenções do cliente?"
                  className="rounded-2xl md:rounded-3xl border-2 border-slate-100 bg-slate-50 min-h-[120px] md:min-h-[160px] resize-none font-bold text-slate-900 p-6 md:p-8 focus-visible:ring-slate-950/20 focus-visible:border-slate-950 transition-all placeholder:text-slate-400 text-sm md:text-base"
                />
              </div>

              <DialogFooter className="pt-6 md:pt-10 flex flex-col-reverse sm:flex-row gap-3 md:gap-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setEditingLead(null)}
                  className="rounded-xl md:rounded-2xl h-14 md:h-18 px-6 md:px-8 font-black text-slate-400 hover:text-slate-950 uppercase tracking-[0.3em] text-[10px] transition-all w-full sm:w-auto"
                >
                  CANCELAR
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-slate-950 hover:bg-black text-white rounded-2xl md:rounded-[2rem] h-14 md:h-18 px-8 md:px-10 font-black tracking-[0.2em] text-[11px] shadow-2xl shadow-slate-950/20 active:scale-95 transition-all w-full sm:w-auto border-0"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin mr-2 md:mr-3" />
                  ) : (
                    <Save className="w-4 h-4 md:w-5 md:h-5 mr-2 md:mr-3" />
                  )}
                  SALVAR DADOS
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
