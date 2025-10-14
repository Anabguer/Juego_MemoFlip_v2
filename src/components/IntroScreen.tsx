'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, User, LogOut } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import UserModal from './UserModal';
import { memoflipApi, getAssetPath } from '@/lib/capacitorApi';

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
  
  // ✅ Usar valores REACTIVOS del store en vez de getProgress()
  const { loadProgress, currentLevel, coins } = useGameStore();
  const progress = { level: currentLevel, coins }; // ← REACTIVO a cambios del store

  useEffect(() => {
    setIsClient(true);
    
    // 🔧 ORDEN CORRECTO: Primero verificar sesión, luego cargar progreso
    checkSession(); // Esto cargará del servidor si hay sesión
    // loadProgress() ya NO se llama aquí - checkSession lo hace automáticamente
    
    // 🎯 Inicializar AdMob - SIMPLIFICADO para evitar crashes
    if (typeof window !== 'undefined') {
      import('@/lib/adService')
        .then(({ initAds, showBottomBanner }) => {
          initAds()
            .then(() => showBottomBanner())
            .catch(err => console.warn('[AdMob] No disponible:', err));
        })
        .catch(err => console.warn('[AdMob] Import error:', err));
    }
    
    // Detectar conexión online/offline para sincronizar silenciosamente
    const updateOnlineStatus = async () => {
      const online = navigator.onLine;
      
      // Si vuelve internet, sincronizar progreso (silencioso, sin logs visibles)
      if (online) {
        try {
          const { syncWhenOnline } = useGameStore.getState();
          await syncWhenOnline();
        } catch (error) {
          console.error('❌ Error sincronizando:', error);
        }
      }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      // Ocultar banner al desmontar (sin causar errores)
      import('@/lib/adService')
        .then(({ hideBanner }) => hideBanner())
        .catch(() => {});
    };
  }, []);

  // Efecto de cartas cayendo (adaptado del código original)
  useEffect(() => {
    const createFallingCard = () => {
      const newCard = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100 + '%',
        duration: (Math.random() * 4 + 3) + 's'
      };
      
      setFallingCards(prev => [...prev, newCard]);
      
      // Remover la carta después de 7 segundos
      setTimeout(() => {
        setFallingCards(prev => prev.filter(card => card.id !== newCard.id));
      }, 7000);
    };

    // Crear cartas cada 1.5s
    const interval = setInterval(createFallingCard, 1500);
    
    // Crear algunas cartas iniciales con retraso
    for (let i = 0; i < 3; i++) {
      setTimeout(createFallingCard, i * 500);
    }

    return () => clearInterval(interval);
  }, []);

  // Verificar sesión activa
  const checkSession = async () => {
    try {
      const data = await memoflipApi('auth.php?action=check_session', {
        method: 'GET'
      }) as SessionUser & { authenticated: boolean };

      if (data.authenticated) {
        console.log('🔐 Sesión activa:', data);
        await handleLoginSuccess(data);
      } else {
        console.log('👤 Sin sesión activa, intentando auto-login...');
        
        // ❌ No hay sesión → Intentar AUTO-LOGIN con credenciales guardadas
        const savedEmail = localStorage.getItem('memoflip_user_email');
        const savedToken = localStorage.getItem('memoflip_user_token');
        
        if (savedEmail && savedToken) {
          console.log('🔑 Credenciales encontradas, intentando auto-login...');
          try {
            const savedPassword = atob(savedToken);
            const loginResult = await memoflipApi('auth.php', {
              method: 'POST',
              body: {
                action: 'login',
                email: savedEmail,
                password: savedPassword
              }
            }) as SessionUser & { success?: boolean };
            
            if (loginResult && loginResult.success) {
              console.log('✅ Auto-login exitoso');
              await handleLoginSuccess(loginResult, savedEmail, savedPassword);
            } else {
              // Credenciales inválidas, limpiar TODO
              console.log('❌ Auto-login falló, limpiando TODO');
              localStorage.removeItem('memoflip_user_email');
              localStorage.removeItem('memoflip_user_token');
              localStorage.removeItem('memoflip_progress'); // ✅ Limpiar progreso viejo
              setUserInfo(null);
              const { setCurrentUser, setCurrentLevel, setCoins, setLives } = useGameStore.getState();
              setCurrentUser(null);
              setCurrentLevel(1); // ✅ Resetear a inicial
              setCoins(0);
              setLives(3);
              console.log('🔄 Progreso reseteado - usuario no existe en BD');
            }
          } catch (e) {
            console.log('❌ Error en auto-login:', e);
            localStorage.removeItem('memoflip_user_email');
            localStorage.removeItem('memoflip_user_token');
            localStorage.removeItem('memoflip_progress'); // ✅ Limpiar progreso viejo
            setUserInfo(null);
            const { setCurrentUser, setCurrentLevel, setCoins, setLives } = useGameStore.getState();
            setCurrentUser(null);
            setCurrentLevel(1); // ✅ Resetear a inicial
            setCoins(0);
            setLives(3);
            console.log('🔄 Progreso reseteado - error de conexión');
          }
        } else {
          console.log('🔓 No hay credenciales guardadas - Modo invitado');
          setUserInfo(null);
          const { setCurrentUser, setCurrentLevel, setCoins, setLives } = useGameStore.getState();
          setCurrentUser(null);
          
          // ✅ RESETEAR a valores iniciales limpios (NO cargar localStorage viejo)
          setCurrentLevel(1);
          setCoins(0);
          setLives(3);
          console.log('🔄 Modo invitado - progreso limpio desde nivel 1');
        }
      }
    } catch (error) {
      console.error('❌ Error verificando sesión:', error);
      setUserInfo(null);
      
      // ✅ En caso de error, resetear a limpio (NO cargar localStorage viejo)
      const { setCurrentUser, setCurrentLevel, setCoins, setLives } = useGameStore.getState();
      setCurrentUser(null);
      setCurrentLevel(1);
      setCoins(0);
      setLives(3);
      console.log('🔄 Error de sesión - progreso reseteado');
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    try {
      const data = await memoflipApi('auth.php', {
        method: 'POST',
        body: { action: 'logout' }
      }) as { success: boolean };

      if (data.success) {
        console.log('👋 Sesión cerrada');
        
        // 🗑️ LIMPIAR TODO EL PROGRESO LOCAL
        localStorage.removeItem('memoflip_user_email');
        localStorage.removeItem('memoflip_user_token');
        localStorage.removeItem('memoflip_progress'); // ✅ Limpiar progreso
        localStorage.removeItem('memoflip_pending_sync');
        console.log('🗑️ Credenciales y progreso eliminados');
        
        setUserInfo(null);
        
        // Limpiar currentUser y resetear progreso en el store
        const { setCurrentUser, setCurrentLevel, setCoins, setLives } = useGameStore.getState();
        setCurrentUser(null);
        setCurrentLevel(1); // ✅ Resetear a nivel 1
        setCoins(0);        // ✅ Resetear monedas
        setLives(3);        // ✅ Resetear vidas
        
        console.log('✅ Progreso reseteado a inicial');
        window.location.reload(); // Recargar para limpiar todo
      }
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
    }
  };

  const handleLoginSuccess = (data: SessionUser, email?: string, password?: string) => {
    console.log('✅ Login exitoso:', data);
    setUserInfo(data);
    
    // 🔐 GUARDAR CREDENCIALES PARA AUTO-LOGIN (solo en APK)
    if (email && password) {
      localStorage.setItem('memoflip_user_email', email);
      localStorage.setItem('memoflip_user_token', btoa(password)); // Base64
      console.log('🔑 Credenciales guardadas para auto-login');
    }
    
    // Establecer currentUser en el store
    const { setCurrentUser, setCurrentLevel, setCoins, setLives, getProgress } = useGameStore.getState();
    
    // 🔄 COMPARAR progreso local vs servidor y usar el MAYOR
    const localProgress = getProgress();
    const serverLevel = data.game_data?.max_level_unlocked || 1;
    const serverCoins = data.game_data?.coins_total || 0;
    const serverLives = data.game_data?.lives_current || 3;
    
    // ✅ Usar el nivel más avanzado (local o servidor)
    const bestLevel = Math.max(localProgress.level, serverLevel);
    const bestCoins = Math.max(localProgress.coins, serverCoins);
    
    console.log('📊 Comparando progreso:', { 
      local: { level: localProgress.level, coins: localProgress.coins },
      servidor: { level: serverLevel, coins: serverCoins },
      mejor: { level: bestLevel, coins: bestCoins }
    });
    
    // Crear objeto User para el store
    const user = {
      id: `${data.email}_memoflip`, // ✅ IMPORTANTE: añadir sufijo _memoflip para coincidir con BD
      nickname: data.nombre || data.email.split('@')[0],
      name: data.nombre || data.email.split('@')[0],
      email: data.email,
      createdAt: Date.now(),
      lastLogin: Date.now(),
      isGuest: false,
      progress: {
        level: bestLevel,
        coins: bestCoins,
        lives: serverLives,
        lastPlayed: Date.now(),
        totalScore: bestCoins,
        phase: Math.ceil(bestLevel / 50)
      }
    };
    
    // ✅ Establecer usuario Y progreso en el store CON EL MEJOR PROGRESO
    setCurrentUser(user);
    setCurrentLevel(bestLevel);
    setCoins(bestCoins);
    setLives(serverLives);
    
    console.log('✅ Progreso establecido (mejor de local/servidor):', { 
      level: bestLevel, 
      coins: bestCoins, 
      lives: serverLives 
    });
    
    // ✅ Actualizar localStorage con los datos CORRECTOS
    localStorage.setItem('memoflip_progress', JSON.stringify({
      level: bestLevel,
      coins: bestCoins,
      lives: serverLives,
      lastPlayed: Date.now(),
      totalScore: bestCoins,
      phase: Math.ceil(bestLevel / 50)
    }));
    
    console.log('💾 Login completado - Progreso sincronizado desde servidor');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Efecto de cartas cayendo */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        {fallingCards.map((card) => (
          <motion.div
            key={card.id}
            className="absolute w-10 h-12 rounded-lg shadow-lg"
            style={{
              left: card.left,
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              animation: `fall ${card.duration} linear infinite`
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        ))}
      </div>

      {/* Contenedor principal */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 md:p-16 shadow-2xl border-2 border-white/20 max-w-lg w-full mx-4"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/logo.png"
                alt="MemoFlip" 
                className="max-w-48 h-auto drop-shadow-lg"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
              />
            </div>
          </motion.div>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-white/90 mb-12 font-medium leading-relaxed"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >
            ¡No es un simple juego de memoria! Supera mecánicas desafiantes
          </motion.p>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-4"
          >
            {/* Botón principal JUGAR/CONTINUAR */}
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartGame}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-xl md:text-2xl py-4 px-8 rounded-full shadow-xl border-3 border-white hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
              style={{ boxShadow: '0 8px 20px rgba(255, 215, 0, 0.4)' }}
            >
              <Play className="w-6 h-6" />
              {userInfo ? 'CONTINUAR' : 'JUGAR'}
            </motion.button>
            
            {/* Separador y texto */}
            {!userInfo && (
              <div className="text-center space-y-3">
                <p className="text-white/70 text-sm">¿Ya tienes cuenta?</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserModal(true)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 inline-flex items-center gap-2 backdrop-blur-sm"
                >
                  <User className="w-4 h-4" />
                  Entrar
                </motion.button>
              </div>
            )}

            {/* Botón Salir si está logueado */}
            {userInfo && (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleLogout}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm py-2 px-6 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4" />
                Salir ({userInfo.nombre || userInfo.email})
              </motion.button>
            )}

          </motion.div>

          {/* Información del progreso */}
          {isClient && progress.level > 1 && (
            <div className="mt-8 text-white/70 text-sm">
              Nivel: {progress.level} | Monedas: {progress.coins}
            </div>
          )}
        </motion.div>
      </div>

      {/* Copyright */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-5 left-1/2 transform -translate-x-1/2 text-white/70 text-sm text-center z-20"
      >
        © 2024 @intocables13 - Todos los derechos reservados
      </motion.div>

      {/* Modal de Usuario */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* CSS para la animación de caída */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}