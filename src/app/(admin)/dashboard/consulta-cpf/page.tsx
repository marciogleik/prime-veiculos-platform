"use client";

import CpfLookup from "@/components/shared/CpfLookup";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Search, ShieldCheck } from "lucide-react";

export default function ConsultaCpfPage() {
  return (
    <div className="p-8 space-y-8 animate-antigravity">
      <div>
        <h1 className="text-4xl font-display font-bold mb-2">Consulta CPF</h1>
        <p className="text-muted-foreground">Verifique a situação cadastral de clientes na Receita Federal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-3xl border-none shadow-antigravity overflow-hidden">
            <CardHeader className="bg-primary/5 pb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white">
                  <Search className="w-5 h-5" />
                </div>
                <CardTitle className="text-2xl">Ferramenta de Busca</CardTitle>
              </div>
              <CardDescription>
                Utilize o CPF para buscar o nome completo e a situação cadastral atualizada.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-8">
              <CpfLookup className="max-w-xl" />
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-none shadow-antigravity bg-black text-white p-8">
            <div className="flex gap-6 items-start">
              <div className="bg-primary/20 p-4 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Segurança e Privacidade</h3>
                <p className="text-gray-400 leading-relaxed">
                  Esta consulta é realizada de forma segura através do serviço apicpf.com. 
                  Os dados retornados são de caráter informativo e devem ser utilizados em conformidade 
                  com as políticas de privacidade da Prime Veículos.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-none shadow-antigravity h-full">
            <CardHeader>
              <CardTitle>Histórico Recente</CardTitle>
              <CardDescription>Ultimas consultas realizadas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm">Nenhuma consulta realizada nesta sessão.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
