# Plano de Migração - Funcionalidade de NPCs/PDMs

## Objetivo
Migrar a funcionalidade completa de criação e gerenciamento de NPCs/PDMs da arquitetura abandonada (`CampaignRoute.tsx`) para a arquitetura ativa (`CampaignDetail.tsx`).

## Análise da Situação Atual

### Arquitetura Ativa (Usando)
- **Roteador**: `App.tsx`
- **Componente de Campanha**: `CampaignDetail.tsx` (SEM NPCs)
- **Interface**: Moderna com animações, Firestore real-time

### Arquitetura Abandonada (Com NPCs)
- **Roteador**: `routes/index.tsx` (Não utilizado)
- **Componente de Campanha**: `CampaignRoute.tsx` (COM NPCs)
- **Interface**: Simples, sem animações

## Componentes Encontrados

### Funcionalidade de NPCs Implementada (Abandonada)
✅ **CampaignRoute.tsx** - Interface com aba "Fichas" para NPCs
✅ **Sistema de criação em lote** - Formulário completo
✅ **Validação de atributos** - Soma deve ser = 3
✅ **Integração com moves** - NPCs têm todos os movimentos
✅ **Repositórios** - Local e Firestore já implementados

### Componentes Abandonados para Exclusão
❌ `routes/index.tsx` - Sistema de rotas paralelo
❌ `CampaignRoute.tsx` - Componente de campanha antigo
❌ `CharacterRoute.tsx` - Componente de personagem antigo
❌ `SessionRoute.tsx` - Componente de sessão antigo
❌ `DashboardMaster.tsx` - Dashboard mestre antigo
❌ `DashboardPlayer.tsx` - Dashboard jogador antigo

## Plano de Migração Detalhado

### FASE 1: Preparação e Análise (Passos 1-5)

#### Passo 1: Analisar estrutura de dados de NPCs
- [x] Verificar tipos em `src/npc/types.ts`
- [x] Confirmar repositórios em `src/npc/localNpcRepo.ts` e `firestoreNpcRepo.ts`
- [x] Validar integração com store em `src/shared/store/appStore.ts`

#### Passo 2: Documentar funcionalidades existentes
- [x] Criar lista de funcionalidades do `CampaignRoute.tsx`
- [x] Mapear estados e handlers utilizados
- [x] Documentar validações e regras de negócio

#### Passo 3: Analisar CampaignDetail.tsx
- [x] Entender estrutura de abas existente
- [x] Identificar onde adicionar nova aba "Fichas"
- [x] Verificar integração com Firestore real-time

#### Passo 4: Verificar permissões
- [x] Confirmar regras de segurança em `firestore.rules`
- [x] Validar controle de acesso por role
- [x] Testar permissões de mestre vs jogador

#### Passo 5: Preparar ambiente de teste
- [x] Criar campanha de teste (consultar DADOS_TESTE_NPCS.md)
- [x] Verificar se há testes E2E existentes (consultar DADOS_TESTE_NPCS.md)
- [x] Preparar dados de teste para NPCs (consultar DADOS_TESTE_NPCS.md)

### FASE 2: Implementação na Arquitetura Nova (Passos 6-15)

#### Passo 6: Adicionar nova aba no CampaignDetail.tsx
- [x] Adicionar botão "Fichas" na navegação de abas
- [x] Criar estado para controlar aba ativa
- [x] Adicionar condição para mostrar apenas para mestres (consultar ANALISE_PERMISSOES_NPCS.md)

```tsx
// Adicionar em nav.tabs
{isGM && (
  <button className={activeTab === 'npcs' ? 'active' : ''} onClick={() => setActiveTab('npcs')}>Fichas</button>
)}
```

#### Passo 7: Criar estado para NPCs
- [x] Adicionar estado `npcs` no componente
- [x] Adicionar estado `npcsLoading` para controle de carregamento
- [x] Integrar com store para listar NPCs existentes

```tsx
const [npcs, setNpcs] = useState<NpcSheet[]>([])
const [npcsLoading, setNpcsLoading] = useState(true)
```

