'use client';

import React from 'react';
import { X, Trophy, Medal, Crown, Star } from 'lucide-react';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Datos de ejemplo para el ranking
const mockRankingData = [
  { position: 1, name: 'MemoMaster', level: 847, coins: 12500, avatar: '👑' },
  { position: 2, name: 'CardWizard', level: 623, coins: 9800, avatar: '🧙‍♂️' },
  { position: 3, name: 'FlipChamp', level: 445, coins: 7200, avatar: '🏆' },
  { position: 4, name: 'MemoryPro', level: 389, coins: 6500, avatar: '🎯' },
  { position: 5, name: 'BrainTrainer', level: 312, coins: 5200, avatar: '🧠' },
  { position: 6, name: 'QuickMatch', level: 298, coins: 4800, avatar: '⚡' },
  { position: 7, name: 'CardHunter', level: 267, coins: 4200, avatar: '🎴' },
  { position: 8, name: 'PuzzleSolver', level: 234, coins: 3800, avatar: '🧩' },
  { position: 9, name: 'SpeedRunner', level: 198, coins: 3200, avatar: '🏃‍♂️' },
  { position: 10, name: 'You', level: 156, coins: 2800, avatar: '👤' },
];

export default function RankingModal({ isOpen, onClose }: RankingModalProps) {

  if (!isOpen) return null;

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-white font-bold text-lg">#{position}</span>;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-400/30';
      case 2:
        return 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/30';
      case 3:
        return 'bg-gradient-to-r from-amber-500/20 to-amber-600/20 border-amber-400/30';
      default:
        return 'bg-white/5 border-white/10';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/10 border border-white/20">
                <Trophy className="w-5 h-5 text-yellow-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Ranking Global</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>


          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            <div className="space-y-2">
              {mockRankingData.map((player) => (
                <div
                  key={player.position}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${getPositionColor(player.position)}`}
                >
                  {/* Posición */}
                  <div className="flex-shrink-0">
                    {getPositionIcon(player.position)}
                  </div>

                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-lg">
                      {player.avatar}
                    </div>
                  </div>

                  {/* Info del jugador */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-sm truncate">
                      {player.name}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Nivel {player.level}
                    </p>
                  </div>

                  {/* Monedas */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-yellow-400 font-semibold text-sm">
                      {player.coins.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">monedas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-white/5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Actualizado hace 2 minutos
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Star className="w-3 h-3" />
                Tu posición: #10
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
