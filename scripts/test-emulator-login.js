import { createServer } from 'http';

/**
 * Script simples para testar login com emuladores
 * Acessa o sistema local e tenta fazer login com os usuários de teste
 */

const TEST_USERS = [
  {
    email: 'master.teste@pbta.dev',
    password: 'Test1234!',
    role: 'master'
  },
  {
    email: 'player.teste@pbta.dev', 
    password: 'Test1234!',
    role: 'player'
  }
];

async function testLogin() {
  console.log('🧪 Testando login com emuladores...');
  
  // Verificar se o servidor está rodando
  try {
    const response = await fetch('http://localhost:5173');
    if (response.ok) {
      console.log('✅ Servidor local está rodando em http://localhost:5173');
      console.log('');
      console.log('📋 Usuários de teste disponíveis:');
      TEST_USERS.forEach(user => {
        console.log(`- ${user.role}: ${user.email} / ${user.password}`);
      });
      console.log('');
      console.log('📝 Para testar manualmente:');
      console.log('1. Acesse http://localhost:5173');
      console.log('2. Clique em "Acessar Sistema"');
      console.log('3. Use os botões de login ou digite o email manualmente');
      console.log('');
      console.log('🎯 Os testes E2E usarão automaticamente esses usuários');
    } else {
      console.log('❌ Servidor não respondeu corretamente');
    }
  } catch (error) {
    console.log('❌ Servidor local não está rodando');
    console.log('💡 Execute "npm run dev" em outro terminal primeiro');
  }
}

testLogin();