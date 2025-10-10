# 🎓 Mural IFSP - Bragança Paulista

Sistema de denúncia sobre violência escolar do Instituto Federal de São Paulo (IFSP) - Campus Bragança Paulista.

## 📋 Sobre o Projeto

O Mural IFSP é uma plataforma que permite aos estudantes e comunidade denunciar casos de violência escolar através de postagens contendo vídeos, fotos, áudios, PDFs e textos. O sistema conta com moderação administrativa e sistema de comentários.

## 🚀 Tecnologias Utilizadas

- **Frontend:** React 18 + Vite
- **Backend/Database:** Supabase
- **Hospedagem:** Vercel
- **Animações:** Framer Motion
- **Ícones:** React Icons
- **Gerenciamento de Estado:** Zustand
- **Notificações:** React Hot Toast
- **Players:** React Player, WaveSurfer.js
- **PDF:** PDF.js

## 📁 Estrutura do Projeto

```
mural-ifsp/
├── public/
│   └── logo-ifsp.png
├── src/
│   ├── components/
│   │   ├── common/          # Componentes reutilizáveis
│   │   ├── auth/            # Autenticação
│   │   ├── posts/           # Postagens
│   │   ├── profile/         # Perfil
│   │   └── admin/           # Painel administrativo
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Profile.jsx
│   │   └── Admin.jsx
│   ├── services/
│   │   ├── supabase.js      # Cliente Supabase
│   │   ├── auth.js          # Serviços de autenticação
│   │   └── storage.js       # Upload de arquivos
│   ├── hooks/
│   │   └── useAuth.js       # Hook de autenticação
│   ├── styles/
│   │   ├── global.css       # Estilos globais
│   │   └── animations.css   # Animações
│   ├── utils/
│   │   ├── constants.js     # Constantes
│   │   └── validators.js    # Validações
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .env.local               # NUNCA COMMITAR!
├── .gitignore
├── package.json
├── vite.config.js
└── vercel.json
```

## 🔧 Instalação e Configuração

### 1. Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Conta na Vercel (para deploy)

### 2. Clone o Repositório

```bash
git clone <seu-repositorio>
cd mural-ifsp
```

### 3. Instale as Dependências

```bash
npm install
```

### 4. Configure o Supabase

#### 4.1. Crie um projeto no Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL do projeto e a chave pública (anon key)

#### 4.2. Execute o script SQL
1. No painel do Supabase, vá em **SQL Editor**
2. Cole o conteúdo do arquivo `database-schema.sql` (fornecido anteriormente)
3. Execute o script

#### 4.3. Configure o Storage
1. Vá em **Storage** no painel do Supabase
2. Crie os seguintes buckets (todos públicos):
   - `fotos-perfil`
   - `postagens-midia`
   - `thumbnails`

#### 4.4. Configure a Autenticação
1. Vá em **Authentication** > **Settings**
2. Em **Email Templates**, configure os templates de email
3. Habilite **Email confirmations**

### 5. Configure as Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` e preencha com suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_publica_aqui

# Outras configurações já vêm com valores padrão
```

### 6. Execute o Projeto Localmente

```bash
npm run dev
```

O projeto estará disponível em: `http://localhost:5173`

## 🚢 Deploy na Vercel

### 1. Instale a CLI da Vercel

```bash
npm i -g vercel
```

### 2. Faça Login

```bash
vercel login
```

### 3. Configure o Projeto

```bash
vercel
```

Siga as instruções e confirme as configurações.

### 4. Configure as Variáveis de Ambiente na Vercel

1. Acesse o dashboard da Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione as mesmas variáveis do `.env.local`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 5. Deploy

```bash
vercel --prod
```

## 👥 Tipos de Usuário

### Estudante
- Pode criar postagens
- Pode comentar
- Precisa de BP (prontuário)
- Email institucional (@ifsp.edu.br recomendado)

### Visitante
- Pode apenas comentar
- Precisa verificar email
- Não precisa de BP

### Administrador
- Pode moderar conteúdo
- Pode banir usuários
- Acesso ao painel administrativo

## 📝 Funcionalidades

### Postagens
- ✅ Upload de vídeo, foto, GIF, PDF, áudio
- ✅ Descrição obrigatória
- ✅ Miniatura automática
- ✅ Modal de visualização expandida
- ✅ Player de vídeo/áudio integrado
- ✅ Transcrição de áudio (opcional)

### Comentários
- ✅ Comentários por estudantes e visitantes
- ✅ Sistema de moderação

### Autenticação
- ✅ Cadastro com BP (estudantes)
- ✅ Cadastro com email (visitantes)
- ✅ Verificação por código de 4 dígitos
- ✅ Recuperação de senha

### Administração
- ✅ Painel administrativo
- ✅ Moderação de postagens
- ✅ Gerenciamento de usuários
- ✅ Sistema de banimento
- ✅ Logs de ações administrativas

## 🎨 Tema e Design

- **Cor principal:** Verde IFSP (#0B6623)
- **Tema:** Escuro
- **Efeitos:** Glassmorphism, animações fluidas
- **Responsivo:** Mobile-first

## 🔒 Segurança

- ✅ Variáveis de ambiente protegidas
- ✅ Row Level Security (RLS) no Supabase
- ✅ Validação de arquivos
- ✅ Sanitização de inputs
- ✅ Proteção contra CSRF
- ✅ Headers de segurança configurados

## 📱 Tipos de Mídia Suportados

### Imagens
- JPG, JPEG, PNG, GIF, WEBP
- Máximo: 10MB

### Vídeos
- MP4, WEBM, OGG, MOV
- Máximo: 100MB

### Áudios
- MP3, WAV, OGG
- Máximo: 20MB

### Documentos
- PDF
- Máximo: 15MB

## 🐛 Resolução de Problemas

### Erro de conexão com Supabase
- Verifique se as variáveis de ambiente estão corretas
- Confirme que o projeto Supabase está ativo

### Upload de arquivo falha
- Verifique se os buckets foram criados corretamente
- Confirme que os buckets estão configurados como públicos

### Erro ao executar SQL
- Execute o script em partes se necessário
- Verifique se todas as extensões foram habilitadas

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento

## 📄 Licença

Este projeto é de código aberto e está sob a licença MIT.

---

**Desenvolvido para o IFSP - Campus Bragança Paulista**

🎓 Educação | 🛡️ Segurança | 💚 Comunidade