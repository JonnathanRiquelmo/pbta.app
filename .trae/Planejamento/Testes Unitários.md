# Testes Unitários — pbta.app

## 12. Testes e Validação

### 12.1 Testes Unitários

```typescript
// tests/roller.test.ts
import { describe, it, expect, vi } from 'vitest';
import { rollPBTA } from '../src/utils/pbta';

describe('rollPBTA', () => {
  it('deve retornar uma rolagem válida', () => {
    const result = rollPBTA(2);
    expect(result.dice).toHaveLength(2);
    expect(result.dice[0]).toBeGreaterThanOrEqual(1);
    expect(result.dice[0]).toBeLessThanOrEqual(6);
    expect(result.dice[1]).toBeGreaterThanOrEqual(1);
    expect(result.dice[1]).toBeLessThanOrEqual(6);
    expect(result.total).toBe(result.dice[0] + result.dice[1] + 2);
    expect(['10+', '7-9', '6-']).toContain(result.interpretation);
  });

  it('deve interpretar corretamente 10+', () => {
    const result = rollPBTA(10);
    expect(result.interpretation).toBe('10+');
  });

  it('deve interpretar corretamente 7-9 (determinístico)', () => {
    const spy = vi.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0); // dado 1 => 1
    spy.mockReturnValueOnce(0); // dado 2 => 1
    const result = rollPBTA(5); // 1+1+5 = 7
    expect(result.total).toBe(7);
    expect(result.interpretation).toBe('7-9');
    spy.mockRestore();
  });

  it('deve interpretar corretamente 6- (determinístico)', () => {
    const spy = vi.spyOn(Math, 'random');
    spy.mockReturnValueOnce(0); // 1
    spy.mockReturnValueOnce(0); // 1
    const result = rollPBTA(-5); // 1+1-5 = -3 => 6-
    expect(result.interpretation).toBe('6-');
    spy.mockRestore();
  });
});
```

### 12.2 Testes de Segurança

```typescript
// tests/security.test.ts
import { describe, it, expect } from 'vitest';
import { validateSheetUpdate } from '../src/utils/validators';

describe('Security Validators', () => {
  it('deve impedir atualização de ficha por usuário não proprietário', () => {
    const userId = 'user123';
    const sheet = { ownerId: 'user456' } as any;
    expect(() => validateSheetUpdate(userId, sheet)).toThrow('Unauthorized');
  });

  it('deve permitir atualização para proprietário', () => {
    const userId = 'user123';
    const sheet = { ownerId: 'user123' } as any;
    expect(() => validateSheetUpdate(userId, sheet)).not.toThrow();
  });
});
```

### 12.3 Testes de ACL (Mestre x Jogador)

```typescript
// tests/acl.test.ts
import { describe, it, expect } from 'vitest';
import { isMaster } from '../src/services/auth.service';

describe('ACL Mestre', () => {
  it('reconhece mestre inicial fixo por e-mail', () => {
    const user = { email: 'jonnathan.riquelmo@gmail.com' } as any;
    expect(isMaster(user)).toBe(true);
  });

  it('não reconhece usuário comum como mestre', () => {
    const user = { email: 'player@example.com' } as any;
    expect(isMaster(user)).toBe(false);
  });
});
```