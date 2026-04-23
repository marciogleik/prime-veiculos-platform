'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function CatalogoHeader() {
  return (
    <div className="max-w-4xl mb-16">
      
      <h1 className="text-4xl md:text-7xl font-display font-black tracking-tighter leading-[0.9] md:leading-none mb-6 uppercase">
        Referência número 1 <br className="md:hidden" /> 
        <span className="text-primary italic relative">
          em seminovos da região
        </span>
      </h1>
      
      <p className="text-slate-500 text-lg md:text-xl max-w-2xl font-medium leading-relaxed">
        Uma experiência de compra segura, rápida e confiável — do primeiro contato até a entrega das chaves.
      </p>
    </div>
  );
}
