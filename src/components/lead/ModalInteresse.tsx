"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { useState, ReactNode } from "react";
import { toast } from "sonner";

const leadSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 letras"),
  whatsapp: z.string().min(10, "Informe um WhatsApp válido (com DDD)"),
  message: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface ModalInteresseProps {
  vehicleId: string;
  vehicleLabel: string;
  sellerWhatsapp: string;
  trigger?: ReactNode; // Optional custom trigger button
}

export default function ModalInteresse({ vehicleId, vehicleLabel, sellerWhatsapp, trigger }: ModalInteresseProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
  });

  const onSubmit = async (data: LeadFormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          vehicle_id: vehicleId,
        }),
      });

      if (!response.ok) throw new Error("Erro ao enviar lead");

      toast.success("Proposta enviada com sucesso! Abrindo WhatsApp...");

      // Success: Open WhatsApp
      const cleanPhone = sellerWhatsapp.replace(/\D/g, "");
      // Ensure we don't double the 55
      const finalPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
      
      const customMsg = data.message ? `\n\nMensagem: ${data.message}` : "";
      const msg = encodeURIComponent(`Olá! Vi o anúncio na Prime Veículos e tenho interesse no *${vehicleLabel}*.\n\nNome: ${data.name}${customMsg}`);
      
      setTimeout(() => {
        window.open(`https://wa.me/${finalPhone}?text=${msg}`, "_blank");
        setOpen(false);
        reset();
      }, 1500);

    } catch (error) {
      console.error(error);
      toast.error("Ocorreu um erro ao enviar sua proposta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <div onClick={() => setOpen(true)} className="w-full">
          {trigger}
        </div>
      ) : (
        <Button 
          onClick={() => setOpen(true)}
          size="lg" 
          className="w-full h-16 font-black text-[10px] tracking-[0.2em] rounded-2xl gap-3 shadow-xl bg-primary hover:bg-primary/90 text-white uppercase transition-all active:scale-95"
        >
          <MessageSquare className="w-5 h-5" />
          TENHO INTERESSE
        </Button>
      )}
      
      <DialogContent className="sm:max-w-[440px] rounded-[2rem] p-10 border-0 shadow-2xl">
        <DialogHeader className="mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-3xl font-display font-black tracking-tighter leading-none">
            QUERO ESTE <span className="text-primary italic">VEÍCULO.</span>
          </DialogTitle>
          <DialogDescription className="text-premium-grey font-medium text-sm pt-2">
            Deixe seus dados e um de nossos especialistas entrará em contato imediatamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seu Nome Completo</Label>
            <Input 
              id="name" 
              placeholder="Ex: João Silva" 
              className="h-14 rounded-2xl bg-slate-50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
              {...register("name")}
            />
            {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-2">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seu WhatsApp</Label>
            <Input 
              id="whatsapp" 
              placeholder="(00) 00000-0000" 
              className="h-14 rounded-2xl bg-slate-50 border-0 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
              {...register("whatsapp")}
            />
            {errors.whatsapp && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider pl-2">{errors.whatsapp.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Mensagem Adicional (opcional)</Label>
            <Textarea 
              id="message" 
              placeholder="Olá, gostaria de saber mais informações sobre as condições deste veículo..." 
              className="rounded-2xl bg-slate-50 border-0 min-h-[120px] focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium resize-none p-4"
              {...register("message")}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-16 font-black text-[11px] tracking-[0.3em] rounded-2xl gap-3 bg-black text-white hover:bg-slate-900 transition-all shadow-xl shadow-black/10 disabled:opacity-50" 
            disabled={loading}
          >
            {loading ? "ENVIANDO..." : "SOLICITAR CONTATO"}
            <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
