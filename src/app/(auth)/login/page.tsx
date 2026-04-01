"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Car, Loader2, ArrowRight, ArrowLeft, Mail, Lock, User, Phone, CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

// Login Schema
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha precisa de pelo menos 6 caracteres"),
});

// Register Schema
const registerSchema = z.object({
  name: z.string().min(3, "Nome completo é obrigatório"),
  whatsapp: z.string().min(10, "WhatsApp inválido"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha precisa de pelo menos 6 caracteres"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [success, setSuccess] = useState(false);

  // Login Form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  // Register Form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onLogin = async (data: LoginValues) => {
    startTransition(async () => {
      const { error } = await supabase.auth.signInWithPassword(data);
      if (error) {
        toast.error(error.message);
        return;
      }
      
      // Middleware handles redirects, but let's be explicit
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: seller } = await supabase.from('sellers').select('is_admin').eq('id', user.id).single();
        router.push(seller?.is_admin ? "/dashboard" : "/meu-perfil");
      }
    });
  };

  const onRegister = async (data: RegisterValues) => {
    startTransition(async () => {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            whatsapp: data.whatsapp,
          },
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setSuccess(true);
      toast.success("Conta criada com sucesso!");
      setTimeout(() => {
        setMode("login");
        setSuccess(false);
      }, 3000);
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 p-4">
      {/* Back to Home Button */}
      <Link href="/" className="absolute top-6 sm:top-8 left-6 sm:left-8 z-50 flex items-center gap-2 text-white/50 hover:text-white transition-all group">
        <div className="bg-white/10 p-2 sm:p-2.5 rounded-full backdrop-blur-md border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50 group-hover:scale-110 transition-all">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] hidden sm:block">Ir para a Loja</span>
      </Link>

      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mb-4 shadow-2xl">
            <Car className="w-8 h-8 text-primary shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
          </div>
          <h1 className="text-3xl font-display font-black text-white tracking-widest leading-none">
            PRIME <span className="text-primary italic">VEÍCULOS</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm font-medium tracking-tight">EXPERIÊNCIA AUTOMOTIVA PREMIUM</p>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] rounded-[2.5rem]">
          <CardContent className="p-8 md:p-10">
            {/* Mode Toggle */}
            <div className="flex p-1.5 bg-black/40 rounded-2xl mb-10 relative">
              <motion.div
                className="absolute inset-y-1.5 rounded-xl bg-primary shadow-[0_8px_20px_-4px_rgba(239,68,68,0.4)]"
                initial={false}
                animate={{
                  x: mode === "login" ? 0 : "100%",
                  width: "calc(50% - 6px)"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
              <button
                onClick={() => setMode("login")}
                className={cn(
                  "flex-1 py-3 text-sm font-black uppercase tracking-widest z-10 transition-colors duration-300",
                  mode === "login" ? "text-white" : "text-gray-500 hover:text-gray-300"
                )}
              >
                Entrar
              </button>
              <button
                onClick={() => setMode("register")}
                className={cn(
                  "flex-1 py-3 text-sm font-black uppercase tracking-widest z-10 transition-colors duration-300",
                  mode === "register" ? "text-white" : "text-gray-500 hover:text-gray-300"
                )}
              >
                Cadastrar
              </button>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-display font-black text-white mb-2">Conta Criada!</h3>
                  <p className="text-gray-400">Redirecionando para login...</p>
                </motion.div>
              ) : mode === "login" ? (
                <motion.form
                  key="login"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={loginForm.handleSubmit(onLogin)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">E-mail</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-primary" />
                        <Input
                          {...loginForm.register("email")}
                          placeholder="DIGITE SEU E-MAIL"
                          className="h-14 pl-12 bg-white/5 border-white/10 text-white rounded-2xl placeholder:text-gray-600 focus:ring-primary/20 focus:border-primary/40 transition-all font-medium"
                        />
                      </div>
                      {loginForm.formState.errors.email && (
                        <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-tighter">
                          {loginForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Senha</Label>
                        <button type="button" className="text-[10px] font-black text-primary hover:text-red-400 transition-colors uppercase tracking-widest">
                          Esqueci a senha
                        </button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-primary" />
                        <Input
                          {...loginForm.register("password")}
                          type="password"
                          placeholder="SUA SENHA"
                          className="h-14 pl-12 bg-white/5 border-white/10 text-white rounded-2xl placeholder:text-gray-600 focus:ring-primary/20 focus:border-primary/40 transition-all"
                        />
                      </div>
                      {loginForm.formState.errors.password && (
                        <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-tighter">
                          {loginForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-16 rounded-2xl bg-primary hover:bg-red-600 text-white font-black uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 group overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>ACESSAR PLATAFORMA <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></>}
                    </span>
                  </Button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={registerForm.handleSubmit(onRegister)}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          {...registerForm.register("name")}
                          placeholder="SEU NOME"
                          className="h-14 pl-12 bg-white/5 border-white/10 text-white rounded-2xl placeholder:text-gray-600"
                        />
                      </div>
                      {registerForm.formState.errors.name && (
                        <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-tighter">
                          {registerForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">WhatsApp</Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          {...registerForm.register("whatsapp")}
                          placeholder="(00) 00000-0000"
                          className="h-14 pl-12 bg-white/5 border-white/10 text-white rounded-2xl placeholder:text-gray-600"
                        />
                      </div>
                      {registerForm.formState.errors.whatsapp && (
                        <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-tighter">
                          {registerForm.formState.errors.whatsapp.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input
                        {...registerForm.register("email")}
                        placeholder="EX: NOME@EMAIL.COM"
                        className="h-14 pl-12 bg-white/5 border-white/10 text-white rounded-2xl placeholder:text-gray-600"
                      />
                    </div>
                    {registerForm.formState.errors.email && (
                      <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-tighter">
                        {registerForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          {...registerForm.register("password")}
                          type="password"
                          placeholder="••••••"
                          className="h-14 pl-12 bg-white/5 border-white/10 text-white rounded-2xl placeholder:text-gray-600"
                        />
                      </div>
                      {registerForm.formState.errors.password && (
                        <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-tighter">
                          {registerForm.formState.errors.password.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Confirmar</Label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <Input
                          {...registerForm.register("confirmPassword")}
                          type="password"
                          placeholder="••••••"
                          className="h-14 pl-12 bg-white/5 border-white/10 text-white rounded-2xl placeholder:text-gray-600"
                        />
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <p className="text-[10px] text-primary font-black uppercase mt-1 tracking-tighter">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isPending}
                    className="w-full h-16 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase tracking-[0.2em] shadow-2xl group overflow-hidden relative"
                  >
                    {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "CRIAR CONTA PREMIUM"}
                  </Button>
                </motion.form>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Dynamic Footer */}
        <p className="text-center mt-10 text-xs text-gray-500 font-bold tracking-widest uppercase opacity-50">
          © 2026 Prime Veículos Platform · Gestão Automotiva Inteligente
        </p>
      </motion.div>
    </div>
  );
}
