"use client";

import { useState } from "react";
import { 
  Search, 
  Loader2, 
  User, 
  ShieldCheck, 
  AlertCircle, 
  Copy, 
  CheckCircle2, 
  TrendingUp, 
  Info, 
  Database, 
  Calendar, 
  UserRound,
  Shield,
  Zap,
  ChevronDown,
  LayoutGrid,
  Sparkles
} from "lucide-react";
import { consultarCpfAction } from "@/app/actions/cpf-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CpfLookupProps {
  onResult?: (data: any) => void;
  className?: string;
}

export default function CpfLookup({ onResult, className }: CpfLookupProps) {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length > 9) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (value.length > 6) {
      value = value.replace(/(\d{3})(\d{3})(\d{3})/, "$1.$2.$3");
    } else if (value.length > 3) {
      value = value.replace(/(\d{3})(\d{3})/, "$1.$2");
    }
    
    setCpf(value);
  };

  const handleSearch = async () => {
    const cleanCpf = cpf.replace(/\D/g, "");
    if (cleanCpf.length !== 11) {
      toast.error("Por favor, digite um CPF válido");
      return;
    }

    setLoading(true);
    setResult(null);
    setCopied(false);
    
    try {
      const response = await consultarCpfAction(cleanCpf);
      
      if (response.success) {
        setResult(response.data);
        if (onResult) onResult(response.data);
        toast.success("Dados recuperados!");
      } else {
        toast.error(response.message || "Erro ao consultar CPF");
      }
    } catch (error) {
      toast.error("Erro inesperado ao consultar CPF");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  const getIconForKey = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes("score")) return <TrendingUp className="w-4 h-4 text-emerald-400" />;
    if (k.includes("nascimento") || k.includes("data")) return <Calendar className="w-4 h-4 text-sky-400" />;
    if (k.includes("genero") || k.includes("sexo")) return <UserRound className="w-4 h-4 text-violet-400" />;
    if (k.includes("mae") || k.includes("filiacao")) return <User className="w-4 h-4 text-rose-400" />;
    if (k.includes("pai")) return <User className="w-4 h-4 text-blue-400" />;
    if (k.includes("endereco") || k.includes("logradouro") || k.includes("cep")) return <Database className="w-4 h-4 text-amber-400" />;
    return <Info className="w-4 h-4 text-gray-400" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 700) return "text-emerald-400";
    if (score >= 400) return "text-amber-400";
    return "text-rose-400";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "---";
    // Tenta converter se for YYYY-MM-DD
    if (dateStr.includes("-")) {
      const [y, m, d] = dateStr.split("-");
      if (y.length === 4) return `${d}/${m}/${y}`;
    }
    return dateStr;
  };

  const Gauge = ({ score }: { score: number | null }) => {
    const s = score || 0;
    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (s / 1000) * (circumference * 0.75);
    
    // Color based on score
    const color = s >= 700 ? "#10b981" : (s >= 400 ? "#fbbf24" : "#f43f5e");

    return (
      <div className="relative flex flex-col items-center justify-center pt-4">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-[225deg]"
        >
          {/* Background Track */}
          <circle
            stroke="rgba(255,255,255,0.05)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            style={{ strokeDashoffset: circumference * 0.25 }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress Track */}
          <motion.circle
            stroke={color}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + " " + circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn("text-4xl font-display font-black tracking-tighter", s === 0 ? "text-white/20" : getScoreColor(s))}
            >
              {score !== null ? score : "---"}
            </motion.span>
            <span className="text-[8px] font-black text-white/20 tracking-[0.2em] uppercase">Pontos</span>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("w-full space-y-8", className)}>
      {/* Search Bar - Responsive Fixes */}
      <div className="space-y-4 max-w-xl mx-auto">
        <Label htmlFor="cpf-input" className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-500 flex items-center justify-center gap-2">
            <Sparkles className="w-3 h-3 text-primary animate-pulse" />
            CONSULTA DE ELITE
        </Label>
        <div className="flex flex-col sm:flex-row gap-0 p-1.5 bg-white/10 dark:bg-black/40 backdrop-blur-2xl rounded-antigravity border border-white/20 shadow-antigravity ring-1 ring-white/5 transition-all duration-500 focus-within:ring-primary/30">
          <Input
            id="cpf-input"
            placeholder="000.000.000-00"
            value={cpf}
            onChange={handleCpfChange}
            className="h-14 bg-transparent border-none text-zinc-900 dark:text-white font-mono text-xl tracking-widest focus-visible:ring-0 placeholder:text-zinc-400 dark:placeholder:text-white/20 px-8 sm:flex-1 w-full"
            disabled={loading}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button 
            onClick={handleSearch} 
            disabled={loading || cpf.replace(/\D/g, "").length !== 11}
            className="h-14 px-10 rounded-[1.4rem] gap-3 font-black text-xs tracking-[0.2em] bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all active:scale-95 w-full sm:w-auto overflow-hidden relative group"
          >
            {/* Shimmer effect on button */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
            
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            PESQUISAR
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="rounded-[2.5rem] border-none bg-black ring-1 ring-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] overflow-hidden">
              <CardContent className="p-0">
                {/* Header: Status */}
                <div className="px-6 sm:px-10 py-4 bg-white/[0.02] border-b border-white/5 flex flex-wrap gap-4 justify-between items-center text-[9px] font-black tracking-widest uppercase">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <ShieldCheck className="w-3 h-3" />
                      CRIPTOGRAFIA ATIVA
                    </div>
                    <Badge 
                        variant={result.situacao_cadastral === "REGULAR" || result.code === 200 ? "default" : "destructive"}
                        className="rounded-full px-4 py-1 font-black text-[8px] tracking-widest uppercase bg-white/10 hover:bg-white/20 border-none"
                    >
                        {result.situacao_cadastral || "LOCALIZADO"}
                    </Badge>
                </div>

                <div className="p-6 sm:p-10 lg:p-12 space-y-10">
                   {/* Name & Identity - Mobile First */}
                   <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-center lg:items-start group">
                      <div className="relative shrink-0">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-transparent flex items-center justify-center border border-white/10 p-1.5 shadow-[0_0_30px_rgba(234,30,73,0.1)] transition-transform duration-500 group-hover:scale-105">
                          <div className="w-full h-full rounded-full bg-black flex items-center justify-center border border-white/5">
                            <User className="w-10 h-10 text-white/20 group-hover:text-primary/40 transition-colors" />
                          </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 border-2 border-black shadow-lg">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>

                      <div className="flex-1 text-center lg:text-left space-y-4 min-w-0 w-full overflow-hidden self-center">
                         <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-primary tracking-[0.4em] uppercase opacity-70">Resultado Encontrado</p>
                            <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-6 justify-center lg:justify-start">
                                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-black text-white leading-none max-w-full break-words tracking-tight">
                                   {result.nome}
                                </h2>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-10 w-10 rounded-xl text-white/30 hover:text-white hover:bg-white/5 transition-all active:scale-90" 
                                  onClick={() => copyToClipboard(result.nome)}
                                >
                                  <Copy className="w-5 h-5" />
                                </Button>
                            </div>
                         </div>
                         <div className="flex justify-center lg:justify-start">
                           <div className="px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/60 font-mono tracking-widest flex items-center gap-3 ring-1 ring-white/5">
                              {cpf}
                              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.7)] animate-pulse" />
                           </div>
                         </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8 items-stretch">
                      {/* Score Card */}
                      <div className="col-span-1 md:col-span-2 p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 flex flex-col items-center justify-between group hover:border-primary/40 transition-all duration-500 min-h-[300px]">
                          <div className="w-full flex justify-between items-start mb-4">
                              <div className="space-y-1">
                                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Potencial Financeiro</p>
                                <h3 className="text-xs font-black text-white uppercase tracking-tight">Escore de Consultoria</h3>
                              </div>
                              <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center border border-white/10 group-hover:shadow-[0_0_20px_rgba(234,30,73,0.2)] transition-all">
                                <Zap className="w-6 h-6 text-primary" />
                              </div>
                          </div>
                          
                          <div className="py-2 scale-110">
                            <Gauge score={result.score} />
                          </div>
                          
                          <div className="w-full flex justify-between items-end mt-8 pt-6 border-t border-white/5">
                             <div className="flex flex-col gap-1.5">
                                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Qualificação</span>
                                <span className={cn("text-[11px] font-black uppercase tracking-widest flex items-center gap-2", 
                                  result.score === null ? "text-white/40" : 
                                  result.score >= 700 ? "text-emerald-400" : 
                                  (result.score >= 400 ? "text-amber-400" : "text-rose-400"))}>
                                   <Shield className="w-3 h-3" />
                                   {result.score === null ? "DADO INDISPONÍVEL" :
                                    result.score >= 700 ? "CRÉDITO EXCELENTE" : 
                                    (result.score >= 400 ? "CONFIÁVEL" : "RISCO MÉDIO")}
                                </span>
                             </div>
                             <div className="text-right">
                                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Procedência</span>
                                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">SISTEMA APICPF OFICIAL</p>
                             </div>
                          </div>
                      </div>

                      {/* Situação Cadastral Card */}
                      <div className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 flex flex-col justify-between min-h-[180px] group">
                         <div className="flex justify-between items-start">
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">RFB STATUS</p>
                            <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-all text-emerald-400">
                               <ShieldCheck className="w-6 h-6" />
                            </div>
                         </div>
                         <div className="flex flex-col gap-1 mt-4">
                            <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Situação Cadastral</span>
                            <p className="text-xl font-display font-black text-white uppercase tracking-tight">{result.situacao_cadastral || "REGULAR"}</p>
                         </div>
                      </div>

                      {/* Dynamic Cards */}
                      {Object.entries({
                        ...(result.data || {}),
                        ...result,
                      }).map(([key, value]) => {
                          if (["nome", "situacao_cadastral", "mensagem", "is_not_found", "data", "code", "cpf", "score", "protocolo"].includes(key)) return null;
                          if (value === null || value === undefined || value === "") return null;
                          if (typeof value === "object") return null;

                          let displayValue = String(value);
                          if (key.toLowerCase().includes("data")) displayValue = formatDate(displayValue);
                          const displayKey = key.replace(/_/g, " ").toUpperCase();

                          return (
                            <div key={key} className="p-8 rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 flex flex-col justify-between min-h-[180px] group w-full">
                               <div className="flex justify-between items-start">
                                  <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">{displayKey}</p>
                                  <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center border border-white/5 group-hover:border-primary/30 transition-all text-white/40">
                                     {getIconForKey(key)}
                                  </div>
                               </div>
                               <div className="flex flex-col gap-1 mt-4 overflow-hidden">
                                  <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest">Valor do Dado</span>
                                  <div className="flex items-center justify-between group/row">
                                    <p className="text-xl font-display font-black text-white tracking-tight truncate pr-4">{displayValue}</p>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-white/20 hover:text-white hover:bg-white/5 transition-all active:scale-90"
                                      onClick={() => copyToClipboard(displayValue)}
                                    >
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                  </div>
                               </div>
                            </div>
                          );
                      })}
                   </div>

                   {result.mensagem && !result.nome.includes("Não consta") && (
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[8px] text-white/20 font-bold uppercase tracking-widest text-center italic">
                        Nota: {result.mensagem}
                      </div>
                   )}
                </div>

                {/* Footer */}
                <div className="px-6 sm:px-10 py-6 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 text-[7px] sm:text-[9px] font-bold text-white/20 tracking-widest uppercase">
                       <span>{new Date().toLocaleDateString("pt-BR")}</span>
                       <div className="w-1 h-1 rounded-full bg-white/10" />
                       <span>MODO: CONSULTA INTERATIVA</span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      onClick={() => setShowRaw(!showRaw)}
                      className="h-auto p-0 text-[8px] sm:text-[10px] font-black tracking-widest text-white/30 hover:text-white hover:bg-transparent uppercase underline-offset-4 hover:underline"
                    >
                      <Database className="w-3 h-3 mr-2" />
                      {showRaw ? "OCULTAR ESTRUTURA" : "DETALHES TÉCNICOS"}
                    </Button>
                </div>

                {showRaw && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        className="bg-black/50 p-6 sm:p-10 border-t border-white/5"
                    >
                        <pre className="text-[10px] text-emerald-500/50 font-mono overflow-auto max-h-[300px] leading-relaxed select-all scrollbar-thin scrollbar-thumb-white/5">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
