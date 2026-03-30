# Prime Veículos Platform

Plataforma digital completa para o setor automotivo. Construída do zero para ir além de um simples site de classificados é um ecossistema que conecta o showroom público ao time de vendas em tempo real.

## O que é

O sistema funciona em duas camadas:

**Showroom Digital** — interface pública com catálogo, filtros avançados (preço, quilometragem, combustível), galeria de fotos em alta definição e integração direta com WhatsApp para contato imediato. Leads captados pelo site chegam automaticamente ao painel do vendedor.

**Painel Administrativo (CRM)** — área privada com gestão completa de estoque, pipeline de leads do primeiro contato até o fechamento, business intelligence com métricas de performance e ferramentas de apoio como consulta de CPF para agilizar o atendimento.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS 4 |
| Animações | Framer Motion |
| Banco de Dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth |
| Estado Global | Zustand |
| Sincronização | React Query |
| UI Components | Radix UI + Lucide React |
| Formulários | React Hook Form + Zod |
| Analytics | Recharts |

## Segurança

A autenticação e as permissões são validadas tanto no cliente quanto no servidor via Supabase SSR. O banco de dados utiliza Row Level Security (RLS), garantindo que cada vendedor acesse apenas seus próprios leads — administradores têm visão total do sistema.

---

Desenvolvido por [Marcio Gleik]([https://github.com/marciogleik](https://www.linkedin.com/in/marciogleikdev/))
