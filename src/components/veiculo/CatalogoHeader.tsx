'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function CatalogoHeader() {
  return (
    <div className="max-w-4xl mb-16">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-3 mb-4"
      >
        <div className="h-[1px] w-12 bg-primary" />
        <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
          Exclusividade & Performance
        </span>
      </motion.div>
      
      <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter leading-none mb-6">
        A CURADORIA <br /> 
        <span className="text-primary italic relative">
          DEFINITIVA 
          <Sparkles className="absolute -top-4 -right-8 w-8 h-8 text-primary/30 animate-pulse" />
        </span>
      </h1>
      
      <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
        Explorar nosso inventário é mergulhar em um universo de excelência automotiva. 
        Cada veículo em nosso catálogo é rigorosamente selecionado.
      </p>
    </div>
  );
}
