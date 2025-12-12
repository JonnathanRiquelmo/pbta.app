const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "test-key",
  authDomain: "localhost",
  projectId: "pbta-app",
  storageBucket: "pbta-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

async function createTestNpc() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);

  try {
    const userCred = await signInWithEmailAndPassword(auth, 'master.teste@pbta.dev', 'Test1234!');
    const userId = userCred.user.uid;
    console.log('Logged in as', userId);

    // Hardcoded campaign ID from previous step
    const campaignId = 'DWy8PhS7NVbMGlMbSeuc';

    const npcRef = await addDoc(collection(db, 'npcs'), {
      campaignId,
      name: "Goblin de Teste",
      description: "Um goblin verde e chato.",
      attributes: {
        forca: 1,
        agilidade: 2,
        sabedoria: 0,
        intuicao: -1,
        carisma: 0
      },
      moves: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    console.log('NPC created:', npcRef.id);
  } catch (e) {
    console.error(e);
  }
  
  process.exit(0);
}

createTestNpc();
