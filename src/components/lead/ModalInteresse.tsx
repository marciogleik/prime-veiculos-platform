"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner"; // Assuming sonner is used for toasts, or I'll implement a simple one

const leadSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  message: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface ModalInteresseProps {
  vehicleId: string;
  vehicleLabel: string;
  sellerWhatsapp: string;
}

export default function ModalInteresse({ vehicleId, vehicleLabel, sellerWhatsapp }: ModalInteresseProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LeadFormValues>({
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

      // Success: Open WhatsApp
      const customMsg = data.message ? `\n\nMensagem: ${data.message}` : "";
      const msg = encodeURIComponent(`Olá! Vi o anúncio na Prime Veículos e tenho interesse no *${vehicleLabel}*.\n\nNome: ${data.name}${customMsg}`);
      window.open(`https://wa.me/55${sellerWhatsapp.replace(/\D/g, "")}?text=${msg}`, "_blank");
      
      setOpen(false);
      // toast.success("Interesse enviado com sucesso!");
    } catch (error) {
      console.error(error);
      // toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full h-16 font-bold text-lg rounded-2xl gap-2 shadow-xl shadow-primary/20">
          <MessageSquare className="w-6 h-6" />
          TENHO INTERESSE
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-3xl p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-display font-bold">Quero este Veículo</DialogTitle>
          <DialogDescription>
            Deixe seus dados e um de nossos especialistas entrará em contato imediatamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Seu Nome</Label>
            <Input 
              id="name" 
              placeholder="Ex: João Silva" 
              className="h-12 rounded-xl"
              {...register("name")}
            />
            {errors.name && <p className="text-xs text-red-500 font-medium">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">Seu WhatsApp</Label>
            <Input 
              id="whatsapp" 
              placeholder="(00) 00000-0000" 
              className="h-12 rounded-xl"
              {...register("whatsapp")}
            />
            {errors.whatsapp && <p className="text-xs text-red-500 font-medium">{errors.whatsapp.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Mensagem (opcional)</Label>
            <Textarea 
              id="message" 
              placeholder="Gostaria de saber mais sobre este carro..." 
              className="rounded-xl min-h-[100px]"
              {...register("message")}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 font-bold rounded-xl gap-2" 
            disabled={loading}
          >
            {loading ? "ENVIANDO..." : "ENVIAR PROPOSTA"}
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
