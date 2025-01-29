# Lógica completa de peeked_card_single

## Problema reportado
La primera carta con `peeked_card_single` no se puede clickear, aunque debería poder clickearse normalmente además de mostrarse automáticamente cada 10 segundos.

## 1. Definición del mecanismo en `src/lib/mechanics.ts`

```typescript
// En MECHANIC_CONFIGS
'peeked_card_single': {
  probability: 1.0,
  description: 'Una carta específica se muestra automáticamente cada 10 segundos'
},

// En applyMechanic
case 'peeked_card_single':
  return {
    ...card,
    mechanic: 'peeked_card_single',
    mechanicData: {
      peekTimer: 0,
      peeked: false,
      peekedUntil: 0
    }
  };

// En updateMechanics
case 'peeked_card_single':
  // Solo UNA carta específica hace peek (la primera carta del tablero)
  const peekIntervalSingle = 10; // 10 segundos entre peeks
  const peekDurationSingle = 2; // 2 segundos visible
  const currentTimeSingle = performance.now() / 1000;
  
  // Inicializar timer si no existe
  if (mechanicData.peekTimer === undefined) {
    mechanicData.peekTimer = 0;
  }
  
  // Acumular timer
  mechanicData.peekTimer = ((mechanicData.peekTimer as number) ?? 0) + dt;
  
  // Si es tiempo de hacer peek (y no está ya en peek)
  if ((mechanicData.peekTimer as number) >= peekIntervalSingle && !mechanicData.peeked) {
    mechanicData.peeked = true;
    mechanicData.peekedUntil = currentTimeSingle + peekDurationSingle;
    mechanicData.peekTimer = 0;
    console.log(`👁️ Peek activado para carta ${card.id} - visible hasta ${mechanicData.peekedUntil}`);
  }
  
  // Si el peek expiró, ocultar
  if (mechanicData.peekedUntil && currentTimeSingle >= mechanicData.peekedUntil) {
    mechanicData.peeked = false;
    mechanicData.peekedUntil = 0;
    console.log(`👁️ Peek expirado para carta ${card.id}`);
  }
  
  // Actualizar la carta (SIEMPRE visible y clickeable, solo cambia isFlipped)
  return {
    ...card,
    isVisible: true, // SIEMPRE visible
    isFlipped: mechanicData.peeked || card.isMatched, // Solo se gira cuando está en peek o acertada
    isClickable: true, // SIEMPRE clickeable
    mechanicData
  };
```

## 2. Aplicación del mecanismo en `src/components/GameScreen.tsx`

```typescript
// En initializeLevel - Aplicar peeked_card_single a la primera carta
if (levelConfig.mechanics && levelConfig.mechanics.includes('peeked_card_single')) {
  console.log(`🎯 Aplicando peeked_card_single a primera carta ${cards[0].id}`);
  cards[0] = applyMechanic(cards[0], 'peeked_card_single');
}

// Filtrar peeked_card_single del loop general de mecánicas
const nonBombMechanics = levelConfig.mechanics?.filter(mechanic => 
  mechanic !== 'bomb' && mechanic !== 'peeked_card_single'
) || [];

// Aplicar mecánicas normales (excluyendo peeked_card_single)
nonBombMechanics.forEach(mechanic => {
  const cardsWithMechanic = applyMechanicToCards(cards, mechanic);
  cards = cardsWithMechanic;
});
```

## 3. Sincronización de estado en `src/components/GameScreen.tsx`

```typescript
// useEffect para sincronizar flippedCards con peeked_card automáticos
useEffect(() => {
  const peekedCards = currentCards.filter(card => 
    (card.mechanic === 'peeked_card' || card.mechanic === 'peeked_card_single') && 
    card.isFlipped && 
    !card.isMatched
  );
  
  const peekedCardIds = peekedCards.map(card => card.id);
  
  // Agregar cartas peeked que no están en flippedCards
  const newFlippedCards = [...flippedCards];
  peekedCardIds.forEach(cardId => {
    if (!newFlippedCards.includes(cardId)) {
      newFlippedCards.push(cardId);
    }
  });
  
  // Remover cartas que ya no están peeked
  const filteredFlippedCards = newFlippedCards.filter(cardId => {
    const card = currentCards.find(c => c.id === cardId);
    return !card || card.isFlipped || card.isMatched;
  });
  
  if (JSON.stringify(filteredFlippedCards) !== JSON.stringify(flippedCards)) {
    setFlippedCards(filteredFlippedCards);
  }
}, [currentCards, flippedCards]);
```

