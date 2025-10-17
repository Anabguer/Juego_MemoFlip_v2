const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

console.log('🔧 Reduciendo tamaño del AAB...');

// 1. ELIMINAR BACKUPS (ocupan mucho espacio)
console.log('🗑️ Eliminando archivos .backup...');
const cardsDir = 'public/cards';
const files = fs.readdirSync(cardsDir);
let deletedSize = 0;

files.forEach(file => {
  if (file.endsWith('.backup') || file.endsWith('.backup2')) {
    const filePath = path.join(cardsDir, file);
    const stats = fs.statSync(filePath);
    deletedSize += stats.size;
    fs.unlinkSync(filePath);
    console.log(`✅ Eliminado: ${file} (${Math.round(stats.size/1024)} KB)`);
  }
});

console.log(`🗑️ Total eliminado: ${Math.round(deletedSize/1024/1024)} MB`);

// 2. OPTIMIZAR AUDIO (reducir calidad)
console.log('🎵 Optimizando archivos de audio...');
const audioFiles = [
  'public/sounds/fondo.mp3',
  'public/sounds/fondo2.mp3'
];

audioFiles.forEach(audioFile => {
  if (fs.existsSync(audioFile)) {
    const stats = fs.statSync(audioFile);
    const sizeMB = Math.round(stats.size/1024/1024 * 100) / 100;
    console.log(`📊 ${path.basename(audioFile)}: ${sizeMB} MB`);
    // Nota: Para optimizar audio necesitarías ffmpeg o similar
    // Por ahora solo reportamos el tamaño
  }
});

// 3. OPTIMIZAR LOGO
console.log('🖼️ Optimizando logo...');
const logoPath = 'public/logo.png';
if (fs.existsSync(logoPath)) {
  const stats = fs.statSync(logoPath);
  const sizeKB = Math.round(stats.size/1024);
  console.log(`📊 logo.png: ${sizeKB} KB`);
  
  // Crear backup
  fs.copyFileSync(logoPath, logoPath + '.backup');
  
  // Optimizar logo
  sharp(logoPath)
    .resize(512, 512, { 
      fit: 'inside',
      withoutEnlargement: true 
    })
    .png({ 
      quality: 85,
      compressionLevel: 9
    })
    .toFile(logoPath + '.tmp')
    .then(() => {
      fs.renameSync(logoPath + '.tmp', logoPath);
      const newStats = fs.statSync(logoPath);
      const newSizeKB = Math.round(newStats.size/1024);
      console.log(`✅ Logo optimizado: ${sizeKB} KB → ${newSizeKB} KB (${Math.round((1 - newStats.size/stats.size) * 100)}% reducción)`);
    })
    .catch(err => console.error('❌ Error optimizando logo:', err));
}

// 4. OPTIMIZAR IMÁGENES GLOBALES (bosque, oceano, montaña)
console.log('🌍 Optimizando imágenes globales...');
const globalDirs = ['public/cards/global'];

globalDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
    console.log(`📁 Optimizando ${files.length} imágenes en ${dir}...`);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size/1024);
      
      if (sizeKB > 500) { // Solo optimizar archivos > 500KB
        console.log(`🔧 Optimizando ${file} (${sizeKB} KB)...`);
        
        // Crear backup
        fs.copyFileSync(filePath, filePath + '.backup');
        
        sharp(filePath)
          .resize(600, 600, { 
            fit: 'inside',
            withoutEnlargement: true 
          })
          .png({ 
            quality: 80,
            compressionLevel: 9,
            adaptiveFiltering: true
          })
          .toFile(filePath + '.tmp')
          .then(() => {
            fs.renameSync(filePath + '.tmp', filePath);
            const newStats = fs.statSync(filePath);
            const newSizeKB = Math.round(newStats.size/1024);
            console.log(`✅ ${file}: ${sizeKB} KB → ${newSizeKB} KB (${Math.round((1 - newStats.size/stats.size) * 100)}% reducción)`);
          })
          .catch(err => console.error(`❌ Error optimizando ${file}:`, err));
      }
    });
  }
});

console.log('✅ Optimización completada. Ejecuta "npm run build" para generar nuevo AAB.');
