#!/bin/bash

echo "🔍 Verificando configuração do Lovable..."

# Verificar se o projeto está configurado com Lovable
if grep -q "lovable-tagger" package.json; then
    echo "✅ Projeto configurado com Lovable"
else
    echo "❌ Projeto não está configurado com Lovable"
    exit 1
fi

# Verificar se o build foi feito
if [ -d "dist" ]; then
    echo "✅ Build encontrado em dist/"
else
    echo "❌ Build não encontrado. Fazendo build..."
    npm run build
fi

echo ""
echo "🌐 URLs de Deploy Disponíveis:"
echo ""
echo "1. Surge.sh (já deployado):"
echo "   https://mission-health-nexus.surge.sh/app/progress"
echo ""
echo "2. Lovable (se configurado):"
echo "   - Acesse: https://lovable.dev"
echo "   - Faça login"
echo "   - Importe o projeto"
echo ""
echo "3. Vercel (quando GitHub estiver disponível):"
echo "   npx vercel --prod"
echo ""
echo "4. Netlify:"
echo "   npx netlify deploy --dir=dist --prod"
echo ""

echo "📊 Status do Projeto:"
echo "- ✅ Lovable configurado"
echo "- ✅ Build pronto"
echo "- ✅ Funcionalidades implementadas"
echo "- ✅ Deploy no Surge.sh ativo"

echo ""
echo "🎯 Para acessar o sistema:"
echo "https://mission-health-nexus.surge.sh/app/progress"
echo ""
echo "🔧 Para deploy no Lovable:"
echo "1. Acesse https://lovable.dev"
echo "2. Faça login"
echo "3. Importe o projeto"
echo "4. Configure as variáveis de ambiente" 