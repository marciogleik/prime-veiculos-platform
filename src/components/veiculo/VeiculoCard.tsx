import Image from "next/image";
import Link from "next/link";
import { Gauge, Calendar, Fuel, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Vehicle } from "@/types";

interface VeiculoCardProps {
  veiculo: Vehicle;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(price);

const formatKm = (km: number) =>
  km === 0 ? "0 km" : `${km.toLocaleString("pt-BR")} km`;

export default function VeiculoCard({ veiculo }: VeiculoCardProps) {
  const capa = veiculo.photos?.[0]?.url || "/placeholder-car.jpg";
  const isVendido = veiculo.status === "vendido";

  return (
    <Link
      href={`/veiculo/${veiculo.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 ease-out"
    >
      {/* Image — proporção mais alta para o carro aparecer mais */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={capa}
          alt={`${veiculo.brand?.name} ${veiculo.model}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className={`object-cover group-hover:scale-105 transition-transform duration-700 ease-out z-0 ${isVendido ? "grayscale-[40%]" : ""}`}
        />

        {/* Gradiente leve apenas na base para as badges não ficarem ilegíveis */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/30 to-transparent z-10" />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 flex gap-2 z-20">
          {veiculo.is_featured && !isVendido && (
            <Badge className="bg-primary text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full border-0 shadow-lg backdrop-blur-sm">
              DESTAQUE
            </Badge>
          )}
          {veiculo.mileage === 0 && !isVendido && (
            <Badge className="bg-emerald-500 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full border-0 shadow-lg backdrop-blur-sm">
              0 KM
            </Badge>
          )}
        </div>

        {/* VENDIDO banner — posicionado no topo para não cobrir o carro */}
        {isVendido && (
          <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none overflow-hidden">
            <div
              className="bg-red-600 text-white font-black uppercase tracking-[0.35em] text-sm px-10 py-2.5 shadow-lg shadow-red-950/60 border-b-2 border-red-400/30 w-full text-center"
            >
              VENDIDO
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Marca + Modelo */}
        <div className="mb-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em] mb-0.5">
            {veiculo.brand?.name}
          </p>
          <h2 className="text-lg font-display font-black text-slate-900 leading-tight tracking-tighter">
            {veiculo.model}
          </h2>
          <p className="text-xs text-slate-400 font-medium line-clamp-1 mt-0.5">
            {veiculo.version || veiculo.description}
          </p>
        </div>

        {/* Specs strip */}
        <div className="grid grid-cols-3 gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="flex flex-col items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Ano</span>
            <span className="text-xs font-black text-slate-800">{veiculo.year_model}</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-slate-100">
            <Gauge className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">KM</span>
            <span className="text-xs font-black text-slate-800">{formatKm(veiculo.mileage)}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Fuel className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Comb.</span>
            <span className="text-xs font-black text-slate-800 truncate w-full text-center">{veiculo.fuel}</span>
          </div>
        </div>

        {/* Footer: Preço + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Preço</p>
            <p className={`text-lg font-display font-black leading-none ${isVendido ? "text-slate-400 line-through" : "text-slate-900"}`}>
              {formatPrice(veiculo.price)}
            </p>
          </div>
          <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300 shrink-0 ${isVendido ? "bg-slate-300" : "bg-slate-900 group-hover:bg-primary"}`}>
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
