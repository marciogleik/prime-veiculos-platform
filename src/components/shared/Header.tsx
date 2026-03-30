"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { toast } from "sonner";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
          <Logo className="h-9" />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <Link href="/catalogo" className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors">
            Estoque
          </Link>
          <button 
            onClick={() => toast.info("Em breve: Funcionalidade de venda de veículos.")}
            className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors"
          >
            Vender
          </button>
          <button 
            onClick={() => toast.info("Em breve: Saiba mais sobre nossa história.")}
            className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-500 hover:text-primary transition-colors"
          >
            Sobre
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" className="hidden sm:flex gap-2 rounded-full px-6 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 border border-slate-100">
            <Link href="/login">
              <User className="w-3.5 h-3.5" />
              Restrito
            </Link>
          </Button>
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
