const fs = require('fs');
const XLSX = require('xlsx');

// Leer archivos JSON de niveles
const levelsBeginner = JSON.parse(fs.readFileSync('public/levels_beginner.json', 'utf8')).levels;
const levelsNormal = JSON.parse(fs.readFileSync('public/levels.json', 'utf8')).levels;
const levelsExtreme = JSON.parse(fs.readFileSync('public/levels_extreme.json', 'utf8')).levels;

// Función para obtener información de mecánicas
function getMechanicsInfo(mechanics) {
  if (!mechanics || mechanics.length === 0) return 'Sin mecánicas';
  
  const mechanicsMap = {
    'basic': 'Básico (Pares)',
    'trios': 'Tríos',
    'rotation': 'Rotación',
    'color_change': 'Cambio de Color',
    'size_change': 'Cambio de Tamaño',
    'shape_change': 'Cambio de Forma',
    'pattern': 'Patrón',
    'sequence': 'Secuencia',
    'memory': 'Memoria',
    'logic': 'Lógica'
  };
  
  return mechanics.map(mech => mechanicsMap[mech] || mech).join(', ');
}

// Función para procesar niveles de un modo
function processLevels(levels, modeName) {
  return levels.map((level, index) => {
    const levelNumber = index + 1;
    const cards = level.pairs ? level.pairs * 2 : (level.trios ? level.trios * 3 : 0);
    const hasTimer = level.timer !== undefined && level.timer > 0;
    const timerText = hasTimer ? `${level.timer}s` : 'Sin cronómetro';
    
    return {
      'Modo': modeName,
      'Nivel': levelNumber,
      'Cartas': cards,
      'Cronómetro': timerText,
      'Mecánicas': getMechanicsInfo(level.mechanics),
      'Descripción': level.description || '',
      'Dificultad': level.difficulty || 'Normal',
      'Pares': level.pairs || 0,
      'Tríos': level.trios || 0
    };
  });
}

// Procesar todos los modos
const allLevels = [
  ...processLevels(levelsBeginner, 'Principiante'),
  ...processLevels(levelsNormal, 'Normal'),
  ...processLevels(levelsExtreme, 'Extremo')
];

// Crear libro de Excel
const wb = XLSX.utils.book_new();

// Hoja principal con todos los niveles
const ws = XLSX.utils.json_to_sheet(allLevels);

// Ajustar ancho de columnas
const colWidths = [
  { wch: 12 }, // Modo
  { wch: 8 },  // Nivel
  { wch: 8 },  // Cartas
  { wch: 15 }, // Cronómetro
  { wch: 40 }, // Mecánicas
  { wch: 50 }, // Descripción
  { wch: 12 }, // Dificultad
  { wch: 8 },  // Pares
  { wch: 8 }   // Tríos
];
ws['!cols'] = colWidths;

XLSX.utils.book_append_sheet(wb, ws, 'Todos los Modos');

// Crear hojas separadas por modo
const modes = [
  { name: 'Principiante', levels: levelsBeginner },
  { name: 'Normal', levels: levelsNormal },
  { name: 'Extremo', levels: levelsExtreme }
];

modes.forEach(mode => {
  const modeLevels = processLevels(mode.levels, mode.name);
  const modeWs = XLSX.utils.json_to_sheet(modeLevels);
  modeWs['!cols'] = colWidths;
  XLSX.utils.book_append_sheet(wb, modeWs, `Modo ${mode.name}`);
});

// Hoja de resumen estadístico
const stats = modes.map(mode => {
  const levels = mode.levels;
  const totalLevels = levels.length;
  const totalCards = levels.reduce((sum, level) => {
    const cards = level.pairs ? level.pairs * 2 : (level.trios ? level.trios * 3 : 0);
    return sum + cards;
  }, 0);
  const levelsWithTimer = levels.filter(level => level.timer && level.timer > 0).length;
  const basicMechanics = levels.filter(level => 
    level.mechanics && level.mechanics.includes('basic')
  ).length;
  const trioMechanics = levels.filter(level => 
    level.mechanics && level.mechanics.includes('trios')
  ).length;
  
  return {
    'Modo': mode.name,
    'Total Niveles': totalLevels,
    'Promedio Cartas': Math.round(totalCards / totalLevels),
    'Niveles con Cronómetro': levelsWithTimer,
    '% Con Cronómetro': Math.round((levelsWithTimer / totalLevels) * 100) + '%',
    'Niveles Básicos': basicMechanics,
    'Niveles Tríos': trioMechanics,
    'Cartas Mínimas': Math.min(...levels.map(level => 
      level.pairs ? level.pairs * 2 : (level.trios ? level.trios * 3 : 0)
    )),
    'Cartas Máximas': Math.max(...levels.map(level => 
      level.pairs ? level.pairs * 2 : (level.trios ? level.trios * 3 : 0)
    ))
  };
});

const statsWs = XLSX.utils.json_to_sheet(stats);
statsWs['!cols'] = [
  { wch: 12 }, // Modo
  { wch: 15 }, // Total Niveles
  { wch: 15 }, // Promedio Cartas
  { wch: 20 }, // Niveles con Cronómetro
  { wch: 15 }, // % Con Cronómetro
  { wch: 15 }, // Niveles Básicos
  { wch: 15 }, // Niveles Tríos
  { wch: 15 }, // Cartas Mínimas
  { wch: 15 }  // Cartas Máximas
];
XLSX.utils.book_append_sheet(wb, statsWs, 'Estadísticas');

// Guardar archivo
const fileName = `MemoFlip_Modos_Juego_${new Date().toISOString().split('T')[0]}.xlsx`;
XLSX.writeFile(wb, fileName);

console.log(`✅ Excel generado: ${fileName}`);
console.log(`📊 Total niveles procesados: ${allLevels.length}`);
console.log(`📋 Hojas creadas:`);
console.log(`   - Todos los Modos (${allLevels.length} niveles)`);
console.log(`   - Modo Principiante (${levelsBeginner.length} niveles)`);
console.log(`   - Modo Normal (${levelsNormal.length} niveles)`);
console.log(`   - Modo Extremo (${levelsExtreme.length} niveles)`);
console.log(`   - Estadísticas (resumen por modo)`);

// Mostrar estadísticas por consola
console.log('\n📈 ESTADÍSTICAS POR MODO:');
stats.forEach(stat => {
  console.log(`\n${stat.Modo}:`);
  console.log(`  - Niveles: ${stat['Total Niveles']}`);
  console.log(`  - Promedio cartas: ${stat['Promedio Cartas']}`);
  console.log(`  - Con cronómetro: ${stat['Niveles con Cronómetro']} (${stat['% Con Cronómetro']})`);
  console.log(`  - Básicos: ${stat['Niveles Básicos']} | Tríos: ${stat['Niveles Tríos']}`);
  console.log(`  - Cartas: ${stat['Cartas Mínimas']}-${stat['Cartas Máximas']}`);
});
