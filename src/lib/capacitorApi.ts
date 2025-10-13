/**
 * Wrapper API para MemoFlip
 * Usa CapacitorHttp en APK, fetch en WEB
 * Basado en experiencia de Lumetrix
 */

// Detectar si estamos en Capacitor (APK)
export const isCapacitor = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (window as unknown as { Capacitor?: unknown }).Capacitor !== undefined || window.location.protocol === 'capacitor:';
};

// Obtener base path correcto
export const getBasePath = (): string => {
  if (typeof window === 'undefined') return '/sistema_apps_upload/memoflip';
  
  // En APK, usar URL absoluta
  if (isCapacitor()) {
    return 'https://colisan.com/sistema_apps_upload/memoflip';
  }
  
  // En WEB, usar path relativo o config
  return (window as unknown as { __MEMOFLIP_CONFIG__?: { basePath?: string } }).__MEMOFLIP_CONFIG__?.basePath || '/sistema_apps_upload/memoflip';
};

// Obtener ruta de asset correcta
export const getAssetPath = (path: string): string => {
  if (typeof window === 'undefined') return path;
  
  // En APK, quitar el prefijo de sistema_apps_upload/memoflip
  if (isCapacitor()) {
    // Si el path empieza con /sistema_apps_upload/memoflip/, quitarlo
    if (path.startsWith('/sistema_apps_upload/memoflip/')) {
      return path.replace('/sistema_apps_upload/memoflip', '');
    }
    // Si empieza solo con /, dejarlo
    if (path.startsWith('/')) {
      return path;
    }
    // Si no tiene /, agregar /
    return '/' + path;
  }
  
  // En WEB, devolver path original
  return path;
};

// Wrapper API principal
interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: string | Record<string, unknown>;
}

export const memoflipApi = async (endpoint: string, options: ApiOptions = {}) => {
  const url = getBasePath() + '/' + endpoint;
  
  if (isCapacitor()) {
    // 🔥 CAPACITOR: Usar CapacitorHttp para bypass CORS
    const { CapacitorHttp } = (window as unknown as { Capacitor: { Plugins: { CapacitorHttp: { request: (opts: { url: string; method: string; headers: Record<string, string>; data?: unknown }) => Promise<{ data: unknown }> } } } }).Capacitor.Plugins;
    
    const requestOptions: {
      url: string;
      method: string;
      headers: Record<string, string>;
      data?: unknown;
    } = {
      url: url,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };
    
    if (options.body) {
      requestOptions.data = typeof options.body === 'string' 
        ? JSON.parse(options.body) 
        : options.body;
    }
    
    const response = await CapacitorHttp.request(requestOptions);
    return response.data;
    
  } else {
    // 🌐 WEB: Usar fetch normal
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      credentials: 'same-origin'
    };
    
    if (options.body) {
      fetchOptions.body = typeof options.body === 'string' 
        ? options.body 
        : JSON.stringify(options.body);
    }
    
    const response = await fetch(url, fetchOptions);
    return await response.json();
  }
};

