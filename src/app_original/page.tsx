'use client';

import { useState, useEffect } from 'react';
import IntroScreen from '@/components/IntroScreen';
import LevelSelector from '@/components/LevelSelector';
import GameScreen from '@/components/GameScreen';
import { useGameStore } from '@/store/gameStore';

type Screen = 'intro' | 'levels' | 'game' | 'settings' | 'ranking';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('intro');
  const [selectedLevel, setSelectedLevel] = useState(1);
  const { setCurrentLevel, addCoins, gainLife, saveProgress, loadProgress, getProgress } = useGameStore();

  // Cargar progreso al inicio
  useEffect(() => {
    loadProgress();
    const progress = getProgress();
    setSelectedLevel(progress.level);
    console.log('📊 Progreso cargado:', progress);
  }, [loadProgress, getProgress]);

  const handleStartGame = () => {
    // Usar el nivel actual del progreso, no siempre 1
    const { getProgress } = useGameStore.getState();
    const progress = getProgress();
    const currentLevel = progress.level;
    
    setCurrentLevel(currentLevel);
    setSelectedLevel(currentLevel);
    setCurrentScreen('game');
  };


  const handleBackToIntro = () => {
    setCurrentScreen('intro');
  };

  const handleSelectLevel = (level: number) => {
    setCurrentLevel(level);
    setSelectedLevel(level);
    setCurrentScreen('game');
  };

  const handleLevelComplete = () => {
    // Avanzar al siguiente nivel
    const nextLevel = selectedLevel + 1;
    
    // Verificar que no exceda el máximo de niveles (1000)
    if (nextLevel <= 1000) {
      setCurrentLevel(nextLevel);
      setSelectedLevel(nextLevel);
      // Permanecer en la pantalla de juego con el nuevo nivel
    } else {
      // Si llegamos al nivel 1000, volver al menú
      setCurrentScreen('intro');
    }
    
    // Guardar progreso
    saveProgress();
  };

  const handleLevelFail = () => {
    // Mostrar modal de nivel fallido (por ahora volver al menú)
    setCurrentScreen('intro');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'intro':
        return (
          <IntroScreen
            onStartGame={handleStartGame}
          />
        );
      
      case 'levels':
        return (
          <LevelSelector
            onBack={handleBackToIntro}
            onLevelSelect={handleSelectLevel}
          />
        );
      
      case 'game':
        return (
          <GameScreen
            key={selectedLevel}
            level={selectedLevel}
            onBack={handleBackToIntro}
            onLevelComplete={handleLevelComplete}
            onLevelFail={handleLevelFail}
          />
        );
      
      case 'settings':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-white text-center">
              <h1 className="text-2xl font-bold mb-4">Configuración</h1>
              <p className="mb-4">Próximamente...</p>
              <button
                onClick={handleBackToIntro}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                Volver
              </button>
            </div>
          </div>
        );
      
      case 'ranking':
        return (
          <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-white text-center">
              <h1 className="text-2xl font-bold mb-4">Ranking</h1>
              <p className="mb-4">Próximamente...</p>
              <button
                onClick={handleBackToIntro}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
              >
                Volver
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen">
      {/* 🎮 MEMOFLIP NEXTJS - PÁGINA PRINCIPAL CORRECTA - VERSIÓN COMPLETA */}
      {renderScreen()}
    </main>
  );
}