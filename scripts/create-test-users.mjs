/**
 * Script para criar usuários de teste nos emuladores do Firebase
 * Executar após iniciar os emuladores: firebase emulators:start
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, doc, setDoc } from 'firebase/firestore';

// Configuração do Firebase para emuladores
const firebaseConfig = {
  apiKey: "test-key",
  authDomain: "localhost",
  projectId: "pbta-app",
  storageBucket: "pbta-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

async function createTestUsers() {
  try {
    console.log('🚀 Iniciando criação de usuários de teste...');
    
    // Inicializar Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    
    // Conectar aos emuladores
    connectAuthEmulator(auth, 'http://localhost:9099');
    connectFirestoreEmulator(db, 'localhost', 8080);
    
    // Criar usuário Mestre
    console.log('👑 Criando usuário Mestre...');
    const masterCredential = await createUserWithEmailAndPassword(
      auth, 
      'master.teste@pbta.dev', 
      'Test1234!'
    );
    
    // Criar documento do usuário Mestre no Firestore
    await setDoc(doc(db, 'users', masterCredential.user.uid), {
      email: 'master.teste@pbta.dev',
      name: 'Mestre Teste',
      role: 'master',
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Mestre criado:', masterCredential.user.uid);
    
    // Criar usuário Player
    console.log('🎮 Criando usuário Player...');
    const playerCredential = await createUserWithEmailAndPassword(
      auth, 
      'player.teste@pbta.dev', 
      'Test1234!'
    );
    
    // Criar documento do usuário Player no Firestore
    await setDoc(doc(db, 'users', playerCredential.user.uid), {
      email: 'player.teste@pbta.dev',
      name: 'Player Teste',
      role: 'player',
      createdAt: new Date().toISOString()
    });
    
    console.log('✅ Player criado:', playerCredential.user.uid);
    
    console.log('\n🎉 Usuários de teste criados com sucesso!');
    console.log('\n📋 Credenciais:');
    console.log('Mestre: master.teste@pbta.dev / senha: Test1234!');
    console.log('Player: player.teste@pbta.dev / senha: Test1234!');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao criar usuários:', error);
    process.exit(1);
  }
}

// Executar o script
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestUsers();
}