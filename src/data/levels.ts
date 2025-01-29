import data from './levels.json';
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

export function getLevelFromJson(level: number): LevelData {
  const found = (data.levels as LevelData[]).find(l => l.id === level);
  if (!found) {
    throw new Error(`Nivel ${level} no encontrado en levels.json`);
  }
  return found;
}

export function getAllLevels(): LevelData[] {
  return data.levels as LevelData[];
}

export function getLevelsByPhase(phase: number): LevelData[] {
  return (data.levels as LevelData[]).filter(l => l.phase === phase);
}

export function getBossLevels(): LevelData[] {
  return (data.levels as LevelData[]).filter(l => l.isBoss);
}
