# Documentação das Funcionalidades de NPCs - CampaignRoute.tsx

## 📋 Resumo das Funcionalidades Implementadas

### 1. **Interface de Abas para Mestres**
- **Aba "Jogadores"**: Lista jogadores aceitos na campanha
- **Aba "Fichas"**: Interface completa de gerenciamento de NPCs (visível apenas para mestres)

### 2. **Lista de NPCs Existentes**
```tsx
{npcs.length === 0 ? (
  <p>Nenhum NPC criado.</p>
) : (
  <ul>
    {npcs.map(n => (
      <li key={n.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{n.name}</span>
        <span style={{ color: 'var(--muted)' }}>#{n.id}</span>
        <span style={{ marginLeft: 'auto' }}>Movimentos: {n.moves.length}</span>
      </li>
    ))}
  </ul>
)}
```

**Funcionalidades:**
- ✅ Exibe lista vazia com mensagem "Nenhum NPC criado."
- ✅ Lista NPCs com nome, ID e quantidade de movimentos
- ✅ Layout flexbox com alinhamento de itens

### 3. **Formulário de Criação de NPCs**

#### Campos do Formulário:
```tsx
const [draft, setDraft] = useState<CreateNpcSheetInput>({
  name: '',
  background: '',
  attributes: { forca: 0, agilidade: 0, sabedoria: 0, carisma: 0, intuicao: 0 },
  equipment: '',
  notes: ''
})
```

**Campos Implementados:**
- ✅ **Nome** (input text, obrigatório)
- ✅ **Antecedentes** (input text, obrigatório)
- ✅ **Atributos** (5 selects numéricos: -1, 0, 1, 2, 3)
- ✅ **Equipamentos** (input text, opcional)
- ✅ **Notas** (textarea, opcional)

#### Estrutura de Atributos:
```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
  {(['forca','agilidade','sabedoria','carisma','intuicao'] as const).map(k => (
    <div key={k}>
      <label>{k}</label>
      <select value={draft.attributes[k]} onChange={e => {
        const v = Number(e.target.value) as -1 | 0 | 1 | 2 | 3
        setDraft({ ...draft, attributes: { ...draft.attributes, [k]: v } })
      }}>
        {[-1,0,1,2,3].map(v => (<option key={v} value={v}>{v}</option>))}
      </select>
    </div>
  ))}
</div>
```

### 4. **Sistema de Criação em Lote**

#### Estados de Controle:
```tsx
const [batch, setBatch] = useState<CreateNpcSheetInput[]>([])
const [draft, setDraft] = useState<CreateNpcSheetInput>(...)
```

**Funcionalidades:**
- ✅ **Adicionar à lista**: `addDraftToBatch()`
  - Valida campos obrigatórios (nome e background)
  - Adiciona NPC à lista de espera
  - Reseta formulário para novo NPC
- ✅ **Contador de lista**: Mostra "Na lista: {batch.length}"
- ✅ **Criar NPCs**: `submitBatch()`
  - Envia lista completa para criação
  - Limpa lista após sucesso

#### Validações de Negócio:
```tsx
const addDraftToBatch = () => {
  if (!draft.name.trim() || !draft.background.trim()) return
  setBatch(prev => [...prev, draft])
  setDraft({ name: '', background: '', attributes: { forca: 0, agilidade: 0, sabedoria: 0, carisma: 0, intuicao: 0 }, equipment: '', notes: '' })
}
```

### 5. **Integração com Store e API**

#### Hooks do Store Utilizados:
```tsx
const listNpcSheets = useAppStore(s => s.listNpcSheets)
const createNpcSheets = useAppStore(s => s.createNpcSheets)
```

#### Funções de Integração:
- ✅ **Carregamento de NPCs**: `listNpcSheets(id)`
- ✅ **Criação de NPCs**: `createNpcSheets(id, batch)`
- ✅ **Integração com moves**: Automática via store

### 6. **Controle de Acesso por Role**

```tsx
{role === 'master' ? (
  // Interface completa com abas
) : (
  // Apenas lista de jogadores para players
)}
```

**Validações:**
- ✅ **Mestre**: Acesso completo às abas "Jogadores" e "Fichas"
- ✅ **Jogador**: Acesso apenas à lista de jogadores

### 7. **Estados e Hooks Utilizados**

#### Estados do Componente:
```tsx
const [tab, setTab] = useState<'players' | 'sheets'>('players')
const [batch, setBatch] = useState<CreateNpcSheetInput[]>([])
const [draft, setDraft] = useState<CreateNpcSheetInput>(...)
```

#### Estados Derivados (useMemo):
```tsx
const players = useMemo(() => (id ? listPlayers(id) : []), [id, listPlayers])
const npcs = useMemo(() => (id ? listNpcSheets(id) : []), [id, listNpcSheets])
```

#### Hooks do Store:
```tsx
const setCurrentCampaign = useAppStore(s => s.setCurrentCampaign)
const listPlayers = useAppStore(s => s.listPlayers)
const role = useAppStore(s => s.role)
const listNpcSheets = useAppStore(s => s.listNpcSheets)
const createNpcSheets = useAppStore(s => s.createNpcSheets)
```

### 8. **Estilo e Layout**

#### Classes CSS Utilizadas:
- ✅ `card`: Container principal com estilo de card
- ✅ `primary`: Botão principal de ação
- ✅ `var(--muted)`: Cor para textos secundários

#### Estilos Inline:
- ✅ `display: 'flex'` para alinhamento de elementos
- ✅ `display: 'grid'` para formulário de atributos (5 colunas)
- ✅ `gap: 8` para espaçamento consistente
- ✅ `marginLeft: 'auto'` para alinhar contador à direita

## 🎯 **Funcionalidades que Precisam Ser Migradas**

### Essenciais (Obrigatórias):
1. ✅ **Lista de NPCs existentes** com informações básicas
2. ✅ **Formulário de criação** com todos os campos
3. ✅ **Sistema de criação em lote** com validações
4. ✅ **Controle de acesso por role** (apenas mestre)
5. ✅ **Integração com store** para carregamento e criação

### Melhorias Sugeridas para Migração:
1. 🔧 **Validação de soma de atributos** (atualmente feita no backend)
2. 🔧 **Feedback visual de erros/sucesso** (não implementado)
3. 🔧 **Edição de NPCs existentes** (não implementado)
4. 🔧 **Exclusão de NPCs** (não implementado)
5. 🔧 **Estilo consistente** com novo design do `CampaignDetail.tsx`

## 📊 **Resumo da Análise**

| Funcionalidade | Status | Complexidade | Prioridade |
|----------------|--------|--------------|------------|
| Lista de NPCs | ✅ Implementado | Baixa | Alta |
| Formulário de Criação | ✅ Implementado | Média | Alta |
| Criação em Lote | ✅ Implementado | Média | Alta |
| Controle de Acesso | ✅ Implementado | Baixa | Alta |
| Validação Atributos | 🔧 Backend | Média | Média |
| Feedback Visual | ❌ Ausente | Baixa | Média |
| Edição NPCs | ❌ Ausente | Média | Baixa |
| Exclusão NPCs | ❌ Ausente | Baixa | Baixa |

**Conclusão:** A funcionalidade está completa para migração. O sistema de criação em lote com validações básicas está implementado e funcional. A principal melhoria seria adicionar validação de soma de atributos no frontend para feedback imediato ao usuário.