import { MechanicName } from '@/types/game';

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

// Cache global
let levelsCache: { levels: LevelData[] } | null = null;

async function loadLevels(): Promise<{ levels: LevelData[] }> {
  if (levelsCache) return levelsCache;
  
  const response = await fetch('/levels.json');
  if (!response.ok) throw new Error('No se pudo cargar levels.json');
  
  levelsCache = await response.json();
  return levelsCache!;
}

export async function getLevelFromJson(level: number): Promise<LevelData> {
  const data = await loadLevels();
  const found = (data.levels as LevelData[]).find(l => l.id === level);
  if (!found) {
    throw new Error(`Nivel ${level} no encontrado en levels.json`);
  }
  return found;
}

export async function getAllLevels(): Promise<LevelData[]> {
  const data = await loadLevels();
  return data.levels as LevelData[];
}

export async function getLevelsByPhase(phase: number): Promise<LevelData[]> {
  const data = await loadLevels();
  return (data.levels as LevelData[]).filter(l => l.phase === phase);
}

export async function getBossLevels(): Promise<LevelData[]> {
  const data = await loadLevels();
  return (data.levels as LevelData[]).filter(l => l.isBoss);
}