## 4. Lógica de click en `src/components/GameScreen.tsx`

```typescript
const handleCardClick = (cardId: string | number) => {
  // DEBOUNCING: Prevenir clics muy rápidos
  const now = Date.now();
  if (now - lastClickTime < CLICK_DEBOUNCE_TIME) {
    return;
  }
  setLastClickTime(now);
  
  // Para tríos permitir hasta 3 cartas, para pares solo 2
  const maxFlipped = levelConfig.mechanics && levelConfig.mechanics.includes('trio') ? 3 : 2;
  const isTrioLevel = levelConfig.mechanics && levelConfig.mechanics.includes('trio');
  
  // Contar solo cartas volteadas manualmente (no las automáticas de peeked_card)
  const manuallyFlippedCount = flippedCards.filter(cardId => {
    const card = currentCards.find(c => c.id === cardId);
    return card && !['peeked_card', 'peeked_card_single'].includes(card.mechanic || '');
  }).length;
  
  if (isProcessing || isClickProcessing || manuallyFlippedCount >= maxFlipped) {
    return;
  }

  // Iniciar el juego en el primer clic
  if (!hasStarted) {
    setHasStarted(true);
  }

  const card = currentCards.find(c => c.id === cardId);
  
  if (!card || card.isFlipped || card.isMatched) {
    return;
  }

  // Validación adicional: contar cartas volteadas manualmente
  if (manuallyFlippedCount >= maxFlipped) return;

  // Marcar como procesando para evitar clics múltiples
  setIsClickProcessing(true);

  // Función helper para resetear isClickProcessing de forma segura
  const resetClickProcessing = () => {
    setTimeout(() => {
      setIsClickProcessing(false);
    }, 150);
  };

  // Verificar si la carta puede ser volteada según su mecánica
  if (!canFlipCard(card)) {
    addEvent({
      type: 'CARD_MISS',
      data: { cardId, reason: 'mechanic_blocked' },
      timestamp: Date.now(),
    });
    resetClickProcessing();
    return;
  }

  // ... resto de la lógica de flip ...
  
  flipCard(cardId);
  const newFlippedCards = [...flippedCards, cardId];
  setFlippedCards(newFlippedCards);

  // ... resto de la función ...

  // Liberar el estado de procesamiento después de un breve delay
  resetClickProcessing();
};
```

## 5. Botón disabled en el render

```typescript
<button
  key={card.id}
  data-card-id={card.id}
  onClick={() => handleCardClick(card.id)}
  disabled={(() => {
    const manuallyFlippedForButton = flippedCards.filter(cardId => {
      const c = currentCards.find(c => c.id === cardId);
      return c && !['peeked_card', 'peeked_card_single'].includes(c.mechanic || '');
    }).length;
    const maxFlippedForButton = levelConfig.mechanics && levelConfig.mechanics.includes('trio') ? 3 : 2;
    const isDisabled = card.isMatched || (manuallyFlippedForButton >= maxFlippedForButton && !card.isFlipped) || isClickProcessing || isBombExploded;
    
    return isDisabled;
  })()}
  className={`
    card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}
    ${visualEffects}
    ${isBombExploded ? 'opacity-0 scale-0 transition-all duration-300' : ''}
  `}
  style={{
    border: 'none',
    background: 'transparent',
    cursor: (card.isMatched || (flippedCards.filter(cardId => {
      const c = currentCards.find(c => c.id === cardId);
      return c && !['peeked_card', 'peeked_card_single'].includes(c.mechanic || '');
    }).length >= (levelConfig.mechanics && levelConfig.mechanics.includes('trio') ? 3 : 2) && !card.isFlipped) || isClickProcessing || isBombExploded) ? 'default' : 'pointer',
    transform: levelConfig.mechanics?.includes('rotation') && globalRotation[card.id] !== undefined
      ? `rotate(${globalRotation[card.id]}deg)`
      : getMechanicTransform(card)
  }}
>
```

