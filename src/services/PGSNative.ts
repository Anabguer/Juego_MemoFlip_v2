// Bridge para Google Play Games + Google Sign-In - Obtiene email real
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __pgsLoginCallback?: (data: any) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    CapacitorWebView: any;
  }
}

export class PGSNative {
  private static instance: PGSNative;
  private debugCallback?: (message: string) => void;

  private constructor() {}

  public static getInstance(): PGSNative {
    if (!PGSNative.instance) {
      PGSNative.instance = new PGSNative();
    }
    return PGSNative.instance;
  }

  public setDebugCallback(callback: (message: string) => void) {
    this.debugCallback = callback;
  }

  private addDebugLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const logMessage = `[${timestamp}] ${message}`;
    if (this.debugCallback) {
      this.debugCallback(logMessage);
    }
    console.log(logMessage);
  }

  public isNativeAndroid(): boolean {
    return typeof window !== 'undefined' && 
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           (window as any).Capacitor?.getPlatform?.() === 'android';
  }

  // Login con Google Play Games + Google Sign-In - Obtiene email real
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async signIn(): Promise<{success: boolean, playerId?: string, displayName?: string, email?: string, error?: string, message?: string}> {
    this.addDebugLog('🎮 PGSNative: Iniciando login con Google Play Games + Sign-In...');
    
    if (!this.isNativeAndroid()) {
      this.addDebugLog('❌ PGSNative: No es Android nativo');
      return { success: false, error: 'No es Android nativo' };
    }

    return new Promise((resolve) => {
      // Configurar callback global
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.__pgsLoginCallback = (data: any) => {
        this.addDebugLog('📥 PGSNative: Resultado recibido: ' + JSON.stringify(data));
        
        if (data.success) {
          this.addDebugLog('✅ PGSNative: Login exitoso');
          this.addDebugLog('👤 PGSNative: Player ID: ' + data.playerId);
          this.addDebugLog('👤 PGSNative: Display Name: ' + data.displayName);
          this.addDebugLog('📧 PGSNative: Email: ' + (data.email || 'No disponible'));
        } else {
          this.addDebugLog('❌ PGSNative: Error en login: ' + data.error);
        }
        
        resolve(data);
        delete window.__pgsLoginCallback;
      };

      // Llamar al método nativo usando el bridge de Capacitor
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w: any = window as any;
        
        // Intentar diferentes métodos de bridge
        if (w.Android?.pgsSignIn) {
          this.addDebugLog('🔗 PGSNative: Usando bridge Android.pgsSignIn...');
          try {
            w.Android.pgsSignIn();
            this.addDebugLog('📞 PGSNative: Llamada iniciada, esperando resultado...');
          } catch (error) {
            this.addDebugLog('❌ PGSNative: Error iniciando login: ' + String(error));
            delete window.__pgsLoginCallback;
            resolve({ success: false, error: String(error) });
          }
        } else if (w.CapacitorWebView?.android?.call) {
          this.addDebugLog('🔗 PGSNative: Usando CapacitorWebView.android.call...');
          w.CapacitorWebView.android.call('pgsSignIn', {}, () => {
            this.addDebugLog('📞 PGSNative: Llamada iniciada, esperando resultado...');
          }, (error: string) => {
            this.addDebugLog('❌ PGSNative: Error iniciando login: ' + error);
            delete window.__pgsLoginCallback;
            resolve({ success: false, error });
          });
        } else if (w.Capacitor?.Plugins?.App) {
          this.addDebugLog('🔗 PGSNative: Usando bridge de Capacitor...');
          // Usar el bridge nativo de Capacitor
          w.Capacitor.Plugins.App.addListener('pgsLoginResult', (data: any) => {
            this.addDebugLog('📥 PGSNative: Resultado recibido via listener: ' + JSON.stringify(data));
            if (window.__pgsLoginCallback) {
              window.__pgsLoginCallback(data);
            }
          });
          
          // Llamar al método nativo
          w.Capacitor.Plugins.App.addListener('pgsSignIn', () => {
            this.addDebugLog('📞 PGSNative: Llamada iniciada, esperando resultado...');
          });
          
          // No hay bridge disponible, usar fallback
          this.addDebugLog('❌ PGSNative: No hay bridge disponible, usando fallback...');
          delete window.__pgsLoginCallback;
          resolve({ success: false, error: 'Bridge nativo no disponible' });
        } else {
          this.addDebugLog('❌ PGSNative: No hay bridge disponible');
          delete window.__pgsLoginCallback;
          resolve({ success: false, error: 'Bridge nativo no disponible' });
        }
      } catch (error) {
        this.addDebugLog('❌ PGSNative: Error en signIn: ' + String(error));
        delete window.__pgsLoginCallback;
        resolve({ success: false, error: String(error) });
      }

      // Timeout de seguridad
      setTimeout(() => {
        this.addDebugLog('⏰ PGSNative: Timeout en login (30s)');
        delete window.__pgsLoginCallback;
        resolve({ success: false, error: 'Timeout en login (30s)' });
      }, 30000);
    });
  }

  // Verificar si está autenticado
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async isAuthenticated(): Promise<{authenticated: boolean, user?: any}> {
    this.addDebugLog('🔍 PGSNative: Verificando autenticación...');
    
    if (!this.isNativeAndroid()) {
      this.addDebugLog('❌ PGSNative: No es Android nativo');
      return { authenticated: false };
    }

    // Por ahora, asumimos que si hay datos en localStorage, está autenticado
    const displayName = localStorage.getItem('pgs_display');
    if (displayName) {
      this.addDebugLog('✅ PGSNative: Usuario autenticado: ' + displayName);
      return { 
        authenticated: true, 
        user: { 
          displayName: displayName,
          email: localStorage.getItem('pgs_email') || 'No disponible'
        } 
      };
    }

    this.addDebugLog('ℹ️ PGSNative: Usuario no autenticado');
    return { authenticated: false };
  }

  // Obtener usuario actual
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async getCurrentUser(): Promise<{user: any | null}> {
    this.addDebugLog('👤 PGSNative: Obteniendo usuario actual...');
    
    const authResult = await this.isAuthenticated();
    if (authResult.authenticated && authResult.user) {
      return { user: authResult.user };
    }
    
    return { user: null };
  }

  // Cerrar sesión
  public async signOut(): Promise<{success: boolean}> {
    this.addDebugLog('🚪 PGSNative: Cerrando sesión...');
    
    // Limpiar datos locales
    localStorage.removeItem('pgs_display');
    localStorage.removeItem('pgs_email');
    localStorage.removeItem('pgs_player_id');
    
    this.addDebugLog('✅ PGSNative: Sesión cerrada');
    return { success: true };
  }

  // Mostrar leaderboard
  public async showLeaderboard(): Promise<{success: boolean}> {
    this.addDebugLog('🏆 PGSNative: Mostrando leaderboard...');
    // Por ahora, solo log
    return { success: true };
  }

  // Enviar puntuación
  public async submitScore(score: number): Promise<{success: boolean}> {
    this.addDebugLog('📊 PGSNative: Enviando puntuación: ' + score);
    // Por ahora, solo log
    return { success: true };
  }
}