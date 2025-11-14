Modo: SOLO Coder (Plan mode ativado)

Objetivo
- Executar a FASE 02 — Configuração Firebase: integrar Auth, Firestore e Storage (SDK v9) com persistência offline e emuladores em DEV.

Contexto
- Planejamento: c:\Users\jonna\Documents\pbta.app\Planejamento
- Fase: Planejamento/Fase de Implementação/FASE 02.md
- Referências: Configuração Firebase.md; Documento de Requisitos; Arquitetura do Servidor.md
- Não usar SOLO Builder

Gitflow
- Criar branch: `feature/fase-02-firebase`
- Commits semânticos
- Validação local: `npm run lint`, `npm run test:ci`, `npm run build`
- PR para `main` com checklist dos critérios de aceite e links às referências
- Merge: “Squash and merge”; deletar a branch

Tarefas Obrigatórias
- Criar `firebase/config.ts`, `firebase/auth.ts`, `firebase/firestore.ts`, `firebase/storage.ts`
- Usar obrigatoriamente o `firebaseConfig` especificado nos documentos
- Habilitar persistência offline (IndexedDB) e tratar falhas
- Configurar emuladores para desenvolvimento local (apenas `DEV`)

Critérios de Aceite
- App inicializa Firebase sem erros
- Persistência offline habilitada e com fallback/logs adequados
- Emuladores acionados apenas em ambiente de desenvolvimento

Saídas Esperadas
- Branch e PR com checklist e diffs dos arquivos `firebase/*`
- Instruções no PR para executar localmente e validar offline

Restrições
- Não expor segredos além do `firebaseConfig` fixo
- Respeitar regras de segurança e boas práticas

Avanço
- Preparar plano da FASE 03 (sem executar)