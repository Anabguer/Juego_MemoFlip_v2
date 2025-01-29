// Sistema de cartas globales - cartas aleatorias de todos los temas
// import cardsIndex from '@/public/cards/global/cards-index.json';

export interface GlobalCard {
  id: string;
  image: string;
  theme: string;
  fileName: string;
}

// Función para obtener cartas aleatorias del pool global
export function getRandomGlobalCards(pairs: number): GlobalCard[] {
  // TODO: Implementar cuando se resuelva la importación del JSON
  return [];
}

// Función para obtener una imagen de portada aleatoria
export function getRandomPortadaImage(): string {
  // Usar una de las portadas existentes de forma aleatoria
  const portadas = [
    '/themes/001_oceano/portada.webp',
    '/themes/002_caramelo/portada.webp',
    '/themes/003_isla/portada.webp',
    '/themes/004_bosque/portada.png'
  ];
  
  const randomIndex = Math.floor(Math.random() * portadas.length);
  return portadas[randomIndex];
}

// Función para obtener estadísticas del pool de cartas
export function getCardPoolStats() {
  // TODO: Implementar cuando se resuelva la importación del JSON
  return {
    totalCards: 0,
    totalThemes: 0,
    themes: []
  };
}

// Función para obtener cartas de un tema específico (opcional)
export function getCardsByTheme(theme: string): GlobalCard[] {
  // TODO: Implementar cuando se resuelva la importación del JSON
  return [];
}

