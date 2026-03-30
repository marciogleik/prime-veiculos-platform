import Image from "next/image";
import Link from "next/link";
import { Gauge, Calendar, Fuel } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Vehicle } from "@/types";
import FloatingCard from "@/components/shared/FloatingCard";
import { useId } from "react";

interface VeiculoCardProps {
  veiculo: Vehicle;
}

export default function VeiculoCard({ veiculo }: VeiculoCardProps) {
  const capa = veiculo.photos?.[0]?.url || "/placeholder-car.jpg";
  const precoFormatado = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(veiculo.price);

  return (
    <FloatingCard className="h-full">
      <Card className="group overflow-hidden border-none glass-premium-light rounded-antigravity shadow-antigravity hover:shadow-antigravity-hover hover:-translate-y-2 transition-all duration-700">
      <Link href={`/veiculo/${veiculo.slug}`} className="block relative aspect-[16/10] overflow-hidden">
        <Image
          src={capa}
          alt={`${veiculo.brand?.name} ${veiculo.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
        {veiculo.is_featured && (
          <Badge className="absolute top-4 left-4 bg-primary text-white font-bold">
            DESTAQUE
          </Badge>
        )}
        <div className="absolute bottom-4 right-4">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur text-black font-bold">
            {precoFormatado}
          </Badge>
        </div>
      </Link>

      <CardContent className="p-5">
        <div className="mb-4">
          <h3 className="text-[10px] font-black text-premium-grey uppercase tracking-[0.2em] mb-2">
            {veiculo.brand?.name}
          </h3>
          <h2 className="text-xl font-display font-black group-hover:text-primary transition-colors leading-tight">
            {veiculo.model}
          </h2>
          <p className="text-xs text-slate-400 font-medium line-clamp-1 mt-1">{veiculo.version}</p>
        </div>

        <div className="grid grid-cols-3 gap-2 py-4 border-y border-gray-50">
          <div className="flex flex-col items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold">{veiculo.year_model}</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-gray-50">
            <Gauge className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold">{veiculo.mileage.toLocaleString()} km</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Fuel className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold">{veiculo.fuel}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button asChild className="w-full font-bold">
          <Link href={`/veiculo/${veiculo.slug}`}>
            VER DETALHES
          </Link>
        </Button>
      </CardFooter>
      </Card>
    </FloatingCard>
  );
}
