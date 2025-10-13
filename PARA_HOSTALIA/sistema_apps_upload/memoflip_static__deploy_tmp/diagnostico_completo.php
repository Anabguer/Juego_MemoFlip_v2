<?php
header('Content-Type: text/html; charset=utf-8');

function listarArchivosRecursivo($dir, $base = '') {
    $archivos = [];
    if (is_dir($dir)) {
        $items = scandir($dir);
        foreach ($items as $item) {
            if ($item === '.' || $item === '..') continue;
            $path = $dir . '/' . $item;
            $relativePath = $base ? $base . '/' . $item : $item;
            
            if (is_dir($path)) {
                $archivos = array_merge($archivos, listarArchivosRecursivo($path, $relativePath));
            } else {
                $archivos[] = [
                    'path' => $relativePath,
                    'size' => filesize($path)
                ];
            }
        }
    }
    return $archivos;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnóstico Completo MemoFlip</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .ok { color: #0f0; }
        .error { color: #f00; }
        .warning { color: #ff0; }
        h2 { color: #0ff; border-bottom: 2px solid #0ff; padding-bottom: 5px; }
        pre { background: #000; padding: 10px; border-left: 3px solid #0ff; overflow-x: auto; font-size: 12px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { padding: 8px; text-align: left; border: 1px solid #0ff; }
        th { background: #003; }
    </style>
</head>
<body>
    <h1>🔧 Diagnóstico Completo MemoFlip</h1>
    
    <h2>📦 TODOS los archivos JavaScript en _next/</h2>
    <pre><?php
    $nextDir = __DIR__ . '/_next';
    if (is_dir($nextDir)) {
        $jsFiles = listarArchivosRecursivo($nextDir);
        $jsFiles = array_filter($jsFiles, function($f) {
            return substr($f['path'], -3) === '.js';
        });
        
        echo "Total archivos .js encontrados: " . count($jsFiles) . "\n\n";
        
        foreach ($jsFiles as $file) {
            $size = number_format($file['size']);
            echo "  " . $file['path'] . " ($size bytes)\n";
        }
    } else {
        echo "❌ Carpeta _next/ no existe\n";
    }
    ?></pre>
    
    <h2>🎨 CSS Completo</h2>
    <pre><?php
    if (is_dir($nextDir)) {
        $cssFiles = listarArchivosRecursivo($nextDir);
        $cssFiles = array_filter($cssFiles, function($f) {
            return substr($f['path'], -4) === '.css';
        });
        
        echo "Total archivos .css encontrados: " . count($cssFiles) . "\n\n";
        
        foreach ($cssFiles as $file) {
            $size = number_format($file['size']);
            echo "  " . $file['path'] . " ($size bytes)\n";
        }
    }
    ?></pre>
    
    <h2>🎴 Cartas (total)</h2>
    <pre><?php
    $cardsDir = __DIR__ . '/cards';
    if (is_dir($cardsDir)) {
        $cards = glob($cardsDir . '/card_*.png');
        echo "Total: " . count($cards) . " cartas\n";
        if (count($cards) !== 117) {
            echo "⚠️ ADVERTENCIA: Deberían ser 117 cartas\n";
        }
    }
    ?></pre>
    
    <h2>🔊 Sonidos (total)</h2>
    <pre><?php
    $soundsDir = __DIR__ . '/sounds';
    if (is_dir($soundsDir)) {
        $sounds = glob($soundsDir . '/*.mp3');
        echo "Total: " . count($sounds) . " sonidos\n";
        if (count($sounds) !== 6) {
            echo "⚠️ ADVERTENCIA: Deberían ser 6 sonidos\n";
        }
    }
    ?></pre>
    
    <h2>📄 Archivos raíz importantes</h2>
    <table>
        <tr>
            <th>Archivo</th>
            <th>Estado</th>
            <th>Tamaño</th>
        </tr>
        <?php
        $archivosImportantes = [
            'index.html' => 'HTML principal',
            'favicon.ico' => 'Favicon',
            'logo.png' => 'Logo',
            '.htaccess' => 'Seguridad',
            '_common.php' => 'Helpers PHP',
            'auth.php' => 'Autenticación',
            'game.php' => 'API Juego',
            'ranking.php' => 'API Ranking',
            'test_assets.html' => 'Test Assets',
            'test_auth.html' => 'Test Auth'
        ];
        
        foreach ($archivosImportantes as $archivo => $desc) {
            $path = __DIR__ . '/' . $archivo;
            $existe = file_exists($path);
            $estado = $existe ? '✅' : '❌';
            $size = $existe ? number_format(filesize($path)) . ' bytes' : 'N/A';
            $color = $existe ? '#0f0' : '#f00';
            echo "<tr style='color: $color'>";
            echo "<td>$archivo</td>";
            echo "<td>$estado $desc</td>";
            echo "<td>$size</td>";
            echo "</tr>";
        }
        ?>
    </table>
    
    <h2>🧪 Tests rápidos</h2>
    <pre>
<a href="index.html" style="color: #0ff; font-size: 16px;">🎮 ABRIR MEMOFLIP</a>

<a href="test_assets.html" style="color: #ff0; font-size: 16px;">🧪 Test de Assets</a>

<a href="test_auth.html" style="color: #ff0; font-size: 16px;">🔐 Test de Autenticación</a>
    </pre>
    
    <h2>✅ Verificación final</h2>
    <pre><?php
    $totalJS = count(array_filter(listarArchivosRecursivo($nextDir), function($f) {
        return substr($f['path'], -3) === '.js';
    }));
    $totalCSS = count(array_filter(listarArchivosRecursivo($nextDir), function($f) {
        return substr($f['path'], -4) === '.css';
    }));
    $totalCartas = count(glob($cardsDir . '/card_*.png'));
    $totalSonidos = count(glob($soundsDir . '/*.mp3'));
    
    echo "Resumen:\n";
    echo "  JavaScript: $totalJS archivos " . ($totalJS >= 25 ? '✅' : '❌') . "\n";
    echo "  CSS: $totalCSS archivos " . ($totalCSS >= 1 ? '✅' : '❌') . "\n";
    echo "  Cartas PNG: $totalCartas " . ($totalCartas === 117 ? '✅' : '❌') . "\n";
    echo "  Sonidos MP3: $totalSonidos " . ($totalSonidos === 6 ? '✅' : '❌') . "\n";
    
    if ($totalJS >= 25 && $totalCSS >= 1 && $totalCartas === 117 && $totalSonidos === 6) {
        echo "\n🎉 TODO LISTO - Deberías poder jugar en index.html\n";
    } else {
        echo "\n⚠️ Faltan archivos - Revisa arriba\n";
    }
    ?></pre>
    
</body>
</html>

