# Event Sync Frontend

Bem-vindo ao **Event Sync Frontend**! Esta é uma aplicação web moderna construída com **Next.js 15+ (App Router)** e **React**, projetada para oferecer uma experiência de usuário fluida para o gerenciamento de eventos.

## 🛠️ Tecnologias Principais e Bibliotecas

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Biblioteca:** [React](https://react.dev/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Ícones:** [Lucide React](https://lucide.dev/)
- **Formulários:** [React Hook Form](https://react-hook-form.com/)
- **Validação:** [Zod](https://zod.dev/)
- **Cliente HTTP:** [Axios](https://axios-http.com/)
- **Notificações Toast:** [Sonner](https://sonner.emilkowal.ski/)
- **QR Code:** `react-qr-code` e `@yudiel/react-qr-scanner`
- **Impressão:** `react-to-print` (para certificados)

## 📂 Visão Geral da Estrutura do Projeto

O projeto segue a estrutura padrão do Next.js App Router com um diretório `src`.

- **`src/`**: Raiz do código-fonte.
  - **`app/`**: Contém o roteamento baseado em sistema de arquivos, layouts e páginas.
    - `(auth)/`: Rotas de autenticação (login, cadastro).
    - `events/`: Detalhes de eventos e listagem.
    - `organizer/`: Painel do organizador e ferramentas.
    - `social/`: Funcionalidades sociais (chat, amigos).
  - **`components/`**: Componentes de UI reutilizáveis (botões, modais, cartões, etc.).
  - **`contexts/`**: Provedores de Contexto React (ex: `AuthContext`).
  - **`services/`**: Camada de integração com API (instâncias Axios e repositórios).
  - **`types/`**: Definições de tipos TypeScript.
  - **`lib/`**: Funções utilitárias e código auxiliar compartilhado.

## 🚀 Começando

### Pré-requisitos

- Node.js (v20+)
- Backend rodando (geralmente na porta 3000)

### Instalação

```bash
npm install
```

### Rodando Localmente

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3001](http://localhost:3001) (ou a porta mostrada no terminal) para visualizar a aplicação.

### Construindo para Produção

Para criar um build de produção:

```bash
npm run build
```

Para iniciar o servidor de produção:

```bash
npm run start
```

## 🎨 Funcionalidades

- **Descoberta de Eventos:** Navegue e pesquise por eventos.
- **Inscrição:** Cadastro fácil em eventos.
- **Painel do Organizador:** Crie e gerencie eventos.
- **Sistema de Check-in:** Leitura de QR code para participantes.
- **Certificados:** Gere e imprima certificados de participação.
- **Social:** Converse com amigos que participarão dos mesmos eventos.
