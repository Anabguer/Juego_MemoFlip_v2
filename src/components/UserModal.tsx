'use client';

import { useState } from 'react';
import { X, Gamepad2 } from 'lucide-react';
import { PGSNative } from '@/services/PGSNative';

interface SessionUser {
  email: string;
  nombre: string;
  authenticated: boolean;
  game_data?: {
    max_level_unlocked: number;
    coins_total: number;
    lives_current: number;
    sound_enabled: boolean;
  };
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: SessionUser, email: string, password: string) => void;
}

export default function UserModal({ isOpen, onClose, onLoginSuccess }: UserModalProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlayGamesSignIn = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});
      
      console.log('🎮 UserModal: Iniciando login con Google Play Juegos...');
      
      // Usar Play Games v2 para login
      const result = await PGSNative.getInstance().signIn();
      
      if (result.success && result.displayName) {
        console.log('✅ UserModal: Login con Play Juegos exitoso:', result);
        
        // Crear usuario de Play Games
        const playGamesUser = {
          email: result.email || 'playgames@google.com',
          nombre: result.displayName || 'Jugador Play Games',
          nick: result.displayName || 'Jugador Play Games',
          playerId: result.playerId || 'playgames_user'
        };
        
        console.log('🎮 UserModal: Datos del jugador:', playGamesUser);
        
        // Crear datos de sesión para Play Games
        const sessionData: SessionUser = {
          email: playGamesUser.email,
          nombre: playGamesUser.nombre,
          authenticated: true,
          game_data: {
            max_level_unlocked: 1,
            coins_total: 0,
            lives_current: 3,
            sound_enabled: true
          }
        };
        
        console.log('✅ UserModal: Login exitoso con Play Juegos');
        onLoginSuccess(sessionData, playGamesUser.email, '');
        onClose();
      } else {
        console.log('❌ UserModal: Login con Play Juegos falló:', result.error);
        setErrors({ general: result.error || 'No se pudo autenticar con Google Play Juegos' });
      }
    } catch (error) {
      console.error('❌ UserModal: Error en login con Play Juegos:', error);
      setErrors({ general: 'Error de conexión: ' + error });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                <Gamepad2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Iniciar Sesión</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {errors.general && (
              <p className="text-red-400 text-center text-sm">{errors.general}</p>
            )}

            <button
              onClick={handlePlayGamesSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 p-4 rounded-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Gamepad2 className="w-6 h-6" />
              {isSubmitting ? 'Iniciando sesión...' : 'Entrar con Google Play Juegos'}
            </button>
          </div>

          <div className="p-6 border-t border-white/10 bg-white/5">
            <p className="text-center text-sm text-gray-400">
              Tu progreso se guardará automáticamente con tu cuenta de Google Play Juegos.
            </p>
            <p className="text-center text-xs text-gray-500 mt-2">
              Accede a rankings, logros y sincronización en la nube.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}