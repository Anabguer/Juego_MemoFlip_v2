'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Crown, Lock } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { PHASES } from '@/lib/levelGenerator';

interface LevelSelectScreenProps {
  onBack: () => void;
  onSelectLevel: (level: number) => void;
}

export default function LevelSelectScreen({ onBack, onSelectLevel }: LevelSelectScreenProps) {
  const { currentLevel, currentPhase } = useGameStore();
  const [selectedPhase, setSelectedPhase] = useState(currentPhase);

  const currentPhaseData = PHASES.find(p => p.id === selectedPhase) || PHASES[0];
  const levelsPerPhase = 50;
  const startLevel = (selectedPhase - 1) * levelsPerPhase + 1;
  const endLevel = selectedPhase * levelsPerPhase;

  const isLevelUnlocked = (level: number) => level <= currentLevel;
  const isBossLevel = (level: number) => level % 50 === 0;

  const getLevelStars = (level: number) => {
    // Simular estrellas ganadas (esto vendría de la base de datos)
    if (level < currentLevel) {
      return Math.floor(Math.random() * 3) + 1; // 1-3 estrellas aleatorias
    }
    return 0;
  };

  const renderLevelButton = (level: number) => {
    const isUnlocked = isLevelUnlocked(level);
    const isBoss = isBossLevel(level);
    const stars = getLevelStars(level);
    const isCurrent = level === currentLevel;

    return (
      <motion.button
        key={level}
        whileHover={isUnlocked ? { scale: 1.1 } : {}}
        whileTap={isUnlocked ? { scale: 0.95 } : {}}
        onClick={() => isUnlocked && onSelectLevel(level)}
        disabled={!isUnlocked}
        className={`
          relative w-16 h-16 rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all duration-300
          ${isUnlocked 
            ? isBoss
              ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl'
              : isCurrent
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl'
            : 'bg-gray-500 text-gray-300 cursor-not-allowed'
          }
        `}
      >
        {isBoss && (
          <Crown className="absolute -top-2 -right-2 w-6 h-6 text-yellow-300" />
        )}
        
        {!isUnlocked && (
          <Lock className="absolute inset-0 m-auto w-6 h-6" />
        )}
        
        <span className="text-lg font-bold">{level}</span>
        
        {isUnlocked && stars > 0 && (
          <div className="flex gap-1 mt-1">
            {[...Array(3)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < stars ? 'text-yellow-300 fill-current' : 'text-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-xl border-2 border-white/30 hover:bg-white/30 transition-all duration-300"
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        <h1 className="text-2xl font-bold text-white">Seleccionar Nivel</h1>

        <div className="w-12" /> {/* Spacer */}
      </div>

      {/* Selector de fases */}
      <div className="px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {PHASES.map((phase) => (
            <motion.button
              key={phase.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPhase(phase.id)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-lg font-medium transition-all duration-300
                ${selectedPhase === phase.id
                  ? 'bg-white text-blue-600 shadow-lg'
                  : 'bg-white/20 text-white border border-white/30'
                }
              `}
            >
              {phase.name}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Información de la fase */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-6 mb-6"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <h2 className="text-xl font-bold text-white mb-2">{currentPhaseData.name}</h2>
          <p className="text-white/80 text-sm">{currentPhaseData.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-white/60 text-sm">
              Niveles {startLevel}-{endLevel}
            </span>
            <span className="text-white/60 text-sm">
              Progreso: {Math.min(currentLevel - startLevel + 1, levelsPerPhase)}/{levelsPerPhase}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Grid de niveles */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-10 gap-3">
          {Array.from({ length: levelsPerPhase }, (_, i) => startLevel + i).map(renderLevelButton)}
        </div>
      </div>

      {/* Información del progreso */}
      <div className="px-6 pb-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between text-white/80 text-sm">
            <span>Nivel actual: {currentLevel}</span>
            <span>Fase: {currentPhase}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
