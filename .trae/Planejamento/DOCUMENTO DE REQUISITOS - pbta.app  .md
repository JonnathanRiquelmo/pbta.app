# 📄 **DOCUMENTO DE REQUISITOS – SISTEMA WEB GENÉRICO PBTA (PLAYER + MASTER MODES) + PWA + FIREBASE + GITHUB ACTIONS**

Você é a IA responsável por projetar e implementar um sistema completo de gerenciamento de campanhas de RPG Powered by the Apocalypse (PBTA), de forma totalmente genérica para qualquer cenário e conjunto de regras PBTA.

Seu papel é de **Engenheiro de Software Sênior**, responsável por arquitetura, implementação, organização e documentação.

---

# 🚀 **OBJETIVO GERAL**

Criar uma plataforma web universal para campanhas PBTA, com:

* Sistema completo de campanhas
* Modo Jogador e Modo Mestre (admin)
* Fichas personalizáveis
* Movimentos PBTA customizáveis
* Editor de plot da campanha
* Editor de sessões e anotações
* Personagens do Mestre (PDMs) privativos
* Compartilhamento público de fichas via link
* PWA (suporte completo offline parcial)
* Firebase (Auth + Firestore)
* Deploy automático via GitHub Actions

---

# 🔥 **REQUISITO 1 – FIREBASE OBRIGATÓRIO**

Use **exclusivamente** este firebaseConfig:

```js
const firebaseConfig = {
  apiKey: "AIzaSyASn0c5-hsGf3AHKMPBa6TZC-_gxLiRzIk",
  authDomain: "pbta-db.firebaseapp.com",
  projectId: "pbta-db",
  storageBucket: "pbta-db.firebasestorage.app",
  messagingSenderId: "233513855012",
  appId: "1:233513855012:web:ee5383570c520bc48a90b1"
};
```

### Situação atual:

* Firestore criado em **modo de produção**
* Login **Google** habilitado
* Domínio do GitHub Pages já autorizado
* App Web cadastrado
* Autenticação **exclusivamente via Google**

---

# 🔥 **REQUISITO 2 – REGRAS DE SEGURANÇA FIRESTORE**

As regras já aplicadas são:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

O sistema deve funcionar **com base nessas regras**, presumindo que todo usuário autenticado pode ler e escrever — o controle fino será feito pela aplicação (ACL interna).

---

# 🔥 **REQUISITO 3 – MODOS DO SISTEMA (JOGADOR X MESTRE)**

O sistema deve ter duas visões:

---

## **1) Visão Jogador**

Apenas o jogador vê:

* Suas fichas pessoais
* A lista das campanhas em que participa
* Moves que lhe foram atribuídos
* Sessões (apenas parte pública)
* Plot da campanha (modo leitura)
* Suas notas pessoais
* Histórico de suas próprias rolagens
* Poder rolar dados
* Poder editar apenas seus personagens

Jogadores **não podem**:

* Editar moves da campanha
* Editar plot geral
* Editar personagens de outros jogadores
* Ver PDMs
* Ver notas privadas do mestre
* Ver rolagens de outros jogadores (exceto se o mestre liberar futuramente)

---

## **2) Visão Mestre (admin)**

### Mestre inicial fixo:

```
jonnathan.riquelmo@gmail.com
```

Somente esse e-mail deve ser reconhecido automaticamente como **admin** da plataforma.

### O mestre poderá futuramente:

* Cadastrar novos mestres
* Remover mestres
* Promover/demover usuários

Esses dados serão armazenados no Firestore na coleção:

```
masters
  - uid
  - email
  - isSuperMaster (true/false)
```

### O Mestre pode:

* Ver e editar **todas as fichas** dos jogadores
* Criar, editar e excluir **PDMs** (personagens de mestre)
* Criar e editar **plot da campanha** (área lida por todos)
* Criar e editar **sessões** com data, anotações e logs
* Ver **todas** as rolagens de **todos os jogadores**
* Criar, editar e excluir moves PBTA
* Convidar jogadores para campanhas
* Criar campanhas
* Configurar regras, atributos e estrutura PBTA da campanha

### O Mestre pode criar:

* Personagens NPC privados
* Personagens NPC compartilháveis via link
* Links públicos de fichas (somente leitura)

---

# 🔥 **REQUISITO 4 – ENTIDADES DO SISTEMA**

### **Campaigns**

* id
* ownerUid (UID do mestre)
* name
* description
* plot (texto longo, markdown opcional)
* creationDate
* ruleSet (define estrutura PBTA da campanha)
* players (lista de UIDs convidados)
* sessions (array ou subcoleção)

### **Characters**

* id
* ownerUid (jogador ou mestre)
* campaignId
* isNPC (bool)
* isPrivateToMaster (bool)
* name
* playbook
* stats (dados dinâmicos)
* moves
* inventory
* bio
* customFields
* publicShareId (se existir, permite link público somente leitura)

### **Moves**

* id
* campaignId
* name
* description
* trigger
* rollFormula
* results (10+, 7–9, 6– etc.)

### **Rolls**

* id
* campaignId
* characterId
* rollerUid
* moveId?
* statUsed
* dice
* total
* timestamp

