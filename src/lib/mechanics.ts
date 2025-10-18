import { Card, MechanicName, FrozenMechanicState } from '@/types/game';

// Configuración de mecánicas
export const MECHANIC_CONFIGS = {
  basic: {
    name: 'Básico',
    description: 'Mecánica básica de volteo de cartas',
    difficulty: 'easy' as const,
    phaseRequired: 1,
    probability: 1.0,
  },
  fog: {
    name: 'Niebla',
    description: 'Algunas cartas están ocultas por la niebla',
    difficulty: 'medium' as const,
    phaseRequired: 2,
    probability: 0.3,
  },
  bomb: {
    name: 'Bomba',
    description: 'Cartas que explotan si no se encuentran a tiempo',
    difficulty: 'hard' as const,
    phaseRequired: 3,
    probability: 0.03, // Muy reducido: solo 3% de probabilidad
  },
  ghost: {
    name: 'Fantasma',
    description: 'Cartas que aparecen y desaparecen',
    difficulty: 'medium' as const,
    phaseRequired: 2,
    probability: 0.25,
  },
  chameleon: {
    name: 'Camaleón',
    description: 'Cartas que cambian de valor',
    difficulty: 'hard' as const,
    phaseRequired: 4,
    probability: 0.15,
  },
  rotation: {
    name: 'Rotación',
    description: 'El tablero rota periódicamente',
    difficulty: 'hard' as const,
    phaseRequired: 6,
    probability: 0.15,
  },
  peeked_card: {
    name: 'Carta Vistazo',
    description: 'Una carta se muestra brevemente',
    difficulty: 'easy' as const,
    phaseRequired: 3,
    probability: 0.4,
  },
  combo: {
    name: 'Combo',
    description: 'Bonificaciones por secuencias',
    difficulty: 'hard' as const,
    phaseRequired: 7,
    probability: 0.1,
  },
  frozen: {
    name: 'Congelado',
    description: 'Cartas que se congelan temporalmente',
    difficulty: 'medium' as const,
    phaseRequired: 4,
    probability: 0.25,
  },
  darkness: {
    name: 'Oscuridad',
    description: 'Toda la pantalla se oscurece',
    difficulty: 'hard' as const,
    phaseRequired: 8,
    probability: 0.05,
  },
  trio: {
    name: 'Trío',
    description: 'Necesitas hacer tríos de 3 cartas iguales',
    difficulty: 'medium' as const,
    phaseRequired: 3,
    probability: 0.2,
  },
};

// Aplicar mecánica a una carta
export function applyMechanic(card: Card, mechanic: MechanicName): Card {
  const config = MECHANIC_CONFIGS[mechanic];
  if (!config) return card;

  switch (mechanic) {
    case 'fog':
      return {
        ...card,
        mechanic,
        isVisible: true, // Siempre visible
        mechanicData: {
          fogLevel: Math.random() * 0.8 + 0.2, // 0.2 a 1.0
          revealed: true, // Siempre revelada
        },
      };

    case 'ghost':
      return {
        ...card,
        mechanic,
        mechanicData: {
          isGhost: true,
          isVisible: true,
          visibilityTimer: 0,
          visibilityDuration: Math.random() * 2 + 1, // 1-3 segundos
        },
      };

    case 'chameleon':
      return {
        ...card,
        mechanic,
        mechanicData: {
          colorTimer: Math.random() * 2000 + 1000, // 1-3 segundos
          currentColor: 'normal', // normal, green, red, blue, yellow
          lastChange: Date.now(),
        },
      };


    case 'frozen':
      return {
        ...card,
        mechanic,
        mechanicData: {
          isFrozen: false, // Empezar sin congelar
          freezeTimer: 0,
          lastFreezeTime: 0, // Para controlar el intervalo
        },
      };

    case 'bomb':
      return {
        ...card,
        mechanic,
        mechanicData: {
          isBomb: true,
          bombLevel: 0, // 0=amarillo, 1=naranja, 2=rojo, 3=explota
          isExploded: false,
          explosionDuration: 1.5, // 1.5 segundos desaparecidas
          explosionTimer: 0,
        },
      };

    case 'peeked_card':
      return {
        ...card,
        mechanic,
        mechanicData: {
          isPeeked: false,
          peekTimer: Math.random() * 2000 + 1000, // 1-3 segundos
          lastPeek: 0,
        },
      };


    case 'combo':
      return {
        ...card,
        mechanic,
        mechanicData: {
          comboMultiplier: 1,
          comboChain: 0,
          lastCombo: 0,
        },
      };

    case 'darkness':
      return {
        ...card,
        mechanic,
        mechanicData: {
          darknessLevel: 0, // Empezar completamente normal
          darknessSpeed: 0.07, // Velocidad reducida (tarda más en oscurecerse)
          lastDarkness: 0,
        },
      };

      case 'rotation':
        return {
          ...card,
          mechanic,
          mechanicData: {
            rotation: 0, // Ángulo actual (0, 90, 180, 270 grados)
            lastRotation: 0, // timestamp de la última rotación
            rotationInterval: 2000, // 2 segundos entre rotaciones
          },
        };

    case 'trio':
      return {
        ...card,
        mechanic,
        mechanicData: {
          isTrio: true,
          trioGroup: Math.floor(Math.random() * 1000), // ID del grupo de trío
          trioPosition: Math.floor(Math.random() * 3), // Posición en el trío (0, 1, 2)
        },
      };

    default:
      return card;
  }
}

