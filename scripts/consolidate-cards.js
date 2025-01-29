const fs = require('fs');
const path = require('path');

// Función para copiar archivos
function copyFile(source, destination) {
  try {
    fs.copyFileSync(source, destination);
    return true;
  } catch (error) {
    console.error(`Error copiando ${source}:`, error.message);
    return false;
  }
}

// Función para obtener todos los archivos de cartas
function getAllCardFiles() {
  const themesDir = path.join(__dirname, '../public/themes');
  const cardFiles = [];
  
  const themes = fs.readdirSync(themesDir);
  
  themes.forEach(theme => {
    const themePath = path.join(themesDir, theme);
    if (fs.statSync(themePath).isDirectory()) {
      const files = fs.readdirSync(themePath);
      
      files.forEach(file => {
        // Buscar archivos de cartas (card_XXX.webp, card_XXX.png)
        if (file.match(/^card_\d+\.(webp|png)$/)) {
          const sourcePath = path.join(themePath, file);
          const themeName = theme.replace(/^\d+_/, ''); // Quitar número del tema
          const newFileName = `${themeName}_${file}`;
          
          cardFiles.push({
            source: sourcePath,
            fileName: newFileName,
            theme: themeName
          });
        }
      });
    }
  });
  
  return cardFiles;
}

// Función principal
function consolidateCards() {
  const globalDir = path.join(__dirname, '../public/cards/global');
  
  // Crear directorio si no existe
  if (!fs.existsSync(globalDir)) {
    fs.mkdirSync(globalDir, { recursive: true });
  }
  
  const cardFiles = getAllCardFiles();
  console.log(`📦 Encontradas ${cardFiles.length} cartas para consolidar...`);
  
  let copied = 0;
  let errors = 0;
  
  cardFiles.forEach(card => {
    const destination = path.join(globalDir, card.fileName);
    
    if (copyFile(card.source, destination)) {
      console.log(`✅ ${card.fileName} (${card.theme})`);
      copied++;
    } else {
      errors++;
    }
  });
  
  console.log(`\n🎯 Resumen:`);
  console.log(`   ✅ Copiadas: ${copied}`);
  console.log(`   ❌ Errores: ${errors}`);
  console.log(`   📁 Destino: ${globalDir}`);
  
  // Crear archivo de índice
  const indexFile = path.join(globalDir, 'cards-index.json');
  const index = cardFiles.map(card => ({
    fileName: card.fileName,
    theme: card.theme,
    originalPath: card.source
  }));
  
  fs.writeFileSync(indexFile, JSON.stringify(index, null, 2));
  console.log(`📋 Índice creado: ${indexFile}`);
}

// Ejecutar
consolidateCards();

