## Problema
- Toasts “Conexão restaurada” aparecem duplicados e reaparecem ao navegar.
- Causa: `useEffect` em `ToastProvider` dispara em mount e transições; em React 18 `StrictMode` executa efeitos duas vezes em desenvolvimento, causando duplicidades. Também não há deduplicação ou tempo de vida.

## Solução
- Em `ToastProvider`:
  - Emitir toasts apenas em transições de estado (`online` ↔ `offline`), ignorando o primeiro mount quando `online === true`.
  - Deduplicar mensagens: não adicionar se já existir um toast com a mesma mensagem ativo.
  - Auto-ocultar: remover automaticamente após 4s.

## Implementação
- Usar `useRef` para armazenar `lastOnline` e comparar com `online` dentro do `useEffect`.
- Ajustar `push` para:
  - Evitar duplicatas pelo texto.
  - Agendar `setTimeout` para remover pelo `id` em 4s.

## Verificação
- Desconectar/reconectar a rede: um único toast por evento.
- Navegar entre telas: toasts não reaparecem sem evento real.
- Continuidade: `Sem conexão...` aparece apenas ao entrar offline; `Conexão restaurada` apenas quando voltar online.

## Arquivos
- Atualizar: `src/components/common/toast/ToastProvider.tsx`. 