// Actualizar mecánicas en tiempo real con delta time
export function updateMechanics(cards: Card[], dt: number): Card[] {
  // Verificar si hay cartas que necesitan actualización
  const needsUpdate = cards.some(card => 
    card.mechanic && 
    !card.isMatched && 
    ['ghost', 'bomb', 'chameleon', 'peeked_card', 'darkness', 'rotation'].includes(card.mechanic)
  );
  
  // Solo actualizar si es necesario
  
  if (!needsUpdate) {
    return cards; // No hay nada que actualizar
  }
  
  const now = performance.now() / 1000; // Convertir a segundos
  
  return cards.map(card => {
    if (!card.mechanic || !card.mechanicData) return card;

    const mechanicData = { ...card.mechanicData };

    switch (card.mechanic) {
      case 'ghost':
        // Si la carta ya está acertada, mantenerla siempre visible
        if (card.isMatched) {
          return {
            ...card,
            isVisible: true,
            mechanicData: {
              ...mechanicData,
              isVisible: true
            }
          };
        }
        
        // Alternar visibilidad en segundos reales solo si no está acertada
        mechanicData.visibilityTimer = ((mechanicData.visibilityTimer as number) ?? 0) + dt;
        if ((mechanicData.visibilityTimer as number) >= ((mechanicData.visibilityDuration as number) ?? 3)) {
          mechanicData.isVisible = !mechanicData.isVisible;
          mechanicData.visibilityTimer = 0;
          // Carta cambió visibilidad
        }
        // Actualizar la visibilidad de la carta
        return {
          ...card,
          isVisible: !!mechanicData.isVisible,
          mechanicData
        };

      case 'chameleon':
        // Cambiar color del grid cada 1-3 segundos
        mechanicData.colorTimer = ((mechanicData.colorTimer as number) ?? 0) + dt;
        if ((mechanicData.colorTimer as number) >= 2) { // Cambiar cada 2 segundos
          const colors = ['normal', 'green', 'red', 'blue', 'yellow'];
          const currentIndex = colors.indexOf(mechanicData.currentColor as string);
          const nextIndex = (currentIndex + 1) % colors.length;
          mechanicData.currentColor = colors[nextIndex];
          mechanicData.colorTimer = 0;
        }
        return { ...card, mechanicData };

      case 'bomb':
        // Si la carta está acertada, no hacer nada (no puede explotar)
        if (card.isMatched) {
          break;
        }
        
        // Si ya explotó, contar tiempo de explosión
        if (mechanicData.isExploded) {
          mechanicData.explosionTimer = ((mechanicData.explosionTimer as number) ?? 0) + dt;
          if ((mechanicData.explosionTimer as number) >= (mechanicData.explosionDuration as number)) {
            // Marcar para remover la bomba (se manejará en GameScreen)
            mechanicData.shouldRemove = true;
          }
        }
        break;

      case 'rotation':
        const rotationData = card.mechanicData as Record<string, unknown>;
        const now = performance.now();
        const interval = (rotationData.rotationInterval as number) || 2000;
        const lastRotation = (rotationData.lastRotation as number) || 0;
        
        // Rotar cada 2 segundos (como en tu código)
        if (now - lastRotation >= interval) {
          // Rotar a un ángulo aleatorio de 90 grados (0, 90, 180, 270)
          rotationData.rotation = Math.floor(Math.random() * 4) * 90;
          rotationData.lastRotation = now;
          
          console.log(`🔄 Rotación - Carta ${card.id}: ${rotationData.rotation}°`);
        }
        
        return { ...card, mechanicData: rotationData };

      case 'peeked_card':
        // Sistema simple: solo esta carta específica puede hacer peek
        const peekInterval = 10; // 10 segundos entre peeks (como solicita el usuario)
        const peekDuration = 2; // 2 segundos visible
        const currentTime = performance.now() / 1000;
        
        // Inicializar timer si no existe
        if (mechanicData.peekTimer === undefined) {
          mechanicData.peekTimer = 0;
        }
        
        // Acumular timer
        mechanicData.peekTimer = ((mechanicData.peekTimer as number) ?? 0) + dt;
        
        // Si es tiempo de hacer peek (y no está ya en peek)
        if ((mechanicData.peekTimer as number) >= peekInterval && !mechanicData.peeked) {
          mechanicData.peeked = true;
          mechanicData.peekedUntil = currentTime + peekDuration;
          mechanicData.peekTimer = 0;
          console.log(`👁️ Peek activado para carta ${card.id} - visible hasta ${mechanicData.peekedUntil}`);
        }
        
        // Si el peek expiró, ocultar
        if (mechanicData.peekedUntil && currentTime >= (mechanicData.peekedUntil as number)) {
          mechanicData.peeked = false;
          mechanicData.peekedUntil = 0;
          console.log(`👁️ Peek expirado para carta ${card.id}`);
        }
        
        // Actualizar la carta (SIEMPRE visible y clickeable, solo cambia isFlipped)
        return {
          ...card,
          isFlipped: !!(mechanicData.peeked || card.isMatched), // Solo se gira cuando está en peek o acertada
          mechanicData
        };


      case 'frozen':
        // La mecánica frozen ahora se maneja con timestamps en updateFrozenMechanic
        // No hacer nada aquí, se procesa externamente
        break;

      case 'darkness':
        // Aumentar oscuridad gradualmente en segundos reales
        const currentDarkness = (mechanicData.darknessLevel as number) ?? 0;
        const darknessSpeed = (mechanicData.darknessSpeed as number) ?? 0.07; // Velocidad reducida (tarda más en oscurecerse)
        const newDarkness = Math.min(0.8, currentDarkness + darknessSpeed * dt); // Máximo 80% oscuridad
        
        mechanicData.darknessLevel = newDarkness;
        
        // Log ocasional para debug
        if (Math.random() < 0.01) { // 1% de probabilidad
          console.log(`🌑 Darkness update - card: ${card.id}, level: ${newDarkness.toFixed(2)}`);
        }
        
        // Si llega al máximo, reiniciar más rápido
        if (newDarkness >= 0.8) {
          mechanicData.darknessLevel = Math.max(0, newDarkness - 0.15 * dt); // Reducir más rápido
          console.log(`🌑 Darkness reducing - card: ${card.id}, level: ${(mechanicData.darknessLevel as number).toFixed(2)}`);
        }
        break;

      case 'fog':
        // La niebla se puede disipar con el tiempo o por acciones del jugador
        if (mechanicData.revealed) {
          return { ...card, mechanicData };
        }
        break;

      case 'combo':
        // Los combos se manejan en la lógica de volteo
        break;

      case 'trio':
        // Los tríos no necesitan actualización en tiempo real
        // Se manejan en la lógica de matching
        break;
    }

    return { ...card, mechanicData };
  });
}

