import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import DiceBox from '@3d-dice/dice-box';

export interface DiceBoxRef {
  roll: (notation: string) => Promise<any[]>;
  clear: () => void;
  hide: () => void;
  show: () => void;
}

interface Props {
    locked?: boolean;
}

const DiceBox3D = forwardRef<DiceBoxRef, Props>(({ locked }, ref) => {
  const boxRef = useRef<any>(null);
  const initialized = useRef(false);
  const isRolling = useRef(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (initialized.current) return;

    const initDiceBox = async () => {
      try {
        const box = new DiceBox("#dice-box", {
          assetPath: import.meta.env.BASE_URL + 'assets/dice-box/',
          startingHeight: 20,
          throwForce: 3,
          spinForce: 4,
          lightIntensity: 1,
          scale: 5,
          theme: 'default',
          gravity: 3
        });

        await box.init();
        
        // Forçar resize do canvas para preencher a tela
        const canvas = document.querySelector('#dice-box canvas') as HTMLCanvasElement;
        if (canvas) {
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block'; // Remove extra space below canvas
        }
        boxRef.current = box;
        initialized.current = true;
        console.log('DiceBox initialized successfully');
      } catch (e) {
        console.error('Failed to initialize DiceBox:', e);
      }
    };

    initDiceBox();
  }, []);

  const handleClear = () => {
    if (isRolling.current || locked) return;

    if (boxRef.current) {
      boxRef.current.clear();
    }
    setIsVisible(false);
  };

  useImperativeHandle(ref, () => ({
    roll: async (notation: string) => {
      if (!boxRef.current) return [];
      setIsVisible(true);
      isRolling.current = true;
      boxRef.current.show();
      try {
          const result = await boxRef.current.roll(notation);
          isRolling.current = false;
          return result;
      } catch (e) {
          console.error("Dice roll error", e);
          isRolling.current = false;
          return [];
      }
    },
    clear: handleClear,
    hide: () => {
      if (boxRef.current) {
        boxRef.current.hide();
      }
      setIsVisible(false);
    },
    show: () => {
        if (boxRef.current) {
            boxRef.current.show();
        }
        setIsVisible(true);
    }
  }));

  return (
    <div 
      id="dice-box" 
      onClick={handleClear}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 50,
        pointerEvents: isVisible ? 'all' : 'none',
        cursor: locked ? 'wait' : 'pointer',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)'
      }}
    />
  );
});

DiceBox3D.displayName = 'DiceBox3D';

export default DiceBox3D;
