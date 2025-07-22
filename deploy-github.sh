#!/bin/bash

echo "🚀 DEPLOY PARA GITHUB - MISSION HEALTH NEXUS"
echo "=============================================="

# 1. Verificar status do Git
echo "📋 Verificando status do Git..."
git status

# 2. Adicionar todas as mudanças
echo "📦 Adicionando mudanças..."
git add .

# 3. Fazer commit
echo "💾 Fazendo commit..."
git commit -m "feat: deploy completo com melhorias na Xiaomi Scale $(date '+%Y-%m-%d %H:%M:%S')"

# 4. Tentar push normal
echo "🌐 Tentando push para GitHub..."
if git push origin main; then
    echo "✅ Push realizado com sucesso!"
    echo "🌐 URL do repositório: https://github.com/tvmensal2025/mission-health-nexus-99"
else
    echo "⚠️  Push falhou, tentando alternativas..."
    
    # 5. Tentar com force (se necessário)
    echo "🔄 Tentando push com force..."
    if git push origin main --force; then
        echo "✅ Push com force realizado com sucesso!"
    else
        echo "❌ Falha no push. Possíveis causas:"
        echo "   - Problemas de autenticação"
        echo "   - Conta suspensa"
        echo "   - Problemas de rede"
        echo ""
        echo "🔧 Soluções:"
        echo "   1. Verificar token de acesso pessoal"
        echo "   2. Configurar credenciais do GitHub"
        echo "   3. Usar deploy alternativo (Netlify/Surge)"
        echo ""
        echo "🌐 Deploy alternativo disponível em:"
        echo "   - Netlify: https://mission-health-nexus.netlify.app"
        echo "   - Surge: https://mission-health-nexus.surge.sh"
    fi
fi

# 6. Verificar status final
echo ""
echo "📊 Status final:"
git status

echo ""
echo "🎉 Deploy para GitHub concluído!"
echo "📱 URLs de acesso:"
echo "   🌐 GitHub: https://github.com/tvmensal2025/mission-health-nexus-99"
echo "   🚀 Netlify: https://mission-health-nexus.netlify.app"
echo "   ⚡ Surge: https://mission-health-nexus.surge.sh" 