// Verificar si una carta puede ser volteada
export function canFlipCard(card: Card): boolean {
  if (!card.mechanic || card.mechanic === 'basic') return true;

  switch (card.mechanic) {
    case 'fog':
      return true; // Siempre se puede voltear
    
    case 'bomb':
      return !card.mechanicData?.isExploded;
    
    case 'ghost':
      // Si la carta ya está acertada, siempre es volteable
      if (card.isMatched) return true;
      return !!(card.mechanicData?.isVisible) || false;
    
    case 'frozen':
      // Para frozen, la verificación se hace externamente con isCardFrozen
      // porque el estado se maneja en el componente GameScreen
      return true; // Siempre permitir voltear, la lógica de congelación se maneja en el componente
    
    
    case 'trio':
      return true; // Los tríos se pueden voltear normalmente
    
    default:
      return true;
  }
}

// Aplicar efectos visuales de mecánicas
export function getMechanicVisualEffects(card: Card): string {
  if (!card.mechanic || !card.mechanicData) return '';

  const effects: string[] = [];

  switch (card.mechanic) {
    case 'fog':
      // Efecto de niebla: super borroso y semi-transparente (solo si no está acertada)
      if (!card.isMatched) {
        effects.push('opacity-60', 'blur-md', 'brightness-75');
      }
      break;

    case 'ghost':
      // Si la carta ya está acertada, no aplicar efectos de fantasma
      if (card.isMatched) {
        break;
      }
      if (!card.isVisible) {
        effects.push('opacity-0', 'invisible');
      } else {
        effects.push('opacity-70', 'animate-pulse');
      }
      break;

    case 'frozen':
      // El efecto visual se aplica externamente basado en isCardFrozen
      // No aplicar efectos aquí ya que se maneja en el componente
      break;

    case 'bomb':
      // Si la carta está acertada, no mostrar efectos de bomba
      if (card.isMatched) {
        break;
      }
      
      const bombData = card.mechanicData as Record<string, unknown>;
      if (bombData.isExploded) {
        // Cuando explota, mostrar efecto de explosión
        effects.push('animate-pulse', 'ring-4', 'ring-red-600', 'bg-red-500', 'opacity-80');
      } else {
        // Mostrar nivel de bomba según bombLevel
        const bombLevel = bombData.bombLevel as number;
        if (bombLevel === 0) {
          effects.push('ring-2', 'ring-yellow-500', 'bg-yellow-100'); // Amarillo
        } else if (bombLevel === 1) {
          effects.push('ring-2', 'ring-orange-500', 'bg-orange-100'); // Naranja
        } else if (bombLevel === 2) {
          effects.push('ring-2', 'ring-red-500', 'bg-red-100'); // Rojo
        }
      }
      break;

    case 'chameleon':
      // No aplicar efectos visuales aquí, se maneja en el grid
      break;


    case 'rotation':
      const rotationData = card.mechanicData as Record<string, unknown>;
      const angle = (rotationData.rotationAngle as number) || 0;
      // Aplicar la rotación directamente con CSS transform
      effects.push('transform', 'transition-transform', 'duration-300', 'ease-in-out');
      break;

    case 'darkness':
      const darknessData = card.mechanicData as Record<string, unknown>;
      const darknessLevel = (darknessData.darknessLevel as number) || 0;
      
      // Aplicar efectos graduales sin el nivel extremo
      if (darknessLevel > 0.1) {
        // Efectos graduales basados en el nivel de oscuridad (sin nivel extremo)
        if (darknessLevel > 0.6) {
          effects.push('opacity-50', 'brightness-40', 'contrast-140', 'grayscale-30'); // 70% oscuridad (máximo)
        } else if (darknessLevel > 0.4) {
          effects.push('opacity-60', 'brightness-50', 'contrast-130', 'grayscale-20'); // 50% oscuridad
        } else if (darknessLevel > 0.2) {
          effects.push('opacity-70', 'brightness-60', 'contrast-125'); // 30% oscuridad
        } else {
          effects.push('opacity-80', 'brightness-70', 'contrast-115'); // 20% oscuridad
        }
      }
      // Si darknessLevel es 0.1 o menor, no aplicar ningún efecto (carta completamente normal)
      break;

    case 'combo':
      const comboData = card.mechanicData as Record<string, unknown>;
      if ((comboData.comboChain as number) > 0) {
        effects.push('ring-2', 'ring-yellow-500', 'animate-pulse');
      }
      break;

    case 'trio':
      const trioData = card.mechanicData as Record<string, unknown>;
      if (trioData.isTrio) {
        effects.push('ring-2', 'ring-purple-500', 'animate-pulse');
      }
      break;
  }

  return effects.join(' ');
}

