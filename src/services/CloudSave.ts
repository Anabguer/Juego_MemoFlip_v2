import { PGSNative } from './PGSNative';

export interface GameProgress {
  level: number;
  coins: number;
  lives: number;
  soundEnabled: boolean;
  maxLevelUnlocked: number;
  lastPlayed: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export class CloudSave {
  private static instance: CloudSave;
  private pgsNative: PGSNative;
  private offlineQueue: GameProgress[] = [];

  private constructor() {
    this.pgsNative = PGSNative.getInstance();
  }

  public static getInstance(): CloudSave {
    if (!CloudSave.instance) {
      CloudSave.instance = new CloudSave();
    }
    return CloudSave.instance;
  }

  // Guardar progreso en la nube
  async saveProgress(progress: GameProgress): Promise<boolean> {
    try {
      const isSignedIn = await this.pgsNative.isAuthenticated();
      
      if (isSignedIn) {
        // Guardar directamente en la nube
        return await this.saveToCloud(progress);
      } else {
        // Guardar en cola offline
        this.offlineQueue.push(progress);
        localStorage.setItem('offline_progress', JSON.stringify(this.offlineQueue));
        console.log('💾 Progreso guardado offline, cola:', this.offlineQueue.length);
        return true;
      }
    } catch (error) {
      console.error('Error saving progress:', error);
      // Fallback: guardar offline
      this.offlineQueue.push(progress);
      localStorage.setItem('offline_progress', JSON.stringify(this.offlineQueue));
      return true;
    }
  }

  // Cargar progreso desde la nube
  async loadProgress(): Promise<GameProgress | null> {
    try {
      const isSignedIn = await this.pgsNative.isAuthenticated();
      
      if (isSignedIn) {
        // Cargar desde la nube
        const cloudProgress = await this.loadFromCloud();
        if (cloudProgress) {
          return cloudProgress;
        }
      }
      
      // Fallback: cargar desde localStorage
      const localProgress = localStorage.getItem('game_progress');
      if (localProgress) {
        return JSON.parse(localProgress);
      }
      
      return null;
    } catch (error) {
      console.error('Error loading progress:', error);
      return null;
    }
  }

  // Sincronizar cola offline cuando vuelve la conexión
  async syncOfflineQueue(): Promise<void> {
    try {
      const isSignedIn = await this.pgsNative.isAuthenticated();
      
      if (isSignedIn && this.offlineQueue.length > 0) {
        console.log('🔄 Sincronizando cola offline:', this.offlineQueue.length, 'elementos');
        
        // Enviar todos los elementos de la cola
        for (const progress of this.offlineQueue) {
          await this.saveToCloud(progress);
        }
        
        // Limpiar cola
        this.offlineQueue = [];
        localStorage.removeItem('offline_progress');
        console.log('✅ Cola offline sincronizada');
      }
    } catch (error) {
      console.error('Error syncing offline queue:', error);
    }
  }

  // Guardar en la nube (implementación básica)
  private async saveToCloud(progress: GameProgress): Promise<boolean> {
    try {
      // Aquí implementarías la lógica real de guardado en la nube
      // Por ahora, simulamos guardado exitoso
      console.log('☁️ Guardando en la nube:', progress);
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return true;
    } catch (error) {
      console.error('Error saving to cloud:', error);
      return false;
    }
  }

  // Cargar desde la nube (implementación básica)
  private async loadFromCloud(): Promise<GameProgress | null> {
    try {
      // Aquí implementarías la lógica real de carga desde la nube
      // Por ahora, simulamos carga exitosa
      console.log('☁️ Cargando desde la nube');
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return null; // No hay datos en la nube aún
    } catch (error) {
      console.error('Error loading from cloud:', error);
      return null;
    }
  }

  // Cargar cola offline desde localStorage
  loadOfflineQueue(): void {
    try {
      const stored = localStorage.getItem('offline_progress');
      if (stored) {
        this.offlineQueue = JSON.parse(stored);
        console.log('📱 Cola offline cargada:', this.offlineQueue.length, 'elementos');
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
      this.offlineQueue = [];
    }
  }
}
