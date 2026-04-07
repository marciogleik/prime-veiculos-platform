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

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 relative">
      {isAdmin && v && (
        <div className="fixed bottom-24 lg:top-24 left-0 right-0 z-50 flex justify-center pointer-events-none px-4 lg:bottom-auto">
          <div className="bg-slate-900/95 text-white px-5 py-2.5 lg:px-6 lg:py-3 rounded-2xl lg:rounded-full shadow-2xl flex items-center gap-3 lg:gap-4 pointer-events-auto border border-white/10 backdrop-blur-xl animate-antigravity shadow-primary/20 max-w-[95vw] lg:max-w-none">
            <div className="flex flex-col">
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

      {/* Mobile Sticky Footer */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40 animate-antigravity-slow">
        <Button asChild className="w-full h-16 rounded-[2rem] bg-green-500 hover:bg-green-600 text-white font-black tracking-widest text-xs shadow-2xl shadow-green-500/40 border-4 border-white">
          <a href={`https://wa.me/55${v.seller?.whatsapp?.replace(/\D/g, "") || "66984187359"}`} target="_blank" className="flex items-center justify-center gap-3">
            <Phone className="size-5 fill-current" />
            CHAMAR NO WHATSAPP
          </a>
        </Button>
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

          <div className="bg-white rounded-3xl p-8 border border-gray-100">
            <h2 className="text-2xl font-display font-bold mb-6">Opcionais</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {v.optionals?.[0]?.split(',').map((opt: string) => (
                <div key={opt} className="flex items-center gap-2 text-gray-600">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                  <span className="text-sm font-medium">{opt.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Info & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 sticky top-32">
            <div className="mb-6">
              <span className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2 block">
                {v.brand?.name}
              </span>
              <h1 className="text-4xl font-display font-bold mb-2">{v.model}</h1>
              <p className="text-gray-500 font-medium">{v.version}</p>
            </div>

            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
              <span className="text-4xl font-display font-bold text-primary">{precoFormatado}</span>
              {v.accepts_proposal && (
                <Badge variant="outline" className="border-green-500 text-green-600 bg-green-50">
                  ACEITA PROPOSTA
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="block text-xs text-gray-400 font-bold uppercase">Ano</span>
                  <span className="font-bold">{v.year_fab}/{v.year_model}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                <Gauge className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="block text-xs text-gray-400 font-bold uppercase">KM</span>
                  <span className="font-bold">{v.mileage.toLocaleString()}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                <Fuel className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="block text-xs text-gray-400 font-bold uppercase">Motor</span>
                  <span className="font-bold">{v.fuel}</span>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="block text-xs text-gray-400 font-bold uppercase">Câmbio</span>
                  <span className="font-bold">{v.transmission}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <ModalInteresse 
                vehicleId={v.id} 
                vehicleLabel={`${v.brand?.name} ${v.model}`}
                sellerWhatsapp={v.seller?.whatsapp || "5566984187359"}
              />
              <Button asChild variant="outline" className="w-full h-14 font-bold border-2 rounded-xl gap-2 hover:bg-green-50 hover:border-green-500 hover:text-green-600">
                <a href={`https://wa.me/55${v.seller?.whatsapp?.replace(/\D/g, "") || "66984187359"}`} target="_blank">
                  <Phone className="size-5" />
                  WHATSAPP DIRETO
                </a>
              </Button>
              <Button variant="ghost" className="w-full h-12 font-bold gap-2 text-gray-400">
                <Share2 className="size-4" />
                Compartilhar Veículo
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
