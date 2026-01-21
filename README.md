# � Love Timeline

> *Uma timeline interativa para casais documentarem suas memórias especiais*

![Love Timeline](https://img.shields.io/badge/Next.js-15.5.3-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase)

## 📖 Sobre o Projeto

O **Love Timeline** é uma aplicação web moderna e romântica desenvolvida especificamente para casais que desejam documentar e organizar suas memórias especiais juntos. É uma timeline interativa e visual que permite criar um diário digital compartilhado de momentos importantes do relacionamento.

## ✨ Funcionalidades

### 💕 **Timeline de Memórias**
- Visualização cronológica elegante de memórias em formato timeline
- Upload e armazenamento seguro de fotos em nuvem
- Sistema completo de CRUD (criar, editar, visualizar, excluir) de memórias
- Layout responsivo alternado para desktop e linear para mobile
- Lightbox integrado para visualização ampliada de imagens
- Animações suaves e transições fluidas

### 📅 **Planejador de Eventos**
- Criação e gerenciamento de eventos futuros do casal
- Campos para data, horário, localização e descrição detalhada
- Interface intuitiva para adicionar compromissos e datas especiais
- Organização cronológica de eventos planejados

### 🔐 **Sistema de Autenticação**
- Autenticação privada baseada em senha compartilhada do casal
- Proteção total da privacidade das memórias íntimas
- Persistência segura de sessão no localStorage
- Tela de login personalizada com fundo romântico

### 🎨 **Experiência Visual Única**
- Animações fluidas powered by Framer Motion
- Corações flutuantes decorativos animados
- Tema romântico com gradientes rosa, roxo e tons pastéis
- Interface moderna com efeitos glassmorphism
- Design responsivo mobile-first

## 🛠️ Stack Tecnológica

```typescript
Frontend:       Next.js 15.5.3 (App Router)
Runtime:        React 19.1.0
Language:       TypeScript 5.0
Database:       Supabase PostgreSQL
Storage:        Supabase Storage (imagens)
Styling:        Tailwind CSS 4.1.13
Animations:     Framer Motion 12.23.12
Icons:          Lucide React 0.544.0
Build Tool:     Turbopack (Next.js)
Deployment:     Vercel Ready
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18.0+ instalado
- npm ou yarn
- Conta Supabase (gratuita)

### 1. **Clone o Repositório**
```bash
git clone https://github.com/Alanlan21/love-timeline.git
cd love-timeline
```

### 2. **Instale as Dependências**
```bash
npm install
# ou
yarn install
```

### 3. **Configure as Variáveis de Ambiente**
Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# Authentication
NEXT_PUBLIC_COUPLE_PASSWORD=senha_do_casal_aqui
```

### 4. **Configure o Banco Supabase**
Execute os seguintes comandos SQL no seu painel Supabase:

```sql
-- Tabela de memórias
CREATE TABLE memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  date DATE NOT NULL,
  caption TEXT NOT NULL,
  description TEXT,
  image_url TEXT
);

-- Tabela de eventos planejados
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  description TEXT,
  location TEXT
);

-- Configurar bucket para storage de imagens
INSERT INTO storage.buckets (id, name, public) VALUES ('memories', 'memories', true);
```

### 5. **Execute o Projeto**
```bash
npm run dev
# ou
yarn dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📁 Estrutura do Projeto

```
love-timeline/
├── app/                    # Next.js App Router
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout principal
│   ├── page.tsx           # Página inicial (auth)
│   ├── timeline/          # Página da timeline
│   └── planner/           # Página do planejador
├── components/             # Componentes React
│   ├── Timeline.tsx       # Componente principal da timeline
│   ├── AddMemoryModal.tsx # Modal para adicionar memórias
│   ├── Planner.tsx        # Componente do planejador
│   ├── AuthScreen.tsx     # Tela de autenticação
│   ├── Lightbox.tsx       # Visualizador de imagens
│   └── FloatingHearts.tsx # Animação de corações
├── lib/                   # Utilitários e configurações
│   └── supabaseClient.ts  # Cliente Supabase
└── public/                # Arquivos estáticos
```

## 🎨 Customização

### **Alterando o Tema de Cores**
Edite as cores no [tailwind.config.ts](tailwind.config.ts):

```typescript
theme: {
  extend: {
    colors: {
      pink: { /* suas cores personalizadas */ },
      rose: { /* suas cores personalizadas */ },
      purple: { /* suas cores personalizadas */ }
    }
  }
}
```

### **Modificando a Senha de Acesso**
Altere a variável `NEXT_PUBLIC_COUPLE_PASSWORD` no arquivo `.env.local`.

### **Personalizando o Fundo da Tela de Login**
Edite a variável `BACKGROUND_IMAGE` em [components/AuthScreen.tsx](components/AuthScreen.tsx).



## 👨‍💻 Autor

**Alan** - [@Alanlan21](https://github.com/Alanlan21)

---


<div align="center">
  

**⭐ Se este projeto te ajudou, considere dar uma estrela!**

</div>