// Obtener icono de mecánica
export function getMechanicIcon(mechanic: MechanicName): string {
  const icons = {
    basic: '🎯',
    fog: '💨',
    bomb: '💣',
    ghost: '👻',
    chameleon: '🦎',
    rotation: '🔄',
    peeked_card: '👁️',
    combo: '⚡',
    frozen: '🧊',
    darkness: '🌑',
    trio: '🔺',
  };

  return icons[mechanic] || '❓';
}

// Obtener color de mecánica
export function getMechanicColor(mechanic: MechanicName): string {
  const colors = {
    basic: 'text-gray-600',
    fog: 'text-blue-400',
    bomb: 'text-red-500',
    ghost: 'text-purple-400',
    chameleon: 'text-green-500',
    rotation: 'text-orange-500',
    peeked_card: 'text-yellow-500',
    combo: 'text-yellow-600',
    frozen: 'text-cyan-400',
    darkness: 'text-gray-800',
    trio: 'text-purple-600',
  };

  return colors[mechanic] || 'text-gray-600';
}

// Obtener estilo de transformación para mecánicas
export function getMechanicTransform(card: Card): string {
  if (!card.mechanic || !card.mechanicData) return '';

  switch (card.mechanic) {
    case 'rotation':
      const rotationData = card.mechanicData as Record<string, unknown>;
      const angle = (rotationData.rotation as number) || 0;
      return `rotate(${angle}deg)`;
    
    default:
      return '';
  }
}

