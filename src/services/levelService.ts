import { GameMode } from '@/store/gameStore';
import { LevelConfig } from '@/types/game';

export interface LevelData {
  levels: LevelConfig[];
}

export class LevelService {
  private static instance: LevelService;
  private levelsCache: Map<GameMode, LevelConfig[]> = new Map();

  private constructor() {}

  public static getInstance(): LevelService {
    if (!LevelService.instance) {
      LevelService.instance = new LevelService();
    }
    return LevelService.instance;
  }

  /**
   * Cargar niveles según el modo de juego
   */
  public async loadLevelsForMode(mode: GameMode): Promise<LevelConfig[]> {
    // Verificar si ya están en caché
    if (this.levelsCache.has(mode)) {
      console.log(`📂 [LevelService] Cargando niveles ${mode} desde caché`);
      return this.levelsCache.get(mode)!;
    }

    try {
      let fileName: string;
      
      switch (mode) {
        case 'beginner':
          console.log('📂 [LevelService] Cargando niveles principiante...');
          fileName = '/levels_beginner.json';
          break;
        case 'extreme':
          console.log('📂 [LevelService] Cargando niveles extremo...');
          fileName = '/levels_extreme.json';
          break;
        case 'normal':
        default:
          console.log('📂 [LevelService] Cargando niveles normales...');
          fileName = '/levels.json';
          break;
      }

      const response = await fetch(fileName);
      if (!response.ok) throw new Error(`No se pudo cargar ${fileName}`);
      
      const levelsData = await response.json();
      const levels = levelsData.levels || [];
      console.log(`✅ [LevelService] Cargados ${levels.length} niveles para modo ${mode}`);
      
      // Guardar en caché
      this.levelsCache.set(mode, levels);
      
      return levels;
    } catch (error) {
      console.error(`❌ [LevelService] Error cargando niveles para modo ${mode}:`, error);
      
      // Fallback: cargar niveles normales
      if (mode !== 'normal') {
        console.log('🔄 [LevelService] Fallback: cargando niveles normales...');
        try {
          const response = await fetch('/levels.json');
          if (response.ok) {
            const fallbackData = await response.json();
            const fallbackLevels = fallbackData.levels || [];
            this.levelsCache.set('normal', fallbackLevels);
            return fallbackLevels;
          }
        } catch (fallbackError) {
          console.error('❌ [LevelService] Error en fallback:', fallbackError);
        }
      }
      
      return [];
    }
  }

  /**
   * Obtener un nivel específico por ID y modo
   */
  public async getLevelById(levelId: number, mode: GameMode): Promise<LevelConfig | null> {
    const levels = await this.loadLevelsForMode(mode);
    return levels.find(level => level.id === levelId) || null;
  }

  /**
   * Obtener el siguiente nivel disponible
   */
  public async getNextLevel(currentLevelId: number, mode: GameMode): Promise<LevelConfig | null> {
    const levels = await this.loadLevelsForMode(mode);
    const currentIndex = levels.findIndex(level => level.id === currentLevelId);
    
    if (currentIndex === -1 || currentIndex >= levels.length - 1) {
      return null; // No hay siguiente nivel
    }
    
    return levels[currentIndex + 1];
  }

  /**
   * Obtener el primer nivel del modo
   */
  public async getFirstLevel(mode: GameMode): Promise<LevelConfig | null> {
    const levels = await this.loadLevelsForMode(mode);
    return levels.length > 0 ? levels[0] : null;
  }

  /**
   * Verificar si un nivel existe en el modo
   */
  public async hasLevel(levelId: number, mode: GameMode): Promise<boolean> {
    const level = await this.getLevelById(levelId, mode);
    return level !== null;
  }

  /**
   * Obtener estadísticas del modo
   */
  public async getModeStats(mode: GameMode): Promise<{
    totalLevels: number;
    timedLevels: number;
    untimedLevels: number;
    bossLevels: number;
    averagePairs: number;
  }> {
    const levels = await this.loadLevelsForMode(mode);
    
    const stats = {
      totalLevels: levels.length,
      timedLevels: levels.filter(l => l.timeSec && l.timeSec > 0).length,
      untimedLevels: levels.filter(l => !l.timeSec || l.timeSec === 0).length,
      bossLevels: levels.filter(l => l.isBoss).length,
      averagePairs: levels.length > 0 ? Math.round(levels.reduce((sum, l) => sum + l.pairs, 0) / levels.length) : 0,
    };

    console.log(`📊 [LevelService] Estadísticas modo ${mode}:`, stats);
    return stats;
  }

  /**
   * Limpiar caché (útil para testing)
   */
  public clearCache(): void {
    this.levelsCache.clear();
    console.log('🗑️ [LevelService] Caché limpiado');
  }
}
