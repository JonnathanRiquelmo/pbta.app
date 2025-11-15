## Objetivo
- Aplicar validações de acesso finas por propriedade e por modo (PLAYER/MASTER) na camada de aplicação, e ocultar/desabilitar ações no UI quando não permitidas.

## Branch
- Criar a branch de trabalho: `feature/fase-19-acl-security` (conforme Gitflow).

## ACL na Camada de Serviço
- Confirmar e manter a validação de propriedade: `validateSheetUpdate` em `src/utils/validators.ts:1-6`.
- Garantir uso consistente em operações de fichas e PDMs:
  - `updateCharacter`, `deleteCharacter`, `duplicateCharacter`, `generatePublicShareId` em `src/services/characters.service.ts:68-86,88-106,108-136,147-167`
  - `updatePdm`, `deletePdm` em `src/services/characters.service.ts:199-217,219-235`
- Padronizar mensagens de erro lançadas para acesso indevido (`Unauthorized`) e não encontrado (`NotFound`).

## Validação por Modo (isMaster)
- Confirmar fonte de modo: `useMode().isMaster` em `src/contexts/ModeContext.tsx:18-35` e proteção de rotas: `src/components/auth/ModeGuard.tsx:4-8`.
- UI já condiciona ações de campanha: `Editar Plot` só para MASTER em `src/components/campaigns/CampaignDetail.tsx:65-67`.
- Expandir a ocultação/desabilitação por modo em áreas UI onde fizer sentido:
  - PDMs: ocultar/condicionar botão "Novo PDM" por `isMaster()` em `src/components/pdms/PdmList.tsx:52-59`.
  - PDM Editor: desabilitar/ocultar a flag "Privado ao Mestre" quando não MASTER em `src/components/pdms/PdmEditor.tsx:121-127`.
  - Repassar navegação para áreas /master já protegidas pelo `ModeGuard`.

## UI por Propriedade (Ownership)
- Manter desabilitação de campos quando usuário não é proprietário:
  - `SheetEditor` em `src/components/sheets/SheetEditor.tsx:116-124,139-142`.
  - `PdmEditor` em `src/components/pdms/PdmEditor.tsx:116-127,142-145`.

## Testes
- Já coberto: `validateSheetUpdate` em `tests/security.test.ts:4-16`.
- Adicionar testes de bypass (localStorage) garantindo que operações de serviço disparem `Unauthorized` quando `currentUid != ownerUid`:
  - Cenários para `updateCharacter`, `deleteCharacter`, `updatePdm` com `VITE_TEST_BYPASS_AUTH = true`.
- Adicionar teste unitário simples para `isMaster(email)` verificando comparação com `VITE_MASTER_EMAIL`.

## Verificação
- Rodar a suíte de testes e garantir que tentativas de acesso indevido são bloqueadas.
- Validar UI manualmente (com servidor dev) verificando que ações aparecem apenas quando permitidas por propriedade e modo.

## Entregáveis
- Branch `feature/fase-19-acl-security` criada.
- Ajustes pontuais no UI (PDMs) condicionando por `isMaster`.
- Testes unitários adicionais cobrindo cenários de acesso indevido em serviços e `isMaster`.

Confirma seguir com a criação da branch e a implementação acima?