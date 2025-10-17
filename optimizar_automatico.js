const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

console.log('🔧 Iniciando optimización automática de imágenes...');

const cardsDir = 'public/cards';
const files = fs.readdirSync(cardsDir).filter(f => f.startsWith('card_') && f.endsWith('.png'));

let optimizedCount = 0;
let totalSizeBefore = 0;
let totalSizeAfter = 0;

async function optimizeImage(filePath) {
  try {
    const stats = fs.statSync(filePath);
    const sizeKB = Math.round(stats.size / 1024);
    
    // Solo optimizar si es mayor a 200KB
    if (sizeKB <= 200) {
      return { before: stats.size, after: stats.size };
    }
    
    console.log(`🔧 Optimizando ${path.basename(filePath)} (${sizeKB} KB)...`);
    
    // Crear backup
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    
    // Optimizar con sharp
    await sharp(filePath)
      .resize(512, 512, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .png({ 
        quality: 85,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(filePath + '.tmp');
    
    // Reemplazar original
    fs.renameSync(filePath + '.tmp', filePath);
    
    const newStats = fs.statSync(filePath);
    const newSizeKB = Math.round(newStats.size / 1024);
    
    console.log(`✅ ${path.basename(filePath)}: ${sizeKB} KB → ${newSizeKB} KB (${Math.round((1 - newStats.size/stats.size) * 100)}% reducción)`);
    
    return { before: stats.size, after: newStats.size };
    
  } catch (error) {
    console.error(`❌ Error optimizando ${filePath}:`, error.message);
    return { before: 0, after: 0 };
  }
}

async function main() {
  console.log(`📊 Procesando ${files.length} imágenes...`);
  
  for (const file of files) {
    const filePath = path.join(cardsDir, file);
    const result = await optimizeImage(filePath);
    totalSizeBefore += result.before;
    totalSizeAfter += result.after;
    
    if (result.before !== result.after) {
      optimizedCount++;
    }
  }
  
  console.log(`\n📈 RESUMEN FINAL:`);
  console.log(`- Imágenes optimizadas: ${optimizedCount}`);
  console.log(`- Tamaño total antes: ${Math.round(totalSizeBefore / 1024)} KB`);
  console.log(`- Tamaño total después: ${Math.round(totalSizeAfter / 1024)} KB`);
  console.log(`- Reducción total: ${Math.round((1 - totalSizeAfter/totalSizeBefore) * 100)}%`);
  
  console.log(`\n✅ ¡Optimización completada!`);
}

main().catch(console.error);