## 6. Configuración del nivel en `src/data/levels.json`

```json
{
  "id": 21,
  "name": "Peek Single",
  "description": "Una carta se muestra automáticamente cada 10 segundos",
  "mechanics": ["peeked_card_single"],
  "pairs": 11,
  "timeLimit": 0
}
```

## 7. Tipo en `src/types/game.ts`

```typescript
export type MechanicName = 
  | 'basic'
  | 'bomb'
  | 'peeked_card'
  | 'peeked_card_single'
  | 'ghost'
  | 'chameleon'
  | 'rotation'
  | 'frozen'
  | 'darkness'
  | 'trio'
  | 'fog'
  | 'combo';
```

## 8. Definición de Card en `src/types/game.ts`

```typescript
export interface Card {
  id: string | number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
  isVisible: boolean;
  isClickable: boolean;
  mechanic?: MechanicName;
  mechanicData?: Record<string, unknown>;
}
```

## 9. Función canFlipCard (referenciada en handleCardClick)

```typescript
const canFlipCard = (card: Card): boolean => {
  // Permitir flip si no tiene mecánica restrictiva
  if (!card.mechanic || card.mechanic === 'basic') {
    return true;
  }
  
  // Para peeked_card y peeked_card_single, siempre permitir click
  if (card.mechanic === 'peeked_card' || card.mechanic === 'peeked_card_single') {
    return true;
  }
  
  // Para otras mecánicas, implementar lógica específica
  switch (card.mechanic) {
    case 'frozen':
      return !card.mechanicData?.isFrozen;
    case 'darkness':
      return !card.mechanicData?.isDark;
    default:
      return true;
  }
};
```

## 10. Función flipCard (referenciada en handleCardClick)

```typescript
const flipCard = (cardId: string | number) => {
  setCurrentCards(prevCards => 
    prevCards.map(card => 
      card.id === cardId 
        ? { ...card, isFlipped: true }
        : card
    )
  );
};
```

## 11. Función updateLoop (donde se actualizan las mecánicas)

```typescript
const updateLoop = useCallback(() => {
  if (!currentCards.length || !levelConfig.mechanics?.length) return;
  
  const now = performance.now();
  const dt = (now - lastUpdateTime) / 1000;
  setLastUpdateTime(now);
  
  const updatedCards = currentCards.map(card => {
    if (card.mechanic && card.mechanicData) {
      return updateMechanics(card, dt);
    }
    return card;
  });
  
  setCurrentCards(updatedCards);
}, [currentCards, lastUpdateTime, levelConfig.mechanics]);
```

## Logs de debug observados

Cuando el usuario intenta clickear la primera carta, se observan estos logs:

```
🖱️ Click en carta card_17_2
🔍 Debug click: isProcessing=false, isClickProcessing=false, manuallyFlippedCount=0, maxFlipped=2
🎯 Carta encontrada: {id: 'card_17_2', isFlipped: false, isMatched: false, mechanic: 'peeked_card_single'}
🚫 Botón disabled para card_17_2: {isMatched: false, manuallyFlippedForButton: 0, maxFlippedForButton: 2, isFlipped: true, isClickProcessing: true, …}
```

## Análisis del problema

El problema parece estar en que:
1. La función `handleCardClick` se ejecuta correctamente
2. Las condiciones iniciales están bien
3. Pero el botón está disabled porque `isClickProcessing: true`

Esto sugiere que `isClickProcessing` se queda en `true` y nunca se resetea a `false`, bloqueando permanentemente la carta.

## Posibles causas

1. **Estado desincronizado**: `isClickProcessing` se queda en `true` y nunca se resetea
2. **Condición de disabled incorrecta**: La lógica del botón disabled puede estar evaluando mal las condiciones
3. **Conflicto entre estado local y global**: Puede haber un conflicto entre `flippedCards` (estado local) y `currentCards` (estado global)
4. **Mecánica no aplicada correctamente**: La carta puede no tener la mecánica `peeked_card_single` aplicada correctamente
5. **Loop de animación**: El `updateLoop` puede estar interfiriendo con el estado de la carta
