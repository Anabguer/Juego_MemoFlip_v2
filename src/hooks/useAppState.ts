/**
 * Hook para detectar cuando la app se minimiza/maximiza
 * Pausa/resume el audio automáticamente
 * Basado en experiencia de Lumetrix
 */

import { useEffect } from 'react';
import { isCapacitor } from '@/lib/capacitorApi';

export function useAppState(audioRef: React.RefObject<HTMLAudioElement | null>) {
  useEffect(() => {
    if (!isCapacitor()) return; // Solo en APK

    const setupAppStateListener = async () => {
      try {
        const { App } = (window as unknown as { Capacitor: { Plugins: { App: { addListener: (event: string, callback: (state: { isActive: boolean }) => void) => { remove: () => void } } } } }).Capacitor.Plugins;

        const listener = App.addListener('appStateChange', ({ isActive }) => {
          const audio = audioRef.current;
          if (!audio) return;

          if (!isActive) {
            // App en segundo plano → pausar
            if (!audio.paused) {
              audio.dataset.intentionalPause = 'true';
              audio.pause();
              console.log('🔇 Audio pausado (app minimizada)');
            }
          } else {
            // App vuelve al primer plano → reanudar
            if (audio.paused && audio.dataset.intentionalPause === 'true') {
              audio.play().catch(err => console.error('Error resuming audio:', err));
              delete audio.dataset.intentionalPause;
              console.log('🔊 Audio reanudado (app restaurada)');
            }
          }
        });

        return () => {
          listener.remove();
        };
      } catch (error) {
        console.error('Error setting up app state listener:', error);
      }
    };

    setupAppStateListener();
  }, [audioRef]);
}


