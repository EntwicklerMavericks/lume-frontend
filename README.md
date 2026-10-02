<div align="center">

  <img src="public/images/lume-logo.png" alt="Lume Logo" width="140" />

  # ⚡ LUME — STOREFRONT & GESTÃO
  ### *Plataforma White-Label de E-Commerce de Alta Conversão para o Varejo de Moda*

  [![Angular](https://img.shields.io/badge/Angular-20.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![SCSS](https://img.shields.io/badge/SCSS-HotPink?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)
  [![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
  [![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
  [![Asaas](https://img.shields.io/badge/Gateway-Asaas-003087?style=for-the-badge)](https://asaas.com/)

  <br />

  <p align="center">
    <strong>Frontend completo para comércio eletrônico de moda com arquitetura reativa em Angular 20, checkout integrado com gateway de pagamentos (PIX e Cartão), cálculo dinâmico de frete via Correios/Melhor Envio, central do cliente com Google OAuth e painel administrativo completo para o lojista.</strong>
  </p>

  <p align="center">
    <a href="#-visão-geral">Visão Geral</a> •
    <a href="#-funcionalidades-chave">Funcionalidades</a> •
    <a href="#-arquitetura-e-pastas">Arquitetura</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-como-executar">Como Executar</a> •
    <a href="#-testes">Testes</a>
  </p>

  <br />

</div>

---

## 📌 Visão Geral

A **Lume** é uma solução completa de comércio eletrônico desenvolvida para marcas de moda contemporânea que buscam excelência estética, velocidade de carregamento e alta taxa de conversão em dispositivos móveis e desktop.

A plataforma conecta a experiência do cliente final a um ecossistema robusto de gestão para o lojista, oferecendo fluxos de pagamento transparentes, cálculo automático de frete por CEP, rastreamento de pedidos e customização visual dinâmica.

---

## ✨ Funcionalidades Chave

### 🛍️ Vitrine Pública (Storefront)
- **Identidade Visual Dark Luxury:** Layout moderno com foco em alto contraste, tipografia editorial e apresentação imersiva de produtos.
- **Navegação Inteligente & Responsiva:**
  - Header adaptativo com menu lateral (drawer) para mobile.
  - Barra de busca instantânea com suporte a debounce.
  - Filtros dinâmicos por categoria, preço, tamanho e variações de cor.
- **Página de Detalhes do Produto (PDP):**
  - Galeria de imagens com zoom e transições suaves.
  - Seletor interativo de grade de tamanhos (P, M, G, GG) e cores.
  - Acordeões informativos sobre composição têxtil, modelagem e cuidados de lavagem.
  - Botão de compra direta e compartilhamento rápido para WhatsApp.
- **Sacola de Compras Interativa:**
  - Cálculo instantâneo de subtotais e quantidades.
  - Persistência sincronizada com a conta do cliente.
- **Checkout de Alta Conversão:**
  - Layout otimizado para celular com botão de pagamento prioritário.
  - **Cálculo de Frete Dinâmico:** Integração com ViaCEP para preenchimento automático de endereço e cotação de prazos e valores de frete (PAC e SEDEX).
  - **Pagamentos Integrados (Gateway Asaas):**
    - **PIX:** Geração instantânea de QR Code dinâmico e código "Copia e Cola" com confirmação automática via Webhook.
    - **Cartão de Crédito:** Parcelamento em até 12x com validação em tempo real.
- **Área do Cliente (Central do Usuário):**
  - Cadastro e login seguro com e-mail ou **Google OAuth 2.0**.
  - **Botão oficial do Google e ícone estilizados no tema da loja**, adaptando-se às cores ativas da marca.
  - Histórico de pedidos com linha do tempo de status (Aguardando Pagamento, Pago, Em Separação, Enviado com Código de Rastreio, Entregue).

### ⚙️ Painel de Controle Administrativo (ERP do Lojista)
- **Catálogo de Produtos:**
  - Cadastro, edição, precificação promocional e controle de estoque por variação.
  - Upload de imagens em lote com compressão automática via Canvas para máxima performance.
  - Destaques de vitrine e selos promocionais ("Lançamento", "Mais Vendido").
- **Categorias Dinâmicas:**
  - Criação e ordenação de categorias com sincronização instantânea em toda a loja.
- **Gestão de Pedidos:**
  - Painel com listagem completa, busca por cliente e atualização de status em 1 clique com dropdown contextualizado na paleta da loja.
  - Notificações automáticas por e-mail para o cliente a cada mudança de status (Resend API e fallback SMTP).
- **Gestão de Clientes:**
  - Base de dados de clientes cadastrados, histórico de compras e métricas de ticket médio.
- **Configurações Gerais:**
  - Personalização de frete fixo, frete grátis por valor mínimo, dados de contato e chaves de integração.

---

## 🛠️ Tecnologias

### Frontend
- **Framework:** [Angular 20](https://angular.dev/) (Standalone Components, Signals & Zoneless Architecture)
- **Linguagem:** [TypeScript 5.7](https://www.typescriptlang.org/)
- **Estilização:** SCSS modular com Design Tokens e variáveis CSS nativas (`:root`)
- **Autenticação:** Google Identity Services (GIS) & JWT
- **Roteamento:** Angular Router com Lazy Loading estruturado por feature
- **Testes:** Jasmine & Karma

### Backend & Integrações
- **Framework:** [NestJS 11](https://nestjs.com/)
- **ORM:** [Prisma 6](https://www.prisma.io/)
- **Banco de Dados:** MySQL 8.0
- **Gateway de Pagamento:** [Asaas](https://asaas.com/) (PIX e Cartão)
- **E-mails Transacionais:** [Resend](https://resend.com/) & Nodemailer SMTP
- **Logística & CEP:** ViaCEP API

---

## 📁 Arquitetura e Pastas

```text
lume-frontend/
├── public/
│   ├── images/
│   │   ├── lume-logo.png              # Logo oficial Lume
│   │   ├── hero-lume.jpg              # Banner principal da vitrine
│   │   └── products/                  # Imagens de catálogo e produtos
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── core/                      # Camada central singleton
│   │   │   ├── config/                # store.config.ts (configuração central da marca)
│   │   │   ├── guards/                # AuthGuard, AdminGuard
│   │   │   ├── interceptors/          # AuthInterceptor (injeção de Bearer Token)
│   │   │   ├── models/                # Interfaces do domínio (Product, Category, Order, User)
│   │   │   └── services/              # StoreService, CartService, ShippingService, PaymentService
│   │   ├── features/                  # Módulos funcionais da aplicação
│   │   │   ├── store/                 # Vitrine (Home, Catálogo, PDP, Carrinho, Checkout)
│   │   │   ├── customer-area/         # Central do Cliente e Acompanhamento de Pedidos
│   │   │   ├── auth/                  # Autenticação (Login, Registro, Google OAuth)
│   │   │   ├── products/              # Admin: Gestão de Produtos
│   │   │   ├── categories/            # Admin: Gestão de Categorias
│   │   │   ├── orders/                # Admin: Gestão de Pedidos
│   │   │   ├── customers/             # Admin: Base de Clientes
│   │   │   └── settings/              # Admin: Configurações Gerais
│   │   ├── layouts/                   # Layouts estruturais (StoreLayout, MainLayout, AuthLayout)
│   │   └── shared/                    # Componentes reutilizáveis (Header, Footer, Menu, Modais)
│   ├── environments/                  # Variáveis de ambiente (API URL, Google Client ID)
│   └── styles.scss                    # Design tokens globais e variáveis de tema
└── angular.json
```

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js**: v18+ ou v20+
- **NPM**
- **Backend Lume** rodando em `http://localhost:3000`

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Verifique o arquivo `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  googleClientId: 'SEU_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
};
```

### 3. Iniciar Servidor de Desenvolvimento
```bash
ng serve
# ou
npm start
```
Acesse no navegador: `http://localhost:4200`

---

## 🧪 Testes Automatizados

```bash
# Executar suíte de testes unitários
npm test -- --watch=false
```

## 👨‍💻 Desenvolvedor & Contato Comercial

Desenvolvido por **Eduardo Theodoro**.

<div align="center">

  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Eduardo%20Theodoro-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/eduardot97)
  [![WhatsApp](https://img.shields.io/badge/WhatsApp-Conversar%20no%20WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/5511961742713?text=Ol%C3%A1%20Eduardo,%20vim%20pelo%20Lume%20Frontend!)
  [![E-mail 1](https://img.shields.io/badge/E--mail-entwicklermavericks%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:entwicklermavericks@gmail.com)
  [![E-mail 2](https://img.shields.io/badge/E--mail-eduardotheodorofegit%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:eduardotheodorofegit@gmail.com)

</div>

<br />

| Canal | Informação / Link Direto |
| :--- | :--- |
| 👤 **Nome** | **Eduardo Theodoro** |
| 💼 **LinkedIn** | [linkedin.com/in/eduardot97](https://www.linkedin.com/in/eduardot97) |
| 📱 **WhatsApp** | [**+55 (11) 96174-2713**](https://wa.me/5511961742713?text=Ol%C3%A1%20Eduardo,%20vim%20pelo%20Lume%20Frontend!) |
| 📧 **E-mail Principal** | [entwicklermavericks@gmail.com](mailto:entwicklermavericks@gmail.com) |
| 📧 **E-mail Dev / Git** | [eduardotheodorofegit@gmail.com](mailto:eduardotheodorofegit@gmail.com) |

---

<div align="center">
  <sub>© 2026 Lume Commerce — Todos os direitos reservados.</sub>
</div>
