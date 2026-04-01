import Hero from "@/components/veiculo/Hero";
import VeiculoGrid from "@/components/veiculo/VeiculoGrid";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ShieldCheck, Zap, Handshake } from "lucide-react";
import { Suspense } from "react";
import SkeletonCard from "@/components/shared/SkeletonCard";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function HomePage() {
  const supabase = createAdminClient();
  const { data: brands } = await supabase
    .from("brands")
    .select("*")
    .order("name", { ascending: true });

  const whatsappUrl = "https://wa.me/message/FCLJWRVPZNJHP1";

  return (
    <div className="pb-20 bg-white min-h-screen">
      <Hero brands={brands || []} />

      {/* Destaques Section */}
      <section className="py-32 container mx-auto px-4 animate-antigravity">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-20 gap-8">
          <div className="space-y-4">
            <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">
              CURADORIA DE ELITE
            </span>
            <h2 className="text-4xl md:text-7xl font-display font-black tracking-tighter leading-[0.9]">
              ESTOQUE <span className="text-primary italic">PRIME.</span>
            </h2>
            <p className="text-premium-grey max-w-lg text-lg font-medium leading-relaxed">
              Uma seleção rigorosa de veículos premium para quem não aceita menos que a excelência absoluta.
            </p>
          </div>
          <Button asChild variant="ghost" className="group rounded-full px-10 h-16 border border-white/10 hover:bg-white/5 font-black text-xs tracking-[0.2em] transition-all">
            <Link href="/catalogo" className="flex items-center gap-4">
              VER CATÁLOGO COMPLETO
              <div className="w-12 h-px bg-current group-hover:w-20 transition-all duration-500" />
            </Link>
          </Button>
        </div>

        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        }>
          <VeiculoGrid />
        </Suspense>

        {/* Call to Action for Empty State / Future Stock */}
        <div className="mt-32 bg-slate-950 p-12 md:p-20 rounded-antigravity-lg text-center overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10 space-y-6">
            <h3 className="text-3xl md:text-5xl font-display font-black tracking-tighter text-white">BUSCANDO ALGO <span className="text-primary italic">ESPECÍFICO?</span></h3>
            <p className="text-gray-400 mb-10 max-w-2xl mx-auto text-lg font-medium">
              Nossos consultores especializados podem encontrar o veículo dos seus sonhos através da nossa rede exclusiva.
            </p>
            <Button asChild size="lg" className="rounded-2xl h-16 px-12 font-black tracking-[0.3em] bg-white text-black hover:bg-primary hover:text-white transition-all shadow-antigravity active:scale-95">
              <Link href={whatsappUrl} target="_blank">
                FALAR COM CONSULTOR
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefícios Section */}
      <section className="bg-white py-32 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-24 space-y-4">
            <Badge variant="outline" className="rounded-full border-primary/20 text-primary font-black text-[9px] tracking-widest px-4 py-1">
              DIFERENCIAIS
            </Badge>
            <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter">
              A EXPERIÊNCIA <span className="text-primary italic">PRIME</span>
            </h2>
            <p className="text-premium-grey text-lg font-medium">
              Excelência em cada detalhe, desde a curadoria até a entrega técnica do seu novo veículo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: ShieldCheck, title: "Garantia Prime", desc: "Todos os nossos veículos passam por uma perícia cautelar rigorosa de mais de 100 itens." },
              { icon: Zap, title: "Aprovação Rápida", desc: "Parcerias com as melhores financeiras para garantir a menor taxa do mercado e aprovação imediata." },
              { icon: Handshake, title: "Melhor Avaliação", desc: "Pagamos o preço justo pelo seu seminovo na troca, com valorização superior à média do mercado." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-12 rounded-antigravity border border-gray-100 shadow-antigravity hover:shadow-antigravity-hover hover:-translate-y-3 transition-all duration-700 group">
                <div className="bg-black dark:bg-primary w-16 h-16 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-xl shadow-primary/20">
                  <item.icon className="text-white w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-black mb-6 uppercase tracking-tight">{item.title}</h3>
                <p className="text-premium-grey leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
