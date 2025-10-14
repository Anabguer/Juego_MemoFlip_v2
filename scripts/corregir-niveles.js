/**
 * CORREGIR NIVELES DE MEMOFLIP
 * 1. Regenerar primeros 20 niveles con curva suave
 * 2. Eliminar repeticiones consecutivas en todo el archivo
 */

const fs = require('fs');
const path = require('path');

const levelsPath = path.join(__dirname, '../src/data/levels.json');
const data = JSON.parse(fs.readFileSync(levelsPath, 'utf8'));
const levels = data.levels;

console.log('🔧 CORRIGIENDO NIVELES DE MEMOFLIP\n');

// ========================================
// NUEVOS PRIMEROS 20 NIVELES
// ========================================

const nuevos20 = [
  // Niveles 1-5: Tutorial básico
  { id: 1, phase: 1, theme: 'ocean', pairs: 2, timeSec: 0, mechanics: ['basic'], difficulty: 'easy', description: 'Tutorial: ¡Bienvenido! Sin cronómetro. 4 cartas.', isBoss: false, rewards: { coins: 10 }, seed: 1001020, setSize: 2 },
  { id: 2, phase: 1, theme: 'ocean', pairs: 3, timeSec: 0, mechanics: ['basic'], difficulty: 'easy', description: 'Aprende lo básico. Sin cronómetro. 6 cartas.', isBoss: false, rewards: { coins: 15 }, seed: 1002030, setSize: 2 },
  { id: 3, phase: 1, theme: 'ocean', pairs: 4, timeSec: 0, mechanics: ['basic'], difficulty: 'easy', description: 'Más cartas para practicar. Sin cronómetro. 8 cartas.', isBoss: false, rewards: { coins: 20 }, seed: 1003040, setSize: 2 },
  { id: 4, phase: 1, theme: 'ocean', pairs: 5, timeSec: 0, mechanics: ['basic'], difficulty: 'easy', description: 'Sigue practicando. Sin cronómetro. 10 cartas.', isBoss: false, rewards: { coins: 25 }, seed: 1004050, setSize: 2 },
  { id: 5, phase: 1, theme: 'ocean', pairs: 6, timeSec: 0, mechanics: ['basic'], difficulty: 'easy', description: 'Domina la memoria básica. Sin cronómetro. 12 cartas.', isBoss: false, rewards: { coins: 30 }, seed: 1005060, setSize: 2 },
  
  // Nivel 6: Primera mecánica (fog)
  { id: 6, phase: 1, theme: 'ocean', pairs: 4, timeSec: 0, mechanics: ['fog'], difficulty: 'easy', description: 'Primera mecánica: Niebla suave. Sin cronómetro. 8 cartas.', isBoss: false, rewards: { coins: 40 }, seed: 1006040, setSize: 2 },
  
  // Nivel 7: Descanso
  { id: 7, phase: 1, theme: 'ocean', pairs: 6, timeSec: 0, mechanics: ['basic'], difficulty: 'easy', description: 'Descanso después de niebla. Sin cronómetro. 12 cartas.', isBoss: false, rewards: { coins: 30 }, seed: 1007060, setSize: 2 },
  
  // Nivel 8: Ghost
  { id: 8, phase: 1, theme: 'ocean', pairs: 5, timeSec: 0, mechanics: ['ghost'], difficulty: 'easy', description: 'Cartas fantasma aparecen y desaparecen. Sin cronómetro. 10 cartas.', isBoss: false, rewards: { coins: 50 }, seed: 1008050, setSize: 2 },
  
  // Nivel 9: Descanso
  { id: 9, phase: 1, theme: 'ocean', pairs: 7, timeSec: 0, mechanics: ['basic'], difficulty: 'easy', description: 'Nivel de descanso. Sin cronómetro. 14 cartas.', isBoss: false, rewards: { coins: 35 }, seed: 1009070, setSize: 2 },
  
  // Nivel 10: Peeked
  { id: 10, phase: 1, theme: 'ocean', pairs: 6, timeSec: 0, mechanics: ['peeked_card'], difficulty: 'easy', description: 'Atisbo: algunas cartas se muestran un instante. Sin cronómetro. 12 cartas.', isBoss: false, rewards: { coins: 60 }, seed: 1010060, setSize: 2 },
  
  // Nivel 11: Descanso
  { id: 11, phase: 1, theme: 'ocean', pairs: 6, timeSec: 0, mechanics: ['basic'], difficulty: 'easy', description: 'Nivel de descanso. Sin cronómetro. 12 cartas.', isBoss: false, rewards: { coins: 30 }, seed: 1011060, setSize: 2 },
  
  // Nivel 12: Trio
  { id: 12, phase: 1, theme: 'ocean', pairs: 3, timeSec: 0, mechanics: ['trio'], difficulty: 'easy', description: 'Encuentra tríos en lugar de pares. Sin cronómetro. 9 cartas.', isBoss: false, rewards: { coins: 45 }, seed: 1012030, setSize: 3 },
  
  // Nivel 13: Primer cronómetro
  { id: 13, phase: 1, theme: 'ocean', pairs: 6, timeSec: 60, mechanics: ['basic'], difficulty: 'medium', description: '¡Primer cronómetro! Tienes 60 segundos. 12 cartas.', isBoss: false, rewards: { coins: 60 }, seed: 1013060, setSize: 2 },
  
  // Nivel 14: Fog con descanso
  { id: 14, phase: 1, theme: 'ocean', pairs: 6, timeSec: 0, mechanics: ['fog'], difficulty: 'medium', description: 'Niebla de nuevo. Sin cronómetro. 12 cartas.', isBoss: false, rewards: { coins: 60 }, seed: 1014060, setSize: 2 },
  
  // Nivel 15: Basic con tiempo
  { id: 15, phase: 1, theme: 'ocean', pairs: 7, timeSec: 70, mechanics: ['basic'], difficulty: 'medium', description: 'Más cartas con cronómetro. 70 segundos. 14 cartas.', isBoss: false, rewards: { coins: 70 }, seed: 1015070, setSize: 2 },
  
  // Nivel 16: Ghost con tiempo
  { id: 16, phase: 1, theme: 'ocean', pairs: 6, timeSec: 55, mechanics: ['ghost'], difficulty: 'medium', description: 'Fantasma con cronómetro. 55 segundos. 12 cartas.', isBoss: false, rewards: { coins: 80 }, seed: 1016060, setSize: 2 },
  
  // Nivel 17: Descanso
  { id: 17, phase: 1, theme: 'ocean', pairs: 8, timeSec: 0, mechanics: ['basic'], difficulty: 'medium', description: 'Nivel de descanso. Sin cronómetro. 16 cartas.', isBoss: false, rewards: { coins: 40 }, seed: 1017080, setSize: 2 },
  
  // Nivel 18: Frozen
  { id: 18, phase: 1, theme: 'ocean', pairs: 5, timeSec: 0, mechanics: ['frozen'], difficulty: 'medium', description: 'Cartas congeladas temporalmente. Sin cronómetro. 10 cartas.', isBoss: false, rewards: { coins: 70 }, seed: 1018050, setSize: 2 },
  
  // Nivel 19: Descanso con tiempo
  { id: 19, phase: 1, theme: 'ocean', pairs: 6, timeSec: 65, mechanics: ['basic'], difficulty: 'medium', description: 'Descanso con cronómetro. 65 segundos. 12 cartas.', isBoss: false, rewards: { coins: 60 }, seed: 1019060, setSize: 2 },
  
  // Nivel 20: Darkness
  { id: 20, phase: 1, theme: 'ocean', pairs: 6, timeSec: 0, mechanics: ['darkness'], difficulty: 'medium', description: 'La oscuridad cubre el tablero poco a poco. Sin cronómetro. 12 cartas.', isBoss: false, rewards: { coins: 80 }, seed: 1020060, setSize: 2 }
];

