import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameState, LevelConfig, Card, UserProgress, GameEvent, User } from '@/types/game';
import { memoflipApi } from '@/lib/capacitorApi';
import { saveProgressToServer as saveProgressAPI } from '@/lib/progressService';

interface GameStore extends GameState {
  // Usuario actual
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  createGuestUser: () => User;
  
  // Sistema de anuncios intersticiales
  levelsCompleted: number;
  incrementLevelCompleted: () => void;
  shouldShowInterstitial: () => boolean;
  
  // Acciones del juego
  setCurrentLevel: (level: number) => void;
  setCoins: (coins: number) => void;
  addCoins: (amount: number) => void;
  setLives: (lives: number) => void;
  loseLife: () => void;
  gainLife: () => void;
  setPaused: (paused: boolean) => void;
  setMuted: (muted: boolean) => void;
  setTimeLeft: (time: number) => void;
  setTotalTime: (time: number) => void;
  setCurrentPhase: (phase: number) => void;
  setCurrentTheme: (theme: string) => void;
  setGameEnded: (ended: boolean) => void;
  setLastLifeLost: (timestamp: number) => void;
  
  // Sistema de regeneración de vidas
  checkLifeRegeneration: () => void;
  getTimeUntilNextLife: () => number;
  
      // Progreso del usuario
      updateProgress: (progress: Partial<UserProgress>) => void;
      getProgress: () => UserProgress;
      saveProgress: () => void;
      saveProgressToServer: () => Promise<void>;
      loadProgress: () => void;
      loadProgressFromServer: () => Promise<void>;
      syncWhenOnline: () => Promise<void>;
  
  // Sistema de eventos
  events: GameEvent[];
  addEvent: (event: GameEvent) => void;
  clearEvents: () => void;
  
  // Estado del nivel actual
  currentCards: Card[];
  setCurrentCards: (cards: Card[]) => void;
  flipCard: (cardId: string | number) => void;
  closeCard: (cardId: string | number) => void;
  matchCards: (cardId1: string | number, cardId2: string | number) => void;
  resetCards: () => void;
  
  // Nivel actual
  currentLevelConfig: LevelConfig | null;
  setCurrentLevelConfig: (config: LevelConfig) => void;
  
  // Reset del juego
  resetGame: () => void;
}

