"use client";

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
          <Logo className="h-9" />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <Link href="/" className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900 hover:text-primary transition-colors">
            Início
          </Link>
          <Link href="/catalogo" className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900 hover:text-primary transition-colors">
            Estoque
          </Link>
          <button 
            onClick={() => toast.info("Em breve: Funcionalidade de venda de veículos.")}
            className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900 hover:text-primary transition-colors"
          >
            Vender
          </button>
          <button 
            onClick={() => toast.info("Em breve: Saiba mais sobre nossa história.")}
            className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900 hover:text-primary transition-colors"
          >
            Sobre
          </button>
        </nav>

        <div className="flex items-center gap-4">
          {!loading && (
            <Button asChild variant="ghost" className="hidden sm:flex gap-2 rounded-full px-6 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white border-2 border-black/5 transition-all">
              <Link href={user ? "/meu-perfil" : "/login"}>
                <User />
                {user ? "Minha Conta" : "Entrar"}
              </Link>
            </Button>
          )}
          <Button size="icon" variant="ghost" className="md:hidden rounded-full">
            <div className="flex flex-col gap-1 items-end">
              <div className="w-5 h-0.5 bg-slate-900 rounded-full" />
              <div className="w-3 h-0.5 bg-slate-900 rounded-full" />
            </div>
          </Button>
        </div>
      </div>
    </header>
  );
}
