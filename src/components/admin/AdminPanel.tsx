'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldPlus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AddVehicleForm from '@/components/admin/AddVehicleForm';

export default function AdminPanel() {
  const [isOpen, setIsOpen] = useState(false);

  // Hidden keyboard shortcut: Ctrl+Shift+A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {/* Floating Toggle Button - Hidden but accessible for easier demo */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-50 rounded-full w-14 h-14 shadow-antigravity-hover bg-slate-900 border border-white/10 hover:bg-slate-800 transition-all group overflow-hidden"
        title="Admin Panel (Ctrl+Shift+A)"
      >
        <ShieldPlus className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-10">
                  <div>
                    <h2 className="text-2xl font-display font-black tracking-tighter uppercase">
                      Painel <span className="text-primary italic">Admin</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">
                      Gestão de Inventário
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </Button>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-antigravity border border-slate-100 mb-8">
                    <p className="text-sm font-medium text-slate-600 leading-relaxed text-center">
                      Adicione novos veículos ao catálogo instantaneamente. As alterações são refletidas em tempo real para os clientes.
                    </p>
                  </div>

                  <AddVehicleForm onSuccess={() => setIsOpen(false)} />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
