// Sistema de colores por fases (cada 50 niveles)
export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  cardBackground: string;
  text: string;
  levelRange: [number, number];
}

export const colorThemes: ColorTheme[] = [
  {
    id: 'ocean',
    name: 'Océano',
    primary: '#0ea5e9', // sky-500
    secondary: '#0284c7', // sky-600
    accent: '#38bdf8', // sky-400
    background: 'from-slate-800 via-blue-900 to-slate-900',
    cardBackground: 'bg-blue-500/10',
    text: 'text-blue-100',
    levelRange: [1, 50]
  },
  {
    id: 'forest',
    name: 'Bosque',
    primary: '#22c55e', // green-500
    secondary: '#16a34a', // green-600
    accent: '#4ade80', // green-400
    background: 'from-slate-800 via-green-900 to-slate-900',
    cardBackground: 'bg-green-500/10',
    text: 'text-green-100',
    levelRange: [51, 100]
  },
  {
    id: 'volcano',
    name: 'Volcán',
    primary: '#f97316', // orange-500
    secondary: '#ea580c', // orange-600
    accent: '#fb923c', // orange-400
    background: 'from-slate-800 via-orange-900 to-slate-900',
    cardBackground: 'bg-orange-500/10',
    text: 'text-orange-100',
    levelRange: [101, 150]
  },
  {
    id: 'crystal',
    name: 'Cristales',
    primary: '#a855f7', // purple-500
    secondary: '#9333ea', // purple-600
    accent: '#c084fc', // purple-400
    background: 'from-slate-800 via-purple-900 to-slate-900',
    cardBackground: 'bg-purple-500/10',
    text: 'text-purple-100',
    levelRange: [151, 200]
  },
  {
    id: 'desert',
    name: 'Desierto',
    primary: '#eab308', // yellow-500
    secondary: '#ca8a04', // yellow-600
    accent: '#facc15', // yellow-400
    background: 'from-slate-800 via-yellow-900 to-slate-900',
    cardBackground: 'bg-yellow-500/10',
    text: 'text-yellow-100',
    levelRange: [201, 250]
  },
  {
    id: 'space',
    name: 'Espacio',
    primary: '#6366f1', // indigo-500
    secondary: '#4f46e5', // indigo-600
    accent: '#818cf8', // indigo-400
    background: 'from-slate-800 via-indigo-900 to-slate-900',
    cardBackground: 'bg-indigo-500/10',
    text: 'text-indigo-100',
    levelRange: [251, 300]
  },
  {
    id: 'city',
    name: 'Ciudad',
    primary: '#64748b', // slate-500
    secondary: '#475569', // slate-600
    accent: '#94a3b8', // slate-400
    background: 'from-slate-800 via-slate-700 to-slate-900',
    cardBackground: 'bg-slate-500/10',
    text: 'text-slate-100',
    levelRange: [301, 350]
  },
  {
    id: 'garden',
    name: 'Jardín',
    primary: '#10b981', // emerald-500
    secondary: '#059669', // emerald-600
    accent: '#34d399', // emerald-400
    background: 'from-slate-800 via-emerald-900 to-slate-900',
    cardBackground: 'bg-emerald-500/10',
    text: 'text-emerald-100',
    levelRange: [351, 400]
  },
  {
    id: 'galaxy',
    name: 'Galaxia',
    primary: '#8b5cf6', // violet-500
    secondary: '#7c3aed', // violet-600
    accent: '#a78bfa', // violet-400
    background: 'from-slate-800 via-violet-900 to-slate-900',
    cardBackground: 'bg-violet-500/10',
    text: 'text-violet-100',
    levelRange: [401, 450]
  },
  {
    id: 'cosmic',
    name: 'Cósmico',
    primary: '#ec4899', // pink-500
    secondary: '#db2777', // pink-600
    accent: '#f472b6', // pink-400
    background: 'from-slate-800 via-pink-900 to-slate-900',
    cardBackground: 'bg-pink-500/10',
    text: 'text-pink-100',
    levelRange: [451, 500]
  }
];

// Función para obtener el tema de color según el nivel
export function getColorThemeForLevel(level: number): ColorTheme {
  const theme = colorThemes.find(t => 
    level >= t.levelRange[0] && level <= t.levelRange[1]
  );
  
  // Si no encuentra tema, usar el último (cósmico)
  return theme || colorThemes[colorThemes.length - 1];
}

// Función para verificar si es un boss level
export function isBossLevel(level: number): boolean {
  return level % 50 === 0;
}

// Función para obtener el tema de color especial para boss levels
export function getBossColorTheme(level: number): ColorTheme {
  const baseTheme = getColorThemeForLevel(level);
  
  // Para boss levels, usar colores más intensos
  return {
    ...baseTheme,
    name: `${baseTheme.name} (Boss)`,
    primary: baseTheme.secondary, // Usar color más intenso
    accent: baseTheme.primary,
    background: baseTheme.background.replace('via-', 'via-red-').replace('to-', 'to-red-'),
    cardBackground: 'bg-red-500/20', // Fondo más intenso para boss
    text: 'text-red-100'
  };
}

