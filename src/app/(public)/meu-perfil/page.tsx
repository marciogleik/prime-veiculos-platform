"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Phone, Calendar, ShieldCheck, LogOut, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User as AuthUser } from "@supabase/supabase-js";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setAuthUser(user);

      const { data: seller } = await supabase
        .from("sellers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      setProfile(seller);
      setLoading(false);
    }
    getProfile();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-200 rounded-full mb-4" />
          <div className="w-32 h-4 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  const displayName = profile?.name || authUser?.user_metadata?.full_name || authUser?.user_metadata?.name || "Minha Conta";
  const displayEmail = profile?.email || authUser?.email || "Não informado";
  const joinDate = profile?.created_at || authUser?.created_at;
  const formattedDate = joinDate ? new Date(joinDate).toLocaleDateString("pt-BR") : "Recente";

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="flex flex-col md:flex-row items-center gap-8 bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100"
        >
          <div className="w-32 h-32 bg-primary/10 rounded-[2rem] flex items-center justify-center text-primary border-2 border-primary/20 shadow-xl shadow-primary/10">
            <User className="w-14 h-14" />
          </div>
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">{displayName}</h1>
              {profile?.is_admin && (
                <span className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-primary/20 shrink-0">
                  <ShieldCheck className="w-3 h-3" /> ADMIN
                </span>
              )}
            </div>
            <p className="text-slate-500 font-medium text-lg">Membro desde {formattedDate}</p>
            
            <div className="mt-8 flex flex-wrap justify-center md:justify-start gap-3">
               {profile?.is_admin && (
                 <Button onClick={() => router.push("/dashboard")} className="rounded-2xl font-bold gap-2 px-6 h-12">
                   <ShieldCheck className="w-4 h-4" /> Acessar Painel Admin
                 </Button>
               )}
               <Button variant="outline" onClick={handleLogout} className="rounded-2xl font-bold gap-2 px-6 h-12 text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200 transition-colors">
                 <LogOut className="w-4 h-4" /> Sair da Conta
               </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="rounded-[2.5rem] border border-slate-100 shadow-sm h-full">
            <CardHeader className="px-8 pt-8">
              <CardTitle className="text-lg font-black tracking-wider flex items-center gap-3 text-slate-800">
                 <User className="w-5 h-5 text-primary" /> INFORMAÇÕES PESSOAIS
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <Mail className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">E-mail</p>
                  <p className="font-bold text-slate-700 truncate">{displayEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <Phone className="w-5 h-5 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">WhatsApp</p>
                  <p className="font-bold text-slate-700">{profile?.whatsapp || "Não informado"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2.5rem] border border-slate-100 shadow-sm h-full overflow-hidden flex flex-col">
            <CardHeader className="px-8 pt-8">
               <CardTitle className="text-lg font-black tracking-wider flex items-center gap-3 text-slate-800">
                 <Car className="w-5 h-5 text-primary" /> ATIVIDADE RECENTE
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 flex-1 flex flex-col items-center justify-center text-center space-y-5">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                 <Calendar className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium">Você ainda não demonstrou interesse em nenhum veículo.</p>
              <Button onClick={() => router.push("/catalogo")} className="rounded-2xl font-bold h-12 px-8 shadow-md">
                Explorar Catálogo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
