# Firebase Emulator Setup

## Como usar os Emuladores do Firebase

### 1. Configuração das Variáveis de Ambiente

No arquivo `.env`, você tem duas opções:

```bash
# Para usar os emuladores locais (desenvolvimento sem gastar quota)
VITE_USE_EMULATORS=true

# Para usar o Firebase de produção (padrão)
VITE_USE_EMULATORS=
```

### 2. Iniciar os Emuladores

Em um terminal separado, execute:
```bash
firebase emulators:start
```

### 3. Iniciar o Servidor de Desenvolvimento

Em outro terminal, execute:
```bash
npm run dev
```

### 4. Portas dos Emuladores

- **Firestore**: localhost:8080
- **Authentication**: localhost:9099
- **Functions**: localhost:5001

### Importante

- **Desenvolvimento local**: Use `VITE_USE_EMULATORS=true` para não gastar quota do Firebase
- **Produção/Nuvem**: O sistema automaticamente usa o Firebase de produção (sem emuladores)
- O código de emuladores **não é incluído** no build de produção

### Comandos Úteis

```bash
# Parar todos os emuladores
firebase emulators:stop

# Ver status dos emuladores
firebase emulators:status

# Limpar dados dos emuladores
firebase emulators:clear
```