### **Sessions**

* id
* campaignId
* title or number
* date
* summary
* gmNotes
* publicNotes

### **Notes**

* id
* campaignId
* type: global | character | session
* authorUid
* content
* timestamp

---

# 🔥 **REQUISITO 5 – FUNCIONALIDADES**

### ✔ Login com Google (obrigatório)

* Não existe outro tipo de login
* Após logar, verificar se o usuário é **mestre**

---

### ✔ Dashboard (jogador x mestre)

Ao logar, o app detecta:

```
if user.email === "jonnathan.riquelmo@gmail.com" or user.uid in masters:
    modo = "MASTER"
else:
    modo = "PLAYER"
```

---

### ✔ PDMs (Personagens do Mestre)

* Visíveis apenas ao mestre
* Estrutura igual à dos personagens normais
* Podem ser duplicados/copiar-playbook
* Podem ser compartilhados via link público somente leitura

---

### ✔ Link público de fichas

Gera algo como:

```
pbta.app/#/public/character/<publicShareId>
```

Esse link não exige login e mostra a ficha com design limpo.

---

### ✔ Editor de Plot da Campanha

* Apenas mestre pode editar
* Todos os jogadores podem ler

---

### ✔ Editor de Sessões

Cada sessão contém:

* Data
* Resumo geral (visível a todos)
* Notas privadas do mestre
* Logs de rolagem vinculados

---

### ✔ Editor de Moves PBTA

Baseado em:

* Nome
* Trigger
* Descrição
* Fórmula de rolagem
* Resultados (10+, 7–9, 6-)

---

### ✔ Rolagens automáticas

* 2d6 padrão PBTA
* Possibilidade de aplicar bônus/penalidades
* Histórico salvo no Firestore
* Permitir que o mestre veja tudo
* Jogador vê apenas suas rolagens no perfil

---

# 🔥 **REQUISITO 6 – PWA**

O app deve ter:

### ✔ Mobile-first

* Layout prioritário para smartphones
* Deve funcionar perfeitamente a partir de **375px**

### ✔ Mobile adaptativo

* Layout adaptado para tablets (≥768px)
* Reordenar painéis, dividir colunas quando necessário

### ✔ Touch-friendly

* Botões mínimo **42px**
* Áreas clicáveis amplas
* Gestos de **swipe** para:

  * trocar abas
  * abrir painel lateral
  * navegar entre sessões/fichas

### ✔ Offline-aware

* App deve funcionar parcialmente offline:

  * cache de assets
  * exibir modo offline
  * bloquear ações que dependem do Firestore
  * sincronizar automaticamente ao reconectar

### ✔ Service Worker + Manifest

* icones
* splash screen
* nome curto
* nome completo
* themeColor

---

# 🔥 **REQUISITO 7 – DEPLOY VIA GITHUB ACTIONS**

O repositório é:

```
https://github.com/JonnathanRiquelmo/pbta.app
```

O GitHub Pages está configurado **para deployments via Actions**.

A IA deve gerar:

* workflow `.github/workflows/deploy.yml`
* build com Vite ou equivalente
* push automático para o branch que o Pages usa
* limpeza do cache quando necessário

---

# 🔥 **REQUISITO 8 – ARQUITETURA TÉCNICA**

A IA deve propor uma arquitetura baseada em:

* React + Vite (recomendado)
* Firebase Modular SDK (v9+)
* CSS moderno (Tailwind opcional)
* Services isolados:

  * AuthService
  * CampaignService
  * CharactersService
  * MovesService
  * RollsService
  * SessionsService

---

# 🔥 **REQUISITO 9 – ENTREGÁVEIS**

A IA deve produzir:

### ✔ Estrutura completa do projeto

### ✔ Módulo de autenticação Google funcional

### ✔ Páginas mestre x jogador

### ✔ CRUD de campanhas

### ✔ CRUD de personagens

### ✔ CRUD de PDMs

### ✔ CRUD de moves

### ✔ CRUD de sessões

### ✔ Rolador funcional 2d6 PBTA

### ✔ Links públicos somente leitura

### ✔ Manifest + Service Worker

### ✔ GitHub Actions para deploy

### ✔ Código inicial utilizável

---

# 📌 **INSTRUÇÃO FINAL**

> Com base em todos os requisitos acima, projete a arquitetura do sistema, proponha a organização dos módulos, gere o boilerplate completo do projeto e implemente o núcleo funcional (login Google, criação de campanhas, edição de personagens, movimentações básicas, rolagem PBTA e salvamento no Firestore).
>
> Certifique-se de separar claramente as visões: Jogador e Mestre.
> O mestre inicial é **[jonnathan.riquelmo@gmail.com](mailto:jonnathan.riquelmo@gmail.com)**.
> Gere também o workflow de deploy via GitHub Actions.

---

Se quiser, posso agora:

✅ gerar uma versão **concisa** do documento (prompt curto)
✅ gerar um **quadro Kanban** com todas as tarefas em ordem
✅ criar um **diagrama de arquitetura**
✅ criar um **roadmap em sprints** para a IA seguir

Só pedir!
