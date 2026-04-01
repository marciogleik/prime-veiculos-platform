import { createClient } from "@/lib/supabase/server";
import { 
  ShieldCheck, 
  Phone, 
  Mail, 
  MoreVertical,
  UserCheck
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UserInviteDialog from "@/components/admin/UserInviteDialog";

export default async function VendedoresPage() {
  const supabase = await createClient();
  
  const { data: sellers } = await supabase
    .from("sellers")
    .select("*")
    .order("name");

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-2">Equipe e Permissões</h1>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-gray-900">COLABORADORES</h2>
        </div>
        <UserInviteDialog />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sellers?.map((v) => (
          <div key={v.id} className="group bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-sm relative overflow-hidden transition-all hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1">
            <div className="flex items-center gap-5 mb-11">
              <div className="w-20 h-20 rounded-[1.8rem] bg-slate-50 flex items-center justify-center text-slate-500 border border-slate-100 shadow-inner group-hover:bg-primary/5 group-hover:text-primary transition-all duration-500">
                {v.avatar_url ? (
                   <img src={v.avatar_url} alt={v.name} className="w-full h-full object-cover rounded-[1.8rem]" />
                ) : (
                   <UserCheck className="size-10" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-2xl font-black text-gray-950 truncate leading-tight mb-2 uppercase tracking-tight">{v.name}</h3>
                <div className="flex items-center gap-2">
                   {v.is_admin ? (
                      <Badge className="bg-primary hover:bg-primary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full shadow-lg shadow-primary/20">Administrador</Badge>
                   ) : (
                      <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border-gray-200 text-gray-700">Vendedor</Badge>
                   )}
                </div>
              </div>
            </div>

            <div className="space-y-6 mb-11">
              <div className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white transition-all duration-300">
                <Phone className="size-5 text-primary shrink-0" />
                <span className="text-sm font-black text-gray-700 truncate tracking-tight">{v.whatsapp || "N/D"}</span>
              </div>
              <div className="flex items-center gap-4 p-5 bg-slate-50/50 rounded-2xl border border-slate-100 group-hover:bg-white transition-all duration-300">
                <Mail className="size-5 text-primary shrink-0" />
                <span className="text-sm font-black text-gray-700 truncate tracking-tight">{v.email || "Sem e-mail"}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-9 border-t border-slate-100">
               <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
                  ADM DESDE {new Date(v.created_at).getFullYear()}
               </span>
               <Button variant="ghost" size="icon" className="rounded-2xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <MoreVertical className="size-6" />
               </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

