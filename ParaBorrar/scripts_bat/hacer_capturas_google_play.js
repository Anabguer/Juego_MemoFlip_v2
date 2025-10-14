const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'capturas_google_play');

console.log('📸 CREANDO CAPTURAS PARA GOOGLE PLAY\n');

async function hacerCapturas() {
  let browser;
  
  try {
    // Crear directorio para capturas
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir);
    }

    console.log('🌐 Abriendo navegador...');
    browser = await puppeteer.launch({ 
      headless: false, // Mostrar navegador para ver el proceso
      defaultViewport: { width: 360, height: 640 } // Tamaño móvil
    });

    const page = await browser.newPage();
    
    console.log('📱 Navegando al juego...');
    await page.goto('http://localhost:8000', { waitUntil: 'networkidle0' });
    
    // Esperar a que cargue
    await page.waitForTimeout(3000);

    // CAPTURA 1: Pantalla de inicio
    console.log('📸 Capturando pantalla de inicio...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'captura_1_inicio.png'),
      fullPage: true
    });

    // Hacer clic en "Jugar" si existe
    try {
      await page.click('button:contains("Jugar")', { timeout: 2000 });
      await page.waitForTimeout(2000);
    } catch (e) {
      console.log('   (No se encontró botón Jugar)');
    }

    // CAPTURA 2: Pantalla de selección de nivel o juego
    console.log('📸 Capturando pantalla de juego...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'captura_2_juego.png'),
      fullPage: true
    });

    // Intentar hacer clic en un nivel o empezar juego
    try {
      await page.click('[data-level="1"], .level-card:first-child, button:contains("Nivel 1")', { timeout: 3000 });
      await page.waitForTimeout(3000);
    } catch (e) {
      console.log('   (No se pudo hacer clic en nivel)');
    }

    // CAPTURA 3: Juego en acción
    console.log('📸 Capturando juego en acción...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'captura_3_accion.png'),
      fullPage: true
    });

    // Intentar voltear algunas cartas
    try {
      const cards = await page.$$('.card, [class*="card"]');
      if (cards.length > 0) {
        for (let i = 0; i < Math.min(2, cards.length); i++) {
          await cards[i].click();
          await page.waitForTimeout(500);
        }
        await page.waitForTimeout(1000);
      }
    } catch (e) {
      console.log('   (No se pudieron voltear cartas)');
    }

    // CAPTURA 4: Con cartas volteadas
    console.log('📸 Capturando con cartas volteadas...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, 'captura_4_cartas.png'),
      fullPage: true
    });

    console.log('\n✅ CAPTURAS COMPLETADAS');
    console.log(`📁 Ubicación: ${screenshotsDir}`);
    console.log('📸 Archivos creados:');
    
    const files = fs.readdirSync(screenshotsDir);
    files.forEach(file => {
      const stats = fs.statSync(path.join(screenshotsDir, file));
      console.log(`   - ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
    });

    console.log('\n🎯 Estas capturas las usarás en Google Play Console');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

hacerCapturas();
