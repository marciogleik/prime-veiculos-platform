import { createClient } from "@/lib/supabase/server";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ShieldCheck, UserPlus, Phone, Mail, MoreVertical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function VendedoresPage() {
  const supabase = await createClient();
  
  const { data: sellers } = await supabase
    .from("sellers")
    .select("*")
    .order("name");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-400">Equipe</h1>
          <h2 className="text-4xl font-display font-bold">VENDEDORES</h2>
        </div>
        <Button className="h-14 px-8 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20">
          <UserPlus className="w-5 h-5" />
          CONVIDAR VENDEDOR
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers?.map((v) => (
          <div key={v.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden shrink-0 border-2 border-white shadow-sm">
                {v.avatar_url && <img src={v.avatar_url} alt={v.name} className="w-full h-full object-cover" />}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold leading-tight">{v.name}</h3>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  Membro desde {new Date(v.created_at).getFullYear()}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                <Phone className="w-4 h-4 text-primary" />
                {v.whatsapp}
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                <Mail className="w-4 h-4 text-primary" />
                {v.email}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
              <div className="flex gap-2">
                <Badge className="bg-black text-[10px] font-bold">VENDEDOR</Badge>
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white" title="Autenticado">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full text-gray-300 hover:text-primary">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