// ===== MECÁNICA FROZEN CON TIMESTAMPS =====

// Inicialización de la mecánica frozen
export function initFrozenMechanic(now: number, opts?: { intervalMs?: number; durationMs?: number }): FrozenMechanicState {
  const intervalMs = Math.max(3000, opts?.intervalMs ?? 6000);  // clamp mínimos
  const durationMs = Math.max(1500, opts?.durationMs ?? 3000);
  return {
    enabled: true,
    phase: 'freeze',
    frozenIds: [],
    nextActionAt: now,        // empieza YA la primera congelación
    intervalMs,
    durationMs,
  };
}

// Logs con muestreo para evitar spam
const LOG_SAMPLE = 0.05; // 5%

function logSampled(...args: unknown[]) {
  if (Math.random() < LOG_SAMPLE) console.log('[frozen]', ...args);
}

// Actualización por tick (sin bucles infinitos) - NO TOCA LAS CARTAS
export function updateFrozenMechanic(
  now: number,
  cards: { id: string | number; value: string | number; isMatched: boolean }[],
  frozen: FrozenMechanicState
): FrozenMechanicState {
  let F = { ...frozen };

  if (now < F.nextActionAt || !F.enabled) return F;

  if (F.phase === 'freeze') {
    // Elige 2 cartas válidas con value distinto (para evitar parejas)
    const pool = cards.filter(c => !c.isMatched && !F.frozenIds.includes(c.id.toString()));
    
    // baraja rápido
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    
    let a: typeof pool[0] | undefined, b: typeof pool[0] | undefined;
    for (let i = 0; i < pool.length; i++) {
      if (!a) { 
        a = pool[i]; 
        continue; 
      }
      if (!b && pool[i].value !== a.value) { 
        b = pool[i];
        break;
      }
    }
    
    if (a && b) {
      logSampled(`🧊 Congelando cartas:`, [a.id, b.id], `por ${F.durationMs}ms`);
      F = {
        ...F,
        frozenIds: [a.id.toString(), b.id.toString()],
        phase: 'unfreeze',
        nextActionAt: now + F.durationMs,   // en Y ms toca liberar
      };
    } else {
      // No hay dos válidas: reintenta en X ms
      logSampled(`❌ No hay candidatas válidas para congelar, reprogramando...`);
      F = { ...F, nextActionAt: now + F.intervalMs };
    }

  } else { // 'unfreeze'
    logSampled(`🔥 Descongelando cartas de la tanda:`, F.frozenIds);
    F = {
      ...F,
      frozenIds: [],
      phase: 'freeze',
      nextActionAt: now + F.intervalMs,    // próxima congelación en X ms
    };
  }

  return F;
}
