// Tipos principales del juego MemoFlip Neo

export interface LevelConfig {
  id: number;
  phase: number;
  theme: string;
  pairs: number;
  timeSec: number | null;
  mechanics: MechanicName[];
  seed: number;
  isBoss: boolean;
  rewards: {
    coins: number;
    lives?: number;
  };
}

export type MechanicName = 
  | 'basic' 
  | 'fog' 
  | 'bomb' 
  | 'ghost' 
  | 'chameleon' 
  | 'rotation' 
  | 'peeked_card' 
  | 'combo' 
  | 'frozen' 
  | 'darkness' 
  | 'trio';

export interface GameState {
  currentLevel: number;
  maxLevel: number;
  coins: number;
  lives: number;
  maxLives: number;
  currentPhase: number;
  currentTheme: string;
  isPaused: boolean;
  isMuted: boolean;
  totalTime: number;
  timeLeft: number;
  attempts: number;
  matches: number;
  totalPairs: number;
  gameEnded: boolean;
  lastLifeLost: number;
  lifeRegenTime: number;
  levelsCompleted: number; // ✅ Contador para anuncios intersticiales
}

export interface Card {
  id: string | number;
  value: string | number;
  image?: string;
  isFlipped: boolean;
  isMatched: boolean;
  isVisible: boolean;
  mechanic?: MechanicName;
  mechanicData?: Record<string, unknown>;
  slot?: number; // Posición en el grid de 24 slots
  // congelación
  isFrozen?: boolean;
  freezeUntil?: number; // epoch ms
}

export interface Phase {
  id: number;
  name: string;
  theme: string;
  startLevel: number;
  endLevel: number;
  description: string;
  background: string;
  cardBack: string;
  mechanics: MechanicName[];
}

export interface UserProgress {
  level: number;
  coins: number;
  lives: number;
  lastLifeLost: number; // ✅ TIMESTAMP PARA REGENERACIÓN OFFLINE
  lastPlayed: number;
  totalScore: number;
  phase: number;
  levelsCompleted?: number; // ✅ Contador para anuncios intersticiales
}

export interface User {
  id: string;
  nickname: string;
  name: string;
  email: string;
  createdAt: number;
  lastLogin: number;
  isGuest: boolean;
  progress: UserProgress;
}

export interface UserFormData {
  nickname: string;
  name: string;
  email: string;
}

export interface GameEvent {
  type: 'CARD_FLIP' | 'CARD_MATCH' | 'CARD_MISS' | 'TRIO_MATCH' | 'LEVEL_COMPLETE' | 'LEVEL_FAIL' | 'LIFE_LOST' | 'LIFE_REGENERATED' | 'COIN_EARNED' | 'MECHANIC_ACTIVATED';
  data?: Record<string, unknown>;
  timestamp: number;
}

export interface BossLevel extends LevelConfig {
  isBoss: true;
  specialMechanics: MechanicName[];
  bossName: string;
  bossDescription: string;
  bossReward: {
    coins: number;
    lives: number;
    specialItem?: string;
  };
}

// Configuración de mecánicas
export interface MechanicConfig {
  name: MechanicName;
  displayName: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  phaseRequirement: number;
  probability: number;
}

// Configuración de temas
export interface ThemeConfig {
  id: string;
  name: string;
  phase: number;
  background: string;
  cardBack: string;
  cardFront: string;
  particles: string;
  music: string;
  description: string;
}

// Estado interno de la mecánica "frozen"
export interface FrozenMechanicState {
  enabled: boolean;
  phase: 'freeze' | 'unfreeze';
  frozenIds: string[];     // EXACTAMENTE 2 ids cuando está en fase 'unfreeze'
  nextActionAt: number;    // epoch ms del próximo cambio de fase
  intervalMs: number;      // cada cuánto se vuelve a congelar (X)
  durationMs: number;      // cuánto dura la congelación (Y)
}
