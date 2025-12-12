const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, connectAuthEmulator } = require('firebase/auth');
const { getFirestore, connectFirestoreEmulator, collection, addDoc, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "test-key",
  authDomain: "localhost",
  projectId: "pbta-app",
  storageBucket: "pbta-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

async function createTestSession() {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);

  try {
    // Login as master
    const userCred = await signInWithEmailAndPassword(auth, 'master.teste@pbta.dev', 'Test1234!');
    const userId = userCred.user.uid;
    console.log('Logged in as', userId);

    // Create Campaign
    const campRef = await addDoc(collection(db, 'campaigns'), {
      name: "Campanha de Teste 3D",
      plot: "Teste de dados",
      ownerId: userId,
      playersUids: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    console.log('Campaign created:', campRef.id);

    // Create Session
    const sessionRef = await addDoc(collection(db, 'sessions'), {
      campaignId: campRef.id,
      name: "Sessão 3D",
      date: "2024-01-01",
      summary: "Teste",
      gmNotes: "",
      createdAt: Date.now(),
      createdBy: userId
    });
    console.log('Session created:', sessionRef.id);
  } catch (e) {
    console.error(e);
  }
  
  process.exit(0);
}

createTestSession();
