import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { Heart, X } from 'lucide-react';

interface NoLivesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWatchAd: () => void;
}

const NoLivesModal: React.FC<NoLivesModalProps> = ({ isOpen, onClose, onWatchAd }) => {
  const { getTimeUntilNextLife } = useGameStore();
  const [timeUntilNextLife, setTimeUntilNextLife] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const updateTimer = () => {
      const timeLeft = getTimeUntilNextLife();
      setTimeUntilNextLife(timeLeft);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isOpen, getTimeUntilNextLife]);

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gradient-to-br from-slate-800 via-red-900 to-slate-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-white/10 border border-white/20">
                <Heart className="w-4 h-4 text-red-400" />
              </div>
              <h2 className="text-lg font-bold text-white">¡Sin Vidas!</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              <X className="w-3 h-3 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 text-center">
            {/* Corazón roto con temblor */}
            <div className="flex justify-center mb-3">
              <div 
                className="text-red-500"
                style={{
                  fontSize: '80px',
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
                Te has quedado sin vidas. Puedes esperar o ver un anuncio.
              </p>
              
              {/* Información de regeneración */}
              <div className="bg-white/10 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-lg">⏰</span>
                  <span className="font-semibold text-white text-sm">Próxima vida en:</span>
                </div>
                <div className="text-xl font-bold text-blue-400">
                  {formatTime(timeUntilNextLife)}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Las vidas se regeneran cada 30 minutos
                </p>
              </div>
            </div>

            {/* Botón */}
            <div className="flex justify-center">
              <button
                onClick={onWatchAd}
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-bold hover:from-green-600 hover:to-green-700 transition text-sm"
              >
                Ver Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoLivesModal;
