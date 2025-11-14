# Configuração Firebase — pbta.app

## 8. Configuração Firebase

### 8.1 Estrutura do Projeto

```
firebase/
├── config.ts
├── auth.ts
├── firestore.ts
├── storage.ts
└── utils/
    ├── converters.ts
    └── validators.ts
```

### 8.2 Configuração Base

```typescript
// firebase/config.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyASn0c5-hsGf3AHKMPBa6TZC-_gxLiRzIk",
  authDomain: "pbta-db.firebaseapp.com",
  projectId: "pbta-db",
  storageBucket: "pbta-db.firebasestorage.app",
  messagingSenderId: "233513855012",
  appId: "1:233513855012:web:ee5383570c520bc48a90b1"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Emuladores (apenas para desenvolvimento local)
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
}
```

### 8.3 Offline Persistence

```typescript
// firebase/firestore.ts
import { enableIndexedDbPersistence } from 'firebase/firestore';
import { db } from './config';

enableIndexedDbPersistence(db).catch((err: any) => {
  if (err.code === 'failed-precondition') {
    console.warn('Múltiplas abas abertas, persistência offline não disponível');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistência offline não suportada neste navegador');
  }
});
```