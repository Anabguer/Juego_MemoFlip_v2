/**
 * ANALIZAR Y CORREGIR NIVELES
 * 1. Detectar mecánicas consecutivas repetidas
 * 2. Mostrar estadísticas
 * 3. Generar reporte
 */

const fs = require('fs');
const path = require('path');

const levelsPath = path.join(__dirname, '../src/data/levels.json');
const data = JSON.parse(fs.readFileSync(levelsPath, 'utf8'));
const levels = data.levels;

console.log('🔍 ANÁLISIS DE NIVELES DE MEMOFLIP\n');
console.log(`Total de niveles: ${levels.length}\n`);

// ========================================
// 1. DETECTAR REPETICIONES CONSECUTIVAS
// ========================================
console.log('📊 REPETICIONES CONSECUTIVAS:\n');

const repeticiones = [];

for (let i = 1; i < levels.length; i++) {
  const prev = levels[i - 1];
  const curr = levels[i];
  
  // Comparar mecánicas (ignorando 'basic')
  const prevMechs = prev.mechanics.filter(m => m !== 'basic');
  const currMechs = curr.mechanics.filter(m => m !== 'basic');
  
  // Si ambos tienen la misma mecánica no-básica
  if (prevMechs.length > 0 && currMechs.length > 0) {
    const hayRepeticion = prevMechs.some(m => currMechs.includes(m));
    
    if (hayRepeticion) {
      const mecanicaRepetida = prevMechs.find(m => currMechs.includes(m));
      repeticiones.push({
        nivel1: prev.id,
        nivel2: curr.id,
        mecanica: mecanicaRepetida,
        pares1: prev.pairs,
        pares2: curr.pairs
      });
    }
  }
}

console.log(`Total de repeticiones consecutivas: ${repeticiones.length}\n`);

// Mostrar primeras 30
console.log('Primeras 30 repeticiones:');
repeticiones.slice(0, 30).forEach(r => {
  console.log(`  Nivel ${r.nivel1}-${r.nivel2}: ${r.mecanica} (${r.pares1} y ${r.pares2} pares)`);
});

if (repeticiones.length > 30) {
  console.log(`  ... y ${repeticiones.length - 30} más\n`);
} else {
  console.log('');
}

// ========================================
// 2. ESTADÍSTICAS POR FASE
// ========================================
console.log('📈 ESTADÍSTICAS POR FASE (cada 50 niveles):\n');

for (let fase = 1; fase <= 20; fase++) {
  const start = (fase - 1) * 50 + 1;
  const end = fase * 50;
  
  const nivelesFase = levels.filter(l => l.id >= start && l.id <= end);
  
  // Contar mecánicas
  const mecanicas = {};
  nivelesFase.forEach(l => {
    l.mechanics.forEach(m => {
      if (m !== 'basic') {
        mecanicas[m] = (mecanicas[m] || 0) + 1;
      }
    });
  });
  
  console.log(`Fase ${fase} (niveles ${start}-${end}):`);
  Object.entries(mecanicas)
    .sort((a, b) => b[1] - a[1])
    .forEach(([mec, count]) => {
      console.log(`  ${mec}: ${count} veces`);
    });
  console.log('');
}

// ========================================
// 3. VERIFICAR ORDEN DE INTRODUCCIÓN
// ========================================
console.log('🎯 ORDEN DE INTRODUCCIÓN DE MECÁNICAS:\n');

const primeraAparicion = {};

levels.forEach(l => {
  l.mechanics.forEach(m => {
    if (m !== 'basic' && !primeraAparicion[m]) {
      primeraAparicion[m] = l.id;
    }
  });
});

Object.entries(primeraAparicion)
  .sort((a, b) => a[1] - b[1])
  .forEach(([mec, nivel]) => {
    console.log(`  Nivel ${nivel}: ${mec}`);
  });

console.log('\n✅ Análisis completado');

