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
  X
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
        "bg-black text-white h-screen fixed left-0 top-0 flex flex-col z-[70] transition-all duration-500 ease-[0.16, 1, 0.3, 1] w-72 lg:w-64",
        isOpen ? "translate-x-0 shadow-[20px_0_60px_-15px_rgba(0,0,0,0.5)]" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8 pb-12 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Logo variant="light" className="h-8 transition-transform group-hover:scale-110" />
            <span className="text-[10px] font-black bg-primary px-2 py-0.5 rounded text-white ml-2 tracking-widest">ADMIN</span>
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

        <nav className="flex-grow px-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all group relative overflow-hidden",
                pathname === item.href 
                  ? "bg-primary text-white shadow-xl shadow-primary/20" 
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110 duration-300",
                pathname === item.href ? "text-white" : "text-gray-500 group-hover:text-primary"
              )} />
              {item.label}
              
              {pathname === item.href && (
                <motion.div 
                    layoutId="active-pill"
                    className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 space-y-2 pb-8">
          <Link
            href="/dashboard/configuracoes"
            onClick={onClose}
            className={cn(
              "w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all",
              pathname === "/dashboard/configuracoes"
                ? "bg-primary text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Settings className="w-5 h-5 opacity-50" />
            Configurações
          </Link>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-400/60 hover:text-red-500 hover:bg-red-500/10 rounded-2xl px-5 h-14 font-bold text-xs tracking-widest uppercase transition-all"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5 mr-4 opacity-50" />
            Sair do Painel
          </Button>
        </div>
      </aside>
    </>
  );
}
