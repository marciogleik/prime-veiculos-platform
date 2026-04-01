"use client";

import { useState } from "react";
import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface HeroProps {
  brands: { id: string; name: string }[];
}

export default function Hero({ brands }: HeroProps) {
  const router = useRouter();
  const [marca, setMarca] = useState<string | undefined>(undefined);
  const [modelo, setModelo] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (marca) params.append("marca", marca);
    if (modelo) params.append("modelo", modelo);
    router.push(`/catalogo?${params.toString()}`);
  };

  return (
    <section className="relative min-h-[95vh] flex items-center pt-24 overflow-hidden bg-black">
      {/* Full-bleed car background */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src="/hero-car.png" 
          alt="Premium Car" 
          className="absolute inset-0 w-full h-full object-cover object-[75%_center] opacity-80"
        />
        {/* Gradient overlay: strong black on left for text, transparent on right to show car */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 via-40% to-transparent" />
        {/* Subtle red accent glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(225,29,72,0.1),transparent_50%)]" />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-3xl text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Badge className="mb-8 bg-primary/20 hover:bg-primary/30 text-primary border-primary/20 py-2 px-6 rounded-full font-black text-xs tracking-[0.2em] uppercase">
              Premium Experience
            </Badge>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl sm:text-6xl md:text-8xl font-display font-black leading-[0.95] mb-8 tracking-tighter"
          >
            ENCONTRE O SEU <br />
            <span className="text-primary italic">PRIMEIRO</span> NÍVEL.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-lg leading-relaxed"
          >
            A curadoria mais rigorosa de veículos premium do Brasil. Qualidade garantida e procedência impecável para quem não aceita menos que a excelência.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="glass-premium p-1.5 rounded-antigravity-lg shadow-antigravity flex flex-col md:flex-row gap-0 max-w-4xl border border-white/20 items-center overflow-hidden group/search"
          >
            <div className="flex-1 w-full">
            <Select value={marca || ""} onValueChange={(val: string | null) => setMarca(val ?? undefined)}>
                <SelectTrigger className="border-none h-16 text-white focus:ring-0 placeholder:text-white/40 font-bold bg-transparent px-8 hover:bg-white/5 transition-colors rounded-none">
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 backdrop-blur-3xl border-white/10 text-white rounded-2xl">
                  {brands.length > 0 ? (
                    brands.map((b) => (
                      <SelectItem key={b.id} value={b.name.toLowerCase()}>
                        {b.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="placeholder" disabled>Nenhuma marca encontrada</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="hidden md:block w-px h-8 bg-white/10" />

            <div className="flex-[1.5] w-full">
              <Input 
                placeholder="Qual modelo você procura?" 
                className="border-none h-16 text-white focus-visible:ring-0 placeholder:text-white/30 font-bold bg-transparent px-8 hover:bg-white/5 transition-colors rounded-none"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
              />
            </div>
            
            <Button 
              size="lg" 
              className="h-16 px-12 rounded-[2.8rem] font-black text-xs tracking-[0.3em] bg-primary hover:bg-primary/90 transition-all group relative overflow-hidden m-1 w-full md:w-auto shrink-0"
              onClick={handleSearch}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              BUSCAR
              <Search className="ml-3 size-5 group-hover:scale-110 transition-transform" />
            </Button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-16 grid grid-cols-3 gap-8 sm:gap-16 max-w-xl"
          >
            <div className="space-y-1">
              <span className="block text-2xl sm:text-4xl font-display font-black text-white">+250</span>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Estoque</span>
            </div>
            <div className="space-y-1 border-l border-white/10 pl-8 sm:pl-16">
              <span className="block text-2xl sm:text-4xl font-display font-black text-white">+15k</span>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Leads</span>
            </div>
            <div className="space-y-1 border-l border-white/10 pl-8 sm:pl-16">
              <span className="block text-2xl sm:text-4xl font-display font-black text-white">100%</span>
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Prime</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