#### Passo 8: Implementar carregamento de NPCs
- [x] Adicionar useEffect para carregar NPCs quando aba for ativada
- [x] Implementar subscribe para atualizações em tempo real
- [x] Adicionar tratamento de loading e erro
- [x] Usar estrutura de dados de NPCs (consultar DADOS_TESTE_NPCS.md)

```tsx
useEffect(() => {
  if (!id || activeTab !== 'npcs') return
  setNpcsLoading(true)
  const npcsData = listNpcSheets(id)
  setNpcs(npcsData)
  setNpcsLoading(false)
}, [id, activeTab, listNpcSheets])
```

#### Passo 9: Criar interface de lista de NPCs
- [x] Criar componente visual para listar NPCs existentes
- [x] Adicionar estilo consistente com o resto da interface
- [x] Implementar ação para editar NPC existente

```tsx
{npcs.length === 0 ? (
  <p className="text-muted">Nenhum NPC criado.</p>
) : (
  <ul className="npc-list">
    {npcs.map(npc => (
      <li key={npc.id} className="npc-item">
        <span className="npc-name">{npc.name}</span>
        <span className="npc-background">{npc.background}</span>
        <button onClick={() => handleEditNpc(npc.id)} className="btn btn-sm">Editar</button>
      </li>
    ))}
  </ul>
)}
```

#### Passo 10: Implementar formulário de criação
- [x] Criar estado para formulário de NPC
- [x] Adicionar campos: nome, background, atributos
- [x] Implementar validação de soma de atributos
- [x] Adicionar campos opcionais: equipamentos, notas

```tsx
const [npcForm, setNpcForm] = useState<CreateNpcSheetInput>({
  name: '',
  background: '',
  attributes: { forca: 0, agilidade: 0, sabedoria: 0, carisma: 0, intuicao: 0 },
  equipment: '',
  notes: ''
})
```

#### Passo 11: Adicionar validações
- [x] Implementar cálculo de soma de atributos (consultar DADOS_TESTE_NPCS.md)
- [x] Bloquear submit se soma não for = 3
- [x] Adicionar validação de campos obrigatórios
- [x] Mostrar mensagens de erro amigáveis

```tsx
const currentSum = Math.abs(npcForm.attributes.forca) + 
  Math.abs(npcForm.attributes.agilidade) + 
  Math.abs(npcForm.attributes.sabedoria) + 
  Math.abs(npcForm.attributes.carisma) + 
  Math.abs(npcForm.attributes.intuicao)
const remaining = 3 - currentSum
const canSubmit = npcForm.name.trim() && npcForm.background.trim() && remaining === 0
```

#### Passo 12: Implementar criação em lote
- [x] Adicionar estado para lista de NPCs pendentes
- [x] Implementar função para adicionar NPC à lista
- [x] Criar interface para mostrar lista pendente
- [x] Implementar criação em lote ao finalizar

```tsx
const [npcBatch, setNpcBatch] = useState<CreateNpcSheetInput[]>([])

const addToBatch = () => {
  if (!canSubmit) return
  setNpcBatch(prev => [...prev, npcForm])
  resetForm()
}
```

#### Passo 13: Integrar com store e Firestore
- [x] Usar `createNpcSheets` do store para criar NPCs (consultar ANALISE_PERMISSOES_NPCS.md)
- [x] Implementar tratamento de erros da API
- [x] Adicionar feedback de sucesso/erro
- [x] Limpar formulário após criação bem-sucedida

As funções `handleCreateNpc` e `handleBatchCreate` agora usam a função `createNpcSheets` do store para criar NPCs no Firestore. Implementei:

1. **Tratamento de erros da API**: Função `getErrorMessage` que traduz códigos de erro em mensagens amigáveis
2. **Feedback visual**: Mensagens de sucesso (verde) e erro (vermelho) com ícones e estilos consistentes
3. **Limpeza automática**: Mensagens de sucesso desaparecem após 3 segundos
4. **Integração com store**: Uso correto da função `createNpcSheets` com validações de segurança

