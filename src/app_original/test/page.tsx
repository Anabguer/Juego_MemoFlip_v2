'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getLevelFromJson, getAllLevels } from '@/data/levels';
import { Card } from '@/types/game';
import { getRandomCards, getRandomPortada, loadAvailableCards } from '@/lib/simpleCardSystem';
import { applyMechanic, updateMechanics, canFlipCard, getMechanicVisualEffects, getMechanicIcon } from '@/lib/mechanics';
import { soundSystem } from '@/lib/soundSystem';
import { 
  Heart, 
  Coins, 
  Settings, 
  Trophy, 
  Pause, 
  X, 
  Volume2, 
  VolumeX,
  Clock,
  RotateCcw,
  Play,
  ArrowLeft
} from 'lucide-react';
import Lottie from 'lottie-react';
import partidaGanadaAnimation from '@/data/messages/partida_ganada.json';

export default function TestPage() {
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentCards, setCurrentCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [localTimeLeft, setLocalTimeLeft] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showLevelCompleteModal, setShowLevelCompleteModal] = useState(false);
  const [showLevelFailedModal, setShowLevelFailedModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isClickProcessing, setIsClickProcessing] = useState(false);
  const [flyingCoins, setFlyingCoins] = useState<Array<{id: number, x: number, y: number, targetX: number, targetY: number}>>([]);

  const { 
    currentLevel, 
    coins, 
    lives, 
    setCurrentLevel, 
    addCoins, 
    loseLife, 
    flipCard, 
    closeCard, 
    matchCards,
    resetGame
  } = useGameStore();

  const levelConfig = getLevelFromJson(selectedLevel);
  const allLevels = getAllLevels();

  // Cargar cartas disponibles
  useEffect(() => {
    loadAvailableCards();
  }, []);

  // Inicializar nivel
  const initializeLevel = () => {
    if (!levelConfig) return;

    const randomCards = getRandomCards(levelConfig.pairs);
    const themeBackImage = getRandomPortada();
    
    // Función para centrar cartas en grid de 24 slots
    const centeredIndices = (totalCards: number) => {
      const gridSize = 24;
      const startIndex = Math.floor((gridSize - totalCards) / 2);
      return Array.from({ length: totalCards }, (_, i) => startIndex + i);
    };

    const cardIndices = centeredIndices(randomCards.length);
    
    const cardsWithSlots: Card[] = randomCards.map((card, index) => ({
      id: card.id,
      value: card.id,
      image: card.image,
      isFlipped: false,
      isMatched: false,
      isVisible: true,
      slot: cardIndices[index]
    }));

    setCurrentCards(cardsWithSlots);
    setFlippedCards([]);
    setLocalTimeLeft(levelConfig.timeSec);
    setHasStarted(false);
    setIsPaused(false);
    setShowLevelCompleteModal(false);
    setShowLevelFailedModal(false);
    
    console.log(`🎮 Nivel ${selectedLevel} inicializado:`, {
      pairs: levelConfig.pairs,
      timeSec: levelConfig.timeSec,
      mechanics: levelConfig.mechanics,
      cards: cardsWithSlots.length
    });
  };

  // Inicializar sonidos
  useEffect(() => {
    soundSystem.initialize();
    soundSystem.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Timer
  useEffect(() => {
    if (!hasStarted || isPaused || showLevelCompleteModal || showLevelFailedModal) return;
    if (levelConfig.timeSec === 0) return; // Sin tiempo límite

    const timer = setInterval(() => {
      setLocalTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, isPaused, showLevelCompleteModal, showLevelFailedModal, levelConfig.timeSec]);

  // Verificar completado
  useEffect(() => {
    if (currentCards.length === 0) return;
    
    const allMatched = currentCards.every(card => card.isMatched);
    if (allMatched && hasStarted) {
      checkLevelComplete();
    }
  }, [currentCards, hasStarted]);

  const handleCardClick = (cardId: string | number) => {
    if (isClickProcessing) return;
    
    const card = currentCards.find(c => c.id === cardId);
    if (!card || card.isMatched || card.isFlipped) return;
    
    if (flippedCards.length >= 2) return;
    
    setIsClickProcessing(true);
    
    // Sonido de carta volteada
    soundSystem.play('cartavolteada');
    
    if (!hasStarted) {
      setHasStarted(true);
    }

    const newFlippedCards = [...flippedCards, cardId as number];
    setFlippedCards(newFlippedCards);
    
    flipCard(cardId);
    
    if (newFlippedCards.length === 2) {
      setTimeout(() => {
        checkMatch(newFlippedCards[0], newFlippedCards[1]);
        setFlippedCards([]);
      }, 1000);
    }
    
    setTimeout(() => setIsClickProcessing(false), 100);
  };

  const checkMatch = (cardId1: string | number, cardId2: string | number) => {
    const card1 = currentCards.find(c => c.id === cardId1);
    const card2 = currentCards.find(c => c.id === cardId2);
    
    if (card1 && card2 && card1.value === card2.value) {
      matchCards(cardId1, cardId2);
      addCoins(10);
      
      // Sonidos de éxito
      soundSystem.play('matchexitoso');
      soundSystem.play('coin');
      
      // Lanzar monedas volando
      const card1Element = document.querySelector(`[data-card-id="${cardId1}"]`);
      if (card1Element) {
        const rect = card1Element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        launchFlyingCoins(centerX, centerY, 3);
      }
    } else {
      closeCard(cardId1);
      closeCard(cardId2);
    }
  };

  const checkLevelComplete = () => {
    const earnedCoins = Math.max(10, Math.floor(levelConfig.timeSec / 10));
    addCoins(earnedCoins);
    
    soundSystem.play('acierto');
    setShowLevelCompleteModal(true);
  };

  const handleTimeUp = () => {
    if (showLevelFailedModal || showLevelCompleteModal) return;
    
    loseLife();
    soundSystem.play('fallo');
    setShowLevelFailedModal(true);
  };

  const launchFlyingCoins = (fromX: number, fromY: number, amount: number) => {
    const coins: Array<{id: number, x: number, y: number, targetX: number, targetY: number}> = [];
    for (let i = 0; i < amount; i++) {
      coins.push({
        id: Date.now() + i,
        x: fromX,
        y: fromY,
        targetX: window.innerWidth - 100,
        targetY: 100
      });
    }
    setFlyingCoins(prev => [...prev, ...coins]);
    
    setTimeout(() => {
      setFlyingCoins(prev => prev.filter(coin => !coins.some(c => c.id === coin.id)));
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getMechanicDescription = (mechanic: string) => {
    const mechanics = {
      'basic': {
        icon: '🎴',
        name: 'Mecánica Básica',
        description: 'Encuentra las parejas iguales volteando las cartas. La mecánica fundamental del juego.'
      },
      'fog': {
        icon: '🌫️',
        name: 'Niebla',
        description: 'Algunas cartas están ocultas por la niebla. Tienen opacidad reducida y desenfoque visual.'
      },
      'ghost': {
        icon: '👻',
        name: 'Fantasma',
        description: 'Cartas que aparecen y desaparecen periódicamente. Parpadean con opacidad variable.'
      },
      'bomb': {
        icon: '💣',
        name: 'Bomba',
        description: 'Cartas que explotan si no se encuentran a tiempo. Tienen animación de pulso y borde rojo.'
      },
      'chameleon': {
        icon: '🦎',
        name: 'Camaleón',
        description: 'Cartas que cambian de valor periódicamente. Cambian de color y tienen animación especial.'
      },
      'chain': {
        icon: '⛓️',
        name: 'Cadena',
        description: 'Cartas conectadas que se voltean juntas. Al voltear una, se voltean todas las conectadas.'
      },
      'frozen': {
        icon: '🧊',
        name: 'Congelación',
        description: 'Cartas que se congelan temporalmente. Se muestran en escala de grises y no se pueden voltear.'
      },
      'darkness': {
        icon: '🌑',
        name: 'Oscuridad',
        description: 'Toda la pantalla se oscurece gradualmente. Opacidad reducida y escala de grises.'
      },
      'bonus': {
        icon: '⭐',
        name: 'Bonificación',
        description: 'Gana monedas extra por completar el nivel. Recompensas adicionales por buen rendimiento.'
      },
      'boss': {
        icon: '👑',
        name: 'Nivel Jefe',
        description: 'Nivel especial con mecánicas únicas y recompensas mayores. Mayor dificultad y desafío.'
      },
      'shuffle': {
        icon: '🔀',
        name: 'Reorganización',
        description: 'Las cartas se reorganizan automáticamente durante el juego. Posiciones cambian dinámicamente.'
      }
    };

    return mechanics[mechanic as keyof typeof mechanics] || {
      icon: '🎯',
      name: 'Mecánica Especial',
      description: 'Mecánica única del nivel con efectos especiales.'
    };
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    soundSystem.setEnabled(!soundEnabled);
  };

  const handleNextLevel = () => {
    setSelectedLevel(prev => Math.min(prev + 1, 1000));
    initializeLevel();
  };

  const handlePrevLevel = () => {
    setSelectedLevel(prev => Math.max(prev - 1, 1));
    initializeLevel();
  };

  if (isPlaying) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-start pt-2"
        style={{
          background: 'linear-gradient(135deg, #312e81, #581c87, #0f172a)',
          color: '#e5e7eb',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        {/* Header */}
        <div className="w-full max-w-4xl px-4 mb-4">
          {/* Fila 1: Logo + Controles */}
          <div className="flex justify-between items-start mb-0">
            <div className="w-20"></div>
            
            <img 
              src="/logo.png" 
              alt="MemoFlip" 
              className="w-32 h-32 object-contain"
            />
            
            <div className="flex items-center gap-2">
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
                onClick={() => setIsPlaying(false)}
                className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
                title="Volver al selector"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Fila 2: Corazón + Monedas */}
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/20 -mt-8">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/20 h-10">
              <Heart className="w-5 h-5 text-white" />
              <span className="text-base font-semibold">{lives}</span>
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 border border-white/20 h-10">
              <Coins className="w-5 h-5 text-white" />
              <span className="text-base font-semibold">{coins}</span>
            </div>
          </div>

          {/* Nivel, tiempo+giros y controles */}
          <header className="flex justify-between items-center mb-4">
            <div className="h-8 flex items-center">
              <h2 className="text-lg font-bold m-0">Nivel {selectedLevel}</h2>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20 h-8">
                <Clock className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold">{formatTime(localTimeLeft)}</span>
              </div>
              
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 border border-white/20 h-8">
                <RotateCcw className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold">{currentCards.filter(c => c.isFlipped).length}</span>
              </div>
            </div>

            <div className="h-8 flex items-center">
              <button
                className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition h-8 w-8 flex items-center justify-center"
                onClick={togglePause}
                title="Pausa"
              >
                <Pause className="w-4 h-4 text-white" />
              </button>
            </div>
          </header>

          {/* Barra de cronómetro */}
          {levelConfig.timeSec > 0 && (
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

          {/* Grid de cartas */}
          <div className="grid grid-cols-4 grid-rows-6 gap-2 h-96 mb-4" style={{ maxWidth: '400px', margin: '0 auto' }}>
            {Array.from({ length: 24 }, (_, index) => {
              const card = currentCards.find(c => c.slot === index);
              if (card) {
                const visualEffects = getMechanicVisualEffects(card);
                return (
                  <button
                    key={card.id}
                    data-card-id={card.id}
                    onClick={() => handleCardClick(card.id)}
                    disabled={card.isMatched || (flippedCards.length >= 2 && !card.isFlipped) || isClickProcessing}
                    className={`
                      card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}
                      ${visualEffects}
                    `}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: (card.isMatched || (flippedCards.length >= 2 && !card.isFlipped) || isClickProcessing) ? 'default' : 'pointer'
                    }}
                  >
                    <div className="card-inner">
                      <div className="card-back">
                        <img src="/logo.png" alt="MemoFlip" style={{ width: '64px', height: '64px', objectFit: 'contain', display: 'block', userSelect: 'none' }} />
                      </div>
                      <div className="card-front">
                        <img src={card.image} alt={`Carta ${card.value}`} style={{ width: '64px', height: '64px', objectFit: 'contain', display: 'block', userSelect: 'none' }} />
                      </div>
                    </div>
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
              }
              return (
                <div
                  key={index}
                  className="border border-white/10 rounded-2xl"
                  style={{ aspectRatio: '1' }}
                />
              );
            })}
          </div>

          {/* Información de Mecánica */}
          {levelConfig.mechanics && levelConfig.mechanics.length > 0 && (
            <div className="mt-3 flex justify-center">
              <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="text-lg">
                    {levelConfig.mechanics.includes('basic') ? '🎴' : 
                     levelConfig.mechanics.includes('bomb') ? '💣' :
                     levelConfig.mechanics.includes('frozen') ? '❄️' :
                     levelConfig.mechanics.includes('rotation') ? '🔄' :
                     levelConfig.mechanics.includes('fog') ? '🌫️' :
                     levelConfig.mechanics.includes('ghost') ? '👻' : '🎯'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-xs">
                      {levelConfig.mechanics.includes('basic') ? 'Mecánica Básica' : 
                       levelConfig.mechanics.includes('bomb') ? 'Bomba' :
                       levelConfig.mechanics.includes('frozen') ? 'Congelación' :
                       levelConfig.mechanics.includes('rotation') ? 'Rotación' :
                       levelConfig.mechanics.includes('fog') ? 'Niebla' :
                       levelConfig.mechanics.includes('ghost') ? 'Fantasma' : 'Mecánica Especial'}
                    </h3>
                    <p className="text-gray-300 text-xs leading-tight">
                      {levelConfig.mechanics.includes('basic') ? 'Encuentra las parejas iguales' : 
                       levelConfig.mechanics.includes('bomb') ? '¡Cuidado con las bombas!' :
                       levelConfig.mechanics.includes('frozen') ? 'Algunas cartas se congelan' :
                       levelConfig.mechanics.includes('rotation') ? 'Las cartas rotan' :
                       levelConfig.mechanics.includes('fog') ? 'Algunas cartas están ocultas' :
                       levelConfig.mechanics.includes('ghost') ? 'Cartas fantasma aparecen y desaparecen' : 'Mecánica única del nivel'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modales */}
        {showLevelCompleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative z-10 w-full max-w-md mx-4">
              <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/10 border border-white/20">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h2 className="text-xl font-bold text-white">¡Nivel Superado!</h2>
                  </div>
                  <button
                    onClick={() => setShowLevelCompleteModal(false)}
                    className="p-1.5 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <Lottie 
                      animationData={partidaGanadaAnimation}
                      loop={false}
                      autoplay={true}
                      style={{ width: '150px', height: '150px' }}
                    />
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                      <Clock className="w-4 h-4" />
                      <span>Tiempo: <span className="font-semibold text-white">{formatTime(localTimeLeft)}</span></span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                      <RotateCcw className="w-4 h-4" />
                      <span>Giros: <span className="font-semibold text-white">{currentCards.filter(c => c.isFlipped).length}</span></span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-lg">
                      <Coins className="w-5 h-5 text-yellow-400" />
                      <span className="font-bold text-yellow-400">+ 10 monedas</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setShowLevelCompleteModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
                    >
                      Continuar
                    </button>
                    <button 
                      onClick={handleNextLevel}
                      className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold hover:from-yellow-500 hover:to-yellow-600 transition"
                    >
                      Siguiente Nivel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* CSS para las cartas */}
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
        `}</style>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #312e81, #581c87, #0f172a)',
        color: '#e5e7eb',
        fontFamily: 'system-ui, sans-serif'
      }}
    >
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <img 
            src="/logo.png" 
            alt="MemoFlip" 
            className="w-24 h-24 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold mb-2">🧪 Test de Niveles</h1>
          <p className="text-gray-300">Selecciona cualquier nivel para probar mecánicas</p>
        </div>

        {/* Selector de nivel */}
        <div className="bg-white/10 rounded-2xl p-6 border border-white/20 mb-6">
          <h2 className="text-xl font-bold mb-4">Seleccionar Nivel</h2>
          
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handlePrevLevel}
              disabled={selectedLevel <= 1}
              className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex-1">
              <input
                type="number"
                min="1"
                max="1000"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-center text-lg font-bold"
              />
            </div>
            
            <button
              onClick={handleNextLevel}
              disabled={selectedLevel >= 1000}
              className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
            </button>
          </div>

          {/* Información del nivel */}
          {levelConfig && (
            <div className="bg-white/5 rounded-xl p-4 mb-4">
              <h3 className="text-lg font-bold mb-2">Nivel {selectedLevel}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-300">Pares:</span>
                  <span className="ml-2 font-semibold">{levelConfig.pairs}</span>
                </div>
                <div>
                  <span className="text-gray-300">Tiempo:</span>
                  <span className="ml-2 font-semibold">
                    {levelConfig.timeSec === 0 ? '∞' : `${levelConfig.timeSec}s`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-300">Dificultad:</span>
                  <span className="ml-2 font-semibold">{levelConfig.difficulty}</span>
                </div>
                <div>
                  <span className="text-gray-300">Fase:</span>
                  <span className="ml-2 font-semibold">{levelConfig.phase}</span>
                </div>
              </div>
              
              {levelConfig.mechanics && levelConfig.mechanics.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-300">Mecánicas:</span>
                  <div className="space-y-2 mt-2">
                    {levelConfig.mechanics.map((mechanic, index) => {
                      const mechanicInfo = getMechanicDescription(mechanic);
                      return (
                        <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                          <div className="text-lg">{mechanicInfo.icon}</div>
                          <div className="flex-1">
                            <div className="font-semibold text-sm text-white">{mechanicInfo.name}</div>
                            <div className="text-xs text-gray-300">{mechanicInfo.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              <p className="text-gray-300 text-sm mt-3">{levelConfig.description}</p>
            </div>
          )}

          {/* Botón jugar */}
          <button
            onClick={() => {
              initializeLevel();
              setIsPlaying(true);
            }}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-xl py-4 px-8 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6" />
            Jugar Nivel {selectedLevel}
          </button>
        </div>

        {/* Navegación rápida */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 3, 10, 50, 100, 200, 500, 1000].map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`p-3 rounded-xl border transition ${
                selectedLevel === level
                  ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400'
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
            >
              <div className="text-lg font-bold">Nivel {level}</div>
              <div className="text-xs text-gray-300">
                {level === 1 ? 'Tutorial' :
                 level === 3 ? 'Primer Timer' :
                 level === 10 ? 'Con Timer' :
                 level === 50 ? 'Fase 1' :
                 level === 100 ? 'Fase 2' :
                 level === 200 ? 'Fase 3' :
                 level === 500 ? 'Fase 4' :
                 'Boss Final'}
              </div>
            </button>
          ))}
        </div>

        {/* Botón volver */}
        <div className="text-center mt-6">
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al Juego
          </button>
        </div>
      </div>
    </div>
  );
}
