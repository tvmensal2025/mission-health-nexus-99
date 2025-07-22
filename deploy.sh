#!/bin/bash

echo "🚀 Iniciando deploy do Mission Health Nexus..."

# Build do projeto
echo "📦 Fazendo build do projeto..."
npm run build

# Verificar se o build foi bem sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
else
    echo "❌ Erro no build. Abortando deploy."
    exit 1
fi

# Deploy para Vercel
echo "🌐 Fazendo deploy para Vercel..."
npx vercel --prod --yes

echo "🎉 Deploy concluído!"
echo "📱 Acesse: https://mission-health-nexus-99.vercel.app" 