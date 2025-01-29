// Servicio de anuncios - preparado para AdMob
// Por ahora simula los anuncios, pero se puede integrar fácilmente con AdMob

export interface AdResult {
  success: boolean;
  reward?: {
    type: 'life' | 'coins';
    amount: number;
  };
  error?: string;
}

class AdService {
  private isAdLoaded = false;
  private isShowingAd = false;

  // Simular carga de video
  async loadAd(): Promise<boolean> {
    return new Promise((resolve) => {
      // Simular tiempo de carga
      setTimeout(() => {
        this.isAdLoaded = true;
        // Video cargado (simulado)
        resolve(true);
      }, 1000);
    });
  }

  // Mostrar video para conseguir vida
  async showLifeAd(): Promise<AdResult> {
    if (this.isShowingAd) {
      return { success: false, error: 'Ya se está mostrando un video' };
    }

    if (!this.isAdLoaded) {
      const loaded = await this.loadAd();
      if (!loaded) {
        return { success: false, error: 'No se pudo cargar el video' };
      }
    }

    this.isShowingAd = true;

    return new Promise((resolve) => {
      // Simular tiempo de video (5 segundos)
      setTimeout(() => {
        this.isShowingAd = false;
        this.isAdLoaded = false; // Necesita recargar para el siguiente
        
        // Simular éxito del video (90% de probabilidad)
        const success = Math.random() > 0.1;
        
        if (success) {
          // Video completado - Recompensa: +1 Vida
          resolve({
            success: true,
            reward: {
              type: 'life',
              amount: 1
            }
          });
        } else {
          // Video falló
          resolve({
            success: false,
            error: 'El video no se completó correctamente'
          });
        }
      }, 5000);
    });
  }

  // Mostrar anuncio para conseguir monedas
  async showCoinsAd(): Promise<AdResult> {
    if (this.isShowingAd) {
      return { success: false, error: 'Ya se está mostrando un anuncio' };
    }

    if (!this.isAdLoaded) {
      const loaded = await this.loadAd();
      if (!loaded) {
        return { success: false, error: 'No se pudo cargar el anuncio' };
      }
    }

    this.isShowingAd = true;

    return new Promise((resolve) => {
      // Simular tiempo de anuncio (5 segundos)
      setTimeout(() => {
        this.isShowingAd = false;
        this.isAdLoaded = false;
        
        const success = Math.random() > 0.1;
        const coinsAmount = Math.floor(Math.random() * 50) + 10; // 10-60 monedas
        
        if (success) {
          // Anuncio completado - Recompensa
          resolve({
            success: true,
            reward: {
              type: 'coins',
              amount: coinsAmount
            }
          });
        } else {
          resolve({
            success: false,
            error: 'El anuncio no se completó correctamente'
          });
        }
      }, 5000);
    });
  }

  // Verificar si hay anuncios disponibles
  isAdAvailable(): boolean {
    return !this.isShowingAd;
  }

  // Cargar anuncio en background
  async preloadAd(): Promise<void> {
    if (!this.isAdLoaded && !this.isShowingAd) {
      await this.loadAd();
    }
  }
}

// Instancia singleton
export const adService = new AdService();

// Función helper para mostrar notificación de recompensa
export const showRewardNotification = (reward: { type: string; amount: number }) => {
  const message = reward.type === 'life' 
    ? `+${reward.amount} Vida` 
    : `+${reward.amount} monedas`;
  
  // Aquí se podría integrar con un sistema de notificaciones toast
  // Notificación mostrada
  
  // Mostrar notificación visual temporal más sutil
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-slate-700/90 text-white px-4 py-2 rounded-lg shadow-lg z-50 border border-white/20 backdrop-blur-sm';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 2000);
};
