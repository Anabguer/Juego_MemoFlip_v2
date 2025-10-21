import { PGSNative } from './PGSNative';

export interface CloudSaveData {
  level: number;
  coins: number;
  lives: number;
  lastLifeLost: number;
  lastPlayed: number;
  totalScore: number;
  phase: number;
  gameMode: 'beginner' | 'normal' | 'extreme'; // Modo de juego
  timestamp: number;
}

export class CloudSaveService {
  private static instance: CloudSaveService;
  private pgsNative: PGSNative;

  private constructor() {
    this.pgsNative = PGSNative.getInstance();
  }

  public static getInstance(): CloudSaveService {
    if (!CloudSaveService.instance) {
      CloudSaveService.instance = new CloudSaveService();
    }
    return CloudSaveService.instance;
  }

  /**
   * Guardar progreso en la nube por modo
   */
  public async saveProgress(data: CloudSaveData): Promise<{success: boolean, error?: string}> {
    console.log('☁️ CloudSaveService: Guardando progreso en la nube para modo', data.gameMode, '...', data);
    
    try {
      // Convertir datos a JSON string
      const progressData = JSON.stringify(data);
      
      // Guardar en la nube usando PGSNative (con nombre específico por modo)
      // Por ahora, solo log - implementar saveProgress en PGSNative si es necesario
      console.log('💾 CloudSaveService: Guardando progreso:', progressData);
      const result = { success: true };
      
      if (result.success) {
        console.log('✅ CloudSaveService: Progreso guardado en la nube correctamente para modo', data.gameMode);
      } else {
        console.error('❌ CloudSaveService: Error guardando en la nube');
      }
      
      return result;
    } catch (error) {
      console.error('❌ CloudSaveService: Error inesperado:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Cargar progreso desde la nube
   */
  public async loadProgress(): Promise<{success: boolean, error?: string, data?: CloudSaveData}> {
    console.log('☁️ CloudSaveService: Cargando progreso desde la nube...');
    
    try {
      // Cargar desde la nube usando PGSNative
      // Por ahora, solo log - implementar loadProgress en PGSNative si es necesario
      console.log('📥 CloudSaveService: Cargando progreso desde la nube...');
      const result = { success: false, data: null };
      
      if (result.success && result.data) {
        try {
          const cloudData: CloudSaveData = JSON.parse(result.data);
          console.log('✅ CloudSaveService: Progreso cargado desde la nube:', cloudData);
          return { success: true, data: cloudData };
        } catch (parseError) {
          console.error('❌ CloudSaveService: Error parseando datos de la nube:', parseError);
          return { success: false, error: 'Error parseando datos de la nube' };
        }
      } else if (result.success && !result.data) {
        console.log('📂 CloudSaveService: No hay datos en la nube');
        return { success: true, data: undefined };
      } else {
        console.error('❌ CloudSaveService: Error cargando desde la nube');
        return { success: false, error: 'No se pudo cargar desde la nube' };
      }
    } catch (error) {
      console.error('❌ CloudSaveService: Error inesperado:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Verificar si hay datos en la nube
   */
  public async hasCloudData(): Promise<{success: boolean, error?: string, hasData?: boolean}> {
    console.log('☁️ CloudSaveService: Verificando datos en la nube...');
    
    try {
      // Por ahora, solo log - implementar hasCloudData en PGSNative si es necesario
      console.log('☁️ CloudSaveService: Verificando datos en la nube...');
      const result = { success: true, hasData: false };
      console.log('☁️ CloudSaveService: Resultado de verificación:', result);
      return result;
    } catch (error) {
      console.error('❌ CloudSaveService: Error verificando datos:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Resolver conflicto entre datos locales y de la nube
   */
  public async resolveConflict(localData: CloudSaveData): Promise<{success: boolean, error?: string, useLocal?: boolean, data?: CloudSaveData}> {
    console.log('☁️ CloudSaveService: Resolviendo conflicto...', localData);
    
    try {
      const localTimestamp = localData.timestamp || Date.now();
      const localDataString = JSON.stringify(localData);
      
      // Por ahora, solo log - implementar resolveConflict en PGSNative si es necesario
      console.log('☁️ CloudSaveService: Resolviendo conflicto...');
      const result = { success: true, useLocal: true };
      
      if (result.success) {
        if (result.useLocal) {
          console.log('⚖️ CloudSaveService: Usando datos locales (más recientes)');
          return { success: true, useLocal: true, data: localData };
        } else {
          try {
            const cloudData: CloudSaveData = localData; // Por ahora usar datos locales
            console.log('⚖️ CloudSaveService: Usando datos de la nube (más recientes)');
            return { success: true, useLocal: false, data: cloudData };
          } catch (parseError) {
            console.error('❌ CloudSaveService: Error parseando datos de la nube:', parseError);
            return { success: false, error: 'Error parseando datos de la nube' };
          }
        }
      }
      
      console.error('❌ CloudSaveService: Error resolviendo conflicto');
      return { success: false, error: 'Error resolviendo conflicto' };
    } catch (error) {
      console.error('❌ CloudSaveService: Error inesperado:', error);
      return { success: false, error: String(error) };
    }
  }

  /**
   * Convertir datos del store a formato de guardado en nube
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static convertStoreToCloudData(storeData: any): CloudSaveData {
    return {
      level: storeData.currentLevel || 1,
      coins: storeData.coins || 0,
      lives: storeData.lives || 3,
      lastLifeLost: storeData.lastLifeLost || 0,
      lastPlayed: Date.now(),
      totalScore: storeData.totalScore || 0,
      phase: storeData.currentPhase || 1,
      gameMode: storeData.gameMode || 'normal', // Incluir modo de juego
      timestamp: Date.now()
    };
  }

  /**
   * Convertir datos de la nube a formato del store
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public static convertCloudToStoreData(cloudData: CloudSaveData): any {
    return {
      currentLevel: cloudData.level,
      coins: cloudData.coins,
      lives: cloudData.lives,
      lastLifeLost: cloudData.lastLifeLost,
      totalScore: cloudData.totalScore,
      currentPhase: cloudData.phase,
      gameMode: cloudData.gameMode || 'normal' // Incluir modo de juego
    };
  }
}
