# FASE 02 — Configuração Firebase

**Objetivo**
- Integrar Firebase (Auth, Firestore, Storage) com configurações obrigatórias e persistência offline.

**Tarefas**
- Criar `firebase/config.ts`, `firebase/firestore.ts`, `firebase/auth.ts`, `firebase/storage.ts`.
- Usar o `firebaseConfig` obrigatório e habilitar `IndexedDB` persistence.
- Configurar emuladores para desenvolvimento local.

**Referências**
- `Planejamento/Configuração Firebase.md:18-47` (config básica)
- `Planejamento/Configuração Firebase.md:49-63` (persistência offline)
- `Planejamento/DOCUMENTO DE REQUISITOS - pbta.app  .md:31-40` (config obrigatória)
- `Planejamento/DOCUMENTO DE REQUISITOS - pbta.app  .md:56-65` (regras de segurança)
- `Planejamento/Arquitetura do Servidor.md:38-47`

**Critérios de Aceite**
- App inicializa Firebase sem erros.
- Persistência offline habilitada e logs adequados em falha.
- Emuladores acionados apenas em `DEV`.
