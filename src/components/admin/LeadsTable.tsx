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
  Trash2,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
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
  vehicle?: { brand?: { name: string }; model: string } | null;
  seller?: { id?: string; name: string } | null;
  seller_id?: string | null;
};

type Seller = {
  id: string;
  name: string;
};

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  novo:       { label: "NOVO",       className: "bg-primary text-white",      icon: <Clock className="w-3 h-3" /> },
  contatado:  { label: "CONTATADO", className: "bg-blue-500 text-white",     icon: <MessageCircle className="w-3 h-3" /> },
  negociando: { label: "NEGOCIANDO",className: "bg-orange-500 text-white",   icon: <RefreshCw className="w-3 h-3" /> },
  convertido: { label: "CONVERTIDO",className: "bg-emerald-500 text-white",  icon: <CheckCircle className="w-3 h-3" /> },
  perdido:    { label: "PERDIDO",   className: "bg-gray-400 text-white",     icon: <XCircle className="w-3 h-3" /> },
};

const STATUS_TRANSITIONS = [
  { value: "contatado",  label: "Marcar como Contatado",   icon: <MessageCircle className="w-4 h-4" /> },
  { value: "negociando", label: "Em Negociação",            icon: <RefreshCw className="w-4 h-4" /> },
  { value: "convertido", label: "✅ CONVERTIDO (Vendido)",  icon: <CheckCircle className="w-4 h-4" /> },
  { value: "perdido",    label: "❌ Lead Perdido",           icon: <XCircle className="w-4 h-4" /> },
];

function timeAgo(iso: string) {
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}min`;
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
    <div className="space-y-4 sm:space-y-6">
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
                const status = lead.status || "novo";
                const s = STATUS_CONFIG[status] ?? STATUS_CONFIG.novo;
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
                      <Badge className={cn("font-black text-[9px] rounded-full gap-1.5 px-3 py-1 border-0", s.className)}>
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
                          <a href={`https://wa.me/55${(lead.customer_whatsapp || "").replace(/\D/g, "")}`} target="_blank" title="Abrir WhatsApp">
                            <MessageCircle className="w-5 h-5 text-white" />
                          </a>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-xl h-10 w-10 bg-white border border-gray-100 shadow-sm hover:bg-slate-50 hover:border-primary/20 hover:shadow-md hover:scale-105 transition-all duration-300" 
                              disabled={isPending}
                            >
                              {isPending ? (
                                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                              ) : (
                                <MoreHorizontal className="w-5 h-5 text-gray-400" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 shadow-2xl border-gray-100">
                            <DropdownMenuLabel className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">
                              Ações Rápidas
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-gray-50 mb-1" />
                            <DropdownMenuItem
                              className="rounded-xl px-4 py-3 cursor-pointer font-bold text-sm gap-3 transition-all focus:bg-primary/5 focus:text-primary"
                              onClick={() => setEditingLead(lead)}
                            >
                              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                <Edit2 className="w-4 h-4" />
                              </div>
                              Editar Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-50 my-1" />
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
                            <DropdownMenuSeparator className="bg-gray-50 my-1" />
                            <DropdownMenuItem
                              onClick={() => handleDelete(lead.id, lead.customer_name || "Cliente")}
                              className="rounded-xl px-4 py-3 cursor-pointer font-bold text-sm gap-3 text-red-500 focus:bg-red-50 focus:text-red-600"
                            >
                               <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500">
                                  <Trash2 className="w-4 h-4" />
                               </div>
                               Excluir Permanentemente
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

      {/* Mobile view and Empty state handled via Dialog which is outside */}
      
      {/* Edit Lead Dialog */}
      <Dialog open={!!editingLead} onOpenChange={(open) => !open && setEditingLead(null)}>
        <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display font-black tracking-tight">Editar Lead</DialogTitle>
          </DialogHeader>
          
          {editingLead && (
            <form onSubmit={handleSaveEdit} className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nome do Cliente</Label>
                  <Input 
                    value={editingLead.customer_name as string || ""}
                    onChange={(e) => setEditingLead({...editingLead, customer_name: e.target.value})}
                    className="rounded-2xl border-gray-100 bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">WhatsApp</Label>
                  <Input 
                    value={editingLead.customer_whatsapp as string || ""}
                    onChange={(e) => setEditingLead({...editingLead, customer_whatsapp: e.target.value})}
                    className="rounded-2xl border-gray-100 bg-gray-50/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Vendedor Responsável</Label>
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
                  <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50 text-gray-900 font-bold">
                    <SelectValue placeholder="Selecione um vendedor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl border-gray-100">
                    <SelectItem value="none" className="text-gray-400 font-bold italic">Não atribuído</SelectItem>
                    {sellers.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="font-bold text-slate-900">{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Status Atual</Label>
                <Select
                  value={(editingLead.status as string) || "novo"}
                  onValueChange={(val) => setEditingLead({...editingLead, status: val})}
                >
                  <SelectTrigger className="rounded-2xl border-gray-100 bg-gray-50/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Observações / Notas</Label>
                <Textarea 
                  value={editingLead.notes || ""}
                  onChange={(e) => setEditingLead({...editingLead, notes: e.target.value})}
                  placeholder="Dicas sobre a negociação..."
                  className="rounded-2xl border-gray-100 bg-gray-50/50 min-h-[120px] resize-none"
                />
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setEditingLead(null)}
                  className="rounded-xl font-bold"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black px-8"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  SALVAR ALTERAÇÕES
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
