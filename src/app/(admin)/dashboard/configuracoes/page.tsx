import { Settings, Bell, Lock, Palette, Users, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Configurações | Prime Veículos",
};

const configSections = [
  {
    icon: Bell,
    title: "Notificações",
    description: "Alertas de novos leads por WhatsApp e e-mail",
    tag: "Em breve",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: Lock,
    title: "Segurança e Acesso",
    description: "Gerenciar senhas, sessões e 2FA",
    tag: "Em breve",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: Users,
    title: "Equipe de Vendas",
    description: "Adicionar e remover vendedores do painel",
    tag: "Em breve",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: Palette,
    title: "Aparência",
    description: "Personalizar cores e identidade visual do catálogo",
    tag: "Em breve",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    icon: Database,
    title: "Dados e Backup",
    description: "Exportar inventário e leads em CSV/Excel",
    tag: "Em breve",
    tagColor: "bg-amber-100 text-amber-700",
  },
];

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest mb-1">Admin</p>
        <h1 className="text-4xl font-display font-black tracking-tighter">Configurações</h1>
        <p className="text-gray-400 mt-2 font-medium">Gerencie preferências e configurações do painel</p>
      </div>

      {/* Profile card */}
      <Card className="rounded-3xl border-none shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-slate-900 via-primary/30 to-slate-900" />
        <CardContent className="p-8 -mt-12">
          <div className="flex items-end gap-6">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30 border-4 border-white">
              <span className="text-2xl font-black text-white">PV</span>
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-display font-black">Prime Veículos</h2>
              <p className="text-sm text-gray-400 font-medium">Administrador · Gestão Prime</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Config sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {configSections.map((section) => (
          <Card
            key={section.title}
            className="rounded-3xl border-none shadow-sm hover:shadow-md transition-shadow cursor-default"
          >
            <CardContent className="p-8 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-gray-500" />
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${section.tagColor}`}>
                  {section.tag}
                </span>
              </div>
              <div>
                <h3 className="font-display font-bold text-base">{section.title}</h3>
                <p className="text-sm text-gray-400 mt-1 font-medium leading-relaxed">
                  {section.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Info footer */}
      <div className="bg-slate-900 text-white rounded-3xl p-8">
        <div className="flex items-center gap-3 mb-3">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="font-display font-black text-lg">Precisa de ajuda?</h3>
        </div>
        <p className="text-gray-400 text-sm font-medium leading-relaxed">
          Para configurações avançadas de integração, banco de dados ou Supabase, entre em contato com o suporte técnico.
          Versão do painel: <span className="text-primary font-black">1.0.0-beta</span>
        </p>
      </div>
    </div>
  );
}
