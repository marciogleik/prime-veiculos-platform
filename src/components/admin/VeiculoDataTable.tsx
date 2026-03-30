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
  Plus
} from "lucide-react";
import { Vehicle } from "@/types";
import Link from "next/link";
import Image from "next/image";

interface VeiculoDataTableProps {
  initialData: Vehicle[];
}

export default function VeiculoDataTable({ initialData }: VeiculoDataTableProps) {
  const [data, setData] = useState(initialData);
  const [search, setSearch] = useState("");

  const filteredData = data.filter(v => 
    v.model.toLowerCase().includes(search.toLowerCase()) ||
    v.brand?.name.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'disponível': return <Badge className="bg-green-500 font-bold uppercase text-[10px]">Disponível</Badge>;
      case 'reservado': return <Badge className="bg-orange-500 font-bold uppercase text-[10px]">Reservado</Badge>;
      case 'vendido': return <Badge className="bg-gray-400 font-bold uppercase text-[10px]">Vendido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Buscar por marca ou modelo..." 
            className="pl-10 h-12 rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button asChild className="h-12 px-6 rounded-xl font-bold gap-2">
          <Link href="/dashboard/veiculos/novo">
            <Plus className="w-5 h-5" />
            ADICIONAR VEÍCULO
          </Link>
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-50">
              <TableHead className="px-8 font-bold uppercase text-[10px] tracking-widest">Veículo</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest">Ano/Câmbio</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center">Preço</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-widest text-center">Status</TableHead>
              <TableHead className="px-8 text-right font-bold uppercase text-[10px] tracking-widest">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((v) => (
              <TableRow key={v.id} className="border-gray-50 hover:bg-gray-50/50 transition-colors">
                <TableCell className="px-8 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-10 rounded-lg bg-gray-100 overflow-hidden relative shrink-0">
                      {v.photos?.[0] && (
                        <Image src={v.photos[0].url} alt={v.model} fill className="object-cover" />
                      )}
                    </div>
                    <div>
                      <span className="block font-bold text-sm leading-tight">{v.brand?.name} {v.model}</span>
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{v.version}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="block font-bold">{v.year_fab}/{v.year_model}</span>
                    <span className="text-gray-400 font-medium">{v.transmission}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-bold text-primary">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v.price)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  {getStatusBadge(v.status)}
                </TableCell>
                <TableCell className="px-8 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <MoreHorizontal className="w-5 h-5 text-gray-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2">
                      <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase text-gray-400 tracking-widest">Opções</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-50" />
                      <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-primary/5 focus:text-primary">
                        <Link href={`/dashboard/veiculos/${v.id}/editar`} className="flex items-center gap-2 font-bold text-sm">
                          <Edit className="w-4 h-4" /> Editar Dados
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-primary/5 focus:text-primary">
                        <Link href={`/veiculo/${v.slug}`} target="_blank" className="flex items-center gap-2 font-bold text-sm">
                          <ExternalLink className="w-4 h-4" /> Ver no Site
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-50" />
                      <DropdownMenuItem className="rounded-xl px-3 py-2 cursor-pointer transition-colors focus:bg-red-50 focus:text-red-600 font-bold text-sm text-red-500">
                        <Trash2 className="w-4 h-4 mr-2" /> Excluir Veículo
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