// Reemplazar primeros 20 niveles
for (let i = 0; i < 20; i++) {
  levels[i] = nuevos20[i];
}

console.log('✅ Primeros 20 niveles actualizados\n');

// ========================================
// CORREGIR REPETICIONES CONSECUTIVAS
// ========================================

console.log('🔧 Corrigiendo repeticiones consecutivas...\n');

let corregidas = 0;

// Lista de mecánicas disponibles para intercambiar
const mecanicasDisponibles = ['fog', 'ghost', 'peeked_card', 'frozen', 'darkness', 'trio', 'bomb', 'chameleon', 'rotation'];

for (let i = 21; i < levels.length; i++) {
  const prev = levels[i - 1];
  const curr = levels[i];
  
  // Ignorar niveles boss (cada 50)
  if (curr.id % 50 === 0) continue;
  
  const prevMechs = prev.mechanics.filter(m => m !== 'basic');
  const currMechs = curr.mechanics.filter(m => m !== 'basic');
  
  if (prevMechs.length > 0 && currMechs.length > 0) {
    const hayRepeticion = prevMechs.some(m => currMechs.includes(m));
    
    if (hayRepeticion) {
      // Buscar una mecánica diferente de la fase
      const fase = Math.floor((curr.id - 1) / 50) + 1;
      const mecanicaRepetida = prevMechs.find(m => currMechs.includes(m));
      
      // Intentar cambiar por otra mecánica aleatoria
      const otrasDisponibles = mecanicasDisponibles.filter(m => 
        !prevMechs.includes(m) && m !== mecanicaRepetida
      );
      
      if (otrasDisponibles.length > 0) {
        // Elegir aleatoria basada en el seed del nivel
        const seed = curr.id * 12345;
        const idx = seed % otrasDisponibles.length;
        const nuevaMecanica = otrasDisponibles[idx];
        
        // Reemplazar la mecánica
        curr.mechanics = curr.mechanics.map(m => 
          m === mecanicaRepetida ? nuevaMecanica : m
        );
        
        console.log(`  Nivel ${curr.id}: ${mecanicaRepetida} → ${nuevaMecanica}`);
        corregidas++;
      }
    }
  }
}

console.log(`\n✅ ${corregidas} repeticiones corregidas\n`);

// ========================================
// GUARDAR ARCHIVO
// ========================================

const outputPath = path.join(__dirname, '../src/data/levels.json');
fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf8');

console.log('💾 Archivo guardado: src/data/levels.json');
console.log('\n✅ CORRECCIÓN COMPLETADA\n');

// Mostrar resumen de primeros 20
console.log('📋 PRIMEROS 20 NIVELES (NUEVOS):\n');
for (let i = 0; i < 20; i++) {
  const l = levels[i];
  const mec = l.mechanics.join(', ');
  const tiempo = l.timeSec > 0 ? `⏱️ ${l.timeSec}s` : '❌ No';
  console.log(`  ${l.id}. ${mec.padEnd(15)} | ${l.pairs} pares (${l.pairs * 2} cartas) | ${tiempo}`);
}

console.log('\n🎉 ¡Listo para compilar!');

