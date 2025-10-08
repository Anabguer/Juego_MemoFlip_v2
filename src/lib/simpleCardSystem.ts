// Sistema simple de cartas - lee automáticamente todas las cartas disponibles
export interface SimpleCard {
  id: string;
  image: string;
  fileName: string;
}

// Lista de cartas disponibles (se actualiza automáticamente)
const availableCards: SimpleCard[] = [];

// Función para generar automáticamente la lista de cartas disponibles
function generateCardList(): string[] {
  // SOLO las cartas que realmente existen en public/cards/ (sin subcarpetas)
  // Basado en el listado real del directorio - solo las que existen
  const existingCards = [
    'card_001.png',
    'card_002.png',
    'card_003.png',
    'card_004.png',
    'card_005.png',
    'card_006.png',
    'card_007.png',
    'card_008.png',
    'card_009.png',
    'card_010.png',
    'card_011.png',
    'card_012.png',
    'card_013.png',
    'card_014.png',
    'card_015.png',
    'card_016.png',
    'card_017.png',
    'card_018.png',
    'card_019.png',
    'card_020.png',
    'card_021.png'
  ];
  
  console.log(`🎴 Cartas reales encontradas: ${existingCards.length}`, existingCards);
  return existingCards;
}

// Función para obtener todas las cartas disponibles
export function getAvailableCards(): SimpleCard[] {
  return availableCards;
}

// Función para cargar las cartas disponibles (se llama al inicio)
export function loadAvailableCards(): SimpleCard[] {
  // Lista de cartas disponibles en public/cards/
  const cards: SimpleCard[] = [];
  
  // Generar automáticamente la lista de cartas disponibles
  const cardFiles = generateCardList();
  
  cardFiles.forEach((fileName, index) => {
    // Usar basePath configurado o fallback a /cards/
    let basePath = '/sistema_apps_upload/memoflip_static/cards';
    if (typeof window !== 'undefined') {
      const win = window as unknown as { __MEMOFLIP_CONFIG__?: { cardsPath?: string } };
      if (win.__MEMOFLIP_CONFIG__?.cardsPath) {
        basePath = win.__MEMOFLIP_CONFIG__.cardsPath;
      }
    }
    
    cards.push({
      id: `card_${index + 1}`,
      image: `${basePath}/${fileName}`,
      fileName: fileName
    });
  });
  
  // Actualizar la lista global
  availableCards.length = 0;
  availableCards.push(...cards);
  
  console.log(`🎴 Cargadas ${cards.length} cartas disponibles:`, cards.map(c => c.fileName));
  console.log(`🎴 Cartas principales:`, cards.slice(0, 20).map(c => c.fileName));
  return cards;
}

// Función para obtener cartas aleatorias
export function getRandomCards(pairs: number, isTrio: boolean = false): SimpleCard[] {
  if (availableCards.length === 0) {
    loadAvailableCards();
  }
  
  // Mezclar todas las cartas disponibles de forma completamente aleatoria
  const shuffledCards = [...availableCards].sort(() => Math.random() - 0.5);
  
  // Seleccionar el número de cartas necesarias (solo los pares únicos) de forma aleatoria
  const selectedCards = shuffledCards.slice(0, pairs);
  
  // Crear pares o tríos duplicando las cartas
  const cardGroups: SimpleCard[] = [];
  
  selectedCards.forEach((card, index) => {
    if (isTrio) {
      // Crear trío (3 cartas idénticas)
      cardGroups.push({
        id: `${card.id}_1`,
        image: card.image,
        fileName: card.fileName
      });
      
      cardGroups.push({
        id: `${card.id}_2`,
        image: card.image,
        fileName: card.fileName
      });
      
      cardGroups.push({
        id: `${card.id}_3`,
        image: card.image,
        fileName: card.fileName
      });
    } else {
      // Crear par (2 cartas idénticas)
      cardGroups.push({
        id: `${card.id}_1`,
        image: card.image,
        fileName: card.fileName
      });
      
      cardGroups.push({
        id: `${card.id}_2`,
        image: card.image,
        fileName: card.fileName
      });
    }
  });
  
  // Mezclar las cartas para que no estén juntas (aleatorio total)
  const finalCards = cardGroups.sort(() => Math.random() - 0.5);
  
  const groupType = isTrio ? 'tríos' : 'pares';
  const multiplier = isTrio ? 3 : 2;
  console.log(`🎴 Generando ${pairs} ${groupType} (${finalCards.length} cartas total) - SELECCIÓN ALEATORIA:`, 
    selectedCards.map(c => c.fileName));
  console.log(`🎴 Cartas disponibles: ${availableCards.length}, Seleccionadas: ${selectedCards.length}, Finales: ${finalCards.length}`);
  
  return finalCards;
}

// Función para obtener la portada (logo con fondo naranja)
export function getRandomPortada(): string {
  // Usar basePath configurado o fallback
  let basePath = '/sistema_apps_upload/memoflip_static';
  if (typeof window !== 'undefined') {
    const win = window as unknown as { __MEMOFLIP_CONFIG__?: { basePath?: string } };
    if (win.__MEMOFLIP_CONFIG__?.basePath) {
      basePath = win.__MEMOFLIP_CONFIG__.basePath;
    }
  }
  
  return `${basePath}/logo.png`;
}

// Función para obtener estadísticas
export function getCardStats() {
  return {
    totalCards: availableCards.length,
    themes: ['oceano', 'caramelo', 'isla', 'bosque', 'montana']
  };
}