const initialState: GameState = {
  currentLevel: 1,
  maxLevel: 1000,
  coins: 0,
  lives: 3,
  maxLives: 3,
  currentPhase: 1,
  currentTheme: 'ocean',
  isPaused: false,
  isMuted: false,
  totalTime: 0,
  timeLeft: 0,
  attempts: 0,
  levelsCompleted: 0, // ✅ Inicializar contador de niveles completados
  matches: 0,
  totalPairs: 0,
  gameEnded: false,
  lastLifeLost: 0,
  lifeRegenTime: 1800000, // 30 minutos en ms
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      events: [],
      currentCards: [],
      currentLevelConfig: null,
      currentUser: null,

      // Gestión de usuarios
      setCurrentUser: (user) => set({ currentUser: user }),
      createGuestUser: () => {
        const guestUser: User = {
          id: `guest_${Date.now()}`,
          nickname: `Invitado_${Math.floor(Math.random() * 1000)}`,
          name: 'Usuario Invitado',
          email: '',
          createdAt: Date.now(),
          lastLogin: Date.now(),
          isGuest: true,
          progress: {
            level: 1,
            coins: 0,
            lives: 3,
            lastLifeLost: 0, // ✅ TIMESTAMP PARA REGENERACIÓN
            lastPlayed: Date.now(),
            totalScore: 0,
            phase: 1
          }
        };
        set({ currentUser: guestUser });
        return guestUser;
      },

      // Acciones del juego
      setCurrentLevel: (level) => set({ currentLevel: level }),
      setCoins: (coins) => set({ coins }),
      addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),
      
      // ✅ Sistema de anuncios intersticiales
      incrementLevelCompleted: () => set((state) => ({ 
        levelsCompleted: state.levelsCompleted + 1 
      })),
      shouldShowInterstitial: () => {
        const state = get();
        return state.levelsCompleted > 0 && state.levelsCompleted % 10 === 0;
      },
      setLives: (lives) => set({ lives: Math.min(lives, get().maxLives) }),
      loseLife: () => {
        const state = get();
        // loseLife llamado
        const newLives = Math.max(0, state.lives - 1);
        // loseLife: perdiendo vida
        set({ 
          lives: newLives, 
          lastLifeLost: Date.now(),
          gameEnded: newLives === 0
        });
        get().addEvent({
          type: 'LIFE_LOST',
          data: { remainingLives: newLives },
          timestamp: Date.now()
        });
        
        // ✅ GUARDAR VIDAS INMEDIATAMENTE EN EL SERVIDOR
        console.log('💾 [LIVES] Guardando vidas después de perder vida...');
        get().saveProgressToServer();
      },
      gainLife: () => {
        const newLives = Math.min(get().lives + 1, get().maxLives);
        set({ lives: newLives });
        
        // ✅ GUARDAR VIDAS INMEDIATAMENTE EN EL SERVIDOR
        console.log('💾 [LIVES] Guardando vidas después de ganar vida...');
        get().saveProgressToServer();
      },
      setPaused: (paused) => set({ isPaused: paused }),
      setMuted: (muted) => set({ isMuted: muted }),
      setTimeLeft: (time) => set({ timeLeft: time }),
      setTotalTime: (time) => set({ totalTime: time, timeLeft: time }),
      setCurrentPhase: (phase) => set({ currentPhase: phase }),
      setCurrentTheme: (theme) => set({ currentTheme: theme }),
      setGameEnded: (ended) => set({ gameEnded: ended }),
      setLastLifeLost: (timestamp) => set({ lastLifeLost: timestamp }),

    // Sistema de regeneración de vidas
    checkLifeRegeneration: () => {
      const state = get();
      const now = Date.now();
      
      // Si ya tiene todas las vidas, no hacer nada
      if (state.lives >= state.maxLives) {
        return;
      }
      
      // Calcular cuántas vidas se pueden regenerar
      const timeSinceLastLifeLost = now - state.lastLifeLost;
      const livesToRegenerate = Math.floor(timeSinceLastLifeLost / state.lifeRegenTime);
      
      if (livesToRegenerate > 0) {
        const newLives = Math.min(state.lives + livesToRegenerate, state.maxLives);
        const newLastLifeLost = state.lastLifeLost + (livesToRegenerate * state.lifeRegenTime);
        
        set({ 
          lives: newLives, 
          lastLifeLost: newLastLifeLost,
          gameEnded: false // Si se regeneró una vida, el juego ya no terminó
        });
        
        // ✅ GUARDAR VIDAS REGENERADAS EN EL SERVIDOR
        get().saveProgressToServer();
        
        // Agregar evento de regeneración
        get().addEvent({
          type: 'LIFE_REGENERATED',
          data: { 
            newLives, 
            regeneratedCount: livesToRegenerate,
            timeSinceLastLost: timeSinceLastLifeLost
          },
          timestamp: now
        });
      }
    },
      
      getTimeUntilNextLife: () => {
        const state = get();
        const now = Date.now();
        const timeSinceLastLifeLost = now - state.lastLifeLost;
        const timeUntilNext = state.lifeRegenTime - (timeSinceLastLifeLost % state.lifeRegenTime);
        
        return Math.max(0, timeUntilNext);
      },

      // Progreso del usuario
      updateProgress: (progress) => {
        const currentProgress = get().getProgress();
        const newProgress = { ...currentProgress, ...progress };
        set({
          currentLevel: newProgress.level,
          coins: newProgress.coins,
          lives: newProgress.lives,
          lastLifeLost: newProgress.lastLifeLost || get().lastLifeLost, // ✅ CARGAR TIMESTAMP
          currentPhase: newProgress.phase,
        });
      },
      getProgress: () => {
        const state = get();
        return {
          level: state.currentLevel,
          coins: state.coins,
          lives: state.lives,
          lastLifeLost: state.lastLifeLost, // ✅ GUARDAR TIMESTAMP DE REGENERACIÓN
          lastPlayed: Date.now(),
          totalScore: state.coins, // Por ahora usamos coins como score
          phase: state.currentPhase,
          levelsCompleted: state.levelsCompleted, // ✅ Incluir contador de anuncios
        };
      },
      saveProgress: () => {
        const progress = get().getProgress();
        localStorage.setItem('memoflip_progress', JSON.stringify(progress));
      },
      loadProgress: () => {
        try {
          const saved = localStorage.getItem('memoflip_progress');
          if (saved) {
            const progress: UserProgress = JSON.parse(saved);
            get().updateProgress(progress);
            
            // ✅ Cargar contador de niveles completados
            if (progress.levelsCompleted !== undefined) {
              set({ levelsCompleted: progress.levelsCompleted });
            }
          }
        } catch (error) {
          // Error loading progress
        }
      },

      // Guardar progreso en el servidor (híbrido offline/online)
      saveProgressToServer: async () => {
        const state = get();
        const user = state.currentUser;
        
        // SIEMPRE guardar localmente primero (funciona offline)
        get().saveProgress();
        
        if (!user || user.isGuest) {
          console.log('🔒 Solo guardando local: usuario invitado');
          return;
        }

        // Verificar conexión a internet
        if (!navigator.onLine) {
          console.log('📴 Sin internet: guardado solo local');
          localStorage.setItem('memoflip_pending_sync', 'true');
          return;
        }

        try {
          await saveProgressAPI({
            user_key: user.id,
            level: state.currentLevel,
            coins: state.coins,
            lives: state.lives,
            total_score: state.coins // ✅ AGREGAR total_score para el ranking
          });
          
          console.log('✅ [SAVE] Progreso guardado CORRECTAMENTE');
          localStorage.removeItem('memoflip_pending_sync');
        } catch (error) {
          console.error('❌ [SAVE] Error:', error);
          localStorage.setItem('memoflip_pending_sync', 'true');
        }
      },

      // Cargar progreso (híbrido offline/online)
      loadProgressFromServer: async () => {
        const state = get();
        const user = state.currentUser;
        
        // SIEMPRE cargar datos locales primero (funciona offline)
        get().loadProgress();
        
        if (!user || user.isGuest) {
          console.log('🔒 Solo cargando local: usuario invitado');
          return;
        }

        // Verificar conexión a internet
        if (!navigator.onLine) {
          console.log('📴 Sin internet: usando datos locales');
          return;
        }

        try {
          const data = await memoflipApi(`game.php?action=get_progress&user_key=${user.id}`, {
            method: 'GET'
          });
          
          if (data.success && data.progress) {
            const serverProgress = data.progress;
            const localProgress = get().getProgress();
            
            // ✅ Usar el progreso más avanzado (local vs servidor)
            const bestLevel = Math.max(
              serverProgress.max_level_unlocked || 1,
              localProgress.level
            );
            const bestCoins = Math.max(
              serverProgress.coins_total || 0,
              localProgress.coins
            );
            
            set({
              currentLevel: bestLevel,
              coins: bestCoins,
              lives: serverProgress.lives_current || 3,
              currentPhase: Math.ceil(bestLevel / 50)
            });
            
            console.log('✅ Progreso sincronizado (mejor de local/servidor):', {
              local: { level: localProgress.level, coins: localProgress.coins },
              servidor: { level: serverProgress.max_level_unlocked, coins: serverProgress.coins_total },
              mejor: { level: bestLevel, coins: bestCoins, lives: serverProgress.lives_current }
            });
          }
        } catch (error) {
          console.error('❌ Error cargando progreso del servidor, usando datos locales:', error);
        }
      },

      // Sincronizar cuando vuelve la conexión
      syncWhenOnline: async () => {
        const pendingSync = localStorage.getItem('memoflip_pending_sync');
        if (pendingSync === 'true' && navigator.onLine) {
          console.log('🔄 Sincronizando datos pendientes...');
          await get().saveProgressToServer();
        }
      },

      // Sistema de eventos
      addEvent: (event) => set((state) => ({ 
        events: [...state.events, event].slice(-100) // Mantener solo los últimos 100 eventos
      })),
      clearEvents: () => set({ events: [] }),

      // Cartas
      setCurrentCards: (cards) => set({ currentCards: cards }),
      flipCard: (cardId) => {
        const state = get();
        if (!Array.isArray(state.currentCards)) {
          // currentCards no es un array
          return;
        }
        const newCards = state.currentCards.map(card => 
          card.id === cardId ? { ...card, isFlipped: true } : card
        );
        set({ currentCards: newCards });
        get().addEvent({
          type: 'CARD_FLIP',
          data: { cardId },
          timestamp: Date.now()
        });
      },
      closeCard: (cardId) => {
        const state = get();
        if (!Array.isArray(state.currentCards)) {
          // currentCards no es un array en closeCard
          return;
        }
        const newCards = state.currentCards.map(card => 
          card.id === cardId ? { ...card, isFlipped: false } : card
        );
        set({ currentCards: newCards });
      },
      matchCards: (cardId1, cardId2) => {
        const state = get();
        if (!Array.isArray(state.currentCards)) {
          // currentCards no es un array en matchCards
          return;
        }
        const newCards = state.currentCards.map(card => 
          card.id === cardId1 || card.id === cardId2 
            ? { ...card, isMatched: true, isFlipped: true }
            : card
        );
        set({ 
          currentCards: newCards,
          matches: state.matches + 1
        });
        get().addEvent({
          type: 'CARD_MATCH',
          data: { cardId1, cardId2 },
          timestamp: Date.now()
        });
      },
      resetCards: () => set({ 
        currentCards: [],
        attempts: 0,
        matches: 0,
        totalPairs: 0
      }),

      // Configuración del nivel
      setCurrentLevelConfig: (config) => set({ 
        currentLevelConfig: config,
        totalPairs: config.pairs,
        totalTime: config.timeSec || 0,
        timeLeft: config.timeSec || 0
      }),

      // Reset del juego
      resetGame: () => set({
        ...initialState,
        events: [],
        currentCards: [],
        currentLevelConfig: null,
      }),
    }),
    {
      name: 'memoflip-game-storage',
      partialize: (state) => ({
        currentLevel: state.currentLevel,
        coins: state.coins,
        lives: state.lives,
        currentPhase: state.currentPhase,
        currentTheme: state.currentTheme,
        isMuted: state.isMuted,
        lastLifeLost: state.lastLifeLost,
      }),
    }
  )
);