```tsx
const handleCreateNpc = (npcData: CreateNpcSheetInput) => {
  if (!id || !user) return
  
  setNpcSuccess(null)
  setNpcsError(null)
  
  const result = createNpcSheets(id, [npcData])
  if (result.ok) {
    setShowNpcForm(false)
    setNpcSuccess('NPC criado com sucesso!')
    setTimeout(() => setNpcSuccess(null), 3000)
  } else {
    const errorMessage = getErrorMessage(result.message)
    setNpcsError(errorMessage)
  }
}
```

#### Passo 14: Adicionar navegação para edição
- [x] Implementar rota para edição individual de NPC
- [x] Navegar para `/campaigns/:id/npcs/:npcId`
- [x] Reutilizar formulário para edição
- [x] Implementar update com `updateNpcSheet`

Foi criado o componente `NpcEdit.tsx` que reutiliza o formulário existente `NpcForm` para edição. A implementação inclui:

1. **Rota protegida**: `/campaigns/:id/npcs/:npcId` adicionada no `App.tsx`
2. **Componente NpcEdit**: Novo componente que carrega o NPC existente e permite edição
3. **Reutilização do formulário**: O `NpcForm` foi modificado para aceitar `initialData` como prop
4. **Integração com store**: Usa a função `updateNpcSheet` já existente no appStore
5. **Validações e feedback**: Mantém as mesmas validações do formulário de criação
6. **Navegação**: Botão "Editar" já existente na lista de NPCs redireciona para a página de edição

O fluxo completo permite que o mestre clique em "Editar" na lista de NPCs, seja redirecionado para uma página dedicada de edição, faça as alterações necessárias e salve com feedback visual de sucesso/erro.

#### Passo 15: Testar integração completa
- [x] Testar criação de NPC individual
- [x] Testar criação em lote
- [x] Testar validações
- [x] Testar edição de NPC existente
- [x] Testar exclusão (implementada e testada)

**Resultados dos Testes:**
- ✅ Build executado com sucesso (sem erros de compilação)
- ✅ Todas as funcionalidades de NPC implementadas e integradas
- ✅ Funcionalidade de exclusão foi implementada (faltava no sistema original)
- ✅ Validações funcionando corretamente (soma de atributos = 3)
- ✅ Integração com Firestore completa (sem localStorage)
- ✅ Permissões funcionando (apenas mestres podem criar/editar/excluir)
- ✅ Feedback visual implementado (mensagens de sucesso/erro)

**Implementação de Exclusão:**
Foi necessário implementar a funcionalidade de exclusão que estava faltando no sistema:
1. Adicionado método `delete` na interface `NpcRepo`
2. Implementada função `delete` no `firestoreNpcRepo.ts` usando `deleteDoc` do Firestore
3. Adicionada função `deleteNpcSheet` no appStore com validações de permissão
4. Interface atualizada com botão "Excluir" e confirmação via `confirm()`
5. Feedback visual de sucesso/erro implementado

### FASE 3: Testes e Validação (Passos 16-18)

#### Passo 16: Atualizar testes E2E existentes
- [x] Verificar teste `tests/e2e/npcs-create-validate.spec.ts`
- [x] Adaptar selectors para nova interface
- [x] Garantir que testes continuam passando
- [x] Usar dados de teste de NPCs (consultar DADOS_TESTE_NPCS.md)

#### Passo 17: Adicionar novos testes se necessário
- [x] Testar interface de edição individual
- [x] Testar criação em lote
- [x] Testar validações de formulário

**Testes criados:**
- `tests/e2e/npcs-edit-interface.spec.ts` - Testa navegação e elementos da interface de edição individual
- `tests/e2e/npcs-batch-creation.spec.ts` - Testa fluxo completo de criação em lote com diversos cenários
- `tests/e2e/npcs-form-validations.spec.ts` - Testa validações de formulário incluindo somas, campos obrigatórios e valores negativos

**Arquivos auxiliares de debug criados:**
- `tests/e2e/debug-npc-edit-3.spec.ts` - Debug da estrutura UI da página de edição
- `tests/e2e/debug-npc-edit-4.spec.ts` - Debug do formulário de criação/edição de NPCs
- `tests/e2e/debug-npc-edit-5.spec.ts` - Debug do carregamento de dados do NPC
- `tests/e2e/debug-npc-edit-6.spec.ts` - Debug de navegação entre lista e edição
- `tests/e2e/debug-npc-edit-7.spec.ts` - Debug de persistência no Firestore
- `tests/e2e/debug-npc-edit-8.spec.ts` - Debug de redirecionamento após edição
- `tests/e2e/debug-npc-edit-9.spec.ts` - Debug de renderização condicional do componente

