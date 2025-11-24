# 🩺 Médico Copilot
**Assistente Clínico Inteligente com IA**

Um sistema completo para otimização de consultas médicas com transcrição em tempo real, análise clínica automatizada e gestão de relatórios.

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Demonstração](#-demonstração)
- [Arquitetura](#-arquitetura)
- [Stack Tecnológica](#-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [API Endpoints](#-api-endpoints)
- [Deploy](#-deploy)
- [Roadmap](#-roadmap)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **Médico Copilot** é uma plataforma de assistência clínica que utiliza Inteligência Artificial (Google Gemini) para revolucionar o fluxo de trabalho médico. O sistema transcreve consultas em tempo real, analisa dados clínicos e gera relatórios estruturados automaticamente.

### 🎁 Diferenciais

- ⚡ **Tempo Real**: Transcrição instantânea durante a consulta
- 🤖 **IA Contextual**: Chat pós-consulta com memória do atendimento
- 📄 **Automação**: Geração automática de atestados e relatórios em PDF
- 📹 **Telemedicina**: Suporte integrado para videochamadas seguras
- 📊 **Dashboard Completo**: Histórico com busca avançada e filtros inteligentes
- 🎨 **UX Moderna**: Interface tech com animações e design responsivo
- 🔒 **Segurança**: Dados sensíveis tratados com privacidade

---

## ✨ Funcionalidades

### Core Features

| Funcionalidade | Descrição |
|----------------|-----------|
| 🎙️ **Transcrição em Tempo Real** | Gravação de áudio (WebM) gerenciada por Custom Hooks e transcrição via Google Gemini |
| 🧠 **Análise Clínica por IA** | Geração automática de diagnóstico, exames recomendados e medicamentos |
| 📹 **Teleconsulta** | Videochamadas integradas via Jitsi Meet |
| 💬 **Chat Contextual** | Interação pós-consulta para refinar informações ou solicitar documentos |
| 📑 **Geração de PDF** | Atestados e relatórios profissionais gerados via utilitários dedicados (utils/pdf.ts) |
| 📊 **Dashboard Inteligente** | Grid de histórico com filtros instantâneos por prioridade, data e busca textual |
| 🗑️ **Gestão de Relatórios** | Exclusão, exportação em TXT e PDF via jsPDF |
| 🔔 **Notificações** | Toast system para feedback em tempo real |
| 🎨 **UI Animada** | Layout imersivo com partículas animadas (react-tsparticles) |

### Priorização Automática

O sistema classifica consultas em três níveis:

- 🔴 **Alta**: Casos urgentes que requerem atenção imediata
- 🟡 **Média**: Situações que necessitam acompanhamento
- 🟢 **Baixa**: Consultas de rotina

---

## 🎬 Demonstração
```bash
# Exemplo de fluxo de uso
1. Médico inicia gravação durante consulta (presencial ou remota)
2. IA transcreve em tempo real (Controlado pelo hook useAudioRecorder)
3. Sistema analisa e sugere diagnóstico + exames (Com Retry automático na API)
4. Médico revisa e ajusta via chat contextual
5. Gera atestado em PDF com um comando
6. Relatório salvo automaticamente no histórico
```

---

## 🏗️ Arquitetura
```
┌─────────────────────────────────────────────────────────┐
│                   MÉDICO COPILOT                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │   Frontend (SPA) │◄───────►│  Backend (API)   │    │
│  │                  │  REST   │                  │    │
│  │  React + Vite    │         │  Node + Express  │    │
│  │  TypeScript      │         │  JavaScript      │    │
│  │  Shadcn UI       │         │  Prisma ORM      │    │
│  └────────┬─────────┘         └────────┬─────────┘    │
│           │                            │              │
│  ┌────────▼─────────┐          ┌───────▼─────────┐    │
│  │   Jitsi Meet     │          │   PostgreSQL    │    │
│  │ (Vídeo Iframe)   │          │   (ou SQLite)   │    │
│  └──────────────────┘          └─────────────────┘    │
│                                                         │
│                                ┌──────────────────┐    │
│                                │  Google Gemini   │    │
│                                │      API         │    │
│                                └──────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

O projeto segue uma arquitetura de microsserviços desacoplados, com dois repositórios independentes:

- **medico-frontend**: Interface do usuário (SPA) refatorada com Feature-Based Architecture.
- **medico-api**: Backend e lógica de negócio.

---

## 🛠️ Stack Tecnológica

### Frontend (medico-frontend)

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| React | 18.x | Library UI |
| Vite | 5.x | Build tool & Dev server |
| TypeScript | 5.x | Type safety e Interfaces centralizadas |
| Tailwind CSS | 3.x | Styling |
| Shadcn UI | Latest | Component library (Design System) |
| React Router | 6.x | Navegação com Layout Pattern |
| jsPDF | 2.x | Geração de PDF (Service Utility) |
| html2canvas | 1.x | Screenshot para PDF |
| Jitsi React SDK | 1.x | Videoconferência |
| React TSParticles | 2.x | Animações de fundo |
| Lucide React | Latest | Ícones |

### Backend (medico-api)

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| Node.js | 18+ | Runtime |
| Express | 4.x | Web framework |
| Prisma | 5.x | ORM |
| PostgreSQL | 14+ | Banco de dados (prod) |
| SQLite | 3.x | Banco de dados (dev) |
| Google Gemini API | Latest | IA Generativa |
| Multer | 1.x | Upload de arquivo |
| dotenv | 16.x | Variáveis de ambiente |
| CORS | 2.x | Cross-origin requests |

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.x ou superior ([Download](https://nodejs.org/))
- **npm** ou **yarn**
- **Git** ([Download](https://git-scm.com/))
- Conta **Google AI Studio** para obter API Key do Gemini ([Acesse aqui](https://makersuite.google.com/app/apikey))
- **PostgreSQL** (para produção) ou use **SQLite** (para dev local)

---

## 🚀 Instalação

### 1️⃣ Clone os Repositórios
```bash
# Clone o backend
git clone https://github.com/seu-usuario/medico-api.git
cd medico-api

# Em outro terminal, clone o frontend
git clone https://github.com/seu-usuario/medico-frontend.git
cd medico-frontend
```

### 2️⃣ Instale as Dependências

**Backend**
```bash
cd medico-api
npm install
```

**Frontend**
```bash
cd medico-frontend
npm install
```

---

## 🔧 Configuração

### Backend (.env)

Crie um arquivo `.env` na raiz de `medico-api`:
```env
# Database
# Para desenvolvimento local com SQLite:
DATABASE_URL="file:./dev.db"

# Para produção com PostgreSQL (exemplo Neon):
# DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Google Gemini API
GEMINI_API_KEY="sua_chave_aqui"

# Server
PORT=3000
NODE_ENV=development
```

### Frontend (Opcional)

Se necessário, crie `.env` em `medico-frontend`:
```env
VITE_API_URL=http://localhost:3000
```

### Configuração do Banco de Dados
```bash
cd medico-api

# Gera o Prisma Client
npx prisma generate

# Aplica as migrações
npx prisma migrate dev --name init

# (Opcional) Abre o Prisma Studio para visualizar dados
npx prisma studio
```

---

## 🎮 Uso

### Iniciar Backend
```bash
cd medico-api
npm run dev
# Servidor rodando em http://localhost:3000
```

### Iniciar Frontend
```bash
cd medico-frontend
npm run dev
# Aplicação rodando em http://localhost:8080
```

### Fluxo de Uso Típico

1. Acesse a aplicação em `http://localhost:8080`

2. **Página de Consulta (/):**
   - Clique em "Iniciar Gravação"
   - Fale sobre a consulta
   - Pare a gravação
   - Aguarde transcrição e análise automática
   - Use o chat para refinar ou solicitar atestado

3. **Teleconsulta:**
   - Clique no botão flutuante de vídeo
   - Copie o link da sala e envie ao paciente
   - Realize a consulta remota

4. **Dashboard (/historico):**
   - Visualize todas as consultas
   - Filtre por prioridade ou busque por texto
   - Exporte relatórios em PDF ou TXT
   - Exclua registros antigos

---

## 📁 Estrutura do Projeto

### Backend (medico-api)
```
medico-api/
├── src/
│   ├── controllers/        # Lógica das rotas
│   ├── db/                 # Configuração do Prisma e Schema
│   ├── middlewares/        # Tratamento de erros
│   ├── routes/             # Definição de endpoints
│   ├── services/           # Integrações (Gemini, etc)
│   └── server.js           # Ponto de entrada
├── package.json
└── README.md
```

### Frontend (medico-frontend) - Refatorado

A estrutura segue padrões de arquitetura modular (Feature-based) e separação de conceitos (SoC).
```
medico-frontend/
├── src/
│   ├── components/
│   │   ├── common/           # Componentes globais (Header, Footer)
│   │   ├── features/         # Componentes de negócio (Consulta, Histórico)
│   │   │   ├── consulta/     # Ex: StepIndicator
│   │   │   └── historico/    # Ex: ConsultaCard
│   │   ├── ui/               # Design System (Shadcn UI)
│   │   └── ...
│   ├── hooks/                # Custom Hooks (ex: useAudioRecorder)
│   ├── layouts/              # Layouts de página (DefaultLayout)
│   ├── pages/                # Orquestração das rotas
│   │   ├── Consulta.tsx
│   │   ├── Historico.tsx
│   │   └── ...
│   ├── services/             # Camada de API e Regras de Negócio (Retry logic)
│   ├── types/                # Definições de Tipos Globais e Interfaces
│   ├── utils/                # Funções puras (ex: gerador PDF)
│   ├── App.tsx               # Configuração de Rotas
│   └── main.tsx              # Entry point
├── public/
├── .env
└── vite.config.ts
```

---

## 🔌 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/consulta/transcrever` | Recebe áudio e retorna transcrição |
| POST | `/api/consulta/analisar` | Analisa transcrição e gera diagnóstico estruturado |
| POST | `/api/consulta/chat` | Chat contextual pós-consulta |
| GET | `/api/consulta/historico` | Lista todos os relatórios |
| DELETE | `/api/consulta/:id` | Deleta um relatório específico |

---

## 🗺️ Roadmap

- [ ] Autenticação de usuários (JWT)
- [ ] Suporte a múltiplos idiomas
- [ ] Integração com prontuários eletrônicos (PEP)
- [ ] Transcrição em tempo real durante gravação (Streaming)
- [ ] Dashboard de analytics médicos
- [ ] Modo offline com sincronização
- [ ] Assinatura digital de documentos

---

## 🤝 Contribuindo

Contribuições são sempre bem-vindas!

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### Diretrizes

- Siga o estilo de código existente
- Adicione testes para novas funcionalidades
- Atualize a documentação conforme necessário
- Use commits semânticos (Conventional Commits)

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

## 👨‍💻 Autor

Desenvolvido com ❤️ por **Gabriel Codes**

### 🔗 Conecte-se comigo

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/gabriel-alexandre-silva/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/GabrielDevelop777)
[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](https://gabrielalexandre.vercel.app/)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:gabrielalexok@gmail.com)

---

## 📞 Suporte

- 📧 Email: seuemail@exemplo.com
- 🐛 Issues: [GitHub Issues](https://github.com/GabrielDevelop777/medico-copilot/issues)
- 💬 Discussões: [GitHub Discussions](https://github.com/GabrielDevelop777/medico-copilot/discussions)

---

**Feito para médicos que querem mais tempo para cuidar de pacientes** 🩺

⭐