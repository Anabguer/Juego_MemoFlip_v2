export interface ThemeConfig {
  name: string;
  chapter: number;
  cards: {
    count: number;
    prefix: string;
    ext: string;
    digits: number;
  };
  back: string;
  nodes: {
    default: string;
    boss: string;
  };
  ui: {
    bg_map: string;
    badge_boss: string;
  };
  palette: {
    bg1: string;
    bg2: string;
    accent: string;
    path: string;
    node: string;
    nodeb: string;
  };
  recolor: boolean;
}

export interface ThemeCard {
  id: number;
  value: number;
  image: string;
  isFlipped: boolean;
  isMatched: boolean;
  isVisible: boolean;
  mechanic?: string;
}

// Función para obtener el tema según el nivel
export function getThemeForLevel(level: number): string {
  // Fase 1: Niveles 1-50 = Océano
  if (level >= 1 && level <= 50) {
    return '001_oceano';
  }
  // Fase 2: Niveles 51-100 = Caramelo
  if (level >= 51 && level <= 100) {
    return '002_caramelo';
  }
  // Fase 3: Niveles 101-150 = Isla
  if (level >= 101 && level <= 150) {
    return '003_isla';
  }
  // Fase 4: Niveles 151-200 = Bosque
  if (level >= 151 && level <= 200) {
    return '004_bosque';
  }
  // Fase 5: Niveles 201-250 = Montaña
  if (level >= 201 && level <= 250) {
    return '005_montana';
  }
  
  // Por defecto, océano
  return '001_oceano';
}

// Función para cargar la configuración del tema
export async function loadThemeConfig(themeId: string): Promise<ThemeConfig> {
  try {
    const response = await fetch(`/themes/${themeId}/theme.json`);
    if (!response.ok) {
      throw new Error(`Error loading theme ${themeId}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error loading theme config:', error);
    // Fallback al tema océano
    return {
      name: "Océano",
      chapter: 1,
      cards: {
        count: 30,
        prefix: "card_",
        ext: ".webp",
        digits: 3
      },
      back: "/logo.png",
      nodes: {
        default: "node_default.webp",
        boss: "node_boss.webp"
      },
      ui: {
        bg_map: "bg_map.webp",
        badge_boss: "badge_boss.webp"
      },
      palette: {
        bg1: "#0b132b",
        bg2: "#13315c",
        accent: "#ffd447",
        path: "#8da9c4",
        node: "#ffd447",
        nodeb: "#caa435"
      },
      recolor: false
    };
  }
}

// Función para generar las cartas del tema
export function generateThemeCards(themeConfig: ThemeConfig, pairs: number): ThemeCard[] {
  const cards: ThemeCard[] = [];
  const availableCards = Math.min(pairs, themeConfig.cards.count);
  
  // Crear pares de cartas
  for (let i = 0; i < availableCards; i++) {
    const cardNumber = (i % themeConfig.cards.count) + 1;
    const paddedNumber = cardNumber.toString().padStart(themeConfig.cards.digits, '0');
    const imagePath = `/themes/${getThemeForLevel(1)}/${themeConfig.cards.prefix}${paddedNumber}${themeConfig.cards.ext}`;
    
    // Crear dos cartas con el mismo valor
    cards.push({
      id: i * 2,
      value: cardNumber,
      image: imagePath,
      isFlipped: false,
      isMatched: false,
      isVisible: true,
    });
    
    cards.push({
      id: i * 2 + 1,
      value: cardNumber,
      image: imagePath,
      isFlipped: false,
      isMatched: false,
      isVisible: true,
    });
  }
  
  // Mezclar las cartas
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  
  return cards;
}

// Función para obtener la imagen de portada del tema
export function getThemeBackImage(themeId: string): string {
  return `/themes/${themeId}/portada.webp`;
}

