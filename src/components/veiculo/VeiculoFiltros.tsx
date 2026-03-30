"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useFiltrosStore } from "@/store/filtrosStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brand } from "@/types";
import { FilterX, Search as SearchIcon } from "lucide-react";

interface VeiculoFiltrosProps {
  brands: Brand[];
}

export default function VeiculoFiltros({ brands }: VeiculoFiltrosProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { filtros, setFiltro, setFiltros, limparFiltros } = useFiltrosStore();
  
  const [rangePreco, setRangePreco] = useState([0, 500000]);

  // Sync store with URL on mount
  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries());
    // Parse complex params (arrays, numbers) here if needed
    setFiltros({
      marca: params.marca,
      modelo: params.modelo,
      preco_de: params.preco_de ? Number(params.preco_de) : undefined,
      preco_ate: params.preco_ate ? Number(params.preco_ate) : undefined,
      // ... rest of the mappings
    });
  }, [searchParams, setFiltros]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (filtros.marca) params.append("marca", filtros.marca);
    if (filtros.modelo) params.append("modelo", filtros.modelo);
    if (filtros.preco_de) params.append("preco_de", filtros.preco_de.toString());
    if (filtros.preco_ate) params.append("preco_ate", filtros.preco_ate.toString());
    // ... add all filters to params
    
    router.push(`/catalogo?${params.toString()}`);
  };

  return (
    <aside className="w-full md:w-80 shrink-0">
      <div className="sticky top-24 bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-display font-bold">Filtros</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={limparFiltros}
            className="text-gray-400 hover:text-primary text-xs flex gap-1"
          >
            <FilterX className="w-3 h-3" />
            Limpar
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-250px)] pr-4">
          <div className="space-y-8">
            {/* Busca por Modelo */}
            <div className="space-y-3">
              <Label className="font-bold text-xs uppercase tracking-widest text-gray-400">Modelo</Label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Ex: Corolla" 
                  className="pl-10 h-12 rounded-xl focus-visible:ring-primary/20"
                  value={filtros.modelo || ""}
                  onChange={(e) => setFiltro("modelo", e.target.value)}
                />
              </div>
            </div>

            {/* Marcas */}
            <div className="space-y-4">
              <Label className="font-bold text-xs uppercase tracking-widest text-gray-400">Marcas</Label>
              <div className="grid grid-cols-2 gap-2">
                {brands.map((brand) => (
                  <Button
                    key={brand.id}
                    variant={filtros.marca === brand.name ? "default" : "outline"}
                    className="h-auto py-3 px-2 flex flex-col items-center gap-2 rounded-xl border-gray-100"
                    onClick={() => setFiltro("marca", filtros.marca === brand.name ? undefined : brand.name)}
                  >
                    {brand.logo_url && (
                      <img src={brand.logo_url} alt={brand.name} className="w-8 h-8 object-contain" />
                    )}
                    <span className="text-[10px] font-bold uppercase">{brand.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Preço */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="font-bold text-xs uppercase tracking-widest text-gray-400">Preço</Label>
                <span className="text-xs font-bold text-primary">
                  Até R$ {rangePreco[1].toLocaleString()}
                </span>
              </div>
              <Slider
                value={[rangePreco[1]]}
                max={1000000}
                step={5000}
                onValueChange={(val) => {
                  const v = Array.isArray(val) ? val[0] : val;
                  setRangePreco([0, v]);
                  setFiltro("preco_ate", v);
                }}
              />
            </div>

            {/* Combustível */}
            <div className="space-y-4">
              <Label className="font-bold text-xs uppercase tracking-widest text-gray-400">Combustível</Label>
              <div className="space-y-2">
                {["Flex", "Gasolina", "Elétrico", "Diesel"].map((opt) => (
                  <div key={opt} className="flex items-center gap-2">
                    <Checkbox 
                      id={`fuel-${opt}`} 
                      checked={filtros.combustivel?.includes(opt)}
                      onCheckedChange={(checked) => {
                        const current = filtros.combustivel || [];
                        setFiltro("combustivel", checked 
                          ? [...current, opt] 
                          : current.filter(c => c !== opt)
                        );
                      }}
                    />
                    <Label htmlFor={`fuel-${opt}`} className="text-sm cursor-pointer">{opt}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        <Button 
          className="w-full mt-8 h-14 font-bold rounded-2xl shadow-lg shadow-primary/20"
          onClick={applyFilters}
        >
          APLICAR FILTROS
        </Button>
      </div>
    </aside>
  );
}
