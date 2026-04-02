"use client";

import Link from "next/link";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import Logo from "./Logo";
import { toast } from "sonner";

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="mb-8 block">
              <Logo variant="light" className="h-10" />
            </Link>
            <p className="text-gray-100 leading-relaxed mb-6 text-sm">
              Sua concessionária premium de confiança. Qualidade, transparência e os melhores veículos do mercado.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/primeveiculos_ab?igsh=bjFtb3ZzbDZwNzV1" target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://wa.me/message/FCLJWRVPZNJHP1" target="_blank" className="bg-white/10 p-2 rounded-full hover:bg-emerald-500 transition-colors">
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Links Rápidos</h3>
            <ul className="space-y-4 text-gray-100 text-sm">
              <li><Link href="/catalogo" className="hover:text-white transition-colors">Nosso Estoque</Link></li>
              <li>
                <button onClick={() => toast.info("Em breve: Avaliação online.")} className="hover:text-white transition-colors">
                  Avalie seu Veículo
                </button>
              </li>
              <li>
                <button onClick={() => toast.info("Em breve: Nossa história completa.")} className="hover:text-white transition-colors">
                  Nossa História
                </button>
              </li>
              <li>
                <button onClick={() => toast.info("Em breve: Canais de contato.")} className="hover:text-white transition-colors">
                  Fale Conosco
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Horário de Atendimento</h3>
            <ul className="space-y-4 text-gray-100">
              <li>Segunda - Sexta: 08h às 18h</li>
              <li>Sábado: 08h às 14h</li>
              <li>Domingo: Fechado</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Contato</h3>
            <ul className="space-y-4 text-gray-100">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>Av. Araguaia, 380 - Centro, Água Boa - MT, 78635-000</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>(00) 0000-0000</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>contato@primeveiculos.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center text-gray-200 text-sm">
          <p>© {new Date().getFullYear()} Prime Veículos. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
