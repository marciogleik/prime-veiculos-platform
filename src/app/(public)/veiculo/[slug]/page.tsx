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
  Phone
} from "lucide-react";
import { Metadata } from "next";

interface VeiculoPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: VeiculoPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  
  const { data: v } = await supabase
    .from("vehicles")
    .select("model, price, brands(name), vehicle_photos(url)")
    .eq("slug", slug)
    .single();

  if (!v) return { title: "Veículo não encontrado" };

  return {
    title: `${v.brands?.[0]?.name} ${v.model} | Prime Veículos`,
    description: `Confira os detalhes deste incrível ${v.brands?.[0]?.name} ${v.model} na Prime Veículos.`,
    openGraph: {
      images: [v.vehicle_photos?.[0]?.url || ""],
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

  // Fall back to mock data if not found in DB
  const v = dbVehicle ?? getMockVehicleBySlug(slug);

  if (!v) notFound();

  const precoFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v.price);

  return (
    <div className="pt-32 pb-20 container mx-auto px-4">
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
                sellerWhatsapp={v.seller?.whatsapp || "00000000000"}
              />
              <Button asChild variant="outline" className="w-full h-14 font-bold border-2 rounded-xl gap-2 hover:bg-green-50 hover:border-green-500 hover:text-green-600">
                <a href={`https://wa.me/55${v.seller?.whatsapp.replace(/\D/g, "")}`} target="_blank">
                  <Phone className="w-5 h-5" />
                  WHATSAPP DIRETO
                </a>
              </Button>
              <Button variant="ghost" className="w-full h-12 font-bold gap-2 text-gray-400">
                <Share2 className="w-4 h-4" />
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
