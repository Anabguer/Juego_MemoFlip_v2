'use client';

import { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, Settings, LogOut, Trash2 } from 'lucide-react';
import { soundSystem } from '@/lib/soundSystem';
import { useGameStore } from '@/store/gameStore';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export default function SettingsModal({ isOpen, onClose, onLogout }: SettingsModalProps) {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { currentUser } = useGameStore();

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
          <div className="p-6 space-y-6">
            {/* Control de Sonido */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                🔊 Audio
              </h3>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
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

            {/* Cuenta - Solo si hay usuario logueado */}
            {currentUser && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  👤 Cuenta
                </h3>
                
                <div className="space-y-3">
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
                  
                  {/* Botón Eliminar cuenta */}
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-red-500/20 text-red-400 border border-red-400/30 hover:bg-red-500/30 transition font-medium"
                  >
                    <Trash2 className="w-5 h-5" />
                    Eliminar cuenta
                  </button>
                </div>
              </div>
            )}

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
