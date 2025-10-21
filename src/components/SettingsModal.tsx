'use client';

import { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Settings, LogOut, Trash2, Smartphone, PhoneOff, Star, Clock, Zap } from 'lucide-react';
import { soundSystem } from '@/lib/soundSystem';
import { useGameStore, GameMode } from '@/store/gameStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  onShowLogin?: () => void; // Para mostrar modal de login
}

export default function SettingsModal({ isOpen, onClose, onLogout, onShowLogin }: SettingsModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { currentUser, vibrationEnabled, setVibrationEnabled, gameMode, setGameMode } = useGameStore();

  // Cargar estado de sonido al abrir
  useEffect(() => {
    if (isOpen) {
      setSoundEnabled(soundSystem.isSoundEnabled());
    }
  }, [isOpen]);

  // Función para alternar sonido
  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    soundSystem.setEnabled(newSoundState);
    
    // Reproducir sonido de confirmación
    if (newSoundState) {
      soundSystem.play('cartavolteada');
    }
  };

  // Función para alternar vibración
  const toggleVibration = () => {
    const newVibrationState = !vibrationEnabled;
    setVibrationEnabled(newVibrationState);
    
    // Reproducir sonido de confirmación
    if (soundEnabled) {
      soundSystem.play('cartavolteada');
    }
    
    console.log('📳 Vibración:', newVibrationState ? 'Activada' : 'Desactivada');
  };

  // Función para cambiar modo de juego
  const changeGameMode = (newMode: GameMode) => {
    setGameMode(newMode);
    
    // Reproducir sonido de confirmación
    if (soundEnabled) {
      soundSystem.play('cartavolteada');
    }
    
    console.log('🎮 Modo de juego cambiado a:', newMode);
  };

  // Función para cerrar sesión
  const handleLogout = async () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      onClose();
      
      // 🗑️ LIMPIAR TODO EL PROGRESO LOCAL
      localStorage.removeItem('memoflip_user_email');
      localStorage.removeItem('memoflip_user_token');
      localStorage.removeItem('memoflip_progress');
      localStorage.removeItem('memoflip_pending_sync');
      console.log('🗑️ Logout: Credenciales y progreso eliminados');
      
      // Resetear el store a valores iniciales
      const { setCurrentUser, setCurrentLevel, setCoins, setLives } = useGameStore.getState();
      setCurrentUser(null);
      setCurrentLevel(1);
      setCoins(0);
      setLives(3);
      
      console.log('✅ Progreso reseteado a inicial');
      
      // Volver al inicio
      if (onLogout) {
        onLogout();
      }
      
      // Recargar la página para asegurar limpieza total
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  };

  // Función para eliminar cuenta
  const handleDeleteAccount = () => {
    if (!currentUser) {
      alert('No hay ninguna sesión activa');
      return;
    }

    if (confirm('¿Estás seguro de que quieres solicitar la eliminación de tu cuenta? Se enviará un correo a nuestro equipo.')) {
      const email = currentUser.email;
      const subject = encodeURIComponent('MemoFlip - Solicitud de baja de cuenta');
      const body = encodeURIComponent(
        `Solicito la baja de mi cuenta en la aplicación MemoFlip.\n\n` +
        `Email de la cuenta: ${email}\n\n` +
        `Por favor, eliminen todos mis datos personales y progreso del juego.\n\n` +
        `Gracias.`
      );
      
      // Abrir cliente de correo
      window.location.href = `mailto:info@intocables13.com?subject=${subject}&body=${body}`;
      
      alert('Se ha abierto tu cliente de correo. Por favor, envía el mensaje para completar la solicitud.');
      onClose();
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
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Configuración</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Control de Sonido */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white">
                Audio
              </h3>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {soundEnabled ? (
                    <Volume2 className="w-6 h-6 text-green-400" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-red-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {soundEnabled ? 'Sonido Activado' : 'Sonido Desactivado'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {soundEnabled ? 'Música y efectos activos' : 'Modo silencioso'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={toggleSound}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    soundEnabled
                      ? 'bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30'
                  }`}
                >
                  {soundEnabled ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>

            {/* Control de Vibración */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white">
                Vibración
              </h3>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-3">
                  {vibrationEnabled ? (
                    <Smartphone className="w-6 h-6 text-green-400" />
                  ) : (
                    <PhoneOff className="w-6 h-6 text-red-400" />
                  )}
                  <div>
                    <p className="text-white font-medium">
                      {vibrationEnabled ? 'Vibración Activada' : 'Vibración Desactivada'}
                    </p>
                    <p className="text-sm text-gray-400">
                      {vibrationEnabled ? 'Vibración al tocar cartas' : 'Sin vibración'}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={toggleVibration}
                  className={`px-4 py-2 rounded-xl font-semibold transition ${
                    vibrationEnabled
                      ? 'bg-green-500/20 text-green-400 border border-green-400/30 hover:bg-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30'
                  }`}
                >
                  {vibrationEnabled ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>

            {/* Modo de Juego */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white">
                Modo de Juego
              </h3>
              
              <div className="space-y-2">
                {/* Principiante */}
                <button
                  onClick={() => changeGameMode('beginner')}
                  className={`w-full flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    gameMode === 'beginner'
                      ? 'bg-green-500/20 border-green-400/50 text-green-400'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <Star className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Principiante</p>
                    <p className="text-sm opacity-70">Sin cronómetro, solo mecánicas básicas</p>
                  </div>
                  {gameMode === 'beginner' && (
                    <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
                  )}
                </button>

                {/* Normal */}
                <button
                  onClick={() => changeGameMode('normal')}
                  className={`w-full flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    gameMode === 'normal'
                      ? 'bg-blue-500/20 border-blue-400/50 text-blue-400'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Normal</p>
                    <p className="text-sm opacity-70">Experiencia completa con todas las mecánicas</p>
                  </div>
                  {gameMode === 'normal' && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full"></div>
                  )}
                </button>

                {/* Extremo */}
                <button
                  onClick={() => changeGameMode('extreme')}
                  className={`w-full flex items-center gap-2 p-3 rounded-lg border transition-all ${
                    gameMode === 'extreme'
                      ? 'bg-red-500/20 border-red-400/50 text-red-400'
                      : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-medium">Extremo</p>
                    <p className="text-sm opacity-70">Siempre cronómetro, sin niveles fáciles</p>
                  </div>
                  {gameMode === 'extreme' && (
                    <div className="ml-auto w-2 h-2 bg-red-400 rounded-full"></div>
                  )}
                </button>
              </div>
            </div>

            {/* Cuenta */}
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-white">
                Cuenta
              </h3>
              
              {currentUser ? (
                // Usuario logueado
                <div className="space-y-2">
                  {/* Usuario actual */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-gray-400">Usuario:</p>
                    <p className="text-white font-medium">{currentUser.email}</p>
                  </div>
                  
                  {/* Botón Cerrar sesión */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-400/30 hover:bg-orange-500/30 transition font-medium"
                  >
                    <LogOut className="w-5 h-5" />
                    Cerrar sesión
                  </button>
                  
                  {/* Botón Eliminar cuenta - MÁS PEQUEÑO */}
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-red-500/15 text-red-400 border border-red-400/20 hover:bg-red-500/25 transition text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar cuenta
                  </button>
                </div>
              ) : (
                // Usuario no logueado - Botón Entrar con Google
                <div className="space-y-2">
                  <p className="text-white/70 text-sm text-center">
                    Inicia sesión para guardar tu progreso
                  </p>
                  
                  <button
                    onClick={onShowLogin}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-full bg-transparent hover:bg-white/10 text-white text-sm font-medium transition-all duration-200 border border-white/30 hover:border-white/50 backdrop-blur-sm"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#FFFFFF" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#FFFFFF" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FFFFFF" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#FFFFFF" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Entrar con Google
                  </button>
                </div>
              )}
            </div>


          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/5">
            <p className="text-center text-sm text-gray-400">
              MemoFlip v1.0 - Desarrollado con ❤️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
