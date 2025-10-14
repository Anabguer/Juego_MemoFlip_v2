const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const cardsDir = path.join(__dirname, '../public/cards');
const backupDir = path.join(__dirname, '../cards_backup_original');

console.log('🎴 OPTIMIZADOR DE CARTAS MEMOFLIP\n');

// Crear backup
if (!fs.existsSync(backupDir)) {
  console.log('📦 Creando backup de cartas originales...');
  fs.mkdirSync(backupDir, { recursive: true });
}

// Obtener todas las cartas PNG
const files = fs.readdirSync(cardsDir).filter(f => f.endsWith('.png'));

console.log(`📊 Cartas encontradas: ${files.length}\n`);

let totalOriginal = 0;
let totalOptimizado = 0;
let procesadas = 0;

async function optimizarCarta(filename) {
  const inputPath = path.join(cardsDir, filename);
  const backupPath = path.join(backupDir, filename);
  const tempPath = path.join(cardsDir, `temp_${filename}`);

  try {
    const stats = fs.statSync(inputPath);
    totalOriginal += stats.size;

    // Backup (solo si no existe)
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(inputPath, backupPath);
    }

    // Optimizar: redimensionar a 512x512 y comprimir
    await sharp(inputPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png({
        quality: 90,
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(tempPath);

    const optimizedStats = fs.statSync(tempPath);
    totalOptimizado += optimizedStats.size;

    // Reemplazar original
    fs.unlinkSync(inputPath);
    fs.renameSync(tempPath, inputPath);

    procesadas++;
    const reduction = ((1 - optimizedStats.size / stats.size) * 100).toFixed(1);
    
    if (procesadas % 10 === 0) {
      console.log(`✅ Procesadas: ${procesadas}/${files.length} (${reduction}% reducción promedio)`);
    }

  } catch (error) {
    console.error(`❌ Error en ${filename}:`, error.message);
  }
}

async function main() {
  console.log('🔄 Optimizando cartas...\n');
  
  for (const file of files) {
    await optimizarCarta(file);
  }

  const originalMB = (totalOriginal / 1024 / 1024).toFixed(2);
  const optimizadoMB = (totalOptimizado / 1024 / 1024).toFixed(2);
  const reduction = ((1 - totalOptimizado / totalOriginal) * 100).toFixed(1);

  console.log('\n✨ OPTIMIZACIÓN COMPLETADA\n');
  console.log(`📊 Tamaño original:   ${originalMB} MB`);
  console.log(`📊 Tamaño optimizado: ${optimizadoMB} MB`);
  console.log(`📊 Reducción:         ${reduction}%`);
  console.log(`\n💾 Backup guardado en: cards_backup_original/`);
}

main().catch(console.error);

