"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { inviteSellerAction } from "@/app/(admin)/dashboard/vendedores/actions";
import { Checkbox } from "@/components/ui/checkbox";

export default function UserInviteDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const name = formData.get("name") as string;
    const whatsapp = formData.get("whatsapp") as string;
    const isAdmin = formData.get("isAdmin") === "on";

    try {
      await inviteSellerAction({ email, name, whatsapp, isAdmin });
      toast.success("Membro adicionado com sucesso!");
      setOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao convidar membro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="h-14 px-8 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20">
          <UserPlus className="w-5 h-5" />
          ADICIONAR MEMBRO
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-8 rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-display font-bold">Adicionar Membro</DialogTitle>
          <p className="text-gray-500 text-sm">
            Especifique os dados do vendedor ou administrador. Ele deve já possuir uma conta ativa na plataforma.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-400">E-mail do Usuário</Label>
            <Input id="email" name="email" placeholder="email@exemplo.com" required className="h-12 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Completo</Label>
            <Input id="name" name="name" placeholder="Nome do Membro" required className="h-12 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp</Label>
            <Input id="whatsapp" name="whatsapp" placeholder="Ex: 11999999999" required className="h-12 rounded-xl" />
          </div>

          <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <Checkbox id="isAdmin" name="isAdmin" />
            <Label htmlFor="isAdmin" className="text-xs font-bold text-gray-700 cursor-pointer">
              Definir como Administrador
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl font-bold min-w-32">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Membro"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
