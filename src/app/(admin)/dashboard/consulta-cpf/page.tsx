"use client";

import { useState, useEffect } from "react";
import CpfLookup from "@/components/shared/CpfLookup";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Search, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { getSiteSettingsAction } from "@/app/actions/settings-actions";

export default function ConsultaCpfPage() {
  const [loading, setLoading] = useState(true);
  const [isServiceActive, setIsServiceActive] = useState(false);

  useEffect(() => {
    async function checkStatus() {
      try {
        const settings = await getSiteSettingsAction();
        setIsServiceActive(!!settings?.is_cpf_api_active);
      } catch (error) {
        console.error("Erro ao carregar status da API:", error);
      } finally {
        setLoading(false);
      }
    }
    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Verificando Conectividade...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-antigravity max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-black mb-2 tracking-tight">Consulta de CPF</h1>
          <p className="text-muted-foreground max-w-md">Verifique a situação cadastral de clientes na Receita Federal em tempo real.</p>
        </div>
        {!isServiceActive && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            Serviço Interrompido
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {!isServiceActive ? (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-primary/10 to-transparent rounded-[2.5rem] blur-xl opacity-50 group-hover:opacity-100 transition duration-1000"></div>
              <Card className="rounded-[2.5rem] border-none shadow-antigravity bg-black text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-64 h-64 text-white" />
                </div>
                <CardHeader className="p-10 pb-4">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                      <Search className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black tracking-tight">Serviço Indisponível</CardTitle>
                      <CardDescription className="text-amber-500/60 font-medium uppercase text-[10px] tracking-widest">Manutenção Necessária</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-10 pt-4 space-y-6">
                  <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4">
                    <p className="text-gray-400 leading-relaxed text-lg">
                      A funcionalidade de consulta por CPF está <span className="text-white font-bold">temporariamente desativada</span> devido à expiração do plano atual da API de dados.
                    </p>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                      <div className="bg-amber-500/20 p-2 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                      </div>
                      <p className="text-amber-500 font-bold text-sm">
                        Entre em contato com a Place para reativação do serviço.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                     <button 
                        disabled 
                        className="flex-1 h-14 bg-white/5 border border-white/10 rounded-2xl text-white/30 font-black text-xs tracking-widest cursor-not-allowed uppercase"
                     >
                        Busca Bloqueada
                     </button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
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
          )}

          <Card className="rounded-[2.5rem] border-none shadow-antigravity bg-zinc-900 text-white p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/40 transition-all duration-1000" />
            <div className="flex flex-col sm:flex-row gap-8 items-start relative z-10">
              <div className="bg-primary/20 p-5 rounded-[2rem] border border-primary/20 shadow-[0_0_40px_rgba(234,30,73,0.1)]">
                <ShieldCheck className="w-10 h-10 text-primary" />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black tracking-tight">Segurança e Privacidade</h3>
                <p className="text-gray-400 leading-relaxed text-sm max-w-lg">
                  Nossas consultas seguem rigorosos padrões de segurança. Os dados retornados são 
                  exclusivamente para caráter informativo e uso profissional interno, em total 
                  conformidade com a LGPD e políticas da Prime Veículos.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6 md:h-full">
          <Card className="rounded-[2.5rem] border-none shadow-antigravity h-full flex flex-col bg-white">
            <CardHeader className="p-8">
              <CardTitle className="text-2xl font-black tracking-tight">Histórico Recente</CardTitle>
              <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary/60">Ultimas consultas realizadas</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center py-20 text-center p-8">
              <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-6 shadow-inner">
                <Search className="w-10 h-10 text-gray-200" />
              </div>
              <h4 className="text-lg font-bold text-gray-400">Sem resultados</h4>
              <p className="text-gray-300 text-sm mt-2 max-w-[200px]">Nenhuma consulta realizada nesta sessão administrativa.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
