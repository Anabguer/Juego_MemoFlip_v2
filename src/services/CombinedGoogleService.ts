// Servicio combinado: Google Sign-In + Google Play Games
import { GoogleSignInService } from './GoogleSignInService';
import { PGSNative } from './PGSNative';

export class CombinedGoogleService {
  private static instance: CombinedGoogleService;
  private googleSignIn: GoogleSignInService;
  private pgsNative: PGSNative;

  public static getInstance(): CombinedGoogleService {
    if (!CombinedGoogleService.instance) {
      CombinedGoogleService.instance = new CombinedGoogleService();
    }
    return CombinedGoogleService.instance;
  }

  private constructor() {
    this.googleSignIn = GoogleSignInService.getInstance();
    this.pgsNative = PGSNative.getInstance();
  }

  // Login combinado: Google Sign-In + Google Play Games
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async signIn(): Promise<{success: boolean, user?: any, error?: string}> {
    console.log('🔄 CombinedGoogleService: Iniciando login combinado...');
    
    try {
      // Usar la nueva implementación que combina Play Games + Sign-In
      console.log('🔄 Usando nueva implementación combinada...');
      const result = await this.pgsNative.signIn();
      
      if (result.success) {
        console.log('✅ Login combinado exitoso:', result);
        
        // Guardar información en localStorage
        localStorage.setItem('pgs_display', result.displayName || 'Usuario');
        localStorage.setItem('pgs_email', result.email || '');
        localStorage.setItem('pgs_player_id', result.playerId || '');
        
        // Crear objeto de usuario combinado
        const combinedUser = {
          id: result.playerId,
          email: result.email,
          name: result.displayName,
          displayName: result.displayName,
          playerId: result.playerId
        };
        
        return { success: true, user: combinedUser };
      } else {
        console.log('❌ Login combinado falló:', result.error);
        return result;
      }

    } catch (error) {
      console.error('❌ Error en login combinado:', error);
      return { success: false, error: String(error) };
    }
  }

  // Verificar si está autenticado
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async isAuthenticated(): Promise<{authenticated: boolean, user?: any}> {
    try {
      // Verificar Google Sign-In
      const googleAuth = await this.googleSignIn.isAuthenticated();
      
      if (googleAuth) {
        // Si Google Sign-In está activo, obtener información del usuario
        const userInfo = localStorage.getItem('google_user_info');
        if (userInfo) {
          return { authenticated: true, user: JSON.parse(userInfo) };
        }
      }

      // Si no, verificar Play Games
      const pgsAuth = await this.pgsNative.isAuthenticated();
      if (pgsAuth.authenticated) {
        return pgsAuth;
      }

      return { authenticated: false };
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      return { authenticated: false };
    }
  }

  // Cerrar sesión
  public async signOut(): Promise<{success: boolean}> {
    try {
      // Cerrar sesión en ambos servicios
      await this.googleSignIn.signOut();
      await this.pgsNative.signOut();
      
      // Limpiar localStorage
      localStorage.removeItem('google_user_info');
      localStorage.removeItem('pgs_display');
      localStorage.removeItem('pgs_player_id');
      
      console.log('🚪 Sesión cerrada en ambos servicios');
      return { success: true };
    } catch (error) {
      console.error('❌ Error cerrando sesión:', error);
      return { success: false };
    }
  }

  // Sincronizar con la nube (usar email real)
  public async syncWithCloud(): Promise<void> {
    try {
      const userInfo = localStorage.getItem('google_user_info');
      if (!userInfo) {
        console.log('⚠️ No hay información de usuario para sincronizar');
        return;
      }

      const user = JSON.parse(userInfo);
      console.log('☁️ Sincronizando con la nube usando email real:', user.email);
      
      // Aquí puedes implementar la lógica de sincronización con tu backend
      // usando el email real del usuario
      
    } catch (error) {
      console.error('❌ Error sincronizando con la nube:', error);
    }
  }
}
