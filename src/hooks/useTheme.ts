import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';

export type ThemeName = 'ocean' | 'candy' | 'space' | 'forest' | 'city' | 'desert' | 'arctic' | 'jungle' | 'volcano' | 'crystal';

export interface ThemeConfig {
  id: ThemeName;
  name: string;
  phase: number;
  description: string;
  background: string;
  cardBack: string;
  cardFront: string;
  particles: string;
  music: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
    shadow: string;
  };
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'ocean',
    name: 'Océano',
    phase: 1,
    description: 'Sumérgete en las profundidades del océano',
    background: 'ocean-bg',
    cardBack: 'ocean-card',
    cardFront: 'ocean-card-front',
    particles: 'bubbles',
    music: 'ocean-ambient',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#06b6d4',
      text: '#ffffff',
      shadow: 'rgba(14, 165, 233, 0.3)',
    },
  },
  {
    id: 'candy',
    name: 'Golosinas',
    phase: 2,
    description: 'Un mundo dulce lleno de sorpresas',
    background: 'candy-bg',
    cardBack: 'candy-card',
    cardFront: 'candy-card-front',
    particles: 'sweets',
    music: 'candy-melody',
    colors: {
      primary: '#ec4899',
      secondary: '#be185d',
      accent: '#f472b6',
      text: '#ffffff',
      shadow: 'rgba(236, 72, 153, 0.3)',
    },
  },
  {
    id: 'space',
    name: 'Espacio',
    phase: 3,
    description: 'Explora las estrellas y planetas',
    background: 'space-bg',
    cardBack: 'space-card',
    cardFront: 'space-card-front',
    particles: 'stars',
    music: 'space-ambient',
    colors: {
      primary: '#8b5cf6',
      secondary: '#7c3aed',
      accent: '#a78bfa',
      text: '#ffffff',
      shadow: 'rgba(139, 92, 246, 0.3)',
    },
  },
  {
    id: 'forest',
    name: 'Bosque',
    phase: 4,
    description: 'Aventúrate en el bosque encantado',
    background: 'forest-bg',
    cardBack: 'forest-card',
    cardFront: 'forest-card-front',
    particles: 'leaves',
    music: 'forest-ambient',
    colors: {
      primary: '#16a34a',
      secondary: '#15803d',
      accent: '#22c55e',
      text: '#ffffff',
      shadow: 'rgba(22, 163, 74, 0.3)',
    },
  },
  {
    id: 'city',
    name: 'Ciudad',
    phase: 5,
    description: 'Recorre las calles de la gran ciudad',
    background: 'city-bg',
    cardBack: 'city-card',
    cardFront: 'city-card-front',
    particles: 'lights',
    music: 'city-ambient',
    colors: {
      primary: '#f59e0b',
      secondary: '#d97706',
      accent: '#fbbf24',
      text: '#ffffff',
      shadow: 'rgba(245, 158, 11, 0.3)',
    },
  },
  {
    id: 'desert',
    name: 'Desierto',
    phase: 6,
    description: 'Cruza las dunas del desierto',
    background: 'desert-bg',
    cardBack: 'desert-card',
    cardFront: 'desert-card-front',
    particles: 'sand',
    music: 'desert-ambient',
    colors: {
      primary: '#f97316',
      secondary: '#ea580c',
      accent: '#fb923c',
      text: '#ffffff',
      shadow: 'rgba(249, 115, 22, 0.3)',
    },
  },
  {
    id: 'arctic',
    name: 'Ártico',
    phase: 7,
    description: 'Sobrevive en el frío polar',
    background: 'arctic-bg',
    cardBack: 'arctic-card',
    cardFront: 'arctic-card-front',
    particles: 'snow',
    music: 'arctic-ambient',
    colors: {
      primary: '#06b6d4',
      secondary: '#0891b2',
      accent: '#67e8f9',
      text: '#ffffff',
      shadow: 'rgba(6, 182, 212, 0.3)',
    },
  },
  {
    id: 'jungle',
    name: 'Selva',
    phase: 8,
    description: 'Explora la selva tropical',
    background: 'jungle-bg',
    cardBack: 'jungle-card',
    cardFront: 'jungle-card-front',
    particles: 'vines',
    music: 'jungle-ambient',
    colors: {
      primary: '#059669',
      secondary: '#047857',
      accent: '#10b981',
      text: '#ffffff',
      shadow: 'rgba(5, 150, 105, 0.3)',
    },
  },
  {
    id: 'volcano',
    name: 'Volcán',
    phase: 9,
    description: 'Desciende al corazón del volcán',
    background: 'volcano-bg',
    cardBack: 'volcano-card',
    cardFront: 'volcano-card-front',
    particles: 'lava',
    music: 'volcano-ambient',
    colors: {
      primary: '#dc2626',
      secondary: '#b91c1c',
      accent: '#ef4444',
      text: '#ffffff',
      shadow: 'rgba(220, 38, 38, 0.3)',
    },
  },
  {
    id: 'crystal',
    name: 'Cristal',
    phase: 10,
    description: 'Adéntrate en la cueva de cristales',
    background: 'crystal-bg',
    cardBack: 'crystal-card',
    cardFront: 'crystal-card-front',
    particles: 'shards',
    music: 'crystal-ambient',
    colors: {
      primary: '#7c3aed',
      secondary: '#6d28d9',
      accent: '#8b5cf6',
      text: '#ffffff',
      shadow: 'rgba(124, 58, 237, 0.3)',
    },
  },
];

export function useTheme() {
  const { currentPhase } = useGameStore();
  const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(THEMES[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Obtener tema por fase
  const getThemeByPhase = (phase: number): ThemeConfig => {
    return THEMES.find(theme => theme.phase === phase) || THEMES[0];
  };

  // Cambiar tema
  const changeTheme = (themeId: ThemeName) => {
    const newTheme = THEMES.find(theme => theme.id === themeId);
    if (newTheme && newTheme.id !== currentTheme.id) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentTheme(newTheme);
        setIsTransitioning(false);
      }, 500);
    }
  };

  // Aplicar tema al documento
  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement;
    
    // Aplicar variables CSS
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-text', theme.colors.text);
    root.style.setProperty('--theme-shadow', theme.colors.shadow);
    
    // Aplicar clase de tema al body
    document.body.className = document.body.className
      .replace(/theme-\w+/g, '')
      .trim() + ` theme-${theme.id}`;
  };

  // Actualizar tema cuando cambia la fase
  useEffect(() => {
    const newTheme = getThemeByPhase(currentPhase);
    if (newTheme.id !== currentTheme.id) {
      changeTheme(newTheme.id);
    }
  }, [currentPhase]);

  // Aplicar tema cuando cambia
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Obtener tema por ID
  const getThemeById = (themeId: ThemeName): ThemeConfig | undefined => {
    return THEMES.find(theme => theme.id === themeId);
  };

  // Obtener todos los temas
  const getAllThemes = (): ThemeConfig[] => {
    return THEMES;
  };

  // Obtener temas por fase
  const getThemesByPhase = (phase: number): ThemeConfig[] => {
    return THEMES.filter(theme => theme.phase === phase);
  };

  return {
    currentTheme,
    isTransitioning,
    changeTheme,
    getThemeById,
    getAllThemes,
    getThemesByPhase,
    getThemeByPhase,
  };
}
