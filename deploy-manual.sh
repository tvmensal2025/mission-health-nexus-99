#!/bin/bash

echo "🚀 Iniciando deploy manual do Mission Health Nexus..."

# Build do projeto
echo "📦 Fazendo build do projeto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro no build. Abortando deploy."
    exit 1
fi

echo ""
echo "🌐 Opções de deploy disponíveis:"
echo ""
echo "1. Vercel (recomendado)"
echo "   - Acesse: https://vercel.com"
echo "   - Faça login com GitHub"
echo "   - Importe o projeto"
echo "   - Configure as variáveis de ambiente"
echo ""
echo "2. Netlify"
echo "   - Acesse: https://netlify.com"
echo "   - Faça login com GitHub"
echo "   - Arraste a pasta 'dist' para o deploy"
echo ""
echo "3. GitHub Pages"
echo "   - Acesse: https://pages.github.com"
echo "   - Configure o repositório"
echo "   - Use a pasta 'dist' como source"
echo ""
echo "4. Surge.sh (rápido)"
echo "   - Execute: npx surge dist"
echo ""
echo "📁 Arquivos prontos para deploy:"
ls -la dist/

echo ""
echo "🔧 Variáveis de ambiente necessárias:"
echo "VITE_SUPABASE_URL=sua_url_do_supabase"
echo "VITE_SUPABASE_ANON_KEY=sua_chave_anonima"

echo ""
echo "🎉 Build concluído! Escolha uma das opções acima para fazer deploy." 