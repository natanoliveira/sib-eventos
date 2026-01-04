# 🏛️ EventoIgreja - Sistema de Gestão de Eventos

Sistema completo para gestão de eventos religiosos com autenticação, pagamentos via Stripe, sistema de parcelas, tickets e interface moderna.

![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black?logo=next.js)![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791?logo=postgresql)![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?logo=stripe)

## 📋 Índice

-   [Funcionalidades](#-funcionalidades)
-   [Tecnologias](#-tecnologias)
-   [Instalação](#-instala%C3%A7%C3%A3o)
-   [Configuração](#-configura%C3%A7%C3%A3o)
-   [Execução](#-execu%C3%A7%C3%A3o)
-   [Estrutura do Projeto](#-estrutura-do-projeto)
-   [API Endpoints](#-api-endpoints)
-   [Banco de Dados](#-banco-de-dados)

## ✨ Funcionalidades

### 🔐 Autenticação e Autorização

-   Login com email/senha
-   Login com Google OAuth
-   Sistema JWT com bearer token
-   Gerenciamento de perfil de usuário
-   Alteração de senha
-   Upload de foto de perfil (base64)
-   Sistema de permissões granulares
-   Roles: ADMIN, PASTOR, LEADER, MEMBER

### 👥 Gestão de Membros

-   CRUD completo de membros
-   Busca e filtros por nome, email, telefone
-   Categorização por role
-   Visualização de eventos por membro
-   Histórico de participação
-   Deleção lógica (soft delete)

### 📅 Gestão de Eventos

-   **Criar eventos** com todos os detalhes
    -   Título, descrição, categoria
    -   Datas de início e término
    -   Local, capacidade, preço
-   **Editar eventos** existentes
-   **Remover eventos** (deleção lógica)
-   Status automático: ACTIVE, UPCOMING, COMPLETED, CANCELLED
-   Categorias: Jovens, Adultos, Liderança, Geral
-   Contagem de inscrições em tempo real
-   Interface com cards visuais e progress bars
-   Sistema de toasts para feedback

### 💳 Sistema de Faturas e Parcelas

-   **Geração de Faturas**
    
    -   Seleção de membro e evento
    -   Valor customizável
    -   Parcelamento em até 12x
    -   Métodos: PIX, Cartão, Transferência
    -   Data de vencimento configurável
-   **Gestão de Parcelas**
    
    -   Geração automática de parcelas
    -   Vencimentos mensais
    -   Status: PENDING, PAID, OVERDUE
    -   Pagamento via Stripe
    -   Histórico de pagamentos
    -   Pesquisa e filtros avançados

### 💰 Integração com Stripe

-   Payment Intents para pagamentos seguros
-   Suporte a parcelamento
-   Processamento de pagamentos individuais
-   Webhooks para confirmação automática
-   Modo test e live
-   Estornos (refunds)

### 🎫 Sistema de Tickets/Passaportes

-   Geração automática de tickets
-   QR Code único por ticket
-   Status: ACTIVE, PENDING, CANCELLED, USED
-   Envio por email
-   Impressão de passaportes
-   Visualização e gerenciamento
-   Download de tickets

### 💸 Gestão de Pagamentos

-   Dashboard de pagamentos
-   Filtros por status, método, período
-   Visualização de detalhes completos
-   Processamento de estornos
-   Estatísticas de receita
-   Gráficos de acompanhamento

### 📊 Dashboard Administrativo

-   Estatísticas em tempo real
    -   Total de eventos
    -   Total de membros
    -   Receita total
    -   Eventos ativos
-   Gráficos de receita mensal
-   Métricas de conversão
-   Progress bars de metas

### 🎨 Interface Moderna

-   Design responsivo
-   Paleta de cores blue/indigo
-   Componentes shadcn/ui
-   Animações suaves
-   Loading states em todos os submits
-   Sistema de toasts (Sonner)
-   Modais centralizados
-   Feedback visual consistente

## 🛠️ Tecnologias

### Frontend

-   **Next.js 15.5.9** - Framework React com SSR
-   **React 19** - Biblioteca UI
-   **TypeScript** - Type safety
-   **Tailwind CSS** - Estilização
-   **shadcn/ui** - Componentes UI
-   **Lucide React** - Ícones
-   **Sonner** - Sistema de toasts

### Backend

-   **Next.js API Routes** - Endpoints REST
-   **Prisma** - ORM
-   **PostgreSQL** - Banco de dados
-   **JWT** - Autenticação
-   **bcrypt** - Hash de senhas

### Pagamentos

-   **Stripe** - Processamento de pagamentos
-   **Stripe SDK** - Integração oficial

### DevOps

-   **ESLint** - Linting
-   **TypeScript** - Type checking
-   **Prisma Studio** - Database GUI

## 📦 Instalação

```bash
# Clone o repositóriogit clone <repository-url>cd sib-eventos# Instale as dependênciasnpm install
```

## ⚙️ Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# DatabaseDATABASE_URL="postgresql://user:password@localhost:5432/sib_eventos"# JWT SecretJWT_SECRET="seu-secret-super-seguro-aqui"# Stripe (Test Keys)NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."STRIPE_SECRET_KEY="sk_test_..."STRIPE_WEBHOOK_SECRET="whsec_..."# Next.jsNEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 2. Banco de Dados

```bash
# Gere o Prisma Clientnpx prisma generate# Execute as migrationsnpx prisma migrate dev# (Opcional) Seed do banconpm run db:seed
```

### 3. Stripe

1.  Crie uma conta em [stripe.com](https://stripe.com)
2.  Obtenha suas chaves de teste no Dashboard
3.  Configure o webhook endpoint: `/api/stripe/webhook`
4.  Copie o webhook secret

## 🚀 Execução

### Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3001](http://localhost:3001)

### Build de Produção

```bash
npm run buildnpm start
```

### Credenciais de Demonstração

```
Admin:Email: admin@igreja.comSenha: 123456Pastor:Email: pastor@igreja.comSenha: 123456Membro:Email: membro@igreja.comSenha: 123456
```

## 📁 Estrutura do Projeto

```
sib-eventos/├── app/│   ├── api/                    # API Routes│   │   ├── auth/              # Autenticação│   │   ├── events/            # Eventos│   │   ├── members/           # Membros│   │   ├── invoices/          # Faturas│   │   ├── installments/      # Parcelas│   │   ├── payments/          # Pagamentos│   │   ├── tickets/           # Tickets│   │   └── stripe/            # Stripe│   ├── dashboard/             # Páginas do Dashboard│   ├── login/                 # Página de Login│   └── inscricoes/            # Inscrições públicas├── components/                 # Componentes React│   ├── ui/                    # Componentes shadcn/ui│   ├── events-management.tsx  # Gestão de eventos│   ├── invoice-generator.tsx  # Gerador de faturas│   ├── installments-management.tsx│   ├── payments-management.tsx│   ├── tickets-management.tsx│   └── users-management.tsx├── lib/                       # Utilitários│   ├── prisma.ts             # Prisma Client│   ├── auth.ts               # JWT utils│   ├── auth-utils.ts         # Middleware│   ├── api-client.ts         # API Client│   └── toast.ts              # Sistema de toasts├── prisma/│   ├── schema.prisma         # Schema do banco│   └── migrations/           # Migrations└── public/                   # Arquivos estáticos
```

## 🔌 API Endpoints

### Autenticação

```
POST   /api/auth/login          # LoginPOST   /api/auth/register       # RegistroGET    /api/auth/profile        # Perfil do usuárioPUT    /api/auth/profile        # Atualizar perfilPOST   /api/auth/change-password # Alterar senha
```

### Eventos

```
GET    /api/events              # Listar eventosPOST   /api/events              # Criar eventoGET    /api/events/[id]         # Obter eventoPUT    /api/events/[id]         # Atualizar eventoDELETE /api/events/[id]         # Remover evento
```

### Membros

```
GET    /api/members             # Listar membrosPOST   /api/members             # Criar membroGET    /api/members/[id]        # Obter membroPUT    /api/members/[id]        # Atualizar membroDELETE /api/members/[id]        # Remover membroGET    /api/members/search      # Buscar membros
```

### Faturas

```
GET    /api/invoices            # Listar faturasPOST   /api/invoices/generate   # Gerar fatura
```

### Parcelas

```
GET    /api/installments        # Listar parcelasPOST   /api/installments/[id]/pay # Pagar parcela
```

### Pagamentos

```
GET    /api/payments            # Listar pagamentos
```

### Stripe

```
POST   /api/stripe/create-payment-intent # Criar Payment IntentPOST   /api/stripe/webhook      # Webhook do Stripe
```

## 🗄️ Banco de Dados

### Principais Entidades

-   **User** - Usuários do sistema
-   **Permission** - Permissões do sistema
-   **UserPermission** - Relação usuário-permissão
-   **Person** - Pessoas/Membros
-   **Event** - Eventos
-   **Membership** - Inscrições em eventos
-   **Invoice** - Faturas
-   **Installment** - Parcelas
-   **Payment** - Pagamentos
-   **Ticket** - Tickets/Passaportes

### Diagrama de Relacionamentos

```
User 1---* UserPermission *---1 PermissionUser 1---* Event (creator)User 1---0..1 PersonPerson 1---* Membership *---1 EventPerson 1---* Invoice *---1 EventPerson 1---* Ticket *---1 EventInvoice 1---* InstallmentInstallment 1---* Payment
```

## 🎯 Próximos Passos

-    Relatórios em PDF
-    Exportação de dados (Excel/CSV)
-    Sistema de notificações por email
-    Dashboard de analytics avançado
-    App mobile (React Native)
-    Sistema de check-in com QR Code
-    Integração com outros gateways de pagamento

## 📄 Licença

Este projeto é proprietário e confidencial.

## 👨‍💻 Desenvolvimento

Desenvolvido com 💙 por [Natan Oliveira]

---

**EventoIgreja** - Sistema completo para gestão de eventos religiosos