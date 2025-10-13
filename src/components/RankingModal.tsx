'use client';

import React, { useEffect, useState } from 'react';
import { X, Trophy, Medal, Crown, Star, Loader2 } from 'lucide-react';
import { memoflipApi } from '@/lib/capacitorApi';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RankingPlayer {
  ranking_position: number;
  nombre: string;
  email: string;
  max_level_unlocked: number;
  coins_total: number;
  total_score: number;
}

export default function RankingModal({ isOpen, onClose }: RankingModalProps) {
  const [rankingData, setRankingData] = useState<RankingPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadRanking();
    }
  }, [isOpen]);

  const loadRanking = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await memoflipApi('ranking.php?action=global&limit=20', {
        method: 'GET'
      });

      if (data.success && data.ranking) {
        setRankingData(data.ranking);
        console.log('🏆 Ranking cargado:', data.ranking);
      } else {
        setError(data.message || 'Error cargando ranking');
        console.error('❌ Error en ranking:', data);
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('❌ Error cargando ranking:', err);
    } finally {
      setIsLoading(false);
    }
  };

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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-400 text-sm">{error}</p>
                <button 
                  onClick={loadRanking}
                  className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                >
                  Reintentar
                </button>
              </div>
            ) : rankingData.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-sm">No hay datos de ranking aún</p>
              </div>
            ) : (
              <div className="space-y-2">
                {rankingData.map((player) => {
                  const displayName = player.nombre || player.email.split('@')[0];
                  const avatar = ['👑', '🧙‍♂️', '🏆', '🎯', '🧠', '⚡', '🎴', '🧩', '🏃‍♂️', '👤'][player.ranking_position - 1] || '🎮';
                  
                  return (
                    <div
                      key={player.ranking_position}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${getPositionColor(player.ranking_position)}`}
                    >
                      {/* Posición */}
                      <div className="flex-shrink-0">
                        {getPositionIcon(player.ranking_position)}
                      </div>

                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-lg">
                          {avatar}
                        </div>
                      </div>

                      {/* Info del jugador */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm truncate">
                          {displayName}
                        </h3>
                        <p className="text-xs text-gray-400">
                          Nivel {player.max_level_unlocked}
                        </p>
                      </div>

                      {/* Puntos */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-yellow-400 font-semibold text-sm">
                          {player.total_score.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">puntos</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-white/5 flex-shrink-0">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Top {rankingData.length} jugadores
              </p>
              <button 
                onClick={loadRanking}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
