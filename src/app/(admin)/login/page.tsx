"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Car, Loader2 } from "lucide-react";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha muito curta"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) throw error;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Erro ao realizar login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
        <div className="bg-black p-8 text-center text-white">
          <div className="bg-primary w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Car className="text-white w-6 h-6" />
          </div>
          <h1 className="text-2xl font-display font-bold uppercase tracking-tighter">
            PRIME <span className="text-primary italic">VEÍCULOS</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Painel de Gestão de Vendas</p>
        </div>
        
        <CardContent className="p-8 bg-white">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="seu@email.com" 
                className="h-12 rounded-xl"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <button type="button" className="text-xs text-primary font-bold hover:underline">
                  Esqueceu a senha?
                </button>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••" 
                className="h-12 rounded-xl"
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-14 font-bold rounded-xl text-lg shadow-xl shadow-primary/20"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ENTRAR NO PAINEL"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
