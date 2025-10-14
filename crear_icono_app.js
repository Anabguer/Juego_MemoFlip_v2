const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, 'public/logo.png');
const outputPath = path.join(__dirname, 'iconoapp.png');

console.log('🎨 CREANDO ICONO PARA GOOGLE PLAY\n');

async function crearIcono() {
  try {
    // Verificar que el logo existe
    if (!fs.existsSync(logoPath)) {
      console.error('❌ No se encuentra public/logo.png');
      return;
    }

    console.log('📊 Información del logo original:');
    const metadata = await sharp(logoPath).metadata();
    console.log(`   Dimensiones: ${metadata.width}x${metadata.height}px`);
    console.log(`   Formato: ${metadata.format}`);
    console.log(`   Tamaño: ${(fs.statSync(logoPath).size / 1024).toFixed(1)} KB\n`);

    console.log('🔄 Redimensionando a 512x512px...');
    
    // Crear icono 512x512 con fondo transparente
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Fondo transparente
      })
      .png({
        quality: 100,
        compressionLevel: 0 // Máxima calidad
      })
      .toFile(outputPath);

    const finalSize = fs.statSync(outputPath).size / 1024;
    
    console.log('\n✅ ICONO CREADO EXITOSAMENTE');
    console.log(`📦 Archivo: ${outputPath}`);
    console.log(`📏 Dimensiones: 512x512px`);
    console.log(`💾 Tamaño: ${finalSize.toFixed(1)} KB`);
    console.log('\n🎯 Este archivo lo usarás en Google Play Console');

  } catch (error) {
    console.error('❌ Error creando el icono:', error.message);
  }
}

crearIcono();
