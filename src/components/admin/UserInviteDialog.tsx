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
      const response = await inviteSellerAction({ email, name, whatsapp, isAdmin });
      if (response.success) {
        toast.success("Membro adicionado com sucesso!");
        setOpen(false);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao convidar membro");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        onClick={() => setOpen(true)}
        className="h-14 px-8 rounded-2xl font-bold gap-2 shadow-xl shadow-primary/20"
      >
        <UserPlus className="w-5 h-5" />
        ADICIONAR MEMBRO
      </Button>
      
      <DialogContent className="sm:max-w-md p-8 rounded-[2.5rem] border-none shadow-2xl bg-white">
        <DialogHeader className="mb-6 text-left">
          <DialogTitle className="text-2xl font-black tracking-tight">Adicionar Membro</DialogTitle>
          <p className="text-gray-500 text-sm font-medium mt-2">
            Especifique os dados do vendedor ou administrador. Ele deve já possuir uma conta ativa na plataforma.
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-400">E-mail do Usuário</Label>
            <Input id="email" name="email" type="email" placeholder="email@exemplo.com" required className="h-12 rounded-xl border-gray-100 bg-slate-50 focus:bg-white transition-all" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nome Completo</Label>
              <Input id="name" name="name" placeholder="Nome do Membro" required className="h-12 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-[10px] font-black uppercase tracking-widest text-gray-400">WhatsApp</Label>
              <Input id="whatsapp" name="whatsapp" placeholder="Ex: 5511999999999" required className="h-12 rounded-xl" />
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
            <Checkbox id="isAdmin" name="isAdmin" />
            <div className="space-y-0.5">
              <Label htmlFor="isAdmin" className="text-xs font-black uppercase tracking-widest text-gray-700 cursor-pointer">
                Administrador
              </Label>
              <p className="text-[10px] text-gray-400 font-medium leading-none">Acesso total às configurações.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl font-bold px-6">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl font-black tracking-widest text-xs h-12 min-w-32 shadow-lg shadow-primary/10">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "SALVAR MEMBRO"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
