// 🎯 SERVICIO ADMOB - Versión Simple (UMP pendiente para v1.0.7)
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const isTesting = false; // ← EN PRODUCCIÓN: false
const TEST_BANNER = 'ca-app-pub-3940256099942544/6300978111';
const TEST_REWARDED = 'ca-app-pub-3940256099942544/5224354917';

export async function initAds() {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob] Modo web - simulación activada');
    return;
  }
  
  try {
    await AdMob.initialize({ initializeForTesting: isTesting });
    // AdMob inicializado
    
    // ✅ MONITOR BANNER - Verificar cada 2 segundos que esté visible
    setInterval(async () => {
      try {
        // Forzar banner cada 2 segundos para mantenerlo visible
        await AdMob.showBanner({
          adId: TEST_BANNER,
          adSize: BannerAdSize.BANNER,
          position: BannerAdPosition.BOTTOM_CENTER,
          margin: 0,
          isTesting,
        });
        // Banner mantenido activo
      } catch (e) {
        console.warn('[Banner] Error en verificación:', e);
      }
    }, 2000);
    
  } catch (e) {
    console.error('[AdMob] init error', e);
  }
}

export async function showBottomBanner(adId?: string) {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Banner] Web - simulado');
    return;
  }
  
  try {
    // ✅ NO ocultar banner anterior - solo mostrar directamente
    const opts: BannerAdOptions = {
      adId: adId || TEST_BANNER,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting,
    };
    
    await AdMob.showBanner(opts);
    // Banner mostrado correctamente
  } catch (e) {
    console.error('[Banner] ❌ Error mostrando banner:', e);
    
    // ✅ Reintentar una vez más después del error
    try {
      console.log('[Banner] 🔄 Reintentando...');
      await new Promise(resolve => setTimeout(resolve, 500));
      await AdMob.showBanner({
        adId: adId || TEST_BANNER,
        adSize: BannerAdSize.BANNER,
        position: BannerAdPosition.BOTTOM_CENTER,
        margin: 0,
        isTesting,
      });
      // Banner mostrado en segundo intento
    } catch (e2) {
      console.error('[Banner] ❌ Error definitivo:', e2);
    }
  }
}

export async function hideBanner() {
  if (!Capacitor.isNativePlatform()) return;
  try { 
    // ✅ NO OCULTAR BANNER - Solo loggear que se intentó ocultar
    console.log('[Banner] ⚠️ INTENTO DE OCULTAR BANNER BLOQUEADO');
    console.log('[Banner] 🔥 MANTENIENDO BANNER VISIBLE');
    
    // ✅ En lugar de ocultar, volver a mostrar el banner
    await AdMob.showBanner({
      adId: TEST_BANNER,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting,
    });
    console.log('[Banner] 🔥 BANNER RESTAURADO AUTOMÁTICAMENTE');
  } catch (e) {
    console.error('[Banner] Error restaurando banner:', e);
  }
}

// ✅ FUNCIÓN ESPECIAL PARA FORZAR BANNER SIN OCULTAR
export async function forceShowBanner(adId?: string) {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Banner] Web - simulado');
    return;
  }
  
  try {
    console.log('[Banner] 🔥 FORZANDO BANNER - Sin ocultar anterior');
    
    const opts: BannerAdOptions = {
      adId: adId || TEST_BANNER,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting,
    };
    
    await AdMob.showBanner(opts);
    console.log('[Banner] 🔥 BANNER FORZADO EXITOSAMENTE');
  } catch (e) {
    console.error('[Banner] ❌ Error forzando banner:', e);
  }
}

// Interstitial ad cada 5 niveles
export async function showInterstitialAd() {
  if (!Capacitor.isNativePlatform()) {
    console.log('[Interstitial] Web - simulado');
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[Interstitial] Simulado completado');
        resolve(true);
      }, 2000);
    });
  }
  
  try {
    console.log('[Interstitial] Mostrando anuncio intersticial...');
    
    // Crear el anuncio intersticial
    await AdMob.prepareInterstitial({
      adId: TEST_REWARDED, // Usar el mismo ID de test por ahora
      isTesting
    });
    
    // Mostrar el anuncio
    await AdMob.showInterstitial();
    console.log('[Interstitial] ✅ Anuncio intersticial mostrado');
    
    return true;
  } catch (e) {
    console.error('[Interstitial] ❌ Error mostrando intersticial:', e);
    return false;
  }
}

// Rewarded ad para vidas
export interface AdResult {
  success: boolean;
  reward?: {
    type: 'life' | 'coins';
    amount: number;
  };
  error?: string;
}

export async function showRewardedAd(): Promise<AdResult> {
  if (!Capacitor.isNativePlatform()) {
    console.log('🎮 Simulando anuncio de recompensa...');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          reward: { type: 'life', amount: 1 }
        });
      }, 3000);
    });
  }

  console.log('[Rewarded] Preparando anuncio...');

  return new Promise(async (resolve) => {
    let rewardReceived = false;
    let resolved = false;

    // Listener para recompensa recibida
    const rewardedListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
      console.log('🎁 [Rewarded] Recompensa recibida:', reward);
      rewardReceived = true;
    });

    // Listener para anuncio cerrado
    const dismissedListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
      console.log('📺 [Rewarded] Anuncio cerrado');
      
      // Limpiar listeners
      rewardedListener.remove();
      dismissedListener.remove();
      
      if (!resolved) {
        resolved = true;
        if (rewardReceived) {
          resolve({ success: true, reward: { type: 'life', amount: 1 } });
        } else {
          resolve({ success: false, error: 'Debes ver el anuncio completo para obtener la vida.' });
        }
      }
    });

    // Timeout de seguridad
    const timeout = setTimeout(() => {
      console.warn('⏰ [Rewarded] Timeout');
      rewardedListener.remove();
      dismissedListener.remove();
      
      if (!resolved) {
        resolved = true;
        resolve({ success: false, error: 'El anuncio tardó demasiado. Intenta de nuevo.' });
      }
    }, 60000);

    // Preparar y mostrar anuncio
    AdMob.prepareRewardVideoAd({ adId: TEST_REWARDED, isTesting: isTesting })
      .then(() => {
        console.log('[Rewarded] Anuncio preparado, mostrando...');
        return AdMob.showRewardVideoAd();
      })
      .catch((error) => {
        console.error('❌ [Rewarded] Error:', error);
        clearTimeout(timeout);
        rewardedListener.remove();
        dismissedListener.remove();
        
        if (!resolved) {
          resolved = true;
          resolve({ success: false, error: 'Error inesperado con el anuncio.' });
        }
      });
  });
}
