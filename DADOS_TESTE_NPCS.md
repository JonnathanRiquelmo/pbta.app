# Dados de Teste para NPCs

Este arquivo contém exemplos de dados de teste para criação de NPCs/PDMs durante os testes E2E e desenvolvimento.

## Estrutura de Dados

Os NPCs seguem a seguinte estrutura Firestore:

```typescript
interface Npc {
  id: string
  name: string
  background?: string
  attributes: {
    forca: number  // -2 .. 3
    agilidade: number  // -2 .. 3
    sabedoria: number  // -2 .. 3
    carisma: number  // -2 .. 3
    intuicao: number  // -2 .. 3
  }
  campaignId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Regras de Validação

- Soma absoluta dos atributos (|forca| + |agilidade| + |sabedoria| + |carisma| + |intuicao|) deve ser **exatamente 3**
- Cada atributo pode ter valor entre **-2 e 3**
- Apenas o mestre da campanha pode criar/editar/deletar NPCs

## Exemplos de NPCs Válidos

### NPC Básico (Distribuição Equilibrada)
```json
{
  "name": "Guarda da Cidade",
  "background": "Um guarda comum patrulhando as ruas",
  "attributes": {
    "forca": 1,
    "agilidade": 1,
    "sabedoria": 1,
    "carisma": 0,
    "intuicao": 0
  }
}
```

### NPC Físico (Força Forte)
```json
{
  "name": "Mercenário Orc",
  "background": "Guerreiro experiente e brutamontes",
  "attributes": {
    "forca": 3,
    "agilidade": 0,
    "sabedoria": 0,
    "carisma": 0,
    "intuicao": 0
  }
}
```

### NPC Intelectual (Sabedoria/Astúcia)
```json
{
  "name": "Mago Erudito",
  "background": "Estudioso dos arcanos antigos",
  "attributes": {
    "forca": 0,
    "agilidade": 1,
    "sabedoria": 2,
    "carisma": 0,
    "intuicao": 0
  }
}
```

### NPC Espiritual (Intuição/Carisma)
```json
{
  "name": "Sacerdote Sábio",
  "background": "Líder religioso com forte conexão espiritual",
  "attributes": {
    "forca": 0,
    "agilidade": 0,
    "sabedoria": 1,
    "carisma": 1,
    "intuicao": 1
  }
}
```

### NPC Híbrido (Força + Agilidade)
```json
{
  "name": "Ranger Experiente",
  "background": "Explorador das terras selvagens",
  "attributes": {
    "forca": 2,
    "agilidade": 1,
    "sabedoria": 0,
    "carisma": 0,
    "intuicao": 0
  }
}
```

### NPC Híbrido (Sabedoria + Carisma)
```json
{
  "name": "Conselheiro Real",
  "background": "Assessor sábio e influente da corte",
  "attributes": {
    "forca": 0,
    "agilidade": 0,
    "sabedoria": 2,
    "carisma": 1,
    "intuicao": 0
  }
}
```

### NPC Híbrido (Força + Intuição)
```json
{
  "name": "Paladino Devoto",
  "background": "Cavaleiro sagrado com coragem inabalável",
  "attributes": {
    "forca": 1,
    "agilidade": 0,
    "sabedoria": 0,
    "carisma": 0,
    "intuicao": 2
  }
}
```

## Exemplos de NPCs para Testes E2E

### Teste de Criação Válida (usado no teste existente)
```json
{
  "name": "NPC Válido",
  "attributes": {
    "forca": 1,
    "agilidade": 1,
    "sabedoria": 1,
    "carisma": 0,
    "intuicao": 0
  }
}
```

### Teste de Criação em Lote (3 NPCs)
```json
[
  {
    "name": "Aldeão Comum",
    "attributes": { "forca": 1, "agilidade": 1, "sabedoria": 1, "carisma": 0, "intuicao": 0 }
  },
  {
    "name": "Comerciante Astuto",
    "attributes": { "forca": 0, "agilidade": 1, "sabedoria": 1, "carisma": 1, "intuicao": 0 }
  },
  {
    "name": "Capitão da Guarda",
    "attributes": { "forca": 2, "agilidade": 1, "sabedoria": 0, "carisma": 0, "intuicao": 0 }
  }
]
```

## Exemplos de Dados Inválidos (para testes negativos)

### Soma dos Atributos != 3
```json
{
  "name": "NPC Inválido",
  "attributes": {
    "forca": 2,
    "agilidade": 2,
    "sabedoria": -1,
    "carisma": 0,
    "intuicao": 0
  }
}
// Soma absoluta = 5 (inválido)
```

### Atributo fora da faixa
```json
{
  "name": "NPC com Atributo Alto",
  "attributes": {
    "forca": 4,
    "agilidade": 0,
    "sabedoria": -1,
    "carisma": 0,
    "intuicao": 0
  }
}
// forca = 4 (inválido), sabedoria = -1 (válido), soma absoluta != 3
```

### Atributo Acima de 3
```json
{
  "name": "NPC com Atributo Alto",
  "attributes": {
    "body": 4,
    "mind": 0,
    "spirit": -1
  }
}
// body = 4 (inválido), spirit = -1 (inválido)
```

## Uso nos Testes

Estes dados podem ser usados para:

1. **Testes E2E**: Preencher formulários de criação de NPCs
2. **Testes de Integração**: Validar regras de Firestore
3. **Desenvolvimento**: Popular banco de dados local para testes
4. **Documentação**: Exemplos para novos desenvolvedores

## Campos Automáticos

Os seguintes campos são preenchidos automaticamente pelo sistema:
- `id`: Gerado automaticamente pelo Firestore
- `campaignId`: Fornecido pelo contexto da campanha
- `createdAt`: Timestamp de criação
- `updatedAt`: Timestamp de última atualização
