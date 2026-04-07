import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import VeiculoGaleria from "@/components/veiculo/VeiculoGaleria";
import ModalInteresse from "@/components/lead/ModalInteresse";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Gauge, 
  Calendar, 
  Fuel, 
  Settings2, 
  DoorClosed, 
  Type, 
  CheckCircle2, 
  Share2,
  Phone,
  Edit2
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

interface VeiculoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: VeiculoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: v } = await supabase
    .from("vehicles")
    .select("model, price, brand:brands(name), photos:vehicle_photos(url)")
    .eq("slug", slug)
    .single();

  if (!v) return { title: "Veículo não encontrado" };

  return {
    title: `${(v.brand as any)?.name} ${v.model} | Prime Veículos`,
    description: `Confira os detalhes deste incrível ${(v.brand as any)?.name} ${v.model} na Prime Veículos.`,
    openGraph: {
      images: [(v.photos as any)?.[0]?.url || ""],
    },
  };
}

import { getMockVehicleBySlug } from "@/lib/mock-vehicles";

export default async function VeiculoPage({ params }: VeiculoPageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: dbVehicle } = await supabase
    .from("vehicles")
    .select("*, brand:brands(*), photos:vehicle_photos(*), seller:sellers(*)")
    .eq("slug", slug)
    .single();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: seller } = user ? await supabase.from("sellers").select("is_admin").eq("id", user.id).single() : { data: null };
  const isAdmin = seller?.is_admin || false;

  // Fall back to mock data if not found in DB
  const v = dbVehicle ?? getMockVehicleBySlug(slug);

  if (!v) notFound();

  const precoFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v.price);

  // Formatting WhatsApp
  const cleanPhone = v.seller?.whatsapp?.replace(/\D/g, "") || "66984187359";
  const finalPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(`Olá! Tenho interesse no *${v.brand?.name} ${v.model}* que vi no site.`)}`;

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 relative">
      {isAdmin && v && (
        <div className="fixed bottom-28 lg:top-24 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 lg:bottom-auto">
          <div className="bg-slate-900/95 text-white px-5 py-2.5 lg:px-6 lg:py-3 rounded-2xl lg:rounded-full shadow-2xl flex items-center gap-3 lg:gap-4 pointer-events-auto border border-white/10 backdrop-blur-xl animate-antigravity shadow-primary/20 max-w-[95vw] lg:max-w-none">
            <div className="flex flex-col text-left">
              <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-widest text-primary">
                {v.id?.startsWith("mock-") ? "Demonstração Prime" : "Modo Admin"}
              </span>
              <span className="text-[10px] lg:text-xs font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] lg:max-w-none">
                {v.id?.startsWith("mock-") ? "Sincronizar modelo" : "Gerenciar este veículo"}
              </span>
            </div>
            <div className="h-6 lg:h-8 w-px bg-white/10 mx-1" />
            <Button asChild size="sm" className="bg-primary hover:bg-primary/90 font-black text-[9px] lg:text-[10px] tracking-widest px-4 lg:px-6 h-9 lg:h-10 rounded-xl lg:rounded-full group shrink-0">
              <Link href={`/dashboard/veiculos/${v.id}/editar`} className="flex items-center gap-2">
                <Edit2 className="w-3 h-3 group-hover:rotate-12 transition-transform" />
                {v.id?.startsWith("mock-") ? "SALVAR" : "EDITAR"}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Sticky Footer - Dual Actions */}
      <div className="lg:hidden fixed bottom-6 left-4 right-4 z-40 animate-antigravity-slow">
        <div className="grid grid-cols-2 gap-3">
          <ModalInteresse 
            vehicleId={v.id} 
            vehicleLabel={`${v.brand?.name} ${v.model}`}
            sellerWhatsapp={finalPhone}
            trigger={
              <Button className="w-full h-16 rounded-3xl bg-slate-900 hover:bg-black text-white font-black tracking-widest text-[9px] shadow-2xl border-4 border-white">
                TENHO INTERESSE
              </Button>
            }
          />
          <Button asChild className="w-full h-16 rounded-3xl bg-green-500 hover:bg-green-600 text-white font-black tracking-widest text-[9px] shadow-2xl shadow-green-500/20 border-4 border-white">
            <a href={whatsappUrl} target="_blank" className="flex items-center justify-center gap-2">
              <Phone className="size-4 fill-current pt-0.5" />
              WHATSAPP
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Col: Media & Description */}
        <div className="lg:col-span-8 space-y-8">
          <VeiculoGaleria photos={v.photos || []} />
          
          <div className="bg-white rounded-3xl p-8 border border-gray-100">
            <h2 className="text-2xl font-display font-bold mb-6">Descrição do Veículo</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {v.description || "Este veículo premium foi criteriosamente selecionado para compor nosso estoque. Entre em contato para mais informações."}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-gray-100 border-l-4 border-l-primary">
            <h2 className="text-2xl font-display font-bold mb-6">Opcionais de Fábrica</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {(() => {
                // Compatibility logic: handles both real DB array and mock string-with-commas
                const rawOpts = v.optionals || [];
                const finalOpts = (rawOpts.length === 1 && rawOpts[0].includes(','))
                  ? rawOpts[0].split(',')
                  : rawOpts;

                if (finalOpts.length === 0) {
                  return <p className="text-gray-400 text-sm font-medium italic col-span-full">Informações sobre opcionais não disponíveis.</p>;
                }

                return finalOpts.map((opt: string) => (
                  <div key={opt} className="flex items-center gap-2 text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    <span className="text-sm font-medium">{opt.trim()}</span>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>

        {/* Right Col: Info & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 sticky top-32">
            <div className="mb-6">
              <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] mb-2 block">
                {v.brand?.name}
              </span>
              <h1 className="text-4xl font-display font-black tracking-tighter mb-2">{v.model}</h1>
              <p className="text-premium-grey font-medium tracking-tight">{v.version}</p>
            </div>

            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <span className="text-4xl font-display font-black text-primary">{precoFormatado}</span>
              {v.accepts_proposal && (
                <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50 font-black text-[9px] px-3">
                  ACEITA PROPOSTA
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100/50">
                <Calendar className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Ano</span>
                  <span className="font-bold text-sm">{v.year_fab}/{v.year_model}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100/50">
                <Gauge className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">KM</span>
                  <span className="font-bold text-sm">{v.mileage.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100/50">
                <Fuel className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Motor</span>
                  <span className="font-bold text-sm tracking-tight">{v.fuel}</span>
                </div>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3 border border-slate-100/50">
                <Settings2 className="w-5 h-5 text-slate-400" />
                <div>
                  <span className="block text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Câmbio</span>
                  <span className="font-bold text-sm tracking-tight">{v.transmission}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <ModalInteresse 
                vehicleId={v.id} 
                vehicleLabel={`${v.brand?.name} ${v.model}`}
                sellerWhatsapp={finalPhone}
              />
              <Button asChild variant="outline" className="w-full h-14 font-black text-[10px] tracking-[0.2em] border-2 rounded-xl gap-3 hover:bg-green-50 hover:border-green-500 hover:text-green-600 transition-all">
                <a href={whatsappUrl} target="_blank">
                  <Phone className="size-5" />
                  WHATSAPP DIRETO
                </a>
              </Button>
              <Button variant="ghost" className="w-full h-12 font-black text-[10px] tracking-[0.1em] gap-3 text-slate-400 hover:text-slate-600">
                <Share2 className="size-4" />
                COMPARTILHAR VEÍCULO
              </Button>
            </div>

            {/* Seller Small UI */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100">
                {v.seller?.avatar_url && <img src={v.seller.avatar_url} alt={v.seller.name} className="w-full h-full object-cover" />}
              </div>
              <div>
                <span className="block text-xs text-gray-400 font-bold uppercase tracking-wider">Vendedor Responsável</span>
                <span className="font-bold text-sm tracking-tight">{v.seller?.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
