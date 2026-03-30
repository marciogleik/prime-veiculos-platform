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

  return (
    <Link
      href={`/veiculo/${veiculo.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-500 ease-out"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image
          src={capa}
          alt={`${veiculo.brand?.name} ${veiculo.model}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {veiculo.is_featured && (
            <Badge className="bg-primary text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full border-0 backdrop-blur-sm">
              DESTAQUE
            </Badge>
          )}
          {veiculo.mileage === 0 && (
            <Badge className="bg-emerald-500 text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full border-0 backdrop-blur-sm">
              0 KM
            </Badge>
          )}
        </div>

        {/* Bottom info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.25em] mb-0.5">
            {veiculo.brand?.name}
          </p>
          <h2 className="text-xl font-display font-black text-white leading-tight tracking-tighter">
            {veiculo.model}
          </h2>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Version */}
        <p className="text-xs text-slate-400 font-medium line-clamp-1 mb-4">
          {veiculo.version || veiculo.description}
        </p>

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

        {/* Footer: Price + CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Preço</p>
            <p className="text-lg font-display font-black text-slate-900 leading-none">
              {formatPrice(veiculo.price)}
            </p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-900 group-hover:bg-primary flex items-center justify-center transition-colors duration-300 shrink-0">
            <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Link>
  );
}
