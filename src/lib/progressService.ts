// 🎯 SERVICIO DE GUARDADO DE PROGRESO - ROBUSTO
import { memoflipApi } from './capacitorApi';

export interface SaveProgressData {
  user_key: string;
  level: number;
  coins: number;
  lives: number;
}

export async function saveProgressToServer({ user_key, level, coins, lives }: SaveProgressData) {
  const payload = { user_key, level, coins, lives };
  
  console.log('💾 [SAVE] payload =>', payload);

  try {
    const data = await memoflipApi('api/save_progress.php', {
      method: 'POST',
      body: payload
    });

    console.log('💾 [SAVE] response <=', data);

    if (!data.ok) {
      throw new Error(data.error || 'Server save failed');
    }

    return data;
  } catch (error) {
    console.error('💾 [SAVE] ERROR:', error);
    throw error;
  }
}

