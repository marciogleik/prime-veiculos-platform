"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { VehiclePhoto } from "@/types";
import { Button } from "@/components/ui/button";

interface VeiculoGaleriaProps {
  photos: VehiclePhoto[];
}

export default function VeiculoGaleria({ photos }: VeiculoGaleriaProps) {
  const [indexAtivo, setIndexAtivo] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-[16/9] bg-gray-100 rounded-3xl flex items-center justify-center">
        <span className="text-gray-400">Sem fotos disponíveis</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl group">
        <Image
          src={photos[indexAtivo].url}
          alt={`Foto ${indexAtivo + 1}`}
          fill
          className="object-cover transition-transform duration-700 hover:scale-105"
          priority
        />
        
        {/* Navigation Buttons */}
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/80 backdrop-blur"
            onClick={() => setIndexAtivo((prev) => (prev === 0 ? photos.length - 1 : prev - 1))}
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-white/80 backdrop-blur"
            onClick={() => setIndexAtivo((prev) => (prev === photos.length - 1 ? 0 : prev + 1))}
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        <Button
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-4 rounded-full bg-white/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Maximize2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setIndexAtivo(i)}
            className={`relative flex-shrink-0 w-24 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all ${
              indexAtivo === i ? "border-primary" : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <Image
              src={photo.url}
              alt={`Thumbnail ${i + 1}`}
              fill
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
