// 🎯 SERVICIO ADMOB - Versión Simple (UMP pendiente para v1.0.7)
import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, RewardAdPluginEvents, AdMobRewardItem } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

const isTesting = true; // ← EN PRODUCCIÓN: false
const TEST_BANNER = 'ca-app-pub-3940256099942544/6300978111';
const TEST_REWARDED = 'ca-app-pub-3940256099942544/5224354917';

export async function initAds() {
  if (!Capacitor.isNativePlatform()) {
    console.log('[AdMob] Modo web - simulación activada');
    return;
  }
  
  try {
    await AdMob.initialize({ initializeForTesting: isTesting });
    console.log('[AdMob] initialized');
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
    const opts: BannerAdOptions = {
      adId: adId || TEST_BANNER,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting,
    };
    
    await AdMob.showBanner(opts);
    console.log('[Banner] MOSTRADO');
  } catch (e) {
    console.error('[Banner] Error', e);
  }
}

export async function hideBanner() {
  if (!Capacitor.isNativePlatform()) return;
  try { 
    await AdMob.hideBanner(); 
    console.log('[Banner] Ocultado');
  } catch (e) {
    console.error('[Banner] Error ocultando', e);
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

  return new Promise((resolve) => {
    let rewardReceived = false;

    AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
      console.log('🎁 [Rewarded] Recompensa recibida:', reward);
      rewardReceived = true;
    });

    AdMob.addListener(RewardAdPluginEvents.Dismissed, async () => {
      console.log('📺 [Rewarded] Anuncio cerrado');
      if (rewardReceived) {
        resolve({ success: true, reward: { type: 'life', amount: 1 } });
      } else {
        resolve({ success: false, error: 'Debes ver el anuncio completo para obtener la vida.' });
      }
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToLoad, (error: { message?: string; code?: number }) => {
      console.error('❌ [Rewarded] Error de carga:', error);
      resolve({ success: false, error: 'No se pudo cargar el anuncio. Intenta de nuevo.' });
    });

    AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error: { message?: string; code?: number }) => {
      console.error('❌ [Rewarded] Error al mostrar:', error);
      resolve({ success: false, error: 'Error al mostrar el anuncio. Intenta de nuevo.' });
    });

    AdMob.prepareRewardVideoAd({ adId: TEST_REWARDED, isTesting: isTesting })
      .then(() => AdMob.showRewardVideoAd())
      .catch((error) => {
        console.error('❌ [Rewarded] Error preparando o mostrando:', error);
        resolve({ success: false, error: 'Error inesperado con el anuncio.' });
      });
  });
}
