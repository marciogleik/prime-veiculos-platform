"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-white min-h-screen relative overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        "lg:pl-80"
      )}>
        <header className="h-24 bg-white/95 backdrop-blur-3xl border-b border-gray-100 flex items-center justify-between px-6 sm:px-10 lg:px-14 sticky top-0 z-40 shadow-sm shadow-black/[0.03]">
          <div className="flex items-center gap-4 sm:gap-6 min-w-0 pr-6 lg:pl-4">
            <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden h-12 w-12 rounded-2xl hover:bg-black/5 transition-all shrink-0"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className="w-6 h-6 text-gray-900" />
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 min-w-0">
              <h1 className="text-sm sm:text-xl font-black text-gray-950 uppercase tracking-[0.2em] leading-tight truncate max-w-[180px] sm:max-w-none">
                Painel Administrativo
              </h1>
              <div className="h-5 w-[1px] bg-gray-200 hidden sm:block shrink-0" />
              <span className="text-[10px] sm:text-xs font-black text-gray-600 uppercase tracking-[0.3em] mt-1 sm:mt-0 shrink-0">
                Gestão Prime
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-5 shrink-0 pl-4 border-l border-gray-50">
            <div className="text-right hidden lg:block">
              <span className="block text-xs font-black uppercase tracking-widest text-primary leading-none mb-1">ADMINISTRADOR</span>
              <span className="block text-[10px] font-bold text-gray-600 uppercase tracking-widest">Sessão Ativa</span>
            </div>
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all duration-300">
              <User className="size-5 sm:size-6" />
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
