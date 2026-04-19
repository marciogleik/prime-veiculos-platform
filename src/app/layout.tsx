import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
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
  metadataBase: new URL("https://primeveiculosab.com.br"),
  openGraph: {
    title: "Prime Veículos | Concessionária Premium",
    description: "A melhor seleção de veículos premium com transparência e qualidade.",
    url: "https://primeveiculosab.com.br",
    siteName: "Prime Veículos",
    locale: "pt_BR",
    type: "website",
  },
};

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
