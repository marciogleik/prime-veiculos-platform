"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { toast } from "sonner";

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-2xl border-b border-white/10">
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <Logo variant="dark" className="h-10" />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link href="/catalogo" className="font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors">
            Catálogo
          </Link>
          <button 
            onClick={() => toast.info("Em breve: Funcionalidade de venda de veículos.")}
            className="font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors"
          >
            Venda seu Carro
          </button>
          <button 
            onClick={() => toast.info("Em breve: Saiba mais sobre nossa história.")}
            className="font-bold text-xs uppercase tracking-widest hover:text-primary transition-colors"
          >
            Sobre Nós
          </button>
        </nav>

        <div className="flex items-center gap-4">
          <Button asChild variant="outline" className="hidden sm:flex gap-2">
            <Link href="/login">
              <User className="w-4 h-4" />
              Área do Vendedor
            </Link>
          </Button>
          <Button size="icon" variant="ghost" className="md:hidden">
            <span className="sr-only">Menu</span>
            <div className="w-6 h-0.5 bg-black mb-1.5" />
            <div className="w-6 h-0.5 bg-black mb-1.5" />
            <div className="w-6 h-0.5 bg-black" />
          </Button>
        </div>
      </div>
    </header>
  );
}
