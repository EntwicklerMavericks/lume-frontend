<div align="center">

  <img src="public/images/logo.png" alt="Lume Logo" width="120" />

  # ⚡ LUME
  ### *Streetwear Autêntico & E-Commerce Premium*

  [![Angular](https://img.shields.io/badge/Angular-20.0-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![SCSS](https://img.shields.io/badge/SCSS-HotPink?style=for-the-badge&logo=sass&logoColor=white)](https://sass-lang.com/)
  [![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
  [![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
  [![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

  <br />

  <p align="center">
    <strong>Plataforma completa de comércio eletrônico e gestão administrativa para moda urbana e streetwear, com fechamento direto via WhatsApp e arquitetura moderna de alta performance.</strong>
  </p>

  <p align="center">
    <a href="#-visão-geral">Visão Geral</a> •
    <a href="#-funcionalidades-chave">Funcionalidades</a> •
    <a href="#-tecnologias">Tecnologias</a> •
    <a href="#-arquitetura--estrutura">Arquitetura</a> •
    <a href="#-como-executar">Como Executar</a> •
    <a href="#-testes">Testes</a>
  </p>

  <img src="public/images/portfolio-cover.jpg" alt="Lume Showcase Cover" width="100%" />

</div>

---

## 📌 Visão Geral

A **Lume** é uma marca conceitual de moda streetwear masculina voltada para jovens que buscam cortes *boxy/oversized*, tecidos *heavyweight* e lançamentos exclusivos (*drops*).

O projeto foi projetado com uma experiência de compra ágil e humanizada: o cliente explora o catálogo, personaliza tamanhos e variações, monta sua sacola de compras e fecha o pedido diretamente com um consultor via **WhatsApp**, com mensagens automáticas pré-formatadas contendo todos os detalhes do pedido ou dúvidas sobre caimento.

Para o lojista, a plataforma conta com um **Painel Administrativo completo**, permitindo gestão de catálogo, controle de estoque, criação de categorias dinâmicas e upload de fotos com compressão inteligente no navegador.

---

## ✨ Funcionalidades Chave

### 🛍️ Vitrine Pública (Storefront)
- **Identidade Dark Luxury & Streetwear**: Design minimalista, paleta escura (obsidian/carbon) com contrastes metálicos e tipografia editorial.
- **Header & Menu Drawer Mobile**: Navegação 100% responsiva com links dinâmicos sincronizados com o banco de dados.
- **Hero & Manifesto**: Apresentação de marca com fotografia autêntica da cultura urbana brasileira.
- **Catálogo Inteligente**:
  - Filtros por categoria, faixa de preço, cores e tamanhos.
  - Ordenação por novidades, menor preço e maior preço.
  - Busca em tempo real com debounce.
- **Página de Produto (PDP)**:
  - Galeria de fotos interativa.
  - Seletor de tamanhos e variações.
  - Botão de compra direta com mensagem contextual para o WhatsApp.
  - Accordions explicativos sobre tecidos, caimento e processo de finalização.
- **Sacola de Compras Interativa**:
  - Atualização reativa de quantidades e subtotais em tempo real.
  - Campo para observações personalizadas do cliente.
  - Botão de fechamento padronizado com cantos modernos (8px) e integração direta com a API do WhatsApp.
- **Canais Diretos de WhatsApp**:
  - Mensagem contextual para dúvidas sobre caimento e tamanhos na Home.
  - Mensagem de atendimento geral e catálogo no Rodapé.
  - Mensagem de checkout com listagem de itens, quantidades e total estimado.

### ⚙️ Painel Administrativo (Lojista)
- **Gestão de Produtos**:
  - Cadastro, edição, inativação e exclusão de peças.
  - Upload de múltiplas imagens com **compressão automática via Canvas** (redimensionamento para 1200px / 85% de qualidade, evitando payloads pesados).
  - Variações de cores, tamanhos e controle de estoque por item.
  - Marcação de produtos em destaque (*highlight*) e lançamentos (*newLaunch*).
- **Gestão de Categorias**:
  - Criação e edição de categorias com atualização instantânea nos menus da loja (sem necessidade de reload).
- **Segurança & Controle de Acesso**:
  - Autenticação JWT com Guards e controle de papéis (RBAC).
  - Suporte a payloads de até 50MB no backend e colunas `LONGTEXT` no MySQL para imagens em alta resolução.

---

## 🛠️ Tecnologias

### Frontend
- **Framework**: [Angular 20](https://angular.dev/) (Standalone Components, Signals & Zoneless Change Detection)
- **Linguagem**: [TypeScript 5.7](https://www.typescriptlang.org/)
- **Estilização**: SCSS com Design Tokens e variáveis CSS personalizadas
- **Roteamento**: Angular Router com Lazy Loading por feature
- **Testes**: Karma & Jasmine (25 suites de testes unitários automatizados)

### Backend & Banco de Dados
- **Framework**: [NestJS 11](https://nestjs.com/) (Arquitetura modular orientada a serviços)
- **ORM**: [Prisma 6](https://www.prisma.io/)
- **Banco de Dados**: MySQL 8.0
- **Segurança**: Passport JWT, bcrypt, class-validator, CORS configurável

---

## 📁 Arquitetura & Estrutura do Projeto

```text
new-project/
├── public/
│   ├── images/
│   │   ├── logo.png               # Monograma metálico transparente BA
│   │   ├── hero-maloqueiro.jpg    # Banner principal da cultura urbana
│   │   └── portfolio-cover.jpg    # Capa de apresentação 16:9
│   └── favicon.ico
├── src/
│   ├── app/
│   │   ├── core/                  # Serviços singleton, modelos, guards e interceptors
│   │   │   ├── config/            # store.config.ts (configuração centralizada da marca)
│   │   │   ├── models/            # Interfaces TypeScript do domínio
│   │   │   └── services/          # StoreService, CartService, WhatsappService, SeoService
│   │   ├── features/              # Módulos e páginas da aplicação
│   │   │   ├── store/             # Vitrine pública (Home, Catálogo, Produto, Carrinho)
│   │   │   ├── products/          # Painel Admin: Gestão de Produtos
│   │   │   └── categories/        # Painel Admin: Gestão de Categorias
│   │   ├── layouts/               # Layouts estruturais (StoreLayout, MainLayout)
│   │   └── shared/                # Componentes compartilhados e menus
│   ├── environments/              # Configurações de ambiente (API URL)
│   └── styles.scss                # Design tokens globais e reset
└── angular.json
```

---

## 🚀 Como Executar

### Pré-requisitos
- **Node.js**: v18+ ou v20+
- **MySQL**: v8.0+ em execução
- **NPM** ou **Yarn**

### 1. Clonar os Repositórios
```bash
# Frontend
git clone https://github.com/joaoPauloDev7/new-project.git
cd new-project

# Backend (em outro terminal)
git clone https://github.com/joaoPauloDev7/new-project-backend.git
cd new-project-backend
```

### 2. Configurar e Iniciar o Backend
```bash
cd new-project-backend

# Instalar dependências
npm install

# Configurar variáveis no .env
# DATABASE_URL="mysql://root:senha@localhost:3306/lume_store"
# JWT_SECRET="sua_chave_secreta"
# PORT=3000

# Sincronizar o banco de dados
npx prisma db push

# Iniciar servidor em desenvolvimento
npm run start:dev
```
> O backend estará acessível em: `http://localhost:3000/api`

### 3. Configurar e Iniciar o Frontend
```bash
cd new-project

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
ng serve
```
> O frontend estará acessível em: `http://localhost:4200`

---

## 🧪 Testes

O projeto conta com testes unitários cobrindo serviços essenciais (carrinho, geração de links e mensagens do WhatsApp, SEO e estado da vitrine):

```bash
# Executar todos os testes unitários (execução única)
npm test -- --watch=false
```

---

## 📱 Contato & Redes

- **Projeto:** Lume
- **WhatsApp:** [+55 11 96304-1542](https://wa.me/5511963041542)
- **Estilo:** Streetwear & Moda Urbana Premium

---

<div align="center">
  <sub>Desenvolvido com foco em alta performance, UX e arquitetura escalável.</sub>
</div>
