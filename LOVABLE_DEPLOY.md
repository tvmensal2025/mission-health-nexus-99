# 🚀 Instruções para Deploy no Lovable.dev

## 📋 Passos para Deploy

### 1. Acesse o Lovable
- URL: https://app.lovable.dev
- Faça login com sua conta

### 2. Importe o Projeto
- Clique em "New Project"
- Selecione "Import from GitHub"
- Repositório: `tvmensal2025/mission-health-nexus-99`
- Branch: `main`

### 3. Configure o Build
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18 ou 20

### 4. Configure as Variáveis de Ambiente
```
# Supabase Configuration (OBRIGATÓRIO)
VITE_SUPABASE_URL=https://hlrkoyywjpckdotimtik.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI

# App Configuration
VITE_APP_NAME=Mission Health Nexus 99
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_DEBUG_MODE=false
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_GPT_ASSISTANT=true
```

### 5. Inicie o Deploy
- Clique em "Deploy"
- Aguarde o processo de build e deploy
- A URL será gerada automaticamente

## 🔍 Verificações Pós-Deploy

Após o deploy, verifique:

1. **Autenticação**: Login e registro funcionando
2. **Sistema de Pesagem**: Entrada e salvamento de dados
3. **Dashboard**: Visualização correta de gráficos e dados
4. **Sistema de Sessões**: Criação e visualização de sessões

## 📝 Notas Importantes

- O repositório já está atualizado no GitHub com todas as alterações necessárias
- O build local foi testado e está funcionando corretamente
- As variáveis de ambiente são essenciais para o funcionamento da aplicação

---

**Data de Preparação**: 23/07/2023
**Status**: ✅ **PRONTO PARA DEPLOY** 