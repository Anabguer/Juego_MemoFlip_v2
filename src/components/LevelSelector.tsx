'use client';

import { useState, useEffect } from 'react';
import { getAllLevels, getLevelFromJson, LevelData } from '@/data/levels';
import { getMechanicIcon } from '@/lib/mechanics';

interface LevelSelectorProps {
  onLevelSelect: (level: number) => void;
  onBack: () => void;
}

export default function LevelSelector({ onLevelSelect, onBack }: LevelSelectorProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [allLevels, setAllLevels] = useState<LevelData[]>([]);
  
  useEffect(() => {
    getAllLevels().then(setAllLevels);
  }, []);
  
  // Filtrar niveles por fase actual
  const levelsInCurrentPhase = allLevels.filter(level => level.phase === currentPhase);
  const totalPhases = Math.max(...allLevels.map(l => l.phase));

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return 'Desconocido';
    }
  };

  const formatTime = (timeSec: number) => {
    if (timeSec === 0) return 'Sin límite';
    const minutes = Math.floor(timeSec / 60);
    const seconds = timeSec % 60;
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Seleccionar Nivel</h1>
          <p className="text-white/80">Elige el nivel que quieres jugar</p>
          
          {/* Phase Selector */}
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: totalPhases }, (_, i) => i + 1).map(phase => (
              <button
                key={phase}
                onClick={() => setCurrentPhase(phase)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentPhase === phase
                    ? 'bg-yellow-400 text-black font-bold'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                Fase {phase}
              </button>
            ))}
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-6 px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all"
        >
          ← Volver
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Level List */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Niveles Disponibles - Fase {currentPhase}
                <span className="text-sm font-normal text-white/70 ml-2">
                  ({levelsInCurrentPhase.length} niveles)
                </span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {levelsInCurrentPhase.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setSelectedLevel(level.id)}
                    className={`p-4 rounded-lg text-center transition-all ${
                      selectedLevel === level.id
                        ? 'bg-yellow-400 text-black shadow-lg scale-105'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    } ${level.isBoss ? 'ring-2 ring-yellow-400' : ''}`}
                  >
                    <div className="font-bold text-lg">
                      {level.isBoss ? '👑' : ''} {level.id}
                    </div>
                    <div className="text-sm opacity-80">
                      {level.pairs} pares
                    </div>
                    {level.isBoss && (
                      <div className="text-xs font-bold text-yellow-300">BOSS</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Level Details */}
          <div className="lg:col-span-1">
            {selectedLevel && allLevels.length > 0 ? (
              <LevelDetails 
                level={allLevels.find(l => l.id === selectedLevel)!} 
                onPlay={() => onLevelSelect(selectedLevel)}
              />
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Información del Nivel</h3>
                <p className="text-white/70">Selecciona un nivel para ver sus detalles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface LevelDetailsProps {
  level: LevelData;
  onPlay: () => void;
}

function LevelDetails({ level, onPlay }: LevelDetailsProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'Fácil';
      case 'medium': return 'Medio';
      case 'hard': return 'Difícil';
      default: return 'Desconocido';
    }
  };

  const formatTime = (timeSec: number) => {
    if (timeSec === 0) return 'Sin límite';
    const minutes = Math.floor(timeSec / 60);
    const seconds = timeSec % 60;
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">
          {level.isBoss ? '👑 ' : ''}Nivel {level.id}
        </h3>
        <p className="text-white/80">{level.description}</p>
      </div>

      <div className="space-y-4">
        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-white/70 text-sm">Pares</div>
            <div className="text-white font-bold text-lg">{level.pairs}</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-white/70 text-sm">Tiempo</div>
            <div className="text-white font-bold text-lg">{formatTime(level.timeSec)}</div>
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-white/70 text-sm">Dificultad</div>
          <div className={`font-bold text-lg ${getDifficultyColor(level.difficulty)}`}>
            {getDifficultyText(level.difficulty)}
          </div>
        </div>

        {/* Mechanics */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-white/70 text-sm mb-2">Mecánicas</div>
          <div className="flex flex-wrap gap-2">
            {level.mechanics.map((mechanic, index) => (
              <div
                key={index}
                className="bg-white/20 rounded-lg px-3 py-1 flex items-center gap-2"
              >
                <span className="text-lg">{getMechanicIcon(mechanic)}</span>
                <span className="text-white text-sm capitalize">
                  {mechanic === 'basic' ? 'Básico' : mechanic}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rewards */}
        <div className="bg-white/10 rounded-lg p-3">
          <div className="text-white/70 text-sm">Recompensa</div>
          <div className="text-yellow-400 font-bold text-lg">
            🪙 {level.rewards.coins} monedas
          </div>
        </div>

        {/* Play Button */}
        <button
          onClick={onPlay}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105"
        >
          {level.isBoss ? '👑 JUGAR BOSS' : '🎮 JUGAR NIVEL'}
        </button>
      </div>
    </div>
  );
}
