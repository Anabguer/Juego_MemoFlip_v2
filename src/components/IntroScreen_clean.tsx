'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, LogOut } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import UserModal from './UserModal';
import { memoflipApi } from '@/lib/capacitorApi';
import { PGSNative } from '@/services/PGSNative';

interface IntroScreenProps {
  onStartGame: () => void;
}

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

export default function IntroScreen({
  onStartGame
}: IntroScreenProps) {
  const [fallingCards, setFallingCards] = useState<Array<{ id: number; left: string; duration: string }>>([]);
  const [isClient, setIsClient] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userInfo, setUserInfo] = useState<SessionUser | null>(null);
  const [pgsDisplayName, setPgsDisplayName] = useState<string>('');
  
  // ✅ Usar valores REACTIVOS del store en vez de getProgress()
  const { loadProgress, currentLevel, coins, checkLifeRegeneration } = useGameStore();
  const progress = { level: currentLevel, coins }; // ← REACTIVO a cambios del store

  useEffect(() => {
    setIsClient(true);
    
    // ✅ VERIFICAR REGENERACIÓN DE VIDAS AL INICIAR LA APP
    console.log('🔄 Verificando regeneración de vidas...');
    checkLifeRegeneration();
    
    // 🔧 Cargar progreso local
    loadProgress();
    
    // 🎮 PGS: Intentar silent sign-in
    trySilentPGS();
    
    // 🎯 Inicializar AdMob - SIMPLIFICADO para evitar crashes
    if (typeof window !== 'undefined') {
      import('@/lib/adService')
        .then(({ initAds, showBottomBanner }) => {
          initAds()
            .then(() => showBottomBanner())
            .catch(e => console.error('AdMob init/show error:', e));
        })
        .catch(e => console.error('AdService import error:', e));
    }

    // Generar cartas cayendo
    const cards = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}vw`,
      duration: `${Math.random() * 5 + 5}s`,
    }));
    setFallingCards(cards);
  }, []);

  // 🎮 PGS: Intentar silent sign-in al inicio
  const trySilentPGS = async () => {
    try {
      const authenticated = await PGSNative.getInstance().isAuthenticated();
      if (authenticated) {
        setPgsDisplayName(localStorage.getItem('pgs_display') || '');
        console.log('🎮 PGS: Silent sign-in exitoso:', localStorage.getItem('pgs_display'));
      }
    } catch (error) {
      console.log('🎮 PGS: Error en silent sign-in:', error);
    }
  };

  const handlePGSSignIn = async () => {
    try {
      const result = await PGSNative.getInstance().signIn();
      if (result.success && result.displayName) {
        // Usuario autenticado con Google - no necesitamos backend      
        const displayName = result.displayName || 'Usuario Google';
        setPgsDisplayName(displayName);
        localStorage.setItem('pgs_display', displayName);
        console.log('🎮 PGS: Sign-in exitoso:', displayName);
      } else {
        console.log('🎮 PGS: Usuario canceló sign-in o error:', result.error);
      }
    } catch (error) {
      console.log('🎮 PGS: Error en sign-in:', error);
    }
  };

  const handleLoginSuccess = (data: SessionUser, email?: string, password?: string) => {
    console.log('✅ Login exitoso:', data);
    setUserInfo(data);
    // No se usa en el modo solo Google
  };

  const handleLogout = () => {
    setUserInfo(null);
    setPgsDisplayName('');
    localStorage.removeItem('pgs_display');
    localStorage.removeItem('pgs_player_id');
    console.log('👋 Sesión cerrada.');
  };

  const cardVariants = {
    initial: { y: '-100vh', opacity: 0 },
    animate: { y: '100vh', opacity: 1, transition: { duration: 10, repeat: Infinity, ease: 'linear' } },
  };

  if (!isClient) {
    return null;
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 text-white overflow-hidden p-4">
      {/* Fondo de cartas cayendo */}
      {fallingCards.map((card) => (
        <motion.div
          key={card.id}
          className="absolute text-4xl opacity-0"
          style={{ left: card.left, animationDuration: card.duration }}
          animate={{ y: ['-10vh', '110vh'], opacity: [0, 1, 1, 0], rotate: [0, 360] }}
          transition={{ duration: parseFloat(card.duration), repeat: Infinity, ease: 'linear' }}
        >
          🃏
        </motion.div>
      ))}

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center space-y-8 bg-white/5 backdrop-blur-lg p-8 rounded-3xl shadow-2xl border border-white/10 max-w-md w-full"
      >
        <img
          src="/logo.png"
          alt="MemoFlip Logo"
          className="w-32 h-32 object-contain mb-4"
        />
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 drop-shadow-lg">
          MemoFlip
        </h1>
        <p className="text-white/80 text-lg text-center">
          ¡Entrena tu memoria y diviértete!
        </p>

        {/* Botones de acción */}
        <div className="flex flex-col space-y-4 w-full">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartGame}
            className="px-8 py-4 bg-gradient-to-r from-green-500 to-teal-600 text-white text-xl font-bold rounded-full shadow-lg hover:from-green-600 hover:to-teal-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            <Play className="inline-block mr-2 w-6 h-6" />
            Jugar
          </motion.button>

          {/* Botón de usuario/login */}
          {pgsDisplayName ? (
            // Si está logueado con PGS
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 inline-flex items-center gap-2 backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión ({pgsDisplayName})
            </motion.button>
          ) : (
            // Si no está logueado, mostrar botón de Google
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePGSSignIn}
              className="px-6 py-2 bg-white hover:bg-gray-100 text-gray-900 text-sm font-medium rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 inline-flex items-center gap-2 backdrop-blur-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Entrar con Google
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Modal de usuario */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}
