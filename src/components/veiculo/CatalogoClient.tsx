"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import VeiculoCard from "./VeiculoCard";
import { Vehicle, Brand } from "@/types";

interface CatalogoClientProps {
  vehicles: Vehicle[];
  brands: Brand[];
}

const FUEL_OPTIONS = ["Gasolina", "Flex", "Elétrico", "Diesel"];
const TRANSMISSION_OPTIONS = ["Automático", "Manual", "CVT"];

function toggleFilter<T extends string>(
  value: T,
  current: T[],
  setter: (val: T[]) => void
) {
  if (current.includes(value)) {
    setter(current.filter((item) => item !== value));
  } else {
    setter([...current, value]);
  }
}

export default function CatalogoClient({ vehicles, brands }: CatalogoClientProps) {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [selectedFuel, setSelectedFuel] = useState<string[]>([]);
  const [selectedTransmission, setSelectedTransmission] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(10000000);
  const [sortBy, setSortBy] = useState<"preco_asc" | "preco_desc" | "recente" | "km">("recente");
  const [showFilters, setShowFilters] = useState(false);

  const maxPriceInData = useMemo(() => Math.max(...vehicles.map((v) => v.price), 0), [vehicles]);

  // Sync with search params from Hero
  useEffect(() => {
    const marca = searchParams.get("marca") || "";
    const modelo = searchParams.get("modelo") || "";
    if (marca || modelo) {
      setQuery(`${marca} ${modelo}`.trim());
    }
  }, [searchParams]);

  useEffect(() => {
    if (maxPriceInData > 0 && maxPrice === 10000000) {
      setMaxPrice(maxPriceInData);
    }
  }, [maxPriceInData, maxPrice]);

  const filtered = useMemo(() => {
    let result = vehicles.filter((v) => {
      const matchQuery =
        query.trim() === "" ||
        `${v.brand?.name} ${v.model} ${v.version}`.toLowerCase().includes(query.toLowerCase());
      const matchFuel = selectedFuel.length === 0 || selectedFuel.includes(v.fuel);
      const matchTransmission = selectedTransmission.length === 0 || selectedTransmission.includes(v.transmission);
      const matchBrand = selectedBrands.length === 0 || (v.brand?.name && selectedBrands.includes(v.brand.name.toLowerCase()));
      const matchPrice = v.price <= maxPrice;
      return matchQuery && matchFuel && matchTransmission && matchBrand && matchPrice;
    });

    if (sortBy === "preco_asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "preco_desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "km") result = [...result].sort((a, b) => a.mileage - b.mileage);

    return result;
  }, [vehicles, query, selectedFuel, selectedTransmission, selectedBrands, maxPrice, sortBy]);

  const clearFilters = () => {
    setQuery("");
    setSelectedFuel([]);
    setSelectedTransmission([]);
    setSelectedBrands([]);
    setMaxPrice(maxPriceInData);
    setSortBy("recente");
  };

  const activeFiltersCount =
    selectedFuel.length +
    selectedTransmission.length +
    selectedBrands.length +
    (maxPrice < maxPriceInData ? 1 : 0);

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(p);

  return (
    <div className="space-y-8">
      {/* Search + Controls bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por marca, modelo ou versão..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-4 h-12 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-12 pl-4 pr-9 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none cursor-pointer transition-all"
          >
            <option value="recente">Mais Recentes</option>
            <option value="preco_asc">Menor Preço</option>
            <option value="preco_desc">Maior Preço</option>
            <option value="km">Menor KM</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 h-12 px-5 rounded-xl border font-black text-sm uppercase tracking-wider transition-all ${
            showFilters || activeFiltersCount > 0
              ? "bg-slate-900 text-white border-slate-900"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <span className="bg-primary text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="bg-white border-2 border-slate-900/5 shadow-2xl shadow-slate-900/5 rounded-3xl p-8 mb-10 space-y-8">
              {/* Marcas Section */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-950 mb-4 flex items-center justify-between">
                  Marcas
                  {selectedBrands.length > 0 && (
                    <button 
                      onClick={() => setSelectedBrands([])}
                      className="text-[9px] text-primary hover:underline lowercase tracking-normal font-bold"
                    >
                      remover todas
                    </button>
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  {brands.map((brand) => {
                    const isSelected = selectedBrands.includes(brand.name.toLowerCase());
                    return (
                      <button
                        key={brand.id}
                        onClick={() => toggleFilter(brand.name.toLowerCase(), selectedBrands, setSelectedBrands)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all duration-300 ${
                          isSelected
                            ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-black/10 -translate-y-0.5"
                            : "bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {brand.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 border-t border-slate-100">
                {/* Combustível */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-950 mb-3">Combustível</p>
                  <div className="flex flex-wrap gap-2">
                    {FUEL_OPTIONS.map((fuel) => (
                      <button
                        key={fuel}
                        onClick={() => toggleFilter(fuel, selectedFuel, setSelectedFuel)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          selectedFuel.includes(fuel)
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {fuel}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Câmbio */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-950 mb-3">Câmbio</p>
                  <div className="flex flex-wrap gap-2">
                    {TRANSMISSION_OPTIONS.map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleFilter(t, selectedTransmission, setSelectedTransmission)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          selectedTransmission.includes(t)
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preço */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-950">Preço máximo</p>
                    <span className="text-xs font-black text-slate-900">{formatPrice(maxPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={maxPriceInData}
                    step={50000}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-950 font-black mt-1 uppercase tracking-tighter">
                    <span>R$ 0</span>
                    <span>{formatPrice(maxPriceInData)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-black text-slate-800">{filtered.length}</span>
          <span className="text-sm font-medium text-slate-500">
            {filtered.length === 1 ? "veículo encontrado" : "veículos encontrados"}
          </span>
          {(activeFiltersCount > 0 || query) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/70 transition-colors ml-2"
            >
              <X className="w-3 h-3" /> Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-black text-slate-800 mb-2">Nenhum veículo encontrado</h3>
          <p className="text-slate-500 text-sm font-medium mb-6">Tente ajustar os filtros ou buscar por outro termo.</p>
          <button
            onClick={clearFilters}
            className="text-sm font-black text-primary hover:underline"
          >
            Limpar todos os filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((vehicle, index) => (
              <motion.div
                key={vehicle.id}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
              >
                <VeiculoCard veiculo={vehicle} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
