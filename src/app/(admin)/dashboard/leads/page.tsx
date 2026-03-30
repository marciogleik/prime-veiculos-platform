import { createClient } from "@/lib/supabase/server";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, MessageCircle, Phone, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function LeadsPage() {
  const supabase = await createClient();
  
  const { data: leads } = await supabase
    .from("leads")
    .select("*, vehicle:vehicles(model, brand:brands(name)), seller:sellers(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-gray-400">Atendimento</h1>
        <h2 className="text-4xl font-display font-bold">GESTÃO DE LEADS</h2>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-50">
              <TableHead className="px-8 font-bold uppercase text-[10px] tracking-widest">Cliente</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Interesse</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Responsável</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center">Status</TableHead>
              <TableHead className="px-8 text-right font-bold uppercase text-[10px] tracking-widest">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads?.map((lead) => (
              <TableRow key={lead.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                <TableCell className="px-8 py-6">
                  <div className="flex flex-col">
                    <span className="font-bold">{lead.customer_name}</span>
                    <span className="text-xs text-gray-400 font-medium">{lead.customer_whatsapp}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm leading-tight text-primary">
                      {lead.vehicle?.brand?.name} {lead.vehicle?.model}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase truncate max-w-[200px]">
                      {lead.notes || "Sem observações"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm font-medium text-gray-600">{lead.seller?.name || "Não atribuído"}</span>
                </TableCell>
                <TableCell className="text-center">
                  <Badge className={cn(
                    "font-bold uppercase text-[10px]",
                    lead.status === 'novo' ? 'bg-primary' : 
                    lead.status === 'atendido' ? 'bg-green-500' : 'bg-gray-400'
                  )}>
                    {lead.status}
                  </Badge>
                </TableCell>
                <TableCell className="px-8 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="outline" size="icon" className="rounded-full border-green-100 hover:bg-green-50 text-green-600" asChild>
                      <a href={`https://wa.me/55${lead.customer_whatsapp.replace(/\D/g, "")}`} target="_blank">
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="rounded-full">
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                         <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-primary/5 focus:text-primary font-bold text-sm">
                          <CheckCircle className="w-4 h-4 mr-2" /> Marcar Atendido
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-600 font-bold text-sm text-red-500">
                          <XCircle className="w-4 h-4 mr-2" /> Cancelar Lead
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
