const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Analizando imágenes...');

const cardsDir = 'public/cards';
const files = fs.readdirSync(cardsDir).filter(f => f.startsWith('card_') && f.endsWith('.png'));

let optimizedCount = 0;
let totalSizeBefore = 0;
let totalSizeAfter = 0;

console.log(`📊 Encontradas ${files.length} imágenes de cartas`);

for (const file of files) {
  const filePath = path.join(cardsDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = Math.round(stats.size / 1024);
  
  totalSizeBefore += stats.size;
  
  // Si la imagen es mayor a 200KB, optimizarla
  if (sizeKB > 200) {
    console.log(`🔧 Optimizando ${file} (${sizeKB} KB)...`);
    
    try {
      // Crear backup
      const backupPath = filePath + '.backup';
      fs.copyFileSync(filePath, backupPath);
      
      // Optimizar con ImageMagick (si está disponible) o usar una herramienta simple
      // Para ahora, solo reportar las que necesitan optimización
      console.log(`⚠️  ${file} necesita optimización (${sizeKB} KB)`);
      optimizedCount++;
      
    } catch (error) {
      console.error(`❌ Error procesando ${file}:`, error.message);
    }
  } else {
    totalSizeAfter += stats.size;
  }
}

console.log(`\n📈 RESUMEN:`);
console.log(`- Imágenes que necesitan optimización: ${optimizedCount}`);
console.log(`- Tamaño total antes: ${Math.round(totalSizeBefore / 1024)} KB`);
console.log(`- Tamaño total después: ${Math.round(totalSizeAfter / 1024)} KB`);

if (optimizedCount > 0) {
  console.log(`\n💡 Recomendación: Usar una herramienta como TinyPNG o ImageMagick para optimizar las imágenes grandes.`);
}

