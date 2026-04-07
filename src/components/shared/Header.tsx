"use client";

import Link from "next/link";
import { User, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }
    getUser();
  }, [supabase]);

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Estoque", href: "/catalogo" },
    { label: "Vender", onClick: () => toast.info("Em breve: Funcionalidade de venda de veículos.") },
    { label: "Sobre", onClick: () => toast.info("Em breve: Saiba mais sobre nossa história.") },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group transition-transform hover:scale-[1.02]">
            <Logo className="h-9" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              link.href ? (
                <Link 
                  key={link.label}
                  href={link.href} 
                  className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900 hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <button 
                  key={link.label}
                  onClick={link.onClick}
                  className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-900 hover:text-primary transition-colors text-left"
                >
                  {link.label}
                </button>
              )
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {!loading && (
              <Button asChild variant="ghost" className="hidden sm:flex gap-2 rounded-full px-6 text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white border-2 border-black/5 transition-all">
                <Link href={user ? "/meu-perfil" : "/login"}>
                  <User className="size-4" />
                  {user ? "Minha Conta" : "Entrar"}
                </Link>
              </Button>
            )}
            
            <Button 
              size="icon" 
              variant="ghost" 
              className="md:hidden rounded-full hover:bg-black/5"
              onClick={() => setIsMenuOpen(true)}
            >
              <div className="flex flex-col gap-1 items-end">
                <div className="w-5 h-0.5 bg-slate-900 rounded-full" />
                <div className="w-3 h-0.5 bg-slate-900 rounded-full" />
              </div>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Outside Header to avoid backdrop-blur constraints */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />

            {/* Menu Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 bottom-0 w-[85vw] max-w-sm bg-white shadow-2xl flex flex-col pointer-events-auto"
            >
              <div className="p-6 h-24 flex items-center justify-between border-b border-gray-100">
                <Logo className="h-7" />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-full h-11 w-11 hover:bg-black/5"
                >
                  <X className="size-6 text-slate-400" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto py-10 px-8 space-y-10">
                <div className="flex flex-col gap-8">
                  {navLinks.map((link) => (
                    link.href ? (
                      <Link 
                        key={link.label}
                        href={link.href} 
                        onClick={() => setIsMenuOpen(false)}
                        className="text-3xl font-display font-black text-slate-900 flex items-center justify-between group"
                      >
                        {link.label}
                        <div className="w-8 h-px bg-slate-100 group-hover:w-12 group-hover:bg-primary transition-all duration-300" />
                      </Link>
                    ) : (
                      <button 
                        key={link.label}
                        onClick={() => {
                          link.onClick?.();
                          setIsMenuOpen(false);
                        }}
                        className="text-3xl font-display font-black text-slate-900 flex items-center justify-between group text-left"
                      >
                        {link.label}
                        <div className="w-8 h-px bg-slate-100 group-hover:w-12 group-hover:bg-primary transition-all duration-300" />
                      </button>
                    )
                  ))}
                </div>

                {!loading && (
                  <div className="pt-10 border-t border-gray-100">
                    <Button asChild className="w-full h-16 rounded-2xl bg-black text-white font-black tracking-widest text-xs group shadow-xl active:scale-95 transition-all">
                      <Link href={user ? "/meu-perfil" : "/login"} onClick={() => setIsMenuOpen(false)}>
                        <User className="size-5 mr-3 group-hover:scale-110 transition-transform" />
                        {user ? "MINHA CONTA" : "ENTRAR AGORA"}
                      </Link>
                    </Button>
                    
                    {user && (
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <Button asChild variant="outline" className="h-14 rounded-xl border-gray-200 text-xs font-black tracking-widest hover:bg-slate-50" onClick={() => setIsMenuOpen(false)}>
                          <Link href="/dashboard" className="flex items-center gap-2">
                            <LayoutDashboard className="size-4" />
                            PAINEL
                          </Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="h-14 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 text-xs font-black tracking-widest"
                          onClick={() => {
                            supabase.auth.signOut();
                            setIsMenuOpen(false);
                            window.location.reload();
                          }}
                        >
                          <LogOut className="size-4 mr-2" />
                          SAIR
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-8 bg-slate-50 border-t border-gray-100 mt-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 block mb-4">Prime Veículos Platform</span>
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                  Excelência automotiva e transparência absoluta em cada detalhe da sua negociação.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
