const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = path.join(__dirname, 'capturas');
const outputDir = path.join(__dirname, 'capturas_google_play_redimensionadas');

console.log('📏 REDIMENSIONANDO CAPTURAS PARA GOOGLE PLAY\n');

async function redimensionarCapturas() {
  try {
    // Crear directorio de salida
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // Buscar archivos de captura
    const files = fs.readdirSync(inputDir).filter(file => 
      file.toLowerCase().includes('.png') || file.toLowerCase().includes('.jpg')
    );

    if (files.length === 0) {
      console.log('❌ No se encontraron capturas en:', inputDir);
      console.log('   Coloca tus capturas en esa carpeta primero');
      return;
    }

    console.log(`📸 Encontradas ${files.length} capturas:`);
    files.forEach(file => console.log(`   - ${file}`));
    console.log('');

    for (const file of files) {
      const inputPath = path.join(inputDir, file);
      const outputPath = path.join(outputDir, `google_play_${file}`);

      console.log(`🔄 Procesando: ${file}`);

      // Redimensionar manteniendo proporción pero ajustando a tamaño Google Play
      await sharp(inputPath)
        .resize(1080, 1920, {
          fit: 'contain',
          background: { r: 13, g: 17, b: 23 } // Color de fondo oscuro del juego
        })
        .png({
          quality: 95,
          compressionLevel: 6
        })
        .toFile(outputPath);

      const originalSize = fs.statSync(inputPath).size / 1024;
      const newSize = fs.statSync(outputPath).size / 1024;

      console.log(`   ✅ Completado: ${file}`);
      console.log(`   📏 Tamaño: ${originalSize.toFixed(1)} KB → ${newSize.toFixed(1)} KB`);
    }

    console.log('\n🎯 CAPTURAS REDIMENSIONADAS PARA GOOGLE PLAY');
    console.log(`📁 Ubicación: ${outputDir}`);
    console.log('📸 Archivos listos para subir a Google Play Console');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

redimensionarCapturas();
