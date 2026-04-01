"use client";

import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Search,
  Plus,
  Loader2
} from "lucide-react";
import { Vehicle } from "@/types";
import Link from "next/link";
import Image from "next/image";
import { deleteVehicle } from "@/app/(admin)/dashboard/veiculos/actions";
import { toast } from "sonner";

interface VeiculoDataTableProps {
  initialData: Vehicle[];
}

export default function VeiculoDataTable({ initialData }: VeiculoDataTableProps) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredData = data.filter(v => 
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.brand?.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string, model: string) => {
    if (!confirm(`Tem certeza que deseja excluir o veículo ${model}? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setIsDeleting(id);
    try {
      await deleteVehicle(id);
      setData(prev => prev.filter(v => v.id !== id));
      toast.success("Veículo excluído com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir veículo.");
    } finally {
      setIsDeleting(null);
    }
  };

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'disponível': return <Badge className="bg-green-500 font-bold uppercase text-[10px]">Disponível</Badge>;
      case 'reservado': return <Badge className="bg-orange-500 font-bold uppercase text-[10px]">Reservado</Badge>;
      case 'vendido': return <Badge className="bg-gray-400 font-bold uppercase text-[10px]">Vendido</Badge>;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-xs lg:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Buscar por marca ou modelo..." 
            className="pl-12 h-12 sm:h-14 rounded-2xl border-gray-100 bg-white shadow-sm focus:ring-primary/20 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button asChild className="h-12 sm:h-14 px-6 sm:px-8 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-95">
          <Link href="/dashboard/veiculos/novo" className="flex items-center justify-center w-full sm:w-auto text-xs sm:text-sm tracking-widest uppercase">
            <Plus className="w-5 h-5" />
            Adicionar Veículo
          </Link>
        </Button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-50/50">
              <TableHead className="px-8 py-5 font-black uppercase text-[10px] tracking-[0.2em] text-gray-950">Veículo</TableHead>
              <TableHead className="py-5 font-black uppercase text-[10px] tracking-[0.2em] text-gray-950">Ano/Câmbio</TableHead>
              <TableHead className="py-5 font-black uppercase text-[10px] tracking-[0.2em] text-gray-950 text-center">Preço</TableHead>
              <TableHead className="py-5 font-black uppercase text-[10px] tracking-[0.2em] text-gray-950 text-center">Status</TableHead>
              <TableHead className="px-8 py-5 text-right font-black uppercase text-[10px] tracking-[0.2em] text-gray-950">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((v) => (
              <TableRow key={v.id} className="border-gray-50/50 hover:bg-gray-50/30 transition-colors group">
                <TableCell className="px-8 py-5">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-12 rounded-xl bg-gray-100 overflow-hidden relative shrink-0 shadow-sm border border-gray-50">
                      {v.photos?.[0] && (
                        <Image src={v.photos[0].url} alt={v.model} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                      )}
                    </div>
                    <div>
                      <span className="block font-black text-slate-950 text-base leading-tight">{v.brand?.name} {v.model}</span>
                      <span className="text-[10px] text-gray-950 uppercase font-black tracking-[0.15em] mt-0.5 block">{v.version}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-5">
                  <div className="text-sm">
                    <span className="block font-black text-slate-950">{v.year_fab}/{v.year_model}</span>
                    <p className="text-gray-950 font-bold text-[10px] uppercase tracking-widest mt-0.5">{v.transmission}</p>
                  </div>
                </TableCell>
                <TableCell className="py-5 text-center px-4">
                  <span className="font-black text-primary text-base">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.price)}
                  </span>
                </TableCell>
                <TableCell className="py-5 text-center px-4">
                  {getStatusBadge(v.status)}
                </TableCell>
                <TableCell className="px-8 py-5 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100 transition-colors" disabled={isDeleting === v.id}>
                        {isDeleting === v.id ? (
                          <Loader2 className="w-5 h-5 text-primary animate-spin" />
                        ) : (
                          <MoreHorizontal className="w-5 h-5 text-gray-950" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 shadow-2xl border-gray-100">
                      <DropdownMenuLabel className="px-4 py-2 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-1">Opções do Veículo</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-50 mb-1" />
                      <DropdownMenuItem asChild className="rounded-xl px-4 py-3 cursor-pointer transition-all hover:bg-primary/5 hover:text-primary">
                        <Link href={`/dashboard/veiculos/${v.id}/editar`} className="flex items-center gap-3 font-bold text-sm">
                          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                             <Edit className="w-4 h-4" />
                          </div>
                          Editar Dados
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl px-4 py-3 cursor-pointer transition-all hover:bg-primary/5 hover:text-primary">
                        <Link href={`/veiculo/${v.slug}`} target="_blank" className="flex items-center gap-3 font-bold text-sm">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                             <ExternalLink className="w-4 h-4" />
                          </div>
                          Ver no Site
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-50 my-1" />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(v.id, v.model)}
                        className="rounded-xl px-4 py-3 cursor-pointer transition-all hover:bg-red-50 hover:text-red-600 font-bold text-sm text-red-500"
                      >
                         <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 mr-2">
                           <Trash2 className="w-4 h-4" />
                        </div>
                        Excluir Veículo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-4">
        {filteredData.map((v) => (
          <div key={v.id} className="bg-white rounded-[2rem] border border-gray-100 p-5 shadow-sm active:scale-[0.98] transition-transform">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-20 h-16 rounded-2xl bg-gray-100 overflow-hidden relative shrink-0 border border-gray-50 shadow-sm">
                {v.photos?.[0] && (
                  <Image src={v.photos[0].url} alt={v.model} fill className="object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                   <h3 className="font-black text-slate-950 text-base leading-tight truncate">{v.brand?.name} {v.model}</h3>
                   {getStatusBadge(v.status)}
                </div>
                <p className="text-[10px] text-gray-950 uppercase font-black tracking-widest truncate mb-2">{v.version}</p>
                <div className="flex items-center gap-4">
                  <div className="text-[10px] font-black bg-white px-2 py-1 rounded-lg text-slate-950 border border-slate-200">
                    {v.year_fab}/{v.year_model}
                  </div>
                  <div className="text-[10px] font-black bg-white px-2 py-1 rounded-lg text-slate-950 border border-slate-200 uppercase tracking-tighter">
                    {v.transmission}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
               <div>
                  <p className="text-[9px] font-black uppercase text-gray-950 tracking-widest mb-0.5">Preço Anunciado</p>
                  <p className="font-black text-primary text-xl tracking-tighter">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.price)}
                  </p>
               </div>
               <div className="flex gap-2">
                 <Button asChild variant="outline" size="icon" className="rounded-xl h-12 w-12 border-gray-100">
                    <Link href={`/dashboard/veiculos/${v.id}/editar`}>
                      <Edit className="w-5 h-5 text-gray-400" />
                    </Link>
                 </Button>
                 <Button asChild variant="secondary" size="icon" className="rounded-xl h-12 w-12 bg-slate-100 hover:bg-slate-200">
                    <Link href={`/veiculo/${v.slug}`} target="_blank">
                      <ExternalLink className="w-5 h-5 text-gray-600" />
                    </Link>
                 </Button>
                 <Button 
                   variant="destructive" 
                   size="icon" 
                   className="rounded-xl h-12 w-12 bg-red-50 text-red-500 border border-red-100 hover:bg-red-500 hover:text-white transition-all"
                   onClick={() => handleDelete(v.id, v.model)}
                   disabled={isDeleting === v.id}
                 >
                    {isDeleting === v.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                 </Button>
               </div>
            </div>
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 p-12 text-center">
             <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
             <p className="text-gray-400 font-bold">Nenhum veículo encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
