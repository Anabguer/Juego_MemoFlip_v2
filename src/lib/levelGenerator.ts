import { LevelConfig, MechanicName, Phase } from '@/types/game';

// ============================================================================
// 🎮 GENERADOR DE 1000 NIVELES PARA MEMOFLIP NEO - CON NIVELES DE DESCANSO
// ============================================================================

// Fases del juego (cada 50 niveles)
export const PHASES: Phase[] = [
  {
    id: 1,
    name: 'Océano',
    theme: 'ocean',
    startLevel: 1,
    endLevel: 50,
    description: 'Sumérgete en las profundidades del océano',
    background: 'ocean-bg',
    cardBack: 'ocean-card',
    mechanics: ['basic', 'fog', 'ghost'],
  },
  {
    id: 2,
    name: 'Golosinas',
    theme: 'candyland',
    startLevel: 51,
    endLevel: 100,
    description: 'Un mundo dulce lleno de sorpresas',
    background: 'candy-bg',
    cardBack: 'candy-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon'],
  },
  {
    id: 3,
    name: 'Espacio',
    theme: 'space',
    startLevel: 101,
    endLevel: 150,
    description: 'Explora las estrellas y planetas',
    background: 'space-bg',
    cardBack: 'space-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon'],
  },
  {
    id: 4,
    name: 'Bosque',
    theme: 'forest',
    startLevel: 151,
    endLevel: 200,
    description: 'Aventúrate en el bosque encantado',
    background: 'forest-bg',
    cardBack: 'forest-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation'],
  },
  {
    id: 5,
    name: 'Ciudad',
    theme: 'city',
    startLevel: 201,
    endLevel: 250,
    description: 'Explora la ciudad futurista',
    background: 'city-bg',
    cardBack: 'city-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card'],
  },
  {
    id: 6,
    name: 'Desierto',
    theme: 'desert',
    startLevel: 251,
    endLevel: 300,
    description: 'Cruza las dunas del desierto',
    background: 'desert-bg',
    cardBack: 'desert-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo'],
  },
  {
    id: 7,
    name: 'Ártico',
    theme: 'arctic',
    startLevel: 301,
    endLevel: 350,
    description: 'Sobrevive en el frío extremo',
    background: 'arctic-bg',
    cardBack: 'arctic-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen'],
  },
  {
    id: 8,
    name: 'Jungla',
    theme: 'jungle',
    startLevel: 351,
    endLevel: 400,
    description: 'Navega por la jungla tropical',
    background: 'jungle-bg',
    cardBack: 'jungle-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  {
    id: 9,
    name: 'Volcán',
    theme: 'volcano',
    startLevel: 401,
    endLevel: 450,
    description: 'Escapa del volcán en erupción',
    background: 'volcano-bg',
    cardBack: 'volcano-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  {
    id: 10,
    name: 'Cristal',
    theme: 'crystal',
    startLevel: 451,
    endLevel: 500,
    description: 'Explora el reino cristalino',
    background: 'crystal-bg',
    cardBack: 'crystal-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  // Continuar hasta 20 fases (1000 niveles)
  {
    id: 11,
    name: 'Nebulosa',
    theme: 'nebula',
    startLevel: 501,
    endLevel: 550,
    description: 'Viaja a través de la nebulosa',
    background: 'nebula-bg',
    cardBack: 'nebula-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  {
    id: 12,
    name: 'Submarino',
    theme: 'underwater',
    startLevel: 551,
    endLevel: 600,
    description: 'Explora las profundidades abisales',
    background: 'underwater-bg',
    cardBack: 'underwater-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  {
    id: 13,
    name: 'Laboratorio',
    theme: 'laboratory',
    startLevel: 601,
    endLevel: 650,
    description: 'Experimenta en el laboratorio',
    background: 'laboratory-bg',
    cardBack: 'laboratory-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  {
    id: 14,
    name: 'Cementerio',
    theme: 'graveyard',
    startLevel: 651,
    endLevel: 700,
    description: 'Navega por el cementerio encantado',
    background: 'graveyard-bg',
    cardBack: 'graveyard-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  {
    id: 15,
    name: 'Palacio',
    theme: 'palace',
    startLevel: 701,
    endLevel: 750,
    description: 'Explora el palacio real',
    background: 'palace-bg',
    cardBack: 'palace-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  {
    id: 16,
    name: 'Mina',
    theme: 'mine',
    startLevel: 751,
    endLevel: 800,
    description: 'Extrae gemas en la mina',
    background: 'mine-bg',
    cardBack: 'mine-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  {
    id: 17,
    name: 'Templo',
    theme: 'temple',
    startLevel: 801,
    endLevel: 850,
    description: 'Descubre los secretos del templo',
    background: 'temple-bg',
    cardBack: 'temple-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  {
    id: 18,
    name: 'Castillo',
    theme: 'castle',
    startLevel: 851,
    endLevel: 900,
    description: 'Asalta el castillo medieval',
    background: 'castle-bg',
    cardBack: 'castle-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  {
    id: 19,
    name: 'Dimension',
    theme: 'dimension',
    startLevel: 901,
    endLevel: 950,
    description: 'Viaja a otra dimensión',
    background: 'dimension-bg',
    cardBack: 'dimension-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
  {
    id: 20,
    name: 'Final',
    theme: 'final',
    startLevel: 951,
    endLevel: 1000,
    description: 'El desafío final',
    background: 'final-bg',
    cardBack: 'final-card',
    mechanics: ['basic', 'fog', 'ghost', 'bomb', 'chameleon', 'combo', 'rotation', 'peeked_card', 'combo', 'frozen', 'darkness'],
  },
];

// Mecánicas disponibles con porcentajes (equilibradas)
const MECHANICS = {
  'basic': { percentage: 0.15, category: 'basic', good: true },
  'fog': { percentage: 0.15, category: 'basic', good: true },      // Aumentado
  'bomb': { percentage: 0.10, category: 'special', good: false },  // Reducido
  'ghost': { percentage: 0.08, category: 'basic', good: true },    // Aumentado
  'chameleon': { percentage: 0.12, category: 'special', good: true }, // Aumentado
  'combo': { percentage: 0.10, category: 'advanced', good: true },    // Aumentado
  'rotation': { percentage: 0.05, category: 'advanced', good: false }, // Reducido
  'peeked_card': { percentage: 0.08, category: 'advanced', good: true },   // Aumentado
  'frozen': { percentage: 0.06, category: 'advanced', good: false },  // Reducido
  'darkness': { percentage: 0.05, category: 'advanced', good: false }, // Reducido
  'trio': { percentage: 0.04, category: 'advanced', good: true }, // Nueva mecánica
};

// Helper LCG centralizado
function lcg(seed: number): number {
  return ((seed * 9301 + 49297) % 233280) / 233280;
}

// Helper para generar enteros aleatorios
function randInt(seed: number, min: number, max: number): number {
  return Math.floor(lcg(seed) * (max - min + 1)) + min;
}

// ============================================================================
// 🎛️ PHASE CONTROLLER - Control de cuotas por fase
// ============================================================================

interface PhaseStats {
  phase: number;
  levelCount: number;
  card24Count: number;
  multiCount: number;
  noTimerCount: number;
  hardStreak: number;
  timerStreak: number;
}

class PhaseController {
  private stats: Map<number, PhaseStats> = new Map();
  private mechanicCooldown: Map<string, number> = new Map(); // mecánica -> último nivel usado
  
  getPhaseStats(level: number): PhaseStats {
    const phase = Math.ceil(level / 50);
    if (!this.stats.has(phase)) {
      this.stats.set(phase, {
        phase,
        levelCount: 0,
        card24Count: 0,
        multiCount: 0,
        noTimerCount: 0,
        hardStreak: 0,
        timerStreak: 0,
      });
    }
    return this.stats.get(phase)!;
  }
  
  // Verificar si una mecánica está en cooldown
  // NOTA: Cooldown cross-fase (nivel absoluto) - evita repetir mecánicas justo al cambiar de fase
  isMechanicOnCooldown(mechanic: MechanicName, level: number): boolean {
    const lastUsed = this.mechanicCooldown.get(mechanic);
    return lastUsed !== undefined && (level - lastUsed) < 5; // Cooldown de 5 niveles
  }
  
  // Registrar uso de mecánica
  recordMechanicUse(mechanic: MechanicName, level: number) {
    this.mechanicCooldown.set(mechanic, level);
  }
  
  updateStats(level: number, pairs: number, mechanics: MechanicName[], timeSec: number, isBoss: boolean) {
    if (isBoss) return; // Boss no cuenta en estadísticas
    
    const stats = this.getPhaseStats(level);
    stats.levelCount++;
    
    if (pairs === 12) stats.card24Count++;
    if (mechanics.length > 1) stats.multiCount++;
    if (timeSec === 0) stats.noTimerCount++;
    
    // Registrar uso de mecánicas para cooldown
    mechanics.forEach(mechanic => {
      if (mechanic !== 'basic') {
        this.recordMechanicUse(mechanic, level);
      }
    });
    
    // Actualizar streaks usando función consistente
    const levelHardness = isHard(pairs, mechanics, timeSec);
    const hasTimer = timeSec > 0;
    
    stats.hardStreak = levelHardness ? stats.hardStreak + 1 : 0;
    stats.timerStreak = hasTimer ? stats.timerStreak + 1 : 0;
  }
  
  // Método para resetear estadísticas (útil para sesiones de generación)
  reset() {
    this.stats.clear();
    this.mechanicCooldown.clear();
  }
  
  // Telemetría de fase para debug rápido
  getSnapshot(level: number) {
    const s = this.getPhaseStats(level);
    const d = s.levelCount || 1; // Evitar división por 0
    return { 
      phase: s.phase, 
      levelCount: s.levelCount, 
      pct24: +(s.card24Count/d*100).toFixed(1),
      pctMulti: +(s.multiCount/d*100).toFixed(1),
      pctNoTimer: +(s.noTimerCount/d*100).toFixed(1),
      hardStreak: s.hardStreak, 
      timerStreak: s.timerStreak
    };
  }
  
  shouldForce24(level: number): boolean {
    const stats = this.getPhaseStats(level);
    const target24Cards = 5; // 5 niveles + 1 boss = 6/50 = 12% total incluyendo boss
    return stats.card24Count < target24Cards && stats.levelCount < 45; // Últimos 5 niveles no forzar
  }
  
  hasReached24Quota(level: number): boolean {
    const stats = this.getPhaseStats(level);
    const target24Cards = 5; // 5 niveles + 1 boss = 6/50 = 12% total incluyendo boss
    return stats.card24Count >= target24Cards;
  }
  
  shouldAimMulti(level: number): boolean {
    const stats = this.getPhaseStats(level);
    const targetMulti = 0.4; // 40% multi-mecánicas
    const currentMulti = stats.levelCount > 0 ? stats.multiCount / stats.levelCount : 0;
    return currentMulti < targetMulti;
  }
  
  isOverMultiQuota(level: number): boolean {
    const stats = this.getPhaseStats(level);
    const targetMulti = 0.4; // 40% multi-mecánicas
    const currentMulti = stats.levelCount > 0 ? stats.multiCount / stats.levelCount : 0;
    return currentMulti > targetMulti;
  }
  
  shouldGoNoTimer(level: number): boolean {
    const stats = this.getPhaseStats(level);
    const targetNoTimer = 0.6; // 60% sin cronómetro
    const currentNoTimer = stats.levelCount > 0 ? stats.noTimerCount / stats.levelCount : 0;
    return currentNoTimer < targetNoTimer;
  }
  
  shouldBreakHardStreak(level: number): boolean {
    const stats = this.getPhaseStats(level);
    return stats.hardStreak >= 2; // Máximo 2 hard seguidos
  }
  
  shouldBreakTimerStreak(level: number): boolean {
    const stats = this.getPhaseStats(level);
    return stats.timerStreak >= 3; // Máximo 3 con cronómetro seguidos
  }
}

const phaseController = new PhaseController();

// Helper para seleccionar una mecánica por porcentaje
function pickOneByPercentage(seed: number, filter: (m: MechanicName) => boolean): MechanicName {
  const candidates = (Object.keys(MECHANICS) as MechanicName[]).filter(filter);
  if (!candidates.length) return 'basic' as MechanicName; // Protección contra filtros vacíos
  
  const total = candidates.reduce((s, m) => s + MECHANICS[m].percentage, 0);
  const rSeed = (seed * 9301 + 49297) % 233280;
  let r = rSeed / 233280 * total;
  for (const m of candidates) {
    r -= MECHANICS[m].percentage;
    if (r <= 0) return m;
  }
  return candidates[candidates.length - 1];
}

// Helper para calcular dificultad de forma consistente
function isHard(pairs: number, mechanics: MechanicName[], timeSec: number): boolean {
  const hasNegativeMechanics = mechanics.some(m => m !== 'basic' && MECHANICS[m as keyof typeof MECHANICS] && !MECHANICS[m as keyof typeof MECHANICS].good);
  return pairs >= 9 || hasNegativeMechanics || (timeSec > 0 && pairs >= 5);
}

// Reglas de generación
const RULES = {
  noConsecutiveMechanics: true,
  noConsecutive24Cards: true,
  maxMechanicsPerLevel: 4,
  minMechanicsPerLevel: 1,
  noTimerPercentage: 0.60, // 60% sin cronómetro (niveles de descanso)
  multipleMechanicsPercentage: 0.4, // 40% con múltiples mecánicas
  max24CardsPercentage: 0.12, // 12% de niveles de 24 cartas
  
  // Distribución de pares por rango (máximo 12 pares = 24 cartas)
  pairsDistribution: {
    '2-4': 0.30,    // 30% niveles fáciles
    '5-8': 0.40,    // 40% niveles medios
    '9-12': 0.30    // 30% niveles difíciles (máximo 12 pares)
  },
  
  // Sesgo dinámico para niveles de respiro
  difficultyBias: {
    afterHardLevel: 0.8,    // 80% probabilidad de nivel fácil tras uno duro
    afterEasyLevel: 0.3,    // 30% probabilidad de nivel fácil tras uno fácil
    afterMediumLevel: 0.5   // 50% probabilidad de nivel fácil tras uno medio
  }
};

// Función para determinar dificultad del nivel anterior
function getPreviousDifficulty(previousLevelConfig: LevelConfig | null): 'easy' | 'medium' | 'hard' {
  if (!previousLevelConfig) return 'medium';
  
  const pairs = previousLevelConfig.pairs;
  const timeSec = previousLevelConfig.timeSec || 0;
  const mechanics = previousLevelConfig.mechanics;
  
  // Usar función consistente para calcular dificultad
  if (isHard(pairs, mechanics, timeSec)) return 'hard';
  if (pairs >= 5 || mechanics.length > 1 || timeSec > 0) return 'medium';
  return 'easy';
}

// Función para generar pares según distribución con sesgo dinámico
function generatePairs(level: number, seed: number, previousLevelConfig: LevelConfig | null): number {
  const random = lcg(seed);
  
  // Tutorial levels (1-5)
  if (level <= 5) {
    return level + 1; // 2, 3, 4, 5, 6 pairs
  }
  
  // Boss levels always have 12 pairs (24 cards)
  if (isBossLevel(level)) {
    return 12;
  }
  
  // Apply rule to avoid 24 cards consecutively
  if (RULES.noConsecutive24Cards && previousLevelConfig && previousLevelConfig.pairs === 12) {
    const avoidSeed = seed ^ 0x12345678; // Sub-semilla para evitar sesgar el random principal
    const pairs = Math.floor(lcg(avoidSeed) * 10) + 2; // 2-11 pairs
    return pairs === 12 ? 11 : pairs; // Ensure it's not 12
  }
  
  // Determine if it should be a 24-card level (con cupo por fase corregido)
  const underQuota24 = phaseController.shouldForce24(level);
  if (underQuota24 && !(previousLevelConfig?.pairs === 12 && RULES.noConsecutive24Cards)) {
    return 12;
  }
  
  const allow24 = !phaseController.hasReached24Quota(level) && (random < RULES.max24CardsPercentage);
  if (allow24) return 12;
  
  // Aplicar sesgo dinámico basado en nivel anterior
  const previousDifficulty = getPreviousDifficulty(previousLevelConfig);
  let easyProbability = RULES.pairsDistribution['2-4'];
  
  if (previousDifficulty === 'hard') {
    easyProbability = RULES.difficultyBias.afterHardLevel;
  } else if (previousDifficulty === 'easy') {
    easyProbability = RULES.difficultyBias.afterEasyLevel;
  } else {
    easyProbability = RULES.difficultyBias.afterMediumLevel;
  }
  
  // Ajustar distribución con sesgo
  const mediumProbability = (1 - easyProbability) * 0.6; // 60% de lo que queda
  const hardProbability = (1 - easyProbability) * 0.4;   // 40% de lo que queda
  
  // Aplicar distribución de probabilidades con sesgo dinámico
  if (random < easyProbability) {
    // 2-4 pares (fácil)
    const normalizedRandom = Math.max(0, Math.min(1, random / easyProbability));
    return Math.floor(normalizedRandom * 3) + 2;
  } else if (random < easyProbability + mediumProbability) {
    // 5-8 pares (medio)
    const normalizedRandom = Math.max(0, Math.min(1, (random - easyProbability) / mediumProbability));
    return Math.floor(normalizedRandom * 4) + 5;
  } else {
    // 9-12 pares (difícil) - máximo 12 pares
    const normalizedRandom = Math.max(0, Math.min(1, (random - easyProbability - mediumProbability) / hardProbability));
    return Math.floor(normalizedRandom * 4) + 9;
  }
  
  // Fallback de seguridad - nunca devolver menos de 2 pares
  return Math.max(2, Math.min(12, Math.floor(random * 10) + 2));
}

// Función para generar tiempo (determinística basada en seed) con curva mejorada
function generateTime(level: number, seed: number, pairs?: number, mechanics?: MechanicName[]): number {
  const wantsNoTimerByQuota = phaseController.shouldGoNoTimer(level);
  const mustBreakTimerStreak = phaseController.shouldBreakTimerStreak(level);
  const random = lcg(seed);

  if (wantsNoTimerByQuota) return 0;
  
  if (mustBreakTimerStreak) {
    // Rompe racha eligiendo lo que acerque a la cuota
    return 0; // Siempre sin cronómetro para romper racha
  }
  
  // Decisión normal basada en porcentaje
  if (random < RULES.noTimerPercentage) return 0;
  
  // 40% con cronómetro - tiempo basado en nivel + complejidad real
  const minTime = 30; // Suelo mínimo de 30 segundos
  const maxTime = 120; // Techo máximo de 120 segundos
  const curve = 1 - Math.pow(level / 1000, 0.5); // Curva menos agresiva (raíz cuadrada)
  
  // Factores de complejidad
  const negMods = (mechanics || []).filter(m => m !== 'basic' && MECHANICS[m as keyof typeof MECHANICS] && !MECHANICS[m as keyof typeof MECHANICS].good).length;
  const pairsFactor = (pairs ?? 6) / 12; // 0..1
  const mechFactor = Math.min(1, 0.2 * negMods); // hasta +20% por mecánica negativa
  
  let base = minTime + (maxTime - minTime) * (0.5 * curve + 0.5 * pairsFactor);
  base *= (1 + mechFactor);
  
  const variation = Math.floor(lcg(seed ^ 0xC2B2AE35) * 30);
  return Math.max(minTime, Math.min(maxTime, Math.floor(base + variation)));
}

// Función para seleccionar mecánicas (determinística basada en seed)
function selectMechanics(level: number, seed: number, previousLevelConfig: LevelConfig | null): MechanicName[] {
  const mechanics: MechanicName[] = ['basic'];
  
  // Tutorial (niveles 1-5): Solo básico
  if (level <= 5) return mechanics;
  
  // Regla de no mecánicas consecutivas (corregida)
  const prevHadNonBasic = !!(previousLevelConfig && previousLevelConfig.mechanics.some(m => m !== 'basic'));
  
  if (RULES.noConsecutiveMechanics && prevHadNonBasic) {
    // Si quieres permitir contraste:
    const prevHadNeg = previousLevelConfig!.mechanics.some(m => m !== 'basic' && MECHANICS[m as keyof typeof MECHANICS] && !MECHANICS[m as keyof typeof MECHANICS].good);
    const prevHadPos = previousLevelConfig!.mechanics.some(m => m !== 'basic' && MECHANICS[m as keyof typeof MECHANICS] && MECHANICS[m as keyof typeof MECHANICS].good);

    if (prevHadNeg && !prevHadPos) {
      // solo positivas esta vez
      const phaseAllowed = new Set(getPhaseByLevel(level).mechanics);
      const mechanic = pickOneByPercentage(seed, m => m !== 'basic' && MECHANICS[m as keyof typeof MECHANICS].good && phaseAllowed.has(m));
      const result: MechanicName[] = ['basic', mechanic];
      
      // Añadir segunda mecánica si se necesita cuota multi
      if (phaseController.shouldAimMulti(level)) {
        const seed2 = seed ^ 0xABCDEF;
        const mechanic2 = pickOneByPercentage(seed2, m => !result.includes(m) && MECHANICS[m as keyof typeof MECHANICS].good && phaseAllowed.has(m));
        if (mechanic2) result.push(mechanic2);
      }
      
      // Respetar maxMechanicsPerLevel
      if (result.length > RULES.maxMechanicsPerLevel) {
        result.length = RULES.maxMechanicsPerLevel;
      }
      return result;
    }
    if (!prevHadNeg && prevHadPos) {
      // solo negativas esta vez
      const phaseAllowed = new Set(getPhaseByLevel(level).mechanics);
      const mechanic = pickOneByPercentage(seed, m => m !== 'basic' && !MECHANICS[m as keyof typeof MECHANICS].good && phaseAllowed.has(m));
      const result: MechanicName[] = ['basic', mechanic];
      
      // Añadir segunda mecánica si se necesita cuota multi
      if (phaseController.shouldAimMulti(level)) {
        const seed2 = seed ^ 0xABCDEF;
        const mechanic2 = pickOneByPercentage(seed2, m => !result.includes(m) && !MECHANICS[m as keyof typeof MECHANICS].good && phaseAllowed.has(m));
        if (mechanic2) result.push(mechanic2);
      }
      
      // Respetar maxMechanicsPerLevel
      if (result.length > RULES.maxMechanicsPerLevel) {
        result.length = RULES.maxMechanicsPerLevel;
      }
      return result;
    }
    // Si tuvo mezcla o no quieres contraste, forzar descanso:
    return ['basic'];
  }
  
  // Introducción gradual de mecánicas (niveles 6-20)
  if (level <= 20) {
    if (level === 7) mechanics.push('fog');
    if (level === 11) mechanics.push('ghost');
    if (level === 15) mechanics.push('bomb');
    if (level === 18) mechanics.push('chameleon');
    return mechanics;
  }
  
  // Niveles 21+: Selección basada en porcentajes con cuota por fase
  const random = lcg(seed);
  
  // Determinar número de mecánicas con cuota por fase
  let numMechanics = 1;
  if (level <= 100) {
    numMechanics = randInt(seed, 1, 3); // 1-3 mecánicas
  } else {
    numMechanics = randInt(seed, 2, 4); // 2-4 mecánicas
  }
  
  // Ajustar por cuota de multi-mecánicas (cap y empuje)
  if (phaseController.shouldAimMulti(level)) {
    numMechanics = Math.max(numMechanics, 2); // Forzar al menos 2 mecánicas
  } else if (phaseController.isOverMultiQuota(level)) {
    // Si te pasaste, baja
    numMechanics = Math.min(numMechanics, level <= 100 ? 2 : 3);
  }
  
  // Limitar según reglas
  numMechanics = Math.min(numMechanics, RULES.maxMechanicsPerLevel);
  numMechanics = Math.max(numMechanics, RULES.minMechanicsPerLevel);
  
  // Seleccionar mecánicas según porcentajes usando helper y filtro por fase + cooldown
  const phaseAllowed = new Set(getPhaseByLevel(level).mechanics);
  let currentSeed = seed;
  
  for (let i = 0; i < numMechanics - 1; i++) { // -1 porque ya tenemos 'basic'
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    
    // Intentar primero con cooldown estricto
    let mechanic = pickOneByPercentage(currentSeed, m => 
      !mechanics.includes(m) && 
      phaseAllowed.has(m) && 
      !phaseController.isMechanicOnCooldown(m, level)
    );
    
    // Si no hay candidatos y necesitamos mantener cuota multi, relajar cooldown
    if (mechanic === 'basic' && phaseController.shouldAimMulti(level)) {
      mechanic = pickOneByPercentage(currentSeed, m => 
        !mechanics.includes(m) && 
        phaseAllowed.has(m)
      );
    }
    
    if (mechanic !== 'basic') { // Evitar duplicar 'basic'
      mechanics.push(mechanic);
    }
  }
  
  // Respetar maxMechanicsPerLevel por seguridad
  if (mechanics.length > RULES.maxMechanicsPerLevel) {
    mechanics.length = RULES.maxMechanicsPerLevel;
  }
  
  return mechanics;
}

// Función para determinar si es nivel boss (cada 50 niveles)
function isBossLevel(level: number): boolean {
  return level % 50 === 0;
}

// Función para obtener la fase por nivel
export function getPhaseByLevel(level: number): Phase {
  return PHASES.find(phase => level >= phase.startLevel && level <= phase.endLevel) || PHASES[0];
}

// Función principal para generar configuración de nivel
// Función para generar configuración de nivel (determinística)
// NOTA: Para reproducibilidad estricta, usar siempre generateLevels(1, N) secuencialmente
export function getLevelConfig(level: number, previousLevelConfig: LevelConfig | null = null): LevelConfig {
  const phase = getPhaseByLevel(level);
  const isBoss = isBossLevel(level);
  
  // Seed determinístico basado en el nivel + offset para variación entre jugadores
  const playerOffset = 0; // TODO: Implementar offset por jugador si se desea
  const baseSeed = level * 12345 + phase.id * 67890 + playerOffset;
  
  // Sub-semillas para evitar correlaciones
  const seedPairs = baseSeed ^ 0x9E3779B9;
  const seedMech = baseSeed ^ 0x7F4A7C15;
  const seedTime = baseSeed ^ 0x85EBCA77;
  
  // Configuración base (orden corregido)
  const pairs = generatePairs(level, seedPairs, previousLevelConfig);
  const mechanics = selectMechanics(level, seedMech, previousLevelConfig);
  const timeSec = generateTime(level, seedTime, pairs, mechanics);
  
  // Configuración especial para niveles boss
  if (isBoss) {
    const bossPairs = 12; // Boss siempre tiene 12 pares (24 cartas)
    const phaseAllowed = new Set(getPhaseByLevel(level).mechanics);
    const bossMechanics: MechanicName[] = ['basic'];
    
    // Añadir mecánicas permitidas por fase para el boss
    const availableMechanics = (Object.keys(MECHANICS) as MechanicName[]).filter(m => 
      m !== 'basic' && phaseAllowed.has(m)
    );
    
    // Seleccionar hasta 3 mecánicas adicionales para el boss
    for (let i = 0; i < Math.min(3, availableMechanics.length); i++) {
      const seedMech = (baseSeed ^ (0x1000 * (i + 1))) % 233280;
      const mechanic = pickOneByPercentage(seedMech, m => 
        !bossMechanics.includes(m) && availableMechanics.includes(m)
      );
      if (mechanic !== 'basic') {
        bossMechanics.push(mechanic);
      }
    }
    
    return {
      id: level,
      phase: phase.id,
      theme: phase.theme,
      pairs: bossPairs,
      timeSec: Math.max(timeSec + 30, 60), // Boss tiene más tiempo
      mechanics: bossMechanics,
      seed: baseSeed,
      isBoss: true,
      rewards: {
        coins: Math.floor(bossPairs * 3 + level * 0.8), // Boss usa bossPairs, no pairs
      },
    };
  }
  
  // Configuración normal
  return {
    id: level,
    phase: phase.id,
    theme: phase.theme,
    pairs,
    timeSec,
    mechanics,
    seed: baseSeed,
    isBoss: false,
    rewards: {
      coins: Math.floor(pairs * 2 + level * 0.5),
    },
  };
}

// Función para generar múltiples niveles
// Función principal para generar niveles
// NOTA: Para reproducibilidad estricta, usar siempre generateLevels(1, N) secuencialmente
export function generateLevels(startLevel: number, count: number, opts?: { resetPhaseStats?: boolean }): LevelConfig[] {
  // Reset opcional de estadísticas de fase
  if (opts?.resetPhaseStats) {
    phaseController.reset();
  }
  
  const levels: LevelConfig[] = [];
  let previousLevelConfig: LevelConfig | null = null;
  
  for (let i = 0; i < count; i++) {
    const level = startLevel + i;
    const config = getLevelConfig(level, previousLevelConfig);
    
    // Límites de racha
    if (isBossLevel(level - 1) && level > 1) {
      // Tras boss, forzar easy sin cronómetro
      config.pairs = Math.min(config.pairs, 4);
      config.timeSec = 0;
    }
    
    if (phaseController.shouldBreakHardStreak(level)) {
      // Romper racha hard completamente
      config.pairs = Math.min(config.pairs, 4);
      config.mechanics = ['basic'].concat(
        config.mechanics.filter(m => MECHANICS[m as keyof typeof MECHANICS]?.good).slice(0, 1) // 0-1 positiva
      ) as MechanicName[];
      config.timeSec = 0;
    }
    
    levels.push(config);
    previousLevelConfig = config; // Usar configuración anterior para sesgo dinámico
    
    // Actualizar estadísticas del PhaseController
    phaseController.updateStats(level, config.pairs, config.mechanics, config.timeSec || 0, config.isBoss);
    
    // Log de consistencia al final de cada fase (dev build)
    if (level % 50 === 0) {
      console.debug('Phase snapshot', phaseController.getSnapshot(level));
    }
  }
  return levels;
}

// Función para obtener información de progreso
export function getProgressInfo(currentLevel: number) {
  const phase = getPhaseByLevel(currentLevel);
  const levelsInPhase = currentLevel - phase.startLevel + 1;
  const totalLevelsInPhase = phase.endLevel - phase.startLevel + 1;
  const phaseProgress = (levelsInPhase / totalLevelsInPhase) * 100;
  
  return {
    currentPhase: phase,
    levelsInPhase,
    totalLevelsInPhase,
    phaseProgress,
    isBossLevel: isBossLevel(currentLevel),
  };
}