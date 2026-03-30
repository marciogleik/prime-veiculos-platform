import { create } from "zustand";
import { FiltrosCatalogo } from "@/types";

interface FiltrosStore {
  filtros: FiltrosCatalogo;
  setFiltro: (chave: keyof FiltrosCatalogo, valor: any) => void;
  limparFiltros: () => void;
  setFiltros: (filtros: FiltrosCatalogo) => void;
}

const initialFiltros: FiltrosCatalogo = {
  combustivel: [],
  cambio: [],
  ordenacao: "recente",
};

export const useFiltrosStore = create<FiltrosStore>((set) => ({
  filtros: initialFiltros,
  setFiltro: (chave, valor) =>
    set((state) => ({
      filtros: { ...state.filtros, [chave]: valor },
    })),
  setFiltros: (filtros) => set({ filtros }),
  limparFiltros: () => set({ filtros: initialFiltros }),
}));
