import { PGSNative } from './PGSNative';
import { GameMode } from '@/store/gameStore';

export class RankingService {
  private static instance: RankingService;
  private pgsNative: PGSNative;

  private constructor() {
    this.pgsNative = PGSNative.getInstance();
  }

  public static getInstance(): RankingService {
    if (!RankingService.instance) {
      RankingService.instance = new RankingService();
    }
    return RankingService.instance;
  }

  /**
   * Obtener el ID del leaderboard (único para todos los modos)
   */
  private getLeaderboardId(): string {
    return 'CgkIj8-a7-ccEAIQAQ'; // memoflip_highscore (único)
  }

  /**
   * Mostrar leaderboard (filtrado por modo en el cliente)
   */
  public async showLeaderboard(gameMode: GameMode): Promise<{success: boolean, error?: string}> {
    console.log('🏆 RankingService: Mostrando leaderboard (filtro modo:', gameMode, ')');
    
    const leaderboardId = this.getLeaderboardId();
    
    try {
      const result = await this.pgsNative.showLeaderboard();
      
      if (result.success) {
        console.log('✅ RankingService: Leaderboard mostrado correctamente (filtro modo:', gameMode, ')');
        // TODO: El filtrado por modo se hará en el cliente cuando Google Play Games
        // permita acceso a los datos del leaderboard para filtrar
      } else {
        console.error('❌ RankingService: Error mostrando leaderboard:', 'Error desconocido');
      }
      
      return result;
    } catch (error) {
      console.error('❌ RankingService: Error inesperado:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Enviar puntuación al leaderboard (con modo incluido en la puntuación)
   */
  public async submitScore(gameMode: GameMode, score: number): Promise<{success: boolean, error?: string}> {
    console.log('📊 RankingService: Enviando puntuación', score, 'para modo', gameMode);
    
    // Crear una puntuación que incluya el modo para poder filtrar después
    // Formato: [MODO]_[PUNTUACIÓN]_[TIMESTAMP]
    const modePrefix = gameMode === 'beginner' ? 'B' : gameMode === 'extreme' ? 'E' : 'N';
    const timestamp = Date.now();
    const scoreWithMode = parseInt(`${modePrefix}${score.toString().padStart(8, '0')}${timestamp.toString().slice(-6)}`);
    
    console.log('📊 RankingService: Puntuación con modo:', scoreWithMode, '(modo:', gameMode, ')');
    
    const leaderboardId = this.getLeaderboardId();
    
    try {
      const result = await this.pgsNative.submitScore(scoreWithMode);
      
      if (result.success) {
        console.log('✅ RankingService: Puntuación enviada correctamente (modo:', gameMode, ')');
      } else {
        console.error('❌ RankingService: Error enviando puntuación:', 'Error desconocido');
      }
      
      return result;
    } catch (error) {
      console.error('❌ RankingService: Error inesperado:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Obtener nombre del modo para mostrar en UI
   */
  public getModeDisplayName(gameMode: GameMode): string {
    switch (gameMode) {
      case 'beginner':
        return 'Principiante';
      case 'normal':
        return 'Normal';
      case 'extreme':
        return 'Extremo';
      default:
        return 'Global';
    }
  }

  /**
   * Obtener descripción del modo para mostrar en UI
   */
  public getModeDescription(gameMode: GameMode): string {
    switch (gameMode) {
      case 'beginner':
        return 'Ranking filtrado: modo Principiante (sin cronómetro)';
      case 'normal':
        return 'Ranking filtrado: modo Normal (experiencia completa)';
      case 'extreme':
        return 'Ranking filtrado: modo Extremo (solo desafíos)';
      default:
        return 'Ranking global de todos los modos';
    }
  }
}
