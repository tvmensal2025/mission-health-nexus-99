# Mission Health Nexus 99

Uma plataforma completa de saúde e bem-estar com sistema de missões, cursos e monitoramento de peso.

## 🚀 Tecnologias Utilizadas

- **Frontend**: React + TypeScript + Vite
- **UI**: Tailwind CSS + Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: GitHub Actions + Vercel/Netlify

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase
- Conta no GitHub

## 🔧 Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/tvmensal2025/mission-health-nexus-99.git
cd mission-health-nexus-99
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configuração do Supabase

O projeto já está configurado com o Supabase. As variáveis de ambiente estão definidas em `src/integrations/supabase/client.ts`.

**Configurações atuais:**
- URL: `https://hlrkoyywjpckdotimtik.supabase.co`
- Project ID: `hlrkoyywjpckdotimtik`

### 4. Configuração do GitHub

O repositório já está conectado ao GitHub:
- **URL**: https://github.com/tvmensal2025/mission-health-nexus-99.git

### 5. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://hlrkoyywjpckdotimtik.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI
```

## 🏃‍♂️ Executando o Projeto

### Desenvolvimento

```bash
npm run dev
```

O projeto estará disponível em `http://localhost:5173`

### Build de Produção

```bash
npm run build
```

## 📊 Estrutura do Banco de Dados

O Supabase está configurado com as seguintes tabelas principais:

- **profiles**: Perfis dos usuários
- **weight_measurements**: Medições de peso e composição corporal
- **weighings**: Pesagens básicas
- **courses**: Cursos disponíveis
- **course_modules**: Módulos dos cursos
- **lessons**: Aulas dos módulos
- **missions**: Missões do sistema
- **user_missions**: Missões atribuídas aos usuários
- **assessments**: Avaliações semanais
- **health_diary**: Diário de saúde
- **user_goals**: Metas dos usuários
- **weekly_analyses**: Análises semanais

## 🔗 Integrações

### Supabase
- ✅ Configurado e funcionando
- ✅ Autenticação implementada
- ✅ Banco de dados PostgreSQL
- ✅ Storage para arquivos

### GitHub
- ✅ Repositório conectado
- ✅ Versionamento ativo
- ✅ Branch principal: `main`

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte seu repositório GitHub ao Vercel
2. Configure as variáveis de ambiente no painel do Vercel
3. Deploy automático a cada push para `main`

### Netlify

1. Conecte seu repositório GitHub ao Netlify
2. Configure as variáveis de ambiente
3. Build command: `npm run build`
4. Publish directory: `dist`

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run build:dev` - Gera build de desenvolvimento
- `npm run lint` - Executa o linter
- `npm run preview` - Visualiza o build de produção

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🆘 Suporte

Para suporte, entre em contato através das issues do GitHub ou envie um email para [seu-email@exemplo.com]

---

**Mission Health Nexus 99** - Transformando vidas através da tecnologia e saúde.
