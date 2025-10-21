import { MechanicName } from '@/types/game';
import { GameMode } from '@/store/gameStore';

export type LevelData = {
  id: number;
  phase: number;
  theme: string;
  pairs: number;
  timeSec: number; // 0 = sin cronómetro
  mechanics: MechanicName[];
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  isBoss: boolean;
  rewards: { coins: number };
  seed: number; // Añadido para compatibilidad con LevelConfig
};

// Cache global por modo
const levelsCache: Map<GameMode, { levels: LevelData[] }> = new Map();

async function loadLevels(mode: GameMode = 'normal'): Promise<{ levels: LevelData[] }> {
  if (levelsCache.has(mode)) return levelsCache.get(mode)!;
  
  let fileName: string;
  switch (mode) {
    case 'beginner':
      fileName = '/levels_beginner.json';
      break;
    case 'extreme':
      fileName = '/levels_extreme.json';
      break;
    case 'normal':
    default:
      fileName = '/levels.json';
      break;
  }
  
  const response = await fetch(fileName);
  if (!response.ok) throw new Error(`No se pudo cargar ${fileName}`);
  
  const data = await response.json();
  levelsCache.set(mode, data);
  return data;
}

export async function getLevelFromJson(level: number, mode: GameMode = 'normal'): Promise<LevelData> {
  const data = await loadLevels(mode);
  const found = (data.levels as LevelData[]).find(l => l.id === level);
  if (!found) {
    throw new Error(`Nivel ${level} no encontrado en modo ${mode}`);
  }
  return found;
}

export async function getAllLevels(mode: GameMode = 'normal'): Promise<LevelData[]> {
  const data = await loadLevels(mode);
  return data.levels as LevelData[];
}

export async function getLevelsByPhase(phase: number, mode: GameMode = 'normal'): Promise<LevelData[]> {
  const data = await loadLevels(mode);
  return (data.levels as LevelData[]).filter(l => l.phase === phase);
}

export async function getBossLevels(mode: GameMode = 'normal'): Promise<LevelData[]> {
  const data = await loadLevels(mode);
  return (data.levels as LevelData[]).filter(l => l.isBoss);
}

// Función para limpiar caché (útil para testing)
export function clearLevelsCache(): void {
  levelsCache.clear();
}