*Nota: Os arquivos de debug podem ser úteis para troubleshooting em passos futuros ou para entender melhor o comportamento dos componentes.*

#### Passo 18: Testar integração com sistema de rolagens
- [x] Verificar se NPCs aparecem no DiceRoller
- [x] Testar rolagens para NPCs
- [x] Validar que NPCs têm acesso a todos os movimentos

*Nota: Teste implementado em `tests/e2e/passo-18-integracao-diceroller-npcs-final.spec.ts`. O teste cria uma campanha, NPC e sessão do zero, verificando a integração completa com o DiceRoller. Arquivos de debug criados: `debug-create-campaign-estrutura.spec.ts` (investiga estrutura da interface de criação de campanha).*

### FASE 4: Limpeza e Finalização (Passos 19-21)

#### Passo 19: Remover código duplicado
- [x] Limpar referências aos componentes antigos
- [x] Remover imports não utilizados
- [x] Consolidar lógica no lugar correto

#### Passo 20: Documentar mudanças
- [x] Atualizar README se necessário (não necessário - criado changelog)
- [x] Documentar nova funcionalidade (já documentada em DOCUMENTACAO_NPCS_FUNCIONALIDADES.md)
- [x] Criar changelog das alterações (criado CHANGELOG_MIGRACAO_NPCS.md)

#### Passo 21: Excluir componentes abandonados
- [x] Remover `routes/index.tsx`
- [x] Remover `CampaignRoute.tsx`
- [x] Remover `CharacterRoute.tsx`
- [x] Remover `SessionRoute.tsx`
- [x] Remover `DashboardMaster.tsx`
- [x] Remover `DashboardPlayer.tsx`

## Arquivos a Serem Excluídos no Final

```
src/routes/index.tsx
src/campaigns/Route.tsx
src/characters/Route.tsx
src/sessions/Route.tsx
src/shared/pages/DashboardMaster.tsx
src/shared/pages/DashboardPlayer.tsx
```

## 📚 Documentação Auxiliar

- **CHANGELOG_MIGRACAO_NPCS.md** - Changelog completo da FASE 4 com detalhes de todas as mudanças
- **DOCUMENTACAO_NPCS_FUNCIONALIDADES.md** - Documentação das funcionalidades de NPCs
- **TESTES_E2E_MAPEAMENTO.md** - Mapeamento dos testes E2E
- **DADOS_TESTE_NPCS.md** - Dados de teste para NPCs
- **ANALISE_PERMISSOES_NPCS.md** - Análise de permissões para NPCs

## Considerações Finais

### Pontos de Atenção
1. **Manter consistência visual**: Usar mesmas classes CSS e padrões
2. **Preservar funcionalidade**: Todas as features do antigo devem existir no novo
3. **Manter validações**: Soma de atributos = 3, campos obrigatórios
4. **Integração com Firestore**: Usar subscriptions em tempo real
5. **Testes E2E**: Manter testes existentes funcionando

### Funcionalidades a Preservar
- ✅ Criação individual de NPCs
- ✅ Criação em lote de NPCs
- ✅ Validação de soma de atributos (= 3)
- ✅ Campos: nome, background, atributos, equipamentos, notas
- ✅ Integração com sistema de moves (todos os moves disponíveis)
- ✅ Integração com sistema de rolagens
- ✅ Acesso apenas para mestres

### Resultado Esperado
Após a migração, o mestre verá:
1. Aba "Fichas" na interface moderna `CampaignDetail.tsx`
2. Lista de NPCs existentes
3. Formulário para criar novos NPCs (individual ou em lote)
4. Validações em tempo real
5. Integração completa com o sistema de rolagens

O sistema ficará mais limpo, moderno e manutenível, com todas as funcionalidades preservadas.
