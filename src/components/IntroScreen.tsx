'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, User, LogOut, Settings } from 'lucide-react';
import { useGameStore, GameMode } from '@/store/gameStore';
import UserModal from './UserModal';
import DiagnosticButton from './DiagnosticButton';
import { getAssetPath } from '@/lib/capacitorApi';
import { PGSNative } from '@/services/PGSNative';
import { CombinedGoogleService } from '@/services/CombinedGoogleService';

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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  
  // ✅ Usar valores REACTIVOS del store en vez de getProgress()
  const { loadProgress, currentLevel, coins, checkLifeRegeneration, loadProgressFromCloud, syncWithCloud, gameMode, setGameMode, showLeaderboard, submitScore } = useGameStore();

  // 🔍 Función para añadir logs de debug
  const addDebugLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    setDebugLogs(prev => [...prev.slice(-9), logMessage]); // Mantener solo los últimos 10 logs
  };

  // Conectar el sistema de debug con PGSNative
  useEffect(() => {
    PGSNative.getInstance().setDebugCallback(addDebugLog);
  }, []);
  const progress = { level: currentLevel, coins }; // ← REACTIVO a cambios del store

  useEffect(() => {
    setIsClient(true);
    
    // ✅ VERIFICAR REGENERACIÓN DE VIDAS AL INICIAR LA APP
    console.log('🔄 Verificando regeneración de vidas...');
    checkLifeRegeneration();
    
    // 🔧 ORDEN CORRECTO: Primero verificar sesión, luego cargar progreso
    checkSession(); // Esto cargará del servidor si hay sesión
    // loadProgress() ya NO se llama aquí - checkSession lo hace automáticamente
    
    // 🎮 PGS: Intentar silent sign-in
    trySilentPGS();
    
    // ☁️ Cargar progreso desde la nube si está autenticado con Google Play Games
    loadProgressFromCloud();
    
    // 🎯 Inicializar AdMob - SIMPLIFICADO para evitar crashes
    if (typeof window !== 'undefined') {
      console.log('🎯 [AdMob] Iniciando carga del servicio...');
      import('@/lib/adService')
        .then(({ initAds, showBottomBanner }) => {
          console.log('🎯 [AdMob] Servicio cargado, inicializando...');
          initAds()
            .then(() => {
              console.log('🎯 [AdMob] Inicializado, mostrando banner...');
              return showBottomBanner();
            })
            .then(() => {
              console.log('✅ [AdMob] Banner mostrado correctamente');
            })
            .catch(err => console.error('❌ [AdMob] Error:', err));
        })
        .catch(err => console.error('❌ [AdMob] Import error:', err));
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
    
    // ✅ VERIFICAR REGENERACIÓN DE VIDAS CADA 30 SEGUNDOS
    const lifeRegenInterval = setInterval(() => {
      console.log('🔄 Verificando regeneración de vidas (intervalo)...');
      checkLifeRegeneration();
    }, 30000); // Cada 30 segundos
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(lifeRegenInterval);
      // ✅ NO ocultar banner al ir al juego - debe permanecer visible
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
    // 🔑 PRIMERO: Intentar auto-login con credenciales guardadas (funciona offline)
    const savedEmail = localStorage.getItem('memoflip_user_email');
    const savedToken = localStorage.getItem('memoflip_user_token');

    if (savedEmail && savedToken) {
      console.log('🔑 Credenciales encontradas, intentando auto-login...');

      // 🔄 MODO OFFLINE: Usar credenciales guardadas sin verificar servidor
      console.log('📴 Modo offline: usando credenciales guardadas');
      const { setCurrentUser, setCurrentLevel, setCoins, setLives, getProgress } = useGameStore.getState();

      // Cargar progreso local
      const localProgress = getProgress();

      // Crear usuario offline
      const user = {
        id: `${savedEmail}_memoflip`,
        nickname: savedEmail.split('@')[0],
        name: savedEmail.split('@')[0],
        email: savedEmail,
        createdAt: Date.now(),
        lastLogin: Date.now(),
        isGuest: false,
        progress: {
          level: localProgress.level,
          coins: localProgress.coins,
          lives: localProgress.lives,
          lastLifeLost: localProgress.lastLifeLost,
          lastPlayed: Date.now(),
          totalScore: localProgress.coins,
          phase: Math.ceil(localProgress.level / 50)
        }
      };

      setCurrentUser(user);
      setCurrentLevel(localProgress.level);
      setCoins(localProgress.coins);
      setLives(localProgress.lives);

      setUserInfo({
        email: savedEmail,
        nombre: savedEmail.split('@')[0],
        authenticated: true,
        game_data: {
          max_level_unlocked: localProgress.level,
          coins_total: localProgress.coins,
          lives_current: localProgress.lives,
          sound_enabled: true
        }
      });

      console.log('✅ Usuario cargado en modo offline:', user);
      return;
    }

    // Sin credenciales guardadas - modo invitado
    console.log('👤 Sin credenciales guardadas - modo invitado');
  };

  // 🎮 COMBINED Functions
  const trySilentPGS = async () => {
    try {
      console.log('🔄 COMBINED: Intentando auto-login...');
      const authResult = await CombinedGoogleService.getInstance().isAuthenticated();
      
      if (authResult.authenticated && authResult.user) {
        const displayName = authResult.user.displayName || authResult.user.name || 'Usuario Google';
        const email = authResult.user.email || 'playgames@google.com';
        
        setPgsDisplayName(displayName);
        console.log('✅ COMBINED: Auto-login exitoso:', displayName);
        console.log('📧 COMBINED: Email real:', email);
        
        // Sincronizar con la nube
        await CombinedGoogleService.getInstance().syncWithCloud();
      } else {
        console.log('ℹ️ COMBINED: No hay sesión activa');
      }
    } catch (error) {
      console.log('❌ COMBINED: Error en auto-login:', error);
    }
  };

  // 🏆 Ranking Functions
  const handleShowRanking = async () => {
    console.log('🏆 Mostrando ranking para modo:', gameMode);
    await showLeaderboard(gameMode);
  };

  const handleSubmitScore = async () => {
    console.log('📊 Enviando puntuación para modo:', gameMode);
    const score = coins + (currentLevel * 100); // Puntuación basada en monedas y nivel
    await submitScore(gameMode, score);
  };

  const handlePGSSignIn = async () => {
    addDebugLog('🔄 COMBINED: Iniciando login combinado (Google Sign-In + Play Games)...');
    
    // Verificar si ya está autenticado
    if (pgsDisplayName) {
      addDebugLog('✅ COMBINED: Usuario ya autenticado: ' + pgsDisplayName);
      return;
    }
    
    try {
      addDebugLog('🔄 COMBINED: Llamando a CombinedGoogleService.signIn()...');
      const result = await CombinedGoogleService.getInstance().signIn();
      addDebugLog('📥 COMBINED: Resultado recibido: ' + JSON.stringify(result));
      
      if (result.success && result.user) {
        const displayName = result.user.displayName || result.user.name || 'Usuario Google';
        const email = result.user.email || 'playgames@google.com';
        
        setPgsDisplayName(displayName);
        localStorage.setItem('pgs_display', displayName);
        addDebugLog('✅ COMBINED: Login combinado exitoso: ' + displayName);
        addDebugLog('📧 COMBINED: Email real: ' + email);
        
        // ☁️ Sincronizar con la nube después del login exitoso
        addDebugLog('☁️ COMBINED: Iniciando sincronización con la nube...');
        await CombinedGoogleService.getInstance().syncWithCloud();
        
        addDebugLog(`✅ Login exitoso con Google! Usuario: ${displayName}, Email: ${email}`);
      } else {
        addDebugLog('❌ COMBINED: Error en login combinado: ' + (result.error || 'Error desconocido'));
        alert(`❌ Error en login: ${result.error || 'No se pudo conectar con Google'}`);
      }
    } catch (error) {
      addDebugLog('❌ COMBINED: Error en login combinado: ' + error);
      alert(`❌ Error técnico: ${error}`);
    }
  };

  // Cerrar sesión
  const handleLogout = async () => {
    console.log('🔴 LOGOUT: Iniciando proceso de logout...');
    
    try {
      // Cerrar sesión en ambos servicios
      await CombinedGoogleService.getInstance().signOut();
      console.log('✅ LOGOUT: Servicios Google cerrados');
    } catch (error) {
      console.error('❌ LOGOUT: Error cerrando servicios:', error);
    }
    
    // 🗑️ LIMPIAR TODO EL PROGRESO LOCAL
    localStorage.removeItem('memoflip_user_email');
    localStorage.removeItem('memoflip_user_token');
    localStorage.removeItem('memoflip_progress');
    localStorage.removeItem('memoflip_pending_sync');
    
    // 🗑️ LIMPIAR PGS DATA
    localStorage.removeItem('pgs_display');
    localStorage.removeItem('pgs_player_id');
    localStorage.removeItem('google_user_info');
    setPgsDisplayName('');
    
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
        lastLifeLost: 0, // ✅ TIMESTAMP PARA REGENERACIÓN
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
    <div className="h-screen w-full fixed top-0 left-0 overflow-hidden" style={{
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
      <div className="flex items-center justify-center h-full p-4 relative z-10">
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
            {/* Botón principal JUGAR/CONTINUAR con efecto burbujas */}
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartGame}
              className="relative w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-white font-black text-xl md:text-2xl py-4 px-8 rounded-full shadow-xl border-3 border-white hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
              style={{ boxShadow: '0 8px 20px rgba(255, 215, 0, 0.4)' }}
            >
              {/* Efecto de burbujas animadas */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                {/* Burbuja 1 */}
                <motion.div
                  className="absolute w-3 h-3 bg-white/30 rounded-full"
                  animate={{
                    x: [0, 100, 0],
                    y: [0, -20, 0],
                    scale: [0.8, 1.2, 0.8],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{ left: '10%', top: '30%' }}
                />
                {/* Burbuja 2 */}
                <motion.div
                  className="absolute w-2 h-2 bg-white/40 rounded-full"
                  animate={{
                    x: [0, -80, 0],
                    y: [0, 15, 0],
                    scale: [1, 0.6, 1],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  style={{ right: '15%', top: '60%' }}
                />
                {/* Burbuja 3 */}
                <motion.div
                  className="absolute w-4 h-4 bg-white/20 rounded-full"
                  animate={{
                    x: [0, 60, 0],
                    y: [0, -25, 0],
                    scale: [0.5, 1.5, 0.5],
                    opacity: [0.2, 0.6, 0.2]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  style={{ left: '20%', bottom: '20%' }}
                />
                {/* Burbuja 4 */}
                <motion.div
                  className="absolute w-2.5 h-2.5 bg-white/35 rounded-full"
                  animate={{
                    x: [0, -70, 0],
                    y: [0, 10, 0],
                    scale: [1.2, 0.4, 1.2],
                    opacity: [0.5, 0.9, 0.5]
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                  }}
                  style={{ right: '25%', top: '40%' }}
                />
                {/* Burbuja 5 */}
                <motion.div
                  className="absolute w-1.5 h-1.5 bg-white/50 rounded-full"
                  animate={{
                    x: [0, 90, 0],
                    y: [0, -15, 0],
                    scale: [0.8, 1.8, 0.8],
                    opacity: [0.3, 0.7, 0.3]
                  }}
                  transition={{
                    duration: 2.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                  }}
                  style={{ left: '60%', top: '70%' }}
                />
              </div>
              
              {/* Contenido del botón */}
              <div className="relative z-10 flex items-center gap-3">
                <Play className="w-6 h-6 text-white" />
                {userInfo ? 'CONTINUAR' : 'JUGAR'}
              </div>
            </motion.button>
            

            {/* Botones de Ranking (solo si está conectado con PGS) */}
            {pgsDisplayName && (
              <div className="w-full space-y-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShowRanking}
                  className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 font-medium text-sm py-2.5 px-6 rounded-full border border-green-400/30 hover:border-green-400/50 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  Ver Ranking {gameMode === 'beginner' ? 'Principiante' : gameMode === 'extreme' ? 'Extremo' : 'Normal'}
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitScore}
                  className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium text-sm py-2.5 px-6 rounded-full border border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Enviar Puntuación
                </motion.button>
              </div>
            )}
            
            {/* Separador y texto */}
            {!userInfo && (
              <div className="text-center space-y-3">
                <p className="text-white/70 text-sm">Inicia sesión para guardar tu progreso</p>
                <motion.button
                  whileHover={{ scale: pgsDisplayName ? 1 : 1.02 }}
                  whileTap={{ scale: pgsDisplayName ? 1 : 0.98 }}
                  onClick={handlePGSSignIn}
                  disabled={!!pgsDisplayName}
                  className={`px-6 py-2.5 text-sm font-medium rounded-full border transition-all duration-200 inline-flex items-center gap-2 backdrop-blur-sm ${
                    pgsDisplayName 
                      ? 'bg-green-500/20 text-green-400 border-green-400/50 cursor-not-allowed' 
                      : 'bg-transparent hover:bg-white/10 text-white border-white/30 hover:border-white/50'
                  }`}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  {pgsDisplayName ? `Conectado como ${pgsDisplayName}` : 'Entrar con Google Play Juegos'}
                </motion.button>
              </div>
            )}

            {/* Botón Salir si está logueado */}
            {userInfo && (
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  console.log('🔴 BOTÓN LOGOUT: Click detectado');
                  handleLogout();
                }}
                className="w-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm py-2 px-6 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4" />
                Salir ({userInfo.nombre || userInfo.email})
              </motion.button>
            )}

          </motion.div>


          {/* Indicadores de estado */}
          <div className="mt-4 text-center space-y-1">
            {/* Indicador PGS si está conectado */}
            {pgsDisplayName && (
              <p className="text-green-400 text-xs">
                🎮 Conectado como: {pgsDisplayName}
              </p>
            )}
            
            {/* Selector de modo de juego */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setGameMode('beginner')}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  gameMode === 'beginner' 
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/50' 
                    : 'bg-white/10 text-white/60 border border-white/20'
                }`}
              >
                🌟 Principiante
              </button>
              <button
                onClick={() => setGameMode('normal')}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  gameMode === 'normal' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-400/50' 
                    : 'bg-white/10 text-white/60 border border-white/20'
                }`}
              >
                🎯 Normal
              </button>
              <button
                onClick={() => setGameMode('extreme')}
                className={`px-3 py-1 text-xs rounded-full transition-all ${
                  gameMode === 'extreme' 
                    ? 'bg-red-500/20 text-red-400 border border-red-400/50' 
                    : 'bg-white/10 text-white/60 border border-white/20'
                }`}
              >
                ⚡ Extremo
              </button>
            </div>
            
            {/* Botón de debug */}
            <button
              onClick={() => setShowDebug(!showDebug)}
              className="mt-2 px-2 py-1 text-xs bg-purple-500/20 text-purple-400 border border-purple-400/50 rounded-full hover:bg-purple-500/30 transition-all"
            >
              🔍 {showDebug ? 'Ocultar' : 'Mostrar'} Debug
            </button>
          </div>

          {/* Panel de Debug */}
          {showDebug && (
            <div className="mt-4 p-3 bg-black/50 rounded-lg border border-white/20">
              <h3 className="text-white text-sm font-medium mb-2">🔍 Debug Logs</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {debugLogs.length === 0 ? (
                  <p className="text-white/60 text-xs">No hay logs aún...</p>
                ) : (
                  debugLogs.map((log, index) => (
                    <div key={index} className="text-xs text-white/80 font-mono">
                      {log}
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => setDebugLogs([])}
                className="mt-2 px-2 py-1 text-xs bg-red-500/20 text-red-400 border border-red-400/50 rounded hover:bg-red-500/30 transition-all"
              >
                🗑️ Limpiar Logs
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Copyright */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-2 left-1/2 transform -translate-x-1/2 text-white/50 text-xs text-center z-20"
      >
        © 2024 @intocables13
      </motion.div>

      {/* Modal de Usuario */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Botón de Megadiagnóstico */}
      <DiagnosticButton />


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