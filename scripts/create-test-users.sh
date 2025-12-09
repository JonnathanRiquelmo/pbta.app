#!/bin/bash

# Script para criar usuários de teste usando Firebase CLI
# Executar após iniciar os emuladores: firebase emulators:start

echo "🚀 Criando usuários de teste nos emuladores..."

# Criar usuário Mestre
echo "👑 Criando usuário Mestre..."
firebase auth:import --project=pbta-app --emulator users-master.json

# Criar usuário Player  
echo "🎮 Criando usuário Player..."
firebase auth:import --project=pbta-app --emulator users-player.json

echo "✅ Usuários criados com sucesso!"
echo ""
echo "📋 Credenciais para os testes:"
echo "Mestre: master.teste@pbta.dev / senha: Test1234!"
echo "Player: player.teste@pbta.dev / senha: Test1234!"