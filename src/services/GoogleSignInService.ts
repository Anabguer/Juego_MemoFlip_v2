// Servicio para Google Sign-In - Obtener email real del usuario
export class GoogleSignInService {
  private static instance: GoogleSignInService;
  private isInitialized = false;

  public static getInstance(): GoogleSignInService {
    if (!GoogleSignInService.instance) {
      GoogleSignInService.instance = new GoogleSignInService();
    }
    return GoogleSignInService.instance;
  }

  // Inicializar Google Sign-In
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Cargar el script de Google Sign-In
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        console.log('✅ Google Sign-In script cargado');
        this.isInitialized = true;
        resolve();
      };
      
      script.onerror = () => {
        console.error('❌ Error cargando Google Sign-In script');
        reject(new Error('Error cargando Google Sign-In'));
      };
      
      document.head.appendChild(script);
    });
  }

  // Login con Google Sign-In nativo de Android
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async signIn(): Promise<{success: boolean, user?: any, error?: string}> {
    try {
      console.log('📧 GoogleSignInService: Iniciando login nativo de Android...');
      
      if (!this.isNativeAndroid()) {
        console.log('❌ GoogleSignInService: No es Android nativo');
        return { success: false, error: 'No es Android nativo' };
      }

      return new Promise((resolve) => {
        // Escuchar el resultado del login nativo
        const handleGoogleSignInResult = (event: Event) => {
          console.log('📧 GoogleSignInService: Evento googleSignInResult recibido');
          console.log('📧 GoogleSignInService: Evento completo:', JSON.stringify(event));
          
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let result: any = null;
            
            // Intentar diferentes formas de obtener el resultado
            if ((event as CustomEvent).detail) {
              const detail = (event as CustomEvent).detail;
              console.log('📧 GoogleSignInService: Resultado desde detail:', detail);
              result = typeof detail === 'string' ? JSON.parse(detail) : detail;
            } else if ((event as Event & { data?: string }).data) {
              const data = (event as Event & { data?: string }).data!;
              console.log('📧 GoogleSignInService: Resultado desde data:', data);
              result = JSON.parse(data);
            } else if ((event as Event & { success?: boolean }).success !== undefined) {
              console.log('📧 GoogleSignInService: Resultado directamente en el evento');
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const eventWithData = event as Event & { success: boolean; user?: any; error?: string };
              result = {
                success: eventWithData.success,
                user: eventWithData.user,
                error: eventWithData.error
              };
            } else {
              console.log('❌ GoogleSignInService: No se encontró resultado en el evento');
              resolve({ success: false, error: 'No se encontró resultado en el evento' });
              return;
            }
            
            console.log('📧 GoogleSignInService: Resultado procesado:', JSON.stringify(result));
            
            if (result.success && result.user) {
              console.log('✅ GoogleSignInService: Login exitoso con usuario:', result.user);
              resolve({ success: true, user: result.user });
            } else {
              console.log('❌ GoogleSignInService: Error en login:', result.error);
              resolve({ success: false, error: result.error });
            }
          } catch (e) {
            console.log('❌ GoogleSignInService: Error parseando resultado:', String(e));
            resolve({ success: false, error: 'Error parseando resultado del login' });
          }
          
          // Remover el listener después de usar
          window.removeEventListener('googleSignInResult', handleGoogleSignInResult);
        };

        // Registrar el listener
        window.addEventListener('googleSignInResult', handleGoogleSignInResult);

        // Llamar al método nativo de Google Sign-In
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const w: any = window as any;
          if (w.CapacitorWebView?.android?.call) {
            console.log('🔗 GoogleSignInService: Usando CapacitorWebView.android.call("googleSignIn")');
            w.CapacitorWebView.android.call('googleSignIn', {}, (_r: string) => {
              console.log('📞 GoogleSignInService: Llamada iniciada, esperando resultado...');
            }, (error: string) => {
              console.log('❌ GoogleSignInService: Error iniciando login:', error);
              window.removeEventListener('googleSignInResult', handleGoogleSignInResult);
              resolve({ success: false, error });
            });
          } else {
            console.log('❌ GoogleSignInService: No hay bridge disponible');
            window.removeEventListener('googleSignInResult', handleGoogleSignInResult);
            resolve({ success: false, error: 'Bridge nativo no disponible' });
          }
        } catch (error) {
          console.log('❌ GoogleSignInService: Error en signIn:', String(error));
          window.removeEventListener('googleSignInResult', handleGoogleSignInResult);
          resolve({ success: false, error: String(error) });
        }

        // Timeout de seguridad
        setTimeout(() => {
          console.log('⏰ GoogleSignInService: Timeout en login (30s)');
          window.removeEventListener('googleSignInResult', handleGoogleSignInResult);
          resolve({ success: false, error: 'Timeout en login (30s)' });
        }, 30000);
      });
      
    } catch (error) {
      console.error('❌ Error en Google Sign-In:', error);
      return { success: false, error: String(error) };
    }
  }

  // Verificar si es Android nativo
  private isNativeAndroid(): boolean {
    return typeof window !== 'undefined' && 
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           (window as any).Capacitor?.getPlatform?.() === 'android';
  }

  // Obtener información del usuario usando el token
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async getUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
      
      if (!response.ok) {
        throw new Error('Error obteniendo información del usuario');
      }
      
      const userInfo = await response.json();
      console.log('👤 Información del usuario obtenida:', userInfo);
      
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        displayName: userInfo.name,
        picture: userInfo.picture,
        verified_email: userInfo.verified_email
      };
    } catch (error) {
      console.error('❌ Error obteniendo información del usuario:', error);
      throw error;
    }
  }

  // Verificar si está autenticado
  public async isAuthenticated(): Promise<boolean> {
    try {
      const token = localStorage.getItem('google_access_token');
      if (!token) return false;

      // Verificar si el token sigue siendo válido
      const response = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`);
      return response.ok;
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return false;
    }
  }

  // Cerrar sesión
  public async signOut(): Promise<void> {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_user_info');
    console.log('🚪 Google Sign-In cerrado');
  }
}

// Declarar tipos globales
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}
