"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex bg-[#fcfcfc] min-h-screen relative overflow-x-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className="flex-1 lg:ml-64 min-h-screen w-full transition-all duration-500">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden h-10 w-10 rounded-xl hover:bg-black/5 transition-colors"
                onClick={() => setIsSidebarOpen(true)}
            >
                <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-sm sm:text-lg font-black text-gray-400 uppercase tracking-widest hidden sm:block">Painel Administrativo</h1>
          </div>
          
          <div className="flex items-center gap-4 group cursor-default">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-black uppercase tracking-tighter text-gray-900 leading-none">Administrador</span>
              <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em] mt-1">Gestão Prime</span>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white shadow-xl shadow-black/20 group-hover:scale-110 transition-transform duration-300">
              <User className="w-5 h-5" />
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
