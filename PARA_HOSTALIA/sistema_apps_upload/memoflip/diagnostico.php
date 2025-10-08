<?php
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnóstico MemoFlip</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .ok { color: #0f0; }
        .error { color: #f00; }
        .warning { color: #ff0; }
        h2 { color: #0ff; border-bottom: 2px solid #0ff; padding-bottom: 5px; }
        pre { background: #000; padding: 10px; border-left: 3px solid #0ff; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🔧 Diagnóstico MemoFlip</h1>
    
    <h2>📍 Ubicación y rutas</h2>
    <pre><?php
    echo "Script actual: " . __FILE__ . "\n";
    echo "Directorio actual: " . __DIR__ . "\n";
    echo "URL actual: " . $_SERVER['REQUEST_URI'] . "\n";
    echo "Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "\n";
    ?></pre>
    
    <h2>📁 Archivos en este directorio</h2>
    <pre><?php
    $files = scandir(__DIR__);
    foreach ($files as $file) {
        if ($file === '.' || $file === '..') continue;
        $path = __DIR__ . '/' . $file;
        $size = is_file($path) ? number_format(filesize($path)) : 'DIR';
        $type = is_dir($path) ? '📁' : '📄';
        echo "$type $file ($size bytes)\n";
    }
    ?></pre>
    
    <h2>🎴 Cartas en /cards/</h2>
    <pre><?php
    $cardsDir = __DIR__ . '/cards';
    if (is_dir($cardsDir)) {
        $cards = glob($cardsDir . '/card_*.png');
        echo "Total cartas encontradas: " . count($cards) . "\n";
        echo "Primeras 5 cartas:\n";
        foreach (array_slice($cards, 0, 5) as $card) {
            echo "  - " . basename($card) . " (" . number_format(filesize($card)) . " bytes)\n";
        }
    } else {
        echo "❌ Carpeta cards/ no existe\n";
    }
    ?></pre>
    
    <h2>🔊 Sonidos en /sounds/</h2>
    <pre><?php
    $soundsDir = __DIR__ . '/sounds';
    if (is_dir($soundsDir)) {
        $sounds = glob($soundsDir . '/*.mp3');
        echo "Total sonidos encontrados: " . count($sounds) . "\n";
        foreach ($sounds as $sound) {
            echo "  - " . basename($sound) . " (" . number_format(filesize($sound)) . " bytes)\n";
        }
    } else {
        echo "❌ Carpeta sounds/ no existe\n";
    }
    ?></pre>
    
    <h2>📦 JavaScript en /_next/static/chunks/</h2>
    <pre><?php
    $jsDir = __DIR__ . '/_next/static/chunks';
    if (is_dir($jsDir)) {
        $jsFiles = glob($jsDir . '/*.js');
        echo "Total archivos JS encontrados: " . count($jsFiles) . "\n";
        echo "Primeros 5 archivos:\n";
        foreach (array_slice($jsFiles, 0, 5) as $js) {
            echo "  - " . basename($js) . " (" . number_format(filesize($js)) . " bytes)\n";
        }
    } else {
        echo "❌ Carpeta _next/static/chunks/ no existe\n";
    }
    ?></pre>
    
    <h2>🎨 CSS en /_next/static/css/</h2>
    <pre><?php
    $cssDir = __DIR__ . '/_next/static/css';
    if (is_dir($cssDir)) {
        $cssFiles = glob($cssDir . '/*.css');
        echo "Total archivos CSS encontrados: " . count($cssFiles) . "\n";
        foreach ($cssFiles as $css) {
            echo "  - " . basename($css) . " (" . number_format(filesize($css)) . " bytes)\n";
        }
    } else {
        echo "❌ Carpeta _next/static/css/ no existe\n";
    }
    ?></pre>
    
    <h2>🔐 Archivos PHP</h2>
    <pre><?php
    $phpFiles = ['_common.php', 'auth.php', 'game.php', 'ranking.php'];
    foreach ($phpFiles as $php) {
        $path = __DIR__ . '/' . $php;
        if (file_exists($path)) {
            echo "✅ $php (" . number_format(filesize($path)) . " bytes)\n";
        } else {
            echo "❌ $php NO EXISTE\n";
        }
    }
    ?></pre>
    
    <h2>🌐 Test de rutas (desde navegador)</h2>
    <pre>
Prueba estas URLs para verificar que cargan:

1. Logo:
   <a href="logo.png" target="_blank" style="color: #0ff;">logo.png</a>
   
2. Favicon:
   <a href="favicon.ico" target="_blank" style="color: #0ff;">favicon.ico</a>

3. Primera carta:
   <a href="cards/card_001.png" target="_blank" style="color: #0ff;">cards/card_001.png</a>

4. Sonido acierto:
   <a href="sounds/acierto.mp3" target="_blank" style="color: #0ff;">sounds/acierto.mp3</a>

5. CSS principal:
   <a href="_next/static/css/e3510fc3d9d30b91.css" target="_blank" style="color: #0ff;">_next/static/css/e3510fc3d9d30b91.css</a>

6. JavaScript webpack:
   <a href="_next/static/chunks/webpack-dedb69f314dd77b7.js" target="_blank" style="color: #0ff;">_next/static/chunks/webpack-dedb69f314dd77b7.js</a>
    </pre>
    
    <h2>🧪 Tests disponibles</h2>
    <pre>
<a href="test_assets.html" style="color: #0ff;">test_assets.html</a> - Test de assets (cartas, sonidos, JS)
<a href="test_auth.html" style="color: #0ff;">test_auth.html</a> - Test de autenticación y sesiones
<a href="index.html" style="color: #0ff;">index.html</a> - Aplicación principal
    </pre>
    
    <h2>📋 Permisos</h2>
    <pre><?php
    echo "Usuario PHP: " . get_current_user() . "\n";
    echo "Permisos directorio: " . substr(sprintf('%o', fileperms(__DIR__)), -4) . "\n";
    ?></pre>
    
</body>
</html>

