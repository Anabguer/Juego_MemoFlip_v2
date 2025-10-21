'use client';

import React, { useEffect, useState } from 'react';
import { X, Trophy, Loader2 } from 'lucide-react';
import { PGSNative } from '@/services/PGSNative';

interface RankingModalProps {
  isOpen: boolean;
  onClose: () => void;
}


export default function RankingModal({ isOpen, onClose }: RankingModalProps) {
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
          // Verificar si el usuario está autenticado con Google Play Games
          const isSignedIn = await PGSNative.getInstance().isAuthenticated();
          
          if (!isSignedIn) {
            setError('Debes iniciar sesión con Google para ver el ranking');
            setIsLoading(false);
            return;
          }

          // Mostrar el leaderboard nativo de Google Play Games
          const result = await PGSNative.getInstance().showLeaderboard();
      
      if (result.success) {
        console.log('🏆 Leaderboard de Google Play Games mostrado');
        // El leaderboard se muestra en una ventana nativa
      } else {
        // En localhost/web, esto es normal - PGS solo funciona en APK
        setError('El ranking solo funciona en la versión APK de Android. En localhost/web no está disponible.');
        console.log('ℹ️ PGS no disponible en web - normal en localhost');
      }
    } catch (err) {
      setError('Error accediendo al ranking');
      console.error('❌ Error cargando ranking:', err);
    } finally {
      setIsLoading(false);
    }
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
            ) : (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Ranking de Google Play Games</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    El ranking se muestra en la interfaz nativa de Google Play Games
                  </p>
                  <p className="text-gray-400 text-xs">
                    Si no se abrió automáticamente, verifica que tengas Google Play Games instalado
                  </p>
                </div>
                
                <button 
                  onClick={loadRanking}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-full font-medium transition-all duration-200"
                >
                  Abrir Ranking
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 bg-white/5 flex-shrink-0">
            <div className="flex items-center justify-center">
              <p className="text-xs text-gray-400">
                Ranking de Google Play Games
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
