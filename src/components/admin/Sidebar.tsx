"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Car, 
  MessageSquare, 
  LogOut, 
  Settings,
  Search,
  X,
  Globe,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Logo from "../shared/Logo";
import { motion } from "framer-motion";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Veículos", icon: Car, href: "/dashboard/veiculos" },
  { label: "Leads", icon: MessageSquare, href: "/dashboard/leads" },
  { label: "Equipe", icon: Users, href: "/dashboard/vendedores" },
  { label: "Consulta CPF", icon: Search, href: "/dashboard/consulta-cpf" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300" 
          onClick={onClose}
        />
      )}

      <aside className={cn(
        "bg-black text-white h-[100dvh] fixed left-0 top-0 flex flex-col z-[70] transition-transform duration-300 ease-[0.16,1,0.3,1] w-72 lg:w-80",
        isOpen ? "translate-x-0 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)]" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8 lg:p-10 pb-12 flex justify-between items-center text-white">
          <Link href="/dashboard" className="flex flex-col gap-5 group" onClick={onClose}>
            <div className="flex items-center">
               <Logo variant="light" className="h-9 transition-transform group-hover:scale-105" />
            </div>
            <span className="text-[10px] font-black bg-primary px-4 py-1.5 rounded-full text-white w-fit tracking-[0.2em] shadow-lg shadow-primary/20 uppercase">ADMINISTRADOR</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden text-gray-500 hover:text-white" 
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex-grow px-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all group relative overflow-hidden",
                pathname === item.href 
                  ? "bg-primary text-white shadow-2xl shadow-primary/30" 
                  : "text-gray-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110 duration-300",
                pathname === item.href ? "text-white" : "text-gray-400 group-hover:text-primary"
              )} />
              {item.label}
              
              {pathname === item.href && (
                <motion.div 
                    layoutId="active-pill"
                    className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/10 space-y-3 pb-10">
          <Link
            href="/"
            onClick={onClose}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[11px] tracking-widest uppercase transition-all text-gray-300 hover:text-white hover:bg-white/10"
          >
            <Globe className="w-5 h-5 opacity-70" />
            Visitar a Loja
          </Link>
          <Link
            href="/dashboard/configuracoes"
            onClick={onClose}
            className={cn(
              "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-[11px] tracking-widest uppercase transition-all",
              pathname === "/dashboard/configuracoes"
                ? "bg-primary text-white"
                : "text-gray-300 hover:text-white hover:bg-white/10"
            )}
          >
            <Settings className="w-5 h-5 opacity-70" />
            Configurações
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-2xl px-6 h-14 font-bold text-[11px] tracking-widest uppercase transition-all"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-4 opacity-70" />
            Sair do Painel
          </Button>
        </div>
      </aside>
    </>
  );
}
