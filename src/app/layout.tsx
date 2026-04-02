import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Prime Veículos | Concessionária Premium",
  description: "A melhor seleção de veículos premium com transparência e qualidade.",
};

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${jakarta.variable} ${outfit.variable} antialiased bg-white text-black`}
      >
        <Providers>
          <TooltipProvider>{children}</TooltipProvider>
        </Providers>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
