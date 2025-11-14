# Estrutura de Componentes React — pbta.app

## 9. Estrutura de Componentes React

### 9.1 Hierarquia de Componentes

```
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Loading.tsx
│   │   ├── Modal.tsx
│   │   └── Tabs.tsx
│   ├── auth/
│   │   ├── GoogleLoginButton.tsx
│   │   └── AuthGuard.tsx
│   ├── dashboard/
│   │   ├── PlayerDashboard.tsx
│   │   └── MasterDashboard.tsx
│   ├── sheets/
│   │   ├── SheetForm.tsx
│   │   ├── SheetList.tsx
│   │   ├── SheetCard.tsx
│   │   ├── SheetEditor.tsx
│   │   └── SheetPublicView.tsx
│   ├── campaigns/
│   │   ├── CampaignList.tsx
│   │   ├── CampaignForm.tsx
│   │   ├── CampaignDetail.tsx
│   │   ├── PlotViewer.tsx
│   │   └── PlotEditor.tsx
│   ├── moves/
│   │   ├── MovesList.tsx
│   │   ├── MovesEditor.tsx
│   │   └── MoveCard.tsx
│   ├── roller/
│   │   ├── DiceRoller.tsx
│   │   ├── RollHistory.tsx
│   │   └── RollResult.tsx
│   ├── sessions/
│   │   ├── SessionEditor.tsx
│   │   ├── SessionList.tsx
│   │   └── SessionViewer.tsx
│   ├── pdms/
│   │   ├── PdmList.tsx
│   │   ├── PdmForm.tsx
│   │   ├── PdmEditor.tsx
│   │   └── PdmPublicView.tsx
│   ├── master/
│   │   ├── RollsMonitor.tsx
│   │   ├── InvitesManager.tsx
│   │   └── MasterSettings.tsx
│   └── public/
│       ├── PublicCharacterView.tsx
│       └── PublicNpcView.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useMode.ts
│   ├── useCampaigns.ts
│   ├── useCharacters.ts
│   ├── useMoves.ts
│   ├── useRolls.ts
│   ├── useSessions.ts
│   ├── useNotes.ts
│   └── useOffline.ts
├── contexts/
│   ├── AuthContext.tsx
│   ├── ModeContext.tsx
│   └── ThemeContext.tsx
├── services/
│   ├── auth.service.ts
│   ├── campaign.service.ts
│   ├── characters.service.ts
│   ├── moves.service.ts
│   ├── rolls.service.ts
│   ├── sessions.service.ts
│   ├── notes.service.ts
│   └── sharing.service.ts
└── utils/
    ├── pbta.ts
    ├── validators.ts
    └── formatters.ts
```

### 9.2 Componente Exemplo: DiceRoller

```typescript
import { useState } from 'react';
import { rollPBTA, saveRoll } from '../../services/rolls.service';
import { useAuth } from '../../hooks/useAuth';

type DiceRoll = {
  id?: string;
  dice: number[];
  total: number;
  interpretation: string;
  rollerUid: string;
  characterId: string;
  moveId?: string;
  createdAt: Date;
};

interface DiceRollerProps {
  campaignId?: string;
  characterId?: string;
  moveId?: string;
  modifier?: number;
  statUsed?: string;
}

export function DiceRoller({
  campaignId,
  characterId,
  moveId,
  modifier = 0,
  statUsed,
}: DiceRollerProps) {
  const { user } = useAuth();
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState<DiceRoll | null>(null);

  const handleRoll = async () => {
    if (!user) return;

    setRolling(true);
    const rollResult = rollPBTA(modifier);

    try {
      const rollId = await saveRoll({
        campaignId: campaignId || '',
        characterId: characterId || '',
        rollerUid: user.uid,
        moveId,
        statUsed,
        dice: rollResult.dice,
        total: rollResult.total,
        timestamp: new Date(),
      });

      setResult({
        id: rollId,
        dice: rollResult.dice,
        total: rollResult.total,
        interpretation: rollResult.interpretation,
        rollerUid: user.uid,
        characterId: characterId || '',
        moveId,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Erro ao salvar rolagem:', error);
    } finally {
      setRolling(false);
    }
  };

  return (
    <div className="dice-roller">
      <div className="dice-display">
        {rolling ? (
          <div className="dice-rolling">🎲</div>
        ) : (
          <div className="dice-result">
            {result && (
              <>
                <span className="dice-values">{result.dice.join(' + ')}</span>
                <span className="total">= {result.total}</span>
                <span className="interpretation">{result.interpretation}</span>
              </>
            )}
          </div>
        )}
      </div>
      <button onClick={handleRoll} disabled={rolling} className="roll-button">
        {rolling ? 'Rolando...' : 'Rolar 2d6'}
      </button>
    </div>
  );
}
```