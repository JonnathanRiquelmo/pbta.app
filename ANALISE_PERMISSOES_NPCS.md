# Análise de Permissões - Funcionalidade de NPCs

## Visão Geral
Análise detalhada das permissões de segurança para a funcionalidade de NPCs/PDMs no sistema.

## 1. Regras de Segurança no Firestore (firestore.rules)

### **Coleção `/npcs/{npcId}`**
```javascript
match /npcs/{npcId} {
  allow read: if isAuthed() && (isOwner(resource.data.campaignId) || isPlayer(resource.data.campaignId));
  allow create, update, delete: if isAuthed()
    && isOwner(request.resource.data.campaignId)
    && validAttrs(request.resource.data.attributes);
}
```

**Permissões:**
- **Leitura**: ✅ Mestre e jogadores podem ler NPCs
- **Criação**: ✅ Apenas mestre (owner da campanha)
- **Atualização**: ✅ Apenas mestre (owner da campanha)
- **Exclusão**: ✅ Apenas mestre (owner da campanha)
- **Validação**: ✅ Atributos devem somar 3

### **Funções Auxiliares**
```javascript
function isOwner(campaignId) {
  return isAuthed() && campaignDoc(campaignId).data.ownerId == request.auth.uid;
}

function isPlayer(campaignId) {
  return isAuthed()
    && (campaignDoc(campaignId).data.playersUids is list)
    && (request.auth.uid in campaignDoc(campaignId).data.playersUids);
}

function validAttrs(attrs) {
  return intInRange(attrs.forca, -1, 3)
    && intInRange(attrs.agilidade, -1, 3)
    && intInRange(attrs.sabedoria, -1, 3)
    && intInRange(attrs.carisma, -1, 3)
    && intInRange(attrs.intuicao, -1, 3)
    && (attrs.forca + attrs.agilidade + attrs.sabedoria + attrs.carisma + attrs.intuicao == 3);
}
```

## 2. Validação por Role no Frontend

### **Sistema de Roles**
```typescript
// src/auth/useAuth.ts:43
role: email === 'jonnathan.riquelmo@gmail.com' ? 'master' : 'player',

// Atribuição baseada em email hardcoded
- Mestre: jonnathan.riquelmo@gmail.com
- Jogador: qualquer outro email
```

### **Verificações no Store (appStore.ts)**
```typescript
// Todos os métodos de NPC verificam role === 'master'
listNpcSheets: (campaignId) => npcRepo.listByCampaign(campaignId),
createNpcSheets: (campaignId, inputs) => {
  if (get().role !== 'master') return { ok: false, message: 'forbidden' }
  // ...
},
updateNpcSheet: (campaignId, id, patch) => {
  if (get().role !== 'master') return { ok: false, message: 'forbidden' }
  // ...
}
```

## 3. Verificações de Permissão por Role

### **Mestre (role === 'master')**
✅ **Pode fazer tudo:**
- Ler lista de NPCs
- Criar NPCs individuais
- Criar NPCs em lote
- Atualizar NPCs existentes
- Acessar aba "Fichas" (quando implementada)

### **Jogador (role === 'player')**
✅ **Pode apenas:**
- Ler NPCs existentes (visualizar)
- ❌ Não pode criar/editar/excluir NPCs
- ❌ Não pode acessar aba "Fichas" (interface)

## 4. Verificações de Campanha

### **Dupla Verificação de Segurança**
```typescript
// CampaignDetail.tsx:48
const isGM = user?.role === 'master' && campaign.ownerId === user.uid;
```

**Requisitos para ser Mestre de uma campanha:**
1. Ter role === 'master' 
2. Ser ownerId da campanha (campaign.ownerId === user.uid)

## 5. Comparação: Mestre vs Jogador

| Ação | Mestre | Jogador | Backend Check | Frontend Check |
|------|--------|---------|---------------|----------------|
| Ler NPCs | ✅ | ✅ | `isOwner \|\| isPlayer` | Nenhuma |
| Criar NPC | ✅ | ❌ | `isOwner` | `role === 'master'` |
| Editar NPC | ✅ | ❌ | `isOwner` | `role === 'master'` |
| Excluir NPC | ✅ | ❌ | `isOwner` | `role === 'master'` |
| Ver aba "Fichas" | ✅ | ❌ | N/A | `isGM` (role + owner) |

## 6. Pontos de Atenção Identificados

### ✅ **Seguro**
- Backend valida ownerId independentemente do role
- Frontend tem dupla verificação (role + owner)
- Firestore rules impedem acesso não autorizado

### ⚠️ **Considerações**
- Role é determinado por email hardcoded (jonnathan.riquelmo@gmail.com)
- Não há sistema de roles dinâmicos ou gerenciamento de permissões
- Todos os testes de permissão devem usar este email específico

## 7. Recomendações para Migração

### **Preservar Segurança**
1. Manter dupla verificação `isGM` no frontend
2. Manter validações `role === 'master'` no store
3. Garantir que Firestore rules continuem protegendo

### **Implementação**
```typescript
// Aba "Fichas" apenas para mestres
{isGM && (
  <button className={activeTab === 'npcs' ? 'active' : ''} onClick={() => setActiveTab('npcs')}>Fichas</button>
)}

// Formulário de criação apenas para mestres
{isGM && (
  <div className="npc-form">
    {/* Formulário de NPC */}
  </div>
)}
```

## 8. Conclusão

O sistema de permissões está **bem implementado** com:
- ✅ Validações no backend (Firestore rules)
- ✅ Validações no frontend (role checks)
- ✅ Dupla verificação de ownership
- ✅ Separação clara entre mestre e jogador

A migração pode prosseguir mantendo as mesmas validações de segurança existentes.