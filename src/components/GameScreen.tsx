'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Lottie from 'lottie-react';
import partidaGanadaAnimation from '@/data/messages/partida_ganada.json';
import { soundSystem } from '@/lib/soundSystem';
import partidaPerdidaAnimation from '@/data/messages/partida_perdida.json';
import SettingsModal from './SettingsModal';
import RankingModal from './RankingModal';
import { 
  Heart, 
  Coins, 
  Settings, 
  Trophy, 
  Pause, 
  Play,
  X, 
  Volume2, 
  VolumeX,
  Clock,
  RotateCcw
} from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Card } from '@/types/game';
import { getLevelFromJson, LevelData } from '@/data/levels';
import { applyMechanic, updateMechanics, canFlipCard, getMechanicVisualEffects, getMechanicIcon, getMechanicTransform, MECHANIC_CONFIGS, initFrozenMechanic, updateFrozenMechanic } from '@/lib/mechanics';
import { getRandomCards, getRandomPortada, loadAvailableCards } from '@/lib/simpleCardSystem';
import { getColorThemeForLevel, getBossColorTheme, isBossLevel, ColorTheme } from '@/data/colorThemes';
import LevelCompleteModal from './LevelCompleteModal';
import NoLivesModal from './NoLivesModal';
import { showRewardedAd, showBottomBanner, hideBanner, forceShowBanner, showInterstitialAd } from '@/lib/adService';
import { useAppState } from '@/hooks/useAppState';

interface GameScreenProps {
  level: number;
  onBack: () => void;
  onLevelComplete: () => void;
  onLevelFail: () => void;
}

export default function GameScreen({ level: propLevel, onBack, onLevelComplete }: GameScreenProps) {
  // 🎮 MEMOFLIP NEXTJS - COMPONENTE DE JUEGO CORRECTO - VERSIÓN COMPLETA
  // ✅ Este es el componente de juego principal con todas las mecánicas
  // ✅ Incluye: tríos, pares, rotación, peek, frozen, bomb, chameleon
  // ✅ Sistema completo de vidas, monedas, sonidos y animaciones
  const {
    currentCards,
    setCurrentCards,
    flipCard,
    closeCard,
    matchCards,
    resetCards,
    setCurrentLevelConfig,
    coins,
    lives,
    setPaused,
    isPaused,
    addCoins,
    setCoins,
    setLives,
    loseLife,
    gainLife,
    addEvent,
    resetGame,
    setCurrentLevel,
    checkLifeRegeneration,
    currentLevel,
    getTimeUntilNextLife
  } = useGameStore();

  // Sincronizar nivel: priorizar store, pero usar prop como fallback
  const level = currentLevel !== undefined ? currentLevel : propLevel;

  const [flippedCards, setFlippedCards] = useState<(string | number)[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [levelConfig, setLevelConfig] = useState<LevelData | null>(null);
  const [showNoLivesModal, setShowNoLivesModal] = useState(false);
  const [timeUpHandled, setTimeUpHandled] = useState(false);
  const timeUpHandledRef = useRef(false);

  // Verificar regeneración de vidas al cargar el componente
  useEffect(() => {
    checkLifeRegeneration();
  }, []);

  // Verificar regeneración de vidas cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      checkLifeRegeneration();
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, []);

  // 🎯 FORZAR BANNER CADA SEGUNDO - SIN COMPLICACIONES
  useEffect(() => {
    console.log('[GameScreen] 🎯 INICIANDO BANNER FORZADO');
    
    const forceBanner = async () => {
      try {
        await forceShowBanner();
        console.log('[GameScreen] ✅ BANNER FORZADO');
      } catch (e) {
        console.warn('[GameScreen] ❌ Error:', e);
      }
    };

    // ✅ FORZAR INMEDIATAMENTE
    forceBanner();
    
    // ✅ FORZAR CADA SEGUNDO
    const interval = setInterval(forceBanner, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Actualizar levelConfig cuando cambie el nivel
  useEffect(() => {
    getLevelFromJson(level).then(newLevelConfig => {
      // Actualizando levelConfig para nivel
      setLevelConfig(newLevelConfig);
      // Nivel cambiado - reinicializando
      
      // Reinicializar el estado frozen si el nivel tiene mecánica frozen
      if (newLevelConfig?.mechanics?.includes('frozen')) {
        frozenRef.current = initFrozenMechanic(Date.now(), { intervalMs: 6000, durationMs: 3000 });
      }
      
      // Reinicializar el nivel cuando cambie
      if (newLevelConfig) {
        initializeLevel();
      }
    });
  }, [level]);

  // Sincronizar store con prop cuando sea necesario (solo al inicio)
  useEffect(() => {
    if (propLevel !== undefined && currentLevel === undefined) {
      // Solo sincronizar si currentLevel no está definido (inicio)
      setCurrentLevel(propLevel);
    }
  }, [propLevel, currentLevel, setCurrentLevel]);
  const [localTimeLeft, setLocalTimeLeft] = useState(0); // Tiempo transcurrido, no cuenta atrás
  const [actualGameTime, setActualGameTime] = useState(0); // Tiempo real de juego
  const [totalFlips, setTotalFlips] = useState(0); // Contador total de giros
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
  const [showLevelFailedModal, setShowLevelFailedModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [themeConfig, setThemeConfig] = useState<Record<string, unknown> | null>(null);
  const [themeBackImage, setThemeBackImage] = useState<string>('/sistema_apps_upload/memoflip/logo.png');
  const [colorTheme, setColorTheme] = useState<ColorTheme | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const [flyingCoins, setFlyingCoins] = useState<Array<{id: number, x: number, y: number, targetX: number, targetY: number}>>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [timeUntilNextLife, setTimeUntilNextLife] = useState(0);
  const [isClickProcessing, setIsClickProcessing] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [showMechanicIntro, setShowMechanicIntro] = useState(false);
  const CLICK_DEBOUNCE_TIME = 300; // 300ms entre clics
  // Removed useTheme hook - using colorTheme instead

  // Función para inicializar nivel (disponible globalmente) - memoizada
  const initializeLevel = useCallback(async () => {
    if (typeof window === 'undefined') return; // Solo en cliente
    
    // Resetear modales cuando cambie el nivel
    setShowLevelCompleteModal(false);
    setShowLevelFailedModal(false);
    
    // Resetear estado de cartas volteadas
    setFlippedCards([]);
    setHasStarted(false); // Resetear el estado de inicio
    setTimeUpHandled(false); // Resetear el estado de tiempo agotado
    timeUpHandledRef.current = false; // Resetear el ref de tiempo agotado
    setActualGameTime(0); // Resetear el tiempo real de juego
    setTotalFlips(0); // Resetear el contador de giros
    
    const config = await getLevelFromJson(level);
    setLevelConfig(config);
    setCurrentLevelConfig(config);
      setLocalTimeLeft(0); // Resetear tiempo transcurrido
      
      // Obtener tema de color según el nivel
      const colorTheme = isBossLevel(level) ? getBossColorTheme(level) : getColorThemeForLevel(level);
      setColorTheme(colorTheme);
      
      // Obtener imagen de portada aleatoria
      const portadaImage = getRandomPortada();
      setThemeBackImage(portadaImage);
      
      // Cargar cartas disponibles si no están cargadas
      loadAvailableCards();
      
      // Verificar si el nivel tiene mecánica trio
      const hasTrioMechanic = config.mechanics && config.mechanics.includes('trio');
      
      // Crear cartas aleatorias del pool simple
      const randomCards = getRandomCards(config.pairs, hasTrioMechanic);
      
      // Función para calcular slots centrados como en el JS
      const centeredIndices = (total: number, cols = 4, rows = 6) => {
        const cx = (cols - 1) / 2;
        const cy = (rows - 1) / 2;
        return Array.from({ length: cols * rows }, (_, i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          return { i, d: Math.hypot(c - cx, r - cy), r, c };
        })
        .sort((a, b) => a.d - b.d || a.r - b.r || a.c - b.c)
        .slice(0, total)
        .map(x => x.i)
        .sort((a, b) => a - b);
      };
      
      // Obtener slots centrados para las cartas
      const slots = centeredIndices(randomCards.length);
      
      // Convertir SimpleCard a Card y aplicar mecánicas
      const cardsWithMechanics = randomCards.map((card, index) => {
        const gameCard: Card = {
          id: card.id,
          value: card.fileName,
          image: card.image,
        isFlipped: false,
        isMatched: false,
        isVisible: true,
          mechanic: undefined,
          slot: slots[index] // Asignar slot centrado
        };
        
      
      // Aplicar mecánicas especiales (no bomb, no trio) según su probabilidad individual
      const nonBombMechanics = config.mechanics.filter(m => m !== 'basic' && m !== 'bomb' && m !== 'trio');
      if (nonBombMechanics.length > 0) {
        for (const mechanic of nonBombMechanics) {
          // Si es darkness, aplicarlo a TODAS las cartas
          if (mechanic === 'darkness') {
            // Aplicando mecánica darkness
            return applyMechanic(gameCard, mechanic);
          }
          
          const mechanicConfig = MECHANIC_CONFIGS[mechanic];
          if (mechanicConfig && Math.random() < mechanicConfig.probability) {
            // Aplicando mecánica especial
            return applyMechanic(gameCard, mechanic);
          }
        }
      }
        return gameCard;
    });

    // Aplicar bombas al 20% de las cartas si el nivel tiene mecánica bomb
    let finalCards = cardsWithMechanics;
    if (config.mechanics.includes('bomb')) {
      const totalCards = finalCards.length;
      const bombCount = Math.floor(totalCards * 0.2); // 20% de las cartas
      
      // Seleccionar cartas aleatorias para bombas
      const bombIndices = Array.from({ length: totalCards }, (_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, bombCount);
      
      finalCards = finalCards.map((card, index) => {
        if (bombIndices.includes(index)) {
          // Aplicando bomba
          return applyMechanic(card, 'bomb');
      }
      return card;
    });
    }

    // Establecer cartas directamente sin reset intermedio
    setCurrentCards(finalCards);
    
    // Mostrar animación de mecánicas solo si hay mecánicas especiales y no se ha mostrado antes
    const specialMechanics = config.mechanics.filter(m => m !== 'basic');
    if (specialMechanics.length > 0 && !showMechanicIntro) {
      setShowMechanicIntro(true);
      // Ocultar la animación después de 3 segundos
      setTimeout(() => {
        setShowMechanicIntro(false);
      }, 3000);
    }
    }, [level]); // Dependencias del useCallback

  // useEffect para inicializar cuando cambie el nivel
  useEffect(() => {
    initializeLevel();
  }, [initializeLevel]); // Depende de la función memoizada

  // Efecto para sincronizar flippedCards con peeked_card
  useEffect(() => {
    const peekedCards = currentCards
      .filter(card => card.mechanic === 'peeked_card' && card.isFlipped && !card.isMatched)
      .map(card => card.id);
    
    // Agregar cartas peeked que no están en flippedCards
    const newFlippedCards = [...new Set([...flippedCards, ...peekedCards])];
    
    // Remover cartas peeked que ya no están flipped
    const filteredFlippedCards = newFlippedCards.filter(cardId => {
      const card = currentCards.find(c => c.id === cardId);
      return card && (card.isFlipped || card.isMatched);
    });
    
    if (JSON.stringify(filteredFlippedCards.sort()) !== JSON.stringify(flippedCards.sort())) {
      setFlippedCards(filteredFlippedCards);
    }
  }, [currentCards, flippedCards]);

  // Watchdog para prevenir que isClickProcessing se quede en true
  useEffect(() => {
    if (!isClickProcessing) return;
    const t = setTimeout(() => setIsClickProcessing(false), 300); // colchón
    return () => clearTimeout(t);
  }, [isClickProcessing]);

  // Efecto para detectar Game Over - solo si no hay modal de vidas abierto
  useEffect(() => {
    console.log('🔍 Verificando vidas:', { lives, showGameOverModal, showNoLivesModal });
    
    // ✅ MOSTRAR MODAL DE VIDAS cuando se queden sin vidas
    if (lives === 0 && !showGameOverModal && !showNoLivesModal) {
      console.log('💔 Sin vidas - mostrando modal de vidas');
      setShowNoLivesModal(true);
    }
    
    // ✅ OCULTAR MODAL DE VIDAS si recuperan vidas
    if (lives > 0 && showNoLivesModal) {
      console.log('❤️ Vidas recuperadas - ocultando modal');
      setShowNoLivesModal(false);
    }
  }, [lives, showGameOverModal, showNoLivesModal]);

  // Ref para el audio de fondo (para useAppState)
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);

  // Usar hook para pausar audio al minimizar app (solo en APK)
  useAppState(bgAudioRef);

  // Inicializar sistema de sonidos
  useEffect(() => {
    soundSystem.initialize().then(() => {
      // Obtener referencia al audio de fondo
      bgAudioRef.current = soundSystem.getBackgroundAudioElement() || null;
      
      // Iniciar música de fondo cuando se inicializa el juego
      soundSystem.playBackgroundMusic();
    });
    
    // Limpiar al desmontar
    return () => {
      soundSystem.stopBackgroundMusic();
    };
  }, []);

  // Función para alternar sonidos - memoizada
  const toggleSound = useCallback(() => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    soundSystem.setEnabled(newSoundState);
    
    // Reproducir sonido de confirmación
    if (newSoundState) {
      soundSystem.play('cartavolteada');
    }
  }, [soundEnabled]);

  // Timer - tiempo transcurrido (incrementa)
  useEffect(() => {
    // Verificando condiciones del timer
    
    if (isPaused || !hasStarted || showLevelCompleteModal || showLevelFailedModal) {
      // Timer bloqueado
      return;
    }
    // Solo crear timer si el nivel tiene cronómetro
    if (levelConfig && levelConfig.timeSec > 0) {
      // Iniciando timer
      const timer = setInterval(() => {
        setLocalTimeLeft(prev => {
          const newTime = prev + 1;
          // Timer tick
          
          // Verificar si se agotó el tiempo
          if (newTime >= levelConfig.timeSec && !showLevelFailedModal && !timeUpHandledRef.current) {
            // Tiempo agotado detectado
            // Marcar inmediatamente en el ref para evitar múltiples ejecuciones
            timeUpHandledRef.current = true;
            setTimeUpHandled(true);
            // Ejecutar directamente sin setTimeout para evitar condiciones de carrera
            handleTimeUp();
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isPaused, hasStarted, showLevelCompleteModal, showLevelFailedModal, levelConfig?.timeSec]);

  // Timer para tiempo real de juego (independiente del cronómetro del nivel)
  useEffect(() => {
    // Verificando timer de tiempo real
    
    if (!hasStarted || isPaused || showLevelCompleteModal || showLevelFailedModal) {
      // Timer tiempo real bloqueado
      return;
    }
    
    // Iniciando timer tiempo real
    const gameTimer = setInterval(() => {
      setActualGameTime(prev => {
        const newTime = prev + 1;
        // Timer tiempo real tick
        return newTime;
      });
    }, 1000);

    return () => {
      // Limpiando timer tiempo real
      clearInterval(gameTimer);
    };
  }, [hasStarted, isPaused, showLevelCompleteModal, showLevelFailedModal]);

  // Estado para el efecto de color del camaleón
  const [chameleonColor, setChameleonColor] = useState<string>('normal');
  
  // Estado para mostrar ayuda de mecánicas
  const [showMechanicHelp, setShowMechanicHelp] = useState<boolean>(false);

  // Estado para la rotación global del nivel
  const [globalRotation, setGlobalRotation] = useState<Record<string, number>>({});

  // Estado para la mecánica frozen - usando refs para evitar reinicializaciones
  const frozenRef = useRef(initFrozenMechanic(Date.now(), { intervalMs: 6000, durationMs: 3000 }));
  const [, forceUpdate] = useState({});

  // Función para verificar si una carta está congelada
  const isCardFrozen = useCallback((cardId: string | number) => {
    return frozenRef.current.frozenIds.includes(cardId.toString());
  }, []);

  // Función para formatear el tiempo hasta la próxima vida
  const formatTimeUntilNextLife = useCallback(() => {
    const minutes = Math.floor(timeUntilNextLife / 60000);
    const seconds = Math.floor((timeUntilNextLife % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeUntilNextLife]);

  // Actualizar contador de tiempo para la próxima vida
  useEffect(() => {
    if (lives < 3) {
      const updateTimer = () => {
        const timeLeft = getTimeUntilNextLife();
        setTimeUntilNextLife(timeLeft);
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);

      return () => clearInterval(interval);
    }
  }, [lives, getTimeUntilNextLife]);

  // Función para manejar ver video para conseguir vida
  const handleWatchAdForLife = useCallback(async () => {
    try {
      console.log('🎬 Iniciando anuncio de vida...');
      console.log('📊 Estado actual:', { lives, showNoLivesModal });
      
      const result = await showRewardedAd();
      
      console.log('📺 Resultado del anuncio:', result);
      
      if (result.success && result.reward) {
        // ✅ RECOMPENSA OBTENIDA
        console.log('🎁 ¡Recompensa recibida! Dando vida...');
        
        // Dar la vida
        gainLife();
        
        // Verificar que la vida se otorgó correctamente
        setTimeout(() => {
          const currentLives = useGameStore.getState().lives;
          console.log('📊 Vidas después del anuncio:', currentLives);
          
          if (currentLives > 0) {
            // Cerrar modal
            setShowNoLivesModal(false);
            
            // Reiniciar el nivel actual para jugar inmediatamente
            setHasStarted(false);
            setLocalTimeLeft(0);
            setActualGameTime(0);
            setTotalFlips(0);
            setFlippedCards([]);
            setIsProcessing(false);
            setTimeUpHandled(false);
            timeUpHandledRef.current = false;
            initializeLevel();
            
            console.log('✅ Modal cerrado y nivel reiniciado');
          } else {
            console.error('❌ Error: No se otorgó la vida correctamente');
            alert('Error al otorgar la vida. Intenta de nuevo.');
          }
        }, 100);
        
        // Agregar evento
        addEvent({
          type: 'LIFE_REGENERATED',
          data: { 
            source: 'ad',
            reward: result.reward 
          },
          timestamp: Date.now()
        });
      } else {
        // ❌ NO SE OBTUVO RECOMPENSA
        console.log('❌ No se obtuvo recompensa:', result.error);
        
        // Mostrar mensaje claro
        const errorMsg = result.error === 'Debes ver el anuncio completo para obtener la vida.' 
          ? '⚠️ Debes ver el anuncio completo para obtener la vida.\n\nNo cierres el anuncio antes de tiempo.'
          : result.error || 'No se pudo cargar el anuncio en este momento.\n\nIntenta de nuevo en unos segundos.';
        
        alert(errorMsg);
        
        // NO cerrar el modal para que pueda intentar de nuevo
        console.log('🔄 Manteniendo modal abierto para reintento');
      }
    } catch (error) {
      // Error al mostrar video
      console.error('❌ Error en handleWatchAdForLife:', error);
      alert('Error al cargar el video. Intenta de nuevo.');
    }
  }, [gainLife, addEvent, initializeLevel, lives, showNoLivesModal]);

  // Función para cerrar modal de vidas
  const handleCloseNoLivesModal = useCallback(() => {
    setShowNoLivesModal(false);
  }, []);

  // Set memoizado para renderizado eficiente - se actualiza con forceUpdate
  const frozenSet = useMemo(() => new Set(frozenRef.current.frozenIds), [forceUpdate]);

  // Rotación global para el nivel (como en tu código)
  useEffect(() => {
    if (!levelConfig?.mechanics?.includes('rotation') || !currentCards || currentCards.length === 0) {
      // No iniciando rotación - condiciones no cumplidas
      return;
    }

    // Iniciando rotación global
    
    // Rotar todas las cartas cada 2 segundos (excepto las emparejadas)
    const interval = setInterval(() => {
      const newRotations: Record<string, number> = {};
      
      // Usar las cartas del store global para obtener el estado actualizado
      const storeState = useGameStore.getState();
      const globalCards = storeState.currentCards;
      
      globalCards.forEach(card => {
        // Solo rotar cartas que NO estén emparejadas
        if (!card.isMatched) {
          newRotations[card.id] = Math.floor(Math.random() * 4) * 90; // 0, 90, 180, 270 grados
        }
      });
      
      setGlobalRotation(newRotations);
      // Rotación global aplicada
    }, 2000);

    return () => {
      // Limpiando intervalo de rotación
      clearInterval(interval);
    };
  }, [levelConfig?.mechanics?.join(','), currentCards.length]); // Cambiar dependencias

  // Actualizar mecánicas en tiempo real con delta time
  useEffect(() => {
    if (!currentCards || currentCards.length === 0 || !levelConfig) {
      return;
    }
    
    // Solo ejecutar el loop si hay mecánicas que requieren actualización continua (excluyendo rotation y frozen)
    const needsContinuousUpdate = levelConfig.mechanics?.some(mechanic => 
      ['ghost', 'bomb', 'chameleon', 'peeked_card', 'darkness'].includes(mechanic)
    );
    
    // Verificando animación
    // Verificando actualización continua
    
    if (!needsContinuousUpdate) {
      // No necesita actualización continua
      return;
    }
    
    // Iniciando loop de animación
    
    let lastTime = performance.now();
    let animationId: number;
    
    const updateLoop = () => {
      const currentTime = performance.now();
      const dt = (currentTime - lastTime) / 1000; // Convertir a segundos
      lastTime = currentTime;
      
      if (Array.isArray(currentCards) && currentCards.length > 0) {
        // Solo loggear ocasionalmente para evitar spam
        if (Math.random() < 0.01) { // 1% de probabilidad de loggear
          // updateLoop ejecutándose
        }
        const updatedCards = updateMechanics(currentCards, dt);
        
        // Detectar si hay cartas con mecánica camaleón y obtener su color
        const chameleonCards = updatedCards.filter(card => card.mechanic === 'chameleon');
        if (chameleonCards.length > 0) {
          const firstChameleonCard = chameleonCards[0];
          const chameleonData = firstChameleonCard.mechanicData as Record<string, unknown>;
          const newColor = chameleonData.currentColor as string;
          if (newColor !== chameleonColor) {
            setChameleonColor(newColor);
          }
        } else {
          // Si no hay cartas camaleón, resetear color
          if (chameleonColor !== 'normal') {
            setChameleonColor('normal');
          }
        }
        
        // Verificar si hay bombas que deben ser removidas y reubicadas
        const bombsToRemove = updatedCards.filter(card => 
          card.mechanic === 'bomb' && 
          card.mechanicData && 
          (card.mechanicData as Record<string, unknown>).shouldRemove
        );
        
        if (bombsToRemove.length > 0) {
          // Removiendo bombas y reubicando
          
          // Remover bombas de las cartas que las tenían
          let cardsWithoutBombs = updatedCards.map(card => {
            if (card.mechanic === 'bomb' && card.mechanicData && 
                (card.mechanicData as Record<string, unknown>).shouldRemove) {
              return {
                ...card,
                mechanic: undefined,
                mechanicData: undefined
              };
            }
            return card;
          });
          
          // Seleccionar cartas aleatorias para nuevas bombas
          const availableCards = cardsWithoutBombs.filter(card => 
            !card.isMatched && !card.mechanic
          );
          
          if (availableCards.length > 0) {
            const newBombCount = Math.min(bombsToRemove.length, availableCards.length);
            const newBombIndices = Array.from({ length: availableCards.length }, (_, i) => i)
              .sort(() => Math.random() - 0.5)
              .slice(0, newBombCount);
            
            cardsWithoutBombs = cardsWithoutBombs.map((card, index) => {
              const availableIndex = availableCards.findIndex(c => c.id === card.id);
              if (availableIndex !== -1 && newBombIndices.includes(availableIndex)) {
                // Nueva bomba aplicada
                return applyMechanic(card, 'bomb');
              }
              return card;
            });
          }
          
          setCurrentCards(cardsWithoutBombs);
        } else if (JSON.stringify(updatedCards) !== JSON.stringify(currentCards)) {
          setCurrentCards(updatedCards);
        }
      }
      
      animationId = requestAnimationFrame(updateLoop);
    };
    
    animationId = requestAnimationFrame(updateLoop);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [level, levelConfig, currentCards, chameleonColor]); // Incluir currentCards en dependencias

  // Loop separado para la mecánica frozen (con timestamps) - usando refs
  useEffect(() => {
    if (!levelConfig?.mechanics?.includes('frozen') || !currentCards || currentCards.length === 0) {
      return;
    }

    let animationId: number;
    
    const frozenLoop = () => {
      const now = Date.now();
      const next = updateFrozenMechanic(now, currentCards, frozenRef.current);
      
      // Comparar si el estado realmente cambió (frozenIds o phase)
      const currentState = frozenRef.current;
      const stateChanged = 
        next.frozenIds.length !== currentState.frozenIds.length ||
        next.phase !== currentState.phase ||
        next.frozenIds.some((id, index) => id !== currentState.frozenIds[index]);
      
      if (stateChanged) {
        frozenRef.current = next;
        forceUpdate({}); // forzar re-render para actualizar UI
      }
      
      animationId = requestAnimationFrame(frozenLoop);
    };
    
    animationId = requestAnimationFrame(frozenLoop);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [levelConfig?.mechanics, currentCards]);

  // Efecto para rotación automática cada 2 segundos
  useEffect(() => {
    if (!levelConfig || !levelConfig.mechanics || !levelConfig.mechanics.includes('rotation')) {
      return;
    }

    const interval = setInterval(() => {
      rotateAllRotationCards();
    }, 2000);

    return () => clearInterval(interval);
  }, [levelConfig?.mechanics, currentCards]);

  // Manejar clic en carta
  // Función para rotar todas las cartas con mecánica rotation - memoizada
  const rotateAllRotationCards = useCallback(() => {
    // Usar las cartas del store global para obtener el estado actualizado
    const storeState = useGameStore.getState();
    const globalCards = storeState.currentCards;
    
    const updatedCards = globalCards.map((card: Card) => {
      // Solo rotar cartas con mecánica rotation que NO estén emparejadas
      if (card.mechanic === 'rotation' && !card.isMatched) {
        return {
          ...card,
          mechanicData: {
            ...card.mechanicData,
            rotationAngle: Math.floor(Math.random() * 4) * 90 // 0, 90, 180, 270 grados
          }
        };
      }
      return card;
    });
    
    setCurrentCards(updatedCards);
  }, []);

  const handleCardClick = (cardId: string | number) => {
    // Click en carta
    
    // Verificar si el juego está pausado
    if (isPaused) {
      // Click bloqueado - juego pausado
      return;
    }
    
    // DEBOUNCING: Prevenir clics muy rápidos
    const now = Date.now();
    if (now - lastClickTime < CLICK_DEBOUNCE_TIME) {
      // Debounce bloqueado
      return;
    }
    setLastClickTime(now);
    
    // Para tríos permitir hasta 3 cartas, para pares solo 2
    const maxFlipped = levelConfig?.mechanics && levelConfig.mechanics.includes('trio') ? 3 : 2;
    const isTrioLevel = levelConfig?.mechanics && levelConfig.mechanics.includes('trio');
    
    // Contar cartas volteadas manualmente de dos formas para mayor seguridad:
    // 1. Desde flippedCards (estado local)
    const manuallyFlippedFromState = flippedCards.filter(cardId => {
      const card = currentCards.find(c => c.id === cardId);
      return card && card.mechanic !== 'peeked_card';
    }).length;
    
    // 2. Desde currentCards (estado del store) - más confiable
    const manuallyFlippedFromCards = currentCards.filter(card => 
      card.isFlipped && 
      !card.isMatched && 
      card.mechanic !== 'peeked_card'
    ).length;
    
    // Usar el máximo de ambos para mayor seguridad
    const manuallyFlippedCount = Math.max(manuallyFlippedFromState, manuallyFlippedFromCards);
    
    // Verificando estado del click
    
    // BLOQUEO ESTRICTO: No permitir más cartas si ya se alcanzó el límite
    if (manuallyFlippedCount >= maxFlipped) {
      // Click bloqueado: máximo de cartas alcanzado
      return;
    }
    
    if (isProcessing || isClickProcessing) {
      // Click bloqueado por procesamiento
      return;
    }

    // Iniciar el juego en el primer clic
    if (!hasStarted) {
      // Iniciando juego
      setHasStarted(true);
    }

    // Incrementar contador de giros
    setTotalFlips(prev => prev + 1);

    const card = currentCards.find(c => c.id === cardId);
    
    // Carta encontrada
    
    if (!card || card.isMatched) {
      // Carta no encontrada o ya emparejada
      return;
    }

    // 🔑 Permitir clic si está volteada por peek (no por usuario)
    const isAutoPeek =
      card.mechanic === 'peeked_card' &&
      !!card.mechanicData?.peeked;

    // Verificando auto peek

    if (card.isFlipped && !isAutoPeek) {
      // Volteada por el usuario → no dejamos recliclarla
      // Carta ya volteada por usuario
      return;
    }

    // Click permitido - procesando

    // Marcar como procesando para evitar clics múltiples
    setIsClickProcessing(true);

    // Función helper para resetear isClickProcessing de forma segura
    const resetClickProcessing = () => {
      setTimeout(() => {
        setIsClickProcessing(false);
      }, 150);
    };

    // Verificar si la carta puede ser volteada según su mecánica
    if (!canFlipCard(card) || isCardFrozen(cardId)) {
      addEvent({
        type: 'CARD_MISS',
        data: { cardId, reason: 'mechanic_blocked' },
        timestamp: Date.now(),
      });
      resetClickProcessing();
      return;
    }

    // Si es una bomba, avanzar el nivel de todas las bombas
    if (card.mechanic === 'bomb' && card.mechanicData) {
      const bombData = card.mechanicData as Record<string, unknown>;
      const currentLevel = bombData.bombLevel as number;
      
      if (currentLevel < 2) {
        // Avanzar nivel de todas las bombas
        const updatedCards = currentCards.map((c: Card) => {
          if (c.mechanic === 'bomb' && c.mechanicData) {
            const cBombData = c.mechanicData as Record<string, unknown>;
            return {
              ...c,
              mechanicData: {
                ...cBombData,
                bombLevel: currentLevel + 1
              }
            };
          }
          return c;
        });
        setCurrentCards(updatedCards);
      } else {
        // Nivel 2 -> Explotar todas las bombas
        const updatedCards = currentCards.map((c: Card) => {
          if (c.mechanic === 'bomb' && c.mechanicData) {
            const cBombData = c.mechanicData as Record<string, unknown>;
            return {
              ...c,
              mechanicData: {
                ...cBombData,
                bombLevel: 3,
                isExploded: true,
                explosionTimer: 0
              }
            };
          }
          return c;
        });
        setCurrentCards(updatedCards);
      }
    }

    flipCard(cardId);
    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Sonido de carta volteada
    soundSystem.play('cartavolteada');

    addEvent({
      type: 'CARD_FLIP',
      data: { cardId, mechanic: card.mechanic },
      timestamp: Date.now(),
    });

    // Verificar si tenemos suficientes cartas para hacer match
    const requiredCards = isTrioLevel ? 3 : 2;
    
    if (newFlippedCards.length === requiredCards) {
      setIsProcessing(true);
      setTimeout(() => {
        if (isTrioLevel) {
          checkTrioMatch(newFlippedCards[0], newFlippedCards[1], newFlippedCards[2]);
        } else {
        checkMatch(newFlippedCards[0], newFlippedCards[1]);
        }
        setFlippedCards([]);
        setIsProcessing(false);
      }, 300);
    }

    // Liberar el estado de procesamiento después de un breve delay
    resetClickProcessing();
  };

  // Verificar coincidencia
  const checkMatch = (cardId1: string | number, cardId2: string | number) => {
    const card1 = currentCards.find(c => c.id === cardId1);
    const card2 = currentCards.find(c => c.id === cardId2);

    if (card1 && card2 && card1.value === card2.value) {
      // Coincidencia
      matchCards(cardId1, cardId2);
      addCoins(10);
      
      // Sonidos de match exitoso y moneda
      soundSystem.play('matchexitoso');
      soundSystem.play('coin');
      
      // Lanzar monedas volando desde el centro de las cartas
      const card1Element = document.querySelector(`[data-card-id="${cardId1}"]`);
      if (card1Element) {
        const rect = card1Element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        launchFlyingCoins(centerX, centerY, 3);
      }
      
      addEvent({
        type: 'CARD_MATCH',
        data: { cardId1, cardId2 },
        timestamp: Date.now(),
      });

      // Verificar si el nivel está completo después de hacer match
      setTimeout(() => {
        // Usar el estado actualizado del store
        const storeState = useGameStore.getState();
        const matchedCards = storeState.currentCards.filter(c => c.isMatched);
        
        // Verificar si el nivel tiene mecánica trio
        const hasTrioMechanic = levelConfig?.mechanics && levelConfig.mechanics.includes('trio');
        
        let isLevelComplete = false;
        
        if (hasTrioMechanic) {
          // Para niveles con tríos: contar tríos completados (3 cartas = 1 trío)
          const completedTrios = Math.floor(matchedCards.length / 3);
          const expectedTrios = levelConfig?.pairs || 0;
          isLevelComplete = completedTrios === expectedTrios;
          
          // Verificando tríos después del match
        } else {
          // Para niveles normales: contar pares completados (2 cartas = 1 par)
          const completedPairs = Math.floor(matchedCards.length / 2);
          const expectedPairs = levelConfig?.pairs || 0;
          isLevelComplete = completedPairs === expectedPairs;
          
          // Verificando pares después del match
        }
        
        if (isLevelComplete && !showLevelCompleteModal) {
               // Nivel completado
                const score = calculateScore;
               // Puntuación calculada
               setEarnedCoins(score);
               setShowLevelCompleteModal(true);
               
               // Sonido de nivel completado (MP3 real)
               soundSystem.play('acierto');
             }
      }, 500);

      // El nivel se verifica automáticamente con useEffect
    } else {
      // No coincidencia - cerrar las cartas
      // Sin sonido de error para no saturar
      
      setTimeout(() => {
        closeCard(cardId1);
        closeCard(cardId2);
      }, 300);
      
      addEvent({
        type: 'CARD_MISS',
        data: { cardId1, cardId2 },
        timestamp: Date.now(),
      });
    }
  };

  // Verificar coincidencia de trío
  const checkTrioMatch = (cardId1: string | number, cardId2: string | number, cardId3: string | number) => {
    const card1 = currentCards.find(c => c.id === cardId1);
    const card2 = currentCards.find(c => c.id === cardId2);
    const card3 = currentCards.find(c => c.id === cardId3);

    if (card1 && card2 && card3 && 
        card1.value === card2.value && 
        card2.value === card3.value) {
      // Trío completo - marcar las 3 cartas directamente
      const state = useGameStore.getState();
      if (Array.isArray(state.currentCards)) {
        const updatedCards = state.currentCards.map(card => 
          card.id === cardId1 || card.id === cardId2 || card.id === cardId3
            ? { ...card, isMatched: true, isFlipped: true }
            : card
        );
        useGameStore.setState({ 
          currentCards: updatedCards,
          matches: state.matches + 1
        });
        // Agregar evento al store
        useGameStore.getState().addEvent({
          type: 'TRIO_MATCH',
          data: { cardId1, cardId2, cardId3 },
          timestamp: Date.now()
        });
      }
      addCoins(15); // Más monedas por trío
      
      // Sonidos de match exitoso y moneda
      soundSystem.play('matchexitoso');
      soundSystem.play('coin');
      
      // Lanzar monedas volando desde el centro de las cartas
      const card1Element = document.querySelector(`[data-card-id="${cardId1}"]`);
      if (card1Element) {
        const rect = card1Element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        launchFlyingCoins(centerX, centerY, 5); // Más monedas por trío
      }
      

      // Verificar si el nivel está completo después de hacer trío
      setTimeout(() => {
        // Usar el estado actualizado del store
        const storeState = useGameStore.getState();
        const matchedCards = storeState.currentCards.filter(c => c.isMatched);
        
        // Para tríos: contar tríos completados (3 cartas = 1 trío)
        const completedTrios = Math.floor(matchedCards.length / 3);
        const expectedTrios = levelConfig?.pairs || 0;
        const isLevelComplete = completedTrios === expectedTrios;
        
        // Verificando tríos después del match
        
        if (isLevelComplete) {
          checkLevelComplete();
        }
      }, 100);
    } else {
      // No coincidencia - voltear cartas de vuelta
      setTimeout(() => {
        closeCard(cardId1);
        closeCard(cardId2);
        closeCard(cardId3);
      }, 1000);
    }
  };

  // Verificar si se completó el nivel
  const checkLevelComplete = () => {
    const storeState = useGameStore.getState();
    const matchedCards = storeState.currentCards.filter(c => c.isMatched);
    
    // Verificar si el nivel tiene mecánica trio
    const hasTrioMechanic = levelConfig?.mechanics && levelConfig.mechanics.includes('trio');
    
    let isLevelComplete = false;
    
    if (hasTrioMechanic) {
      // Para niveles con tríos: contar tríos completados (3 cartas = 1 trío)
      const completedTrios = Math.floor(matchedCards.length / 3);
      const expectedTrios = levelConfig?.pairs || 0;
      isLevelComplete = completedTrios === expectedTrios;
      
      // Verificando nivel completo (tríos)
    } else {
      // Para niveles normales: contar pares completados (2 cartas = 1 par)
      const totalPairs = storeState.currentCards.length / 2;
      const matchedPairs = matchedCards.length / 2;
      isLevelComplete = matchedPairs === totalPairs;
      
      // Verificando nivel completo (pares)
    }
    
    // Solo mostrar modal si realmente se completó el nivel
    if (isLevelComplete && storeState.currentCards.length > 0 && !showLevelCompleteModal && matchedCards.length > 0) {
      // Nivel completado
      
      // Añadir monedas por completar el nivel
      const coinsEarned = levelConfig?.rewards?.coins || (10 * (levelConfig?.pairs || 0));
      addCoins(coinsEarned);
      
      addEvent({
        type: 'LEVEL_COMPLETE',
        data: { level, coinsEarned },
        timestamp: Date.now(),
      });
      
      // Sonido de nivel completado
      soundSystem.play('acierto');
      
      // Mostrar modal inmediatamente
      // Estableciendo modal de nivel completado
      setShowLevelCompleteModal(true);
    }
  };

  // Manejar tiempo agotado
  const handleTimeUp = () => {
    // Verificando condiciones de handleTimeUp
    
    if (showLevelFailedModal || showLevelCompleteModal || isProcessing) {
      // handleTimeUp bloqueado por estado
      return; // Evitar múltiples ejecuciones
    }
    
    // Tiempo agotado - perdiendo vida
    timeUpHandledRef.current = true; // Marcar en el ref que ya se manejó el tiempo agotado
    setTimeUpHandled(true); // Marcar que ya se manejó el tiempo agotado
    setIsProcessing(true); // Marcar como procesando para evitar múltiples ejecuciones
    
    // PERDER VIDA PRIMERO
    loseLife();
    
    // Sonido de fallo (MP3 real)
    soundSystem.play('fallo');
    
    addEvent({
      type: 'LEVEL_FAIL',
      data: { level, reason: 'time_up' },
      timestamp: Date.now(),
    });
    
    // Mostrar modal de tiempo agotado
    setShowLevelFailedModal(true);
    
    // Vida perdida por tiempo agotado
  };

  // Formatear tiempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Pausar/reanudar juego - memoizada
  const togglePause = useCallback(() => {
    setPaused(!isPaused);
  }, [isPaused, setPaused]);

  // Calcular puntuación basada en tiempo y giros - memoizada
  const calculateScore = useMemo(() => {
    if (!hasStarted) {
      return 0;
    }
    
    const timeUsed = actualGameTime; // Tiempo real de juego
    const flipsUsed = totalFlips; // Total de giros realizados
    const totalPairs = levelConfig?.pairs || 0;
    
    // Reglas de puntuación:
    // - Base: 50 puntos por par completado
    // - Penalización por tiempo: -2 puntos por segundo
    // - Penalización por giros: -1 punto por giro
    // - Bonus por eficiencia: +10 puntos si usas menos giros que el mínimo teórico
    
    const baseScore = totalPairs * 50; // 50 puntos por par
    const timePenalty = Math.floor(timeUsed * 2); // -2 puntos por segundo
    const flipPenalty = Math.floor(flipsUsed * 1); // -1 punto por giro
    
    // Bonus por eficiencia (menos giros que el mínimo teórico)
    const minFlips = totalPairs * 2; // Mínimo teórico: 2 giros por par
    const efficiencyBonus = Math.max(0, (minFlips - flipsUsed) * 10);
    
    const finalScore = baseScore - timePenalty - flipPenalty + efficiencyBonus;
    
    // Cálculo de puntuación completado
    
    return Math.max(0, finalScore);
  }, [hasStarted, actualGameTime, totalFlips, levelConfig]);

  const launchFlyingCoins = (fromX: number, fromY: number, amount: number) => {
    const coins: Array<{id: number, x: number, y: number, targetX: number, targetY: number}> = [];
    for (let i = 0; i < amount; i++) {
      coins.push({
        id: Date.now() + i,
        x: fromX,
        y: fromY,
        targetX: window.innerWidth - 100, // Posición del contador de monedas
        targetY: 100
      });
    }
    setFlyingCoins(prev => [...prev, ...coins]);
    
    // Remover las monedas después de la animación
    setTimeout(() => {
      setFlyingCoins(prev => prev.filter(coin => !coins.some(c => c.id === coin.id)));
    }, 1000);
  };

  // Manejar acciones del modal
  const handleNextLevel = async () => {
    // Avanzando al siguiente nivel
    
    // ✅ Incrementar contador de niveles completados
    const { incrementLevelCompleted, shouldShowInterstitial } = useGameStore.getState();
    incrementLevelCompleted();
    
    // Añadir las monedas ya calculadas
    addCoins(earnedCoins);
    
    setShowLevelCompleteModal(false);
    
    // ✅ Verificar si mostrar anuncio intersticial (cada 5 niveles)
    if (shouldShowInterstitial()) {
      console.log('🎯 Mostrando anuncio intersticial (cada 5 niveles)');
      try {
        await showInterstitialAd();
        console.log('✅ Anuncio intersticial completado');
      } catch (error) {
        console.warn('❌ Error mostrando anuncio intersticial:', error);
      }
    }
    
    // ✅ El padre (MemoFlipApp.tsx) se encarga de:
    // - Actualizar el nivel en el store
    // - Guardar en servidor
    await onLevelComplete();
  };

  const handlePlayAgain = async () => {
    setShowLevelCompleteModal(false);
    
    // Reinicializar el nivel actual
    const config = await getLevelFromJson(level);
    setLevelConfig(config);
    setCurrentLevelConfig(config);
    setLocalTimeLeft(0); // Resetear tiempo transcurrido
    
    // Obtener tema de color según el nivel
    const colorTheme = isBossLevel(level) ? getBossColorTheme(level) : getColorThemeForLevel(level);
    setColorTheme(colorTheme);
    
    // Obtener imagen de portada aleatoria
    const portadaImage = getRandomPortada();
    setThemeBackImage(portadaImage);
    
    // Cargar cartas disponibles si no están cargadas
    loadAvailableCards();
    
    // Verificar si el nivel tiene mecánica trio
    const hasTrioMechanic = config.mechanics && config.mechanics.includes('trio');
    
    // Crear cartas aleatorias del pool simple
    const randomCards = getRandomCards(config.pairs, hasTrioMechanic);
    
    // Convertir SimpleCard a Card y aplicar mecánicas
    const cardsWithMechanics = randomCards.map(card => {
      const gameCard: Card = {
        id: card.id,
        value: card.fileName,
        image: card.image,
        isFlipped: false,
        isMatched: false,
        isVisible: true,
        mechanic: undefined
      };
      
      const availableMechanics = config.mechanics.filter(m => m !== 'basic' && m !== 'trio');
      if (availableMechanics.length > 0 && Math.random() < 0.4) { // 40% de probabilidad
        const randomMechanic = availableMechanics[Math.floor(Math.random() * availableMechanics.length)];
        return applyMechanic(gameCard, randomMechanic);
      }
      return gameCard;
    });

    setCurrentCards(cardsWithMechanics);
  };

  const handleBackToMenu = () => {
    setShowLevelCompleteModal(false);
    onBack();
  };


  // Estado para las partículas (solo en cliente)
  const [particles, setParticles] = useState<Array<{id: number, left: string, top: string}>>([]);

  // Crear partículas solo en el cliente
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }));
      setParticles(newParticles);
    }
  }, []);

  // No usar useEffect para verificar nivel completo - se ejecuta desde handleCardClick

  return (
    <>
      <style jsx>{`
        .card {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 14px;
          transform-style: preserve-3d;
          perspective: 1000px;
          transition: transform 0.6s ease;
        }
        
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 0.6s ease;
        }
        
        .card.flipped .card-inner {
          transform: rotateY(180deg);
        }
        
        .card-front, .card-back {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          top: 0;
          left: 0;
          border-radius: 14px;
          display: grid;
          place-items: center;
        }
        
        .card-back {
          background: linear-gradient(135deg,
            rgba(99,102,241,.3),
            rgba(217,70,239,.3),
            rgba(14,165,233,.3));
          border: 1px solid rgba(255,255,255,.2);
          font-size: 28px;
        }
        
        .card-front {
          background: transparent;
          color: #0f172a;
          font-size: 48px;
          transform: rotateY(180deg);
          border: 1px solid rgba(255,255,255,.2);
        }
        
        .card.matched {
          background: rgba(16, 185, 129, 0.2);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
        }
        
        .card:not(:disabled):hover { transform: scale(1.02); }
        .card:not(:disabled):active { transform: scale(0.98); }
        
        .flying-coin {
          position: fixed;
          z-index: 1000;
          pointer-events: none;
          animation: flyToTarget 1s ease-out forwards;
        }
        
         @keyframes flyToTarget {
           0% {
             transform: translate(0, 0) scale(1);
             opacity: 1;
           }
           100% {
             transform: translate(var(--target-x), var(--target-y)) scale(0.5);
             opacity: 0;
           }
         }
         
         @keyframes shake {
           0% {
             transform: translateX(0) rotate(0deg);
           }
           25% {
             transform: translateX(-2px) rotate(-1deg);
           }
           50% {
             transform: translateX(2px) rotate(1deg);
           }
           75% {
             transform: translateX(-1px) rotate(-0.5deg);
           }
           100% {
             transform: translateX(1px) rotate(0.5deg);
           }
         }
      `}</style>
      <div 
        className="relative"
        style={{
          background: 'linear-gradient(135deg, #312e81, #581c87, #0f172a)',
          color: '#e5e7eb',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '0.5rem',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0
        }}
      >
      <div className="w-full h-full overflow-y-auto" style={{ padding: '0.5rem 1rem 0.2rem 1rem' }}>
        <div className="max-w-4xl mx-auto w-full" style={{ maxHeight: '100%' }}>
          {/* Fila 1: Logo centrado + controles a la derecha */}
          <div className="flex justify-between items-start mb-3 -mt-3">
            {/* Espacio vacío a la izquierda para centrar el logo */}
            <div className="w-16"></div>
            
            {/* Logo centrado 128x128 */}
            <img 
              src="/logo.png" 
              alt="MemoFlip" 
              className="w-32 h-32 object-contain"
            />
            
         {/* Trofeo, sonido y engranaje a la derecha */}
        <div className="flex items-center gap-2" style={{ marginTop: '2rem' }}>
           <button
             onClick={() => setShowRankingModal(true)}
             className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
             title="Ranking"
           >
             <Trophy className="w-5 h-5 text-white" />
           </button>
           
           <button
             onClick={toggleSound}
             className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
             title={soundEnabled ? "Desactivar sonidos" : "Activar sonidos"}
           >
             {soundEnabled ? (
               <Volume2 className="w-5 h-5 text-white" />
             ) : (
               <VolumeX className="w-5 h-5 text-white" />
             )}
           </button>
           
           <button
             onClick={() => setShowSettingsModal(true)}
             className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
             title="Ajustes"
           >
             <Settings className="w-5 h-5 text-white" />
           </button>
           
           
        </div>
      </div>

          {/* Fila 2: Corazón izquierda + monedas derecha (compacta) */}
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/20" style={{ marginTop: '-50px' }}>
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/20 h-10">
              <Heart className="w-5 h-5 text-white" />
              <span className="text-base font-semibold">{lives}</span>
              {lives < 3 && (
                <div className="ml-2 text-[10px] text-gray-300">
                  <span>{formatTimeUntilNextLife()}</span>
                </div>
              )}
              </div>
              
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/20 h-10">
              <Coins className="w-5 h-5 text-white" />
              <span className="text-base font-semibold">{coins}</span>
        </div>
              </div>
              
          {/* Nivel, tiempo+giros y controles */}
          <header className="flex justify-between items-center mb-4">
            {/* Nivel a la izquierda */}
            <div className="h-8 flex items-center">
              <h2 className="text-lg font-bold m-0">Nivel {level}</h2>
              </div>
              
            {/* Tiempo y giros en el centro */}
                <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20 h-8">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold">{formatTime(actualGameTime)}</span>
                </div>
              
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20 h-8">
                <RotateCcw className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold">{totalFlips}</span>
                </div>
            </div>
            
            {/* Botón de pausa solo a la derecha */}
            <div className="h-8 flex items-center">
              <button
                className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition h-8 w-8 flex items-center justify-center"
              onClick={togglePause}
                title={isPaused ? "Continuar" : "Pausa"}
            >
                {isPaused ? (
                  <Play className="w-4 h-4 text-white" />
                ) : (
                  <Pause className="w-4 h-4 text-white" />
                )}
              </button>
          </div>
          </header>

          {/* Barra de cronómetro */}
          {levelConfig && levelConfig.timeSec > 0 && (
            <div className="mb-4 flex justify-center">
              <div 
                className="rounded-full overflow-hidden"
                style={{
                  width: '400px',
                  height: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <div 
                  className="h-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${Math.max(0, ((levelConfig.timeSec - localTimeLeft) / levelConfig.timeSec) * 100)}%`,
                    background: `linear-gradient(90deg, 
                      ${localTimeLeft >= levelConfig.timeSec * 0.7 ? '#ef4444' : 
                        localTimeLeft >= levelConfig.timeSec * 0.4 ? '#f59e0b' : '#fbbf24'}, 
                      ${localTimeLeft >= levelConfig.timeSec * 0.7 ? '#dc2626' : 
                        localTimeLeft >= levelConfig.timeSec * 0.4 ? '#d97706' : '#f59e0b'})`
                  }}
                />
        </div>
      </div>
          )}

          {/* GRID - EXACTO como el JS con celdas visibles */}
          <section 
            className="rounded-2xl p-4"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: '20px',
              padding: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
            }}
          >
            <div 
              className={`grid gap-3 transition-all duration-500 ${
                chameleonColor === 'green' ? 'filter hue-rotate-90 saturate-150' :
                chameleonColor === 'red' ? 'filter hue-rotate-180 saturate-150' :
                chameleonColor === 'blue' ? 'filter hue-rotate-240 saturate-150' :
                chameleonColor === 'yellow' ? 'filter hue-rotate-60 saturate-150' :
                ''
              }`}
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px'
              }}
            >
              {/* Crear 24 slots visibles como en el JS */}
              {Array.from({ length: 24 }, (_, slotIndex) => {
                // Encontrar la carta que corresponde a este slot
                const card = currentCards.find(c => c.slot === slotIndex);
                
                if (card) {
                const visualEffects = getMechanicVisualEffects(card);
                
                // Agregar efecto visual de congelación si la carta está congelada
                const frozenEffects = isCardFrozen(card.id) 
                  ? 'opacity-80 cursor-not-allowed ring-4 ring-blue-400 bg-blue-200 animate-pulse shadow-lg shadow-blue-400 border-2 border-blue-300'
                  : '';
                
                // Verificar si esta carta es una bomba que explotó
                const isBombExploded = card.mechanic === 'bomb' && card.mechanicData && 
                  Boolean((card.mechanicData as Record<string, unknown>).isExploded);
                
                return (
                    <button
                      key={card.id}
                      data-card-id={card.id}
                      onClick={() => handleCardClick(card.id)}
                      disabled={(() => {
                        // Usar la misma lógica robusta que en handleCardClick
                        const manuallyFlippedFromState = flippedCards.filter(cardId => {
                          const c = currentCards.find(c => c.id === cardId);
                          return c && c.mechanic !== 'peeked_card';
                        }).length;
                        
                        const manuallyFlippedFromCards = currentCards.filter(c => 
                          c.isFlipped && 
                          !c.isMatched && 
                          c.mechanic !== 'peeked_card'
                        ).length;
                        
                        const manuallyFlippedForButton = Math.max(manuallyFlippedFromState, manuallyFlippedFromCards);
                        const maxFlippedForButton = levelConfig?.mechanics && levelConfig.mechanics.includes('trio') ? 3 : 2;

                        const isAutoPeekCard =
                          card.mechanic === 'peeked_card' &&
                          !!card.mechanicData?.peeked;

                        return (
                          card.isMatched ||
                          isPaused ||  // 👈 Bloquear si está pausado
                          (manuallyFlippedForButton >= maxFlippedForButton && !card.isFlipped) ||
                          (isClickProcessing && !isAutoPeekCard) ||  // 👈 no bloquees peek
                          isBombExploded ||
                          isCardFrozen(card.id)
                        );
                      })()}
                      className={`
                        card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}
                        ${visualEffects} ${frozenEffects}
                        ${isBombExploded ? 'opacity-0 scale-0 transition-all duration-300' : ''}
                      `}
                      style={{
                        border: 'none',
                        background: 'transparent',
        cursor: (() => {
          // Usar la misma lógica robusta
          const manuallyFlippedFromState = flippedCards.filter(cardId => {
            const c = currentCards.find(c => c.id === cardId);
            return c && c.mechanic !== 'peeked_card';
          }).length;
          
          const manuallyFlippedFromCards = currentCards.filter(c => 
            c.isFlipped && 
            !c.isMatched && 
            c.mechanic !== 'peeked_card'
          ).length;
          
          const manuallyFlippedForCursor = Math.max(manuallyFlippedFromState, manuallyFlippedFromCards);
          const maxFlippedForCursor = levelConfig?.mechanics && levelConfig.mechanics.includes('trio') ? 3 : 2;

          const isAutoPeekCard =
            card.mechanic === 'peeked_card' &&
            !!card.mechanicData?.peeked;

          const isDisabled = 
            card.isMatched ||
            isPaused ||  // 👈 Bloquear si está pausado
            (manuallyFlippedForCursor >= maxFlippedForCursor && !card.isFlipped) ||
            (isClickProcessing && !isAutoPeekCard) ||
            isBombExploded ||
            isCardFrozen(card.id);

          return isDisabled ? 'not-allowed' : 'pointer';
        })(),
                        transform: levelConfig?.mechanics?.includes('rotation') && globalRotation[card.id] !== undefined
                          ? `rotate(${globalRotation[card.id]}deg)`
                          : getMechanicTransform(card)
                      }}
                    >

                      {/* Mostrar fantasma cuando la carta ghost está oculta */}
                      {card.mechanic === 'ghost' && !card.isMatched && !card.isVisible && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <div className="text-6xl opacity-90 animate-pulse">
                            👻
                          </div>
                        </div>
                      )}
                      
                      {/* Mostrar carta normal SIEMPRE (como siempre ha sido) */}
                      <div className="card-inner" style={{
                        opacity: card.mechanic === 'peeked_card' && !card.isVisible ? 0 : 1,
                        transition: 'opacity 0.3s ease-in-out'
                      }}>
                        
                        {/* Efecto de hielo para cartas congeladas */}
                        {isCardFrozen(card.id) && (
                          <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                            <div className="text-4xl opacity-90 animate-pulse">
                              ❄️
                            </div>
                          </div>
                        )}
                          {/* Cara frontal (reverso) — Logo/Portada */}
                          <div className="card-back">
                            <img 
                              src={themeBackImage} 
                              alt="MemoFlip" 
                        style={{
                                width: '90%',
                                height: '90%',
                                objectFit: 'contain',
                                display: 'block',
                                userSelect: 'none',
                              }}
                            />
                      </div>

                          {/* Cara trasera (anverso) — Imagen de la carta */}
                          <div className="card-front">
                            <img 
                              src={card.image} 
                              alt={`Carta ${card.value}`} 
                        style={{
                                width: '64px',
                                height: '64px',
                                objectFit: 'contain',
                                display: 'block',
                                userSelect: 'none',
                              }}
                            />
                      </div>
                  </div>

                      {/* Halo verde para cartas matched */}
                      {card.isMatched && (
                        <div 
                          className="absolute inset-0 rounded-2xl"
                        style={{
                            boxShadow: '0 0 30px 8px rgba(16,185,129,0.35)',
                            outline: '4px solid rgba(16,185,129,0.60)'
                          }}
                        />
                      )}
                    </button>
                  );
                } else {
                  // Slot vacío - mostrar celda vacía como en el JS
                  return (
                    <div
                      key={`empty-${slotIndex}`}
                      className="rounded-2xl"
                      style={{
                        width: '100%',
                        aspectRatio: '1/1',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '14px',
                        background: 'rgba(255,255,255,0.05)'
                      }}
                    />
                  );
                }
              })}
          </div>
          </section>

          {/* Información de Mecánica - Rectángulo pequeño como estaba originalmente */}
          {levelConfig && levelConfig.mechanics && levelConfig.mechanics.length > 0 && (
            <div className="mt-3 flex justify-center">
              <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="text-lg">
                    {levelConfig.mechanics.includes('basic') ? '🎴' : 
                     levelConfig.mechanics.includes('bomb') ? '💣' :
                     levelConfig.mechanics.includes('frozen') ? '❄️' :
                     levelConfig.mechanics.includes('rotation') ? '🔄' :
                     levelConfig.mechanics.includes('fog') ? '🌫️' :
                     levelConfig.mechanics.includes('ghost') ? '👻' :
                     levelConfig.mechanics.includes('peeked_card') ? '👁️' :
                     levelConfig.mechanics.includes('chameleon') ? '🦎' :
                     levelConfig.mechanics.includes('trio') ? '🔺' :
                     levelConfig.mechanics.includes('combo') ? '⚡' :
                     levelConfig.mechanics.includes('darkness') ? '🌑' : '🎯'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xs">
                      {levelConfig.mechanics.includes('basic') ? 'Mecánica Básica' : 
                       levelConfig.mechanics.includes('bomb') ? 'Bomba' :
                       levelConfig.mechanics.includes('frozen') ? 'Congelación' :
                       levelConfig.mechanics.includes('rotation') ? 'Rotación' :
                       levelConfig.mechanics.includes('fog') ? 'Niebla' :
                       levelConfig.mechanics.includes('ghost') ? 'Fantasma' :
                       levelConfig.mechanics.includes('peeked_card') ? 'Vista Previa' :
                       levelConfig.mechanics.includes('chameleon') ? 'Camaleón' :
                       levelConfig.mechanics.includes('trio') ? 'Trío' :
                       levelConfig.mechanics.includes('combo') ? 'Combo' :
                       levelConfig.mechanics.includes('darkness') ? 'Oscuridad' : 'Mecánica Especial'}
                    </h3>
                    <p className="text-gray-300 text-xs leading-tight">
                      {levelConfig.mechanics.includes('basic') ? 'Encuentra las parejas iguales' :
                       levelConfig.mechanics.includes('bomb') ? '¡Cuidado con las bombas!' :
                       levelConfig.mechanics.includes('frozen') ? 'Algunas cartas se congelan temporalmente' :
                       levelConfig.mechanics.includes('rotation') ? 'El tablero rota automáticamente' :
                       levelConfig.mechanics.includes('fog') ? 'Las cartas se ven borrosas' :
                       levelConfig.mechanics.includes('ghost') ? 'Las cartas aparecen y desaparecen' :
                       levelConfig.mechanics.includes('peeked_card') ? 'Una carta se muestra al inicio' :
                       levelConfig.mechanics.includes('chameleon') ? 'Todo el grid cambia de color' :
                       levelConfig.mechanics.includes('trio') ? 'Necesitas grupos de 3 cartas' :
                       levelConfig.mechanics.includes('combo') ? 'Bonificaciones por aciertos consecutivos' :
                       levelConfig.mechanics.includes('darkness') ? 'La pantalla se oscurece periódicamente' : 'Mecánica especial del nivel'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowMechanicHelp(true)}
                    className="ml-2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    title="Ayuda"
                  >
                    <span className="text-white text-xs">?</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>
        </div>

      {/* Modal Victoria */}
      <AnimatePresence>
        {showLevelCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLevelCompleteModal(false)}
            />
            
            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm mx-4">
              <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-center p-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/10 border border-white/20">
                      <Trophy className="w-4 h-4 text-yellow-400" />
                    </div>
                    <h2 className="text-lg font-bold text-white">¡Nivel Superado!</h2>
                  </div>
      </div>

                {/* Content */}
                <div className="p-4 text-center">
                  {/* Animación Lottie */}
                  <div className="flex justify-center mb-4">
                    <Lottie 
                      animationData={partidaGanadaAnimation}
                      loop={false}
                      autoplay={true}
                      style={{ width: '120px', height: '120px' }}
                    />
          </div>
                  
                  {/* Estadísticas */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>Tiempo: <span className="font-semibold text-white">{formatTime(actualGameTime)}</span></span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                      <RotateCcw className="w-4 h-4" />
                      <span>Giros: <span className="font-semibold text-white">{totalFlips}</span></span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-lg">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold text-yellow-400">+ {earnedCoins} monedas</span>
        </div>
      </div>

                  {/* Botón Siguiente Nivel */}
                  <div className="flex justify-center">
                    <button 
                      onClick={handleNextLevel}
                      className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold hover:from-yellow-500 hover:to-yellow-600 transition"
                    >
                      Siguiente Nivel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Partida Perdida */}
        {showLevelFailedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowLevelFailedModal(false)}
            />
            
            {/* Modal */}
            <div className="relative z-10 w-full max-w-sm mx-4">
              <div className="bg-gradient-to-br from-slate-800 via-red-900 to-slate-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-center p-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded-lg bg-white/10 border border-white/20">
                      <Heart className="w-4 h-4 text-red-400" />
                    </div>
                    <h2 className="text-base font-bold text-white">¡Tiempo Agotado!</h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 text-center">
                  {/* Corazón roto con temblor */}
                  <div className="flex justify-center mb-3">
                    <div 
                      className="text-red-500"
                      style={{
                        fontSize: '60px',
                        animation: 'shake 0.5s ease-in-out infinite alternate',
                        filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))'
                      }}
                    >
                      💔
                    </div>
                  </div>
                  
                  {/* Información */}
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-300 text-sm">
                      Se acabó el tiempo para el nivel <span className="font-semibold text-white">{level}</span>
                    </p>
                    
                    {/* Tiempo del nivel */}
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400">Tiempo límite: {formatTime(levelConfig?.timeSec || 0)}</span>
                    </div>
                    
                    {/* Monedas ganadas */}
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <Coins className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400">Monedas ganadas: {earnedCoins}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-base">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="font-bold text-red-400">Vidas restantes: {lives}</span>
                    </div>
                  </div>

                  {/* Botones */}
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setShowLevelFailedModal(false);
                        window.location.href = '/';
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition text-sm"
                >
                  Salir
                    </button>
                    <button 
                      onClick={() => {
                        setShowLevelFailedModal(false);
                        // Solo reiniciar el nivel actual, no todo el juego
                        setHasStarted(false);
                        setLocalTimeLeft(0);
                        setActualGameTime(0);
                        setTotalFlips(0);
                        setFlippedCards([]);
                        setIsProcessing(false);
                        setTimeUpHandled(false);
                        timeUpHandledRef.current = false;
                        // Reintentando nivel
                        initializeLevel();
                      }}
                      className="flex-1 px-3 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-bold hover:from-red-600 hover:to-red-700 transition text-sm"
                    >
                      Reintentar
                    </button>
              </div>
                </div>
              </div>
            </div>
              </div>
        )}
      </AnimatePresence>

      {/* Monedas volando */}
      {flyingCoins.map(coin => (
        <div
          key={coin.id}
          className="flying-coin"
          style={{
            left: coin.x,
            top: coin.y,
            '--target-x': `${coin.targetX - coin.x}px`,
            '--target-y': `${coin.targetY - coin.y}px`,
          } as React.CSSProperties}
        >
          <Coins className="w-6 h-6 text-yellow-400" />
        </div>
      ))}

      {/* Modales */}
      <SettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)}
        onLogout={onBack}
      />
      
      <RankingModal 
        isOpen={showRankingModal} 
        onClose={() => setShowRankingModal(false)} 
      />

      {/* Animación de Introducción de Mecánicas */}
      <AnimatePresence>
        {showMechanicIntro && levelConfig && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-gradient-to-br from-white/20 via-white/15 to-white/10 backdrop-blur-sm rounded-2xl border border-white/30 shadow-2xl p-6 max-w-sm mx-4">
              <div className="text-center">
                <h3 className="text-xl font-bold text-white mb-4">
                  ¡Desafío Especial!
                </h3>
                
                <div className="space-y-3">
                  {levelConfig.mechanics
                    .filter(m => m !== 'basic')
                    .map((mechanic, index) => (
                      <motion.div
                        key={mechanic}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.3 }}
                        className="flex items-center justify-center gap-3 bg-purple-600/50 rounded-lg p-3"
                      >
                        <span className="text-2xl">
                          {getMechanicIcon(mechanic)}
                        </span>
                        <span className="text-white font-medium capitalize">
                          {mechanic === 'fog' ? 'Niebla' :
                           mechanic === 'ghost' ? 'Fantasma' :
                           mechanic === 'bomb' ? 'Bomba' :
                           mechanic === 'chameleon' ? 'Camaleón' :
                           mechanic === 'darkness' ? 'Oscuridad' :
                           mechanic === 'rotation' ? 'Rotación' :
                           mechanic === 'frozen' ? 'Congelado' :
                           mechanic === 'peeked_card' ? 'Vista Previa' :
                           mechanic === 'trio' ? 'Trío' :
                           mechanic}
                        </span>
                      </motion.div>
                    ))}
                </div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-sm text-gray-300"
                >
                  ¡Demuestra tu habilidad!
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Ayuda de Mecánicas */}
      {showMechanicHelp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">Mecánicas del Juego</h2>
              <button
                onClick={() => setShowMechanicHelp(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {levelConfig?.mechanics?.map(mechanic => {
                const getMechanicInfo = (mech: string) => {
                  switch(mech) {
                    case 'basic':
                      return {
                        icon: '🎯',
                        name: 'Básica',
                        description: 'Mecánica estándar sin efectos especiales. Simplemente encuentra las parejas iguales.'
                      };
                    case 'ghost':
                      return {
                        icon: '👻',
                        name: 'Fantasma',
                        description: 'Las cartas aparecen y desaparecen. Cuando están ocultas, se muestra un fantasma en su lugar.'
                      };
                    case 'fog':
                      return {
                        icon: '💨',
                        name: 'Niebla',
                        description: 'Las cartas se ven borrosas y semi-transparentes, dificultando su identificación.'
                      };
                    case 'chameleon':
                      return {
                        icon: '🦎',
                        name: 'Camaleón',
                        description: 'Todo el grid cambia de color periódicamente (verde, rojo, azul, amarillo) para confundir.'
                      };
                    case 'bomb':
                      return {
                        icon: '💣',
                        name: 'Bomba',
                        description: '20% de cartas tienen bombas. Al tocar una, todas pasan de amarillo → naranja → rojo → explotan.'
                      };
                    case 'trio':
                      return {
                        icon: '🔺',
                        name: 'Trío',
                        description: 'En lugar de parejas, necesitas hacer grupos de 3 cartas idénticas.'
                      };
                    case 'rotation':
                      return {
                        icon: '🔄',
                        name: 'Rotación',
                        description: 'El tablero rota periódicamente, cambiando la orientación de las cartas.'
                      };
                    case 'peeked_card':
                      return {
                        icon: '👁️',
                        name: 'Vista Previa',
                        description: 'Una carta se muestra brevemente al inicio para darte una pista.'
                      };
                    case 'combo':
                      return {
                        icon: '⚡',
                        name: 'Combo',
                        description: 'Bonificaciones por hacer secuencias de aciertos consecutivos.'
                      };
                    case 'frozen':
                      return {
                        icon: '🧊',
                        name: 'Congelación',
                        description: 'Algunas cartas se congelan temporalmente y no se pueden voltear. Las cartas emparejadas nunca se congelan.'
                      };
                    case 'darkness':
                      return {
                        icon: '🌑',
                        name: 'Oscuridad',
                        description: 'Toda la pantalla se oscurece periódicamente, dificultando la visión.'
                      };
                    default:
                      return {
                        icon: '🎯',
                        name: 'Especial',
                        description: 'Mecánica especial del nivel.'
                      };
                  }
                };

                const mechanicInfo = getMechanicInfo(mechanic);
                
                return (
                  <div key={mechanic} className="bg-white/10 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{mechanicInfo.icon}</span>
                      <h3 className="text-white font-semibold">{mechanicInfo.name}</h3>
                    </div>
                    <p className="text-gray-300 text-sm">{mechanicInfo.description}</p>
    </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal Game Over */}
      <AnimatePresence>
        {showGameOverModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowGameOverModal(false)}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative bg-gradient-to-br from-red-900/90 to-red-800/90 backdrop-blur-xl rounded-2xl p-8 mx-4 max-w-md w-full border border-red-500/30 shadow-2xl"
            >
              <div className="text-center">
                {/* Icono */}
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                    <span className="text-6xl">💀</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">¡GAME OVER!</h2>
                  <p className="text-red-200">Se han agotado todas las vidas</p>
                </div>

                {/* Estadísticas */}
                <div className="bg-black/20 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center">
                      <div className="text-white font-semibold">Nivel alcanzado</div>
                      <div className="text-yellow-400 text-xl font-bold">{level}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-semibold">Monedas ganadas</div>
                      <div className="text-yellow-400 text-xl font-bold">{coins}</div>
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowGameOverModal(false);
                      resetGame();
                      setCurrentLevel(1);
                    }}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    🎮 Jugar de nuevo
                  </button>
                  <button
                    onClick={() => {
                      setShowGameOverModal(false);
                      onBack();
                    }}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    🏠 Menú
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Sin Vidas */}
      <NoLivesModal
        isOpen={showNoLivesModal}
        onClose={handleCloseNoLivesModal}
        onWatchAd={handleWatchAdForLife}
      />
    </div>
    </>
  );
}
