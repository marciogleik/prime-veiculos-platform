"use client";

import { useState, useEffect } from "react";
export const dynamic = "force-dynamic";
import { 
  Settings, 
  Bell, 
  Lock, 
  Palette, 
  Users, 
  Database, 
  Save, 
  Loader2, 
  MessageSquare, 
  ShieldCheck, 
  Info,
  Building2,
  Phone,
  Mail,
  MapPin,
  Cpu
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { getSiteSettingsAction, updateSiteSettingsAction } from "@/app/actions/settings-actions";

type TabType = "geral" | "equipe" | "funcionalidades" | "seguranca" | "dados";

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState<TabType>("geral");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  
  // Password state
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await getSiteSettingsAction();
        setSettings(data);
      } catch (error) {
        toast.error("Erro ao carregar configurações");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      ...settings,
      dealership_name: formData.get("dealership_name"),
      dealership_whatsapp: formData.get("dealership_whatsapp"),
      dealership_email: formData.get("dealership_email"),
      dealership_address: formData.get("dealership_address"),
      dealership_cnpj: formData.get("dealership_cnpj"),
    };

    try {
      await updateSiteSettingsAction(data);
      toast.success("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error("As senhas não coincidem.");
    }
    if (passwords.new.length < 6) {
      return toast.error("A nova senha deve ter pelo menos 6 caracteres.");
    }

    setPassLoading(true);
    try {
      const { changePasswordAction } = await import("@/app/actions/settings-actions");
      await changePasswordAction(passwords.new);
      toast.success("Senha alterada com sucesso!");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar senha");
    } finally {
      setPassLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Carregando Painel...</p>
      </div>
    );
  }

  const tabs = [
    { id: "geral", label: "Geral", icon: Building2 },
    { id: "equipe", label: "Equipe", icon: Users },
    { id: "funcionalidades", label: "Funcionalidades", icon: Cpu },
    { id: "seguranca", label: "Segurança", icon: Lock },
    { id: "dados", label: "Dados", icon: Database },
  ];

  return (
    <div className="space-y-10 animate-antigravity max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] mb-2 px-1">Sistema de Gestão</p>
          <h1 className="text-4xl md:text-5xl font-display font-black tracking-tighter">Configurações</h1>
          <p className="text-gray-400 mt-2 font-medium max-w-md">Personalize o comportamento da plataforma e os dados da sua concessionária.</p>
        </div>
        
        <div className="flex p-1.5 bg-gray-100 rounded-2xl overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab.id ? "text-white" : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary shadow-lg shadow-primary/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <tab.icon className={`w-3.5 h-3.5 relative z-10 ${activeTab === tab.id ? "text-white" : ""}`} />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "geral" && (
            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="rounded-[2.5rem] border-none shadow-antigravity overflow-hidden">
                  <CardHeader className="p-10 pb-4 bg-slate-50/50 border-b border-gray-100">
                     <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                           <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                           <CardTitle className="text-2xl font-black tracking-tight">Identidade da Loja</CardTitle>
                           <CardDescription>Dados principais que aparecem no catálogo e leads.</CardDescription>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent className="p-10 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome da Concessionária</Label>
                        <Input name="dealership_name" defaultValue={settings?.dealership_name} className="h-12 rounded-xl focus:ring-primary/20" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">CNPJ (Opcional)</Label>
                        <Input name="dealership_cnpj" defaultValue={settings?.dealership_cnpj} placeholder="00.000.000/0001-00" className="h-12 rounded-xl" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 font-display">WhatsApp Oficial</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                          <Input name="dealership_whatsapp" defaultValue={settings?.dealership_whatsapp} placeholder="Ex: 5511999999999" className="h-12 pl-12 rounded-xl" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">E-mail de Contato</Label>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                          <Input name="dealership_email" defaultValue={settings?.dealership_email} type="email" placeholder="contato@prime.com.br" className="h-12 pl-12 rounded-xl" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Endereço Físico</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-4 h-4 text-rose-500" />
                        <Input name="dealership_address" defaultValue={settings?.dealership_address} placeholder="Av. Principal, 1000 - Centro" className="h-12 pl-12 rounded-xl" />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                       <Button type="submit" disabled={saving} className="h-14 px-10 rounded-2xl gap-3 font-black tracking-widest text-xs shadow-xl shadow-primary/20">
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                          SALVAR ALTERAÇÕES
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                 <Card className="rounded-[2.5rem] border-none shadow-antigravity bg-slate-900 text-white p-8 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] rounded-full group-hover:scale-150 transition-all duration-1000 opacity-50" />
                    <div className="relative z-10 flex flex-col gap-6">
                       <div className="w-16 h-16 rounded-[1.8rem] bg-white/10 flex items-center justify-center border border-white/10">
                          <Palette className="w-8 h-8 text-primary" />
                       </div>
                       <div>
                          <h3 className="text-xl font-bold mb-1">Logotipo e Cores</h3>
                          <p className="text-sm text-gray-400 leading-relaxed font-medium">A personalização visual avançada estará disponível na versão 1.1 do painel.</p>
                       </div>
                       <Button variant="outline" disabled className="w-full h-12 border-white/20 text-white rounded-xl uppercase text-[10px] font-black tracking-widest">Em Desenvolvimento</Button>
                    </div>
                 </Card>

                 <div className="p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                       <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Status do Sistema</p>
                       <p className="text-lg font-bold">100% Operacional</p>
                    </div>
                 </div>
              </div>
            </form>
          )}

          {activeTab === "funcionalidades" && (
            <div className="max-w-3xl mx-auto space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-antigravity overflow-hidden">
                 <CardHeader className="p-10 pb-6 bg-slate-50 border-b border-gray-100">
                    <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-4">
                       <Cpu className="w-6 h-6 text-primary" />
                       Controle de Funcionalidades
                    </CardTitle>
                    <CardDescription>Serviços externos e automações do sistema.</CardDescription>
                 </CardHeader>
                 <CardContent className="p-10">
                    <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2rem] border border-gray-100 group transition-all">
                       <div className="flex gap-6 items-center">
                          <div className="w-14 h-14 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                             <Database className="w-7 h-7" />
                          </div>
                          <div>
                             <h4 className="text-lg font-bold mb-1">Consulta de CPF Oficial</h4>
                             <p className="text-sm text-gray-400 font-medium">Verificação de cadastro na Receita Federal via APICPF.</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                            settings.is_cpf_api_active 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-600" 
                              : "bg-amber-50 border-amber-100 text-amber-600"
                          }`}>
                            {settings.is_cpf_api_active ? "Ativo" : "Em Manutenção"}
                          </div>
                       </div>
                    </div>

                    <div className="mt-10 p-8 rounded-3xl bg-slate-900 text-white flex gap-6 items-start">
                       <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                          <Lock className="w-5 h-5 text-primary" />
                       </div>
                       <div className="space-y-2">
                          <p className="text-sm font-bold leading-relaxed">
                            Controle de Acesso Restrito
                          </p>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            A ativação/desativação deste serviço requer acesso direto ao banco de dados ou código-fonte por motivos de segurança e conformidade com API externa.
                          </p>
                       </div>
                    </div>
                 </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "equipe" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div>
                   <h3 className="text-2xl font-black tracking-tight">Gerenciar Equipe</h3>
                   <p className="text-gray-400 font-medium">Controle o acesso de vendedores e administradores.</p>
                </div>
                <Button onClick={() => window.location.href='/dashboard/vendedores'} className="h-12 rounded-xl gap-2 font-bold px-6">
                   Ver Painel de Equipe
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm text-center space-y-3">
                   <p className="text-4xl font-black text-primary">{settings?.teamStats?.admins || 0}</p>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Administradores</p>
                </div>
                <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm text-center space-y-3">
                   <p className="text-4xl font-black text-gray-900">{settings?.teamStats?.sellers || 0}</p>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Vendedores Ativos</p>
                </div>
                <div className="p-10 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm text-center space-y-3">
                   <p className="text-4xl font-black text-gray-300">0</p>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Bloqueados</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "seguranca" && (
            <div className="max-w-2xl mx-auto">
              <Card className="rounded-[2.5rem] border-none shadow-antigravity bg-white p-12">
                 <form onSubmit={handlePasswordChange} className="flex flex-col items-center text-center space-y-8">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner">
                       <Lock className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                       <h3 className="text-3xl font-black tracking-tight">Alterar Senha</h3>
                       <p className="text-gray-400 font-medium max-w-sm">Atualize sua senha de acesso ao painel administrativo.</p>
                    </div>
                    <div className="w-full space-y-5 pt-4">
                       <div className="space-y-2 text-left">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Nova Senha</Label>
                          <Input 
                            type="password" 
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            placeholder="Mínimo 6 caracteres" 
                            className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-primary/20" 
                          />
                       </div>
                       <div className="space-y-2 text-left">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4">Confirmar Nova Senha</Label>
                          <Input 
                            type="password" 
                            value={passwords.confirm}
                            onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                            placeholder="Repita a nova senha" 
                            className="h-14 rounded-2xl bg-slate-50 border-none focus:ring-primary/20" 
                          />
                       </div>
                       <Button 
                         type="submit"
                         disabled={passLoading}
                         className="w-full h-16 rounded-2xl font-black tracking-widest text-xs uppercase shadow-xl shadow-primary/20 mt-4"
                       >
                          {passLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          ATUALIZAR SENHA AGORA
                       </Button>
                    </div>
                 </form>
              </Card>
            </div>
          )}

          {activeTab === "dados" && (
            <Card className="rounded-[2.5rem] border-none shadow-antigravity overflow-hidden max-w-2xl mx-auto">
               <CardHeader className="p-10 border-b border-gray-100">
                  <CardTitle className="text-2xl font-black tracking-tight">Backup de Dados</CardTitle>
               </CardHeader>
               <CardContent className="p-10 space-y-6">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                     <div>
                        <p className="font-bold">Exportar Veículos</p>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">Baixe todo o seu inventário em formato Excel/CSV.</p>
                     </div>
                     <Button variant="outline" className="h-10 rounded-lg text-xs font-black uppercase tracking-widest">Extrair CSV</Button>
                  </div>
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                     <div>
                        <p className="font-bold">Listagem de Leads</p>
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">Exportar base de dados de potenciais clientes.</p>
                     </div>
                     <Button variant="outline" className="h-10 rounded-lg text-xs font-black uppercase tracking-widest">Extrair CSV</Button>
                  </div>
               </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
