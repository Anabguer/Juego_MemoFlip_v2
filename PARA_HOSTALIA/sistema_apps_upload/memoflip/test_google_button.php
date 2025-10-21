<?php
// 🧪 TEST BOTÓN GOOGLE
// Este script verifica que el botón de Google esté en el HTML

echo "<h1>🧪 TEST BOTÓN GOOGLE</h1>";

echo "<h2>1. Verificando archivos del frontend:</h2>";

$files_to_check = [
    'index.html',
    '_next/static/chunks/pages/index-5ff6ba2ea9f01907.js',
    '_next/static/css/cc4243f132af1e72.css'
];

foreach ($files_to_check as $file) {
    if (file_exists($file)) {
        echo "<p style='color: green;'>✅ $file existe</p>";
    } else {
        echo "<p style='color: red;'>❌ $file NO existe</p>";
    }
}

echo "<h2>2. Buscando botón de Google en index.html:</h2>";

if (file_exists('index.html')) {
    $content = file_get_contents('index.html');
    
    if (strpos($content, 'Continuar con Google') !== false) {
        echo "<p style='color: green; font-size: 18px;'>✅ Botón 'Continuar con Google' encontrado en index.html</p>";
    } else {
        echo "<p style='color: red; font-size: 18px;'>❌ Botón 'Continuar con Google' NO encontrado en index.html</p>";
    }
    
    if (strpos($content, 'google_signin') !== false) {
        echo "<p style='color: green; font-size: 18px;'>✅ Función 'google_signin' encontrada en index.html</p>";
    } else {
        echo "<p style='color: red; font-size: 18px;'>❌ Función 'google_signin' NO encontrada en index.html</p>";
    }
    
    // Mostrar fragmento relevante
    $lines = explode("\n", $content);
    $google_line = -1;
    foreach ($lines as $i => $line) {
        if (strpos($line, 'Continuar con Google') !== false) {
            $google_line = $i;
            break;
        }
    }
    
    if ($google_line >= 0) {
        echo "<h3>Línea con botón de Google:</h3>";
        echo "<pre>" . htmlspecialchars($lines[$google_line]) . "</pre>";
    }
} else {
    echo "<p style='color: red;'>❌ index.html no existe</p>";
}

echo "<h2>3. Test del endpoint Google Sign-In:</h2>";

$test_data = [
    'action' => 'google_signin',
    'email' => 'test@gmail.com',
    'nombre' => 'Test User',
    'nick' => 'TestUser',
    'google_id' => 'google_123456'
];

$json_input = json_encode($test_data);

echo "<p>Datos de prueba:</p>";
echo "<pre>" . json_encode($test_data, JSON_PRETTY_PRINT) . "</pre>";

// Simular auth.php
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['HTTP_CONTENT_TYPE'] = 'application/json';
$GLOBALS['json_data'] = $test_data;

// Simular file_get_contents
$original_file_get_contents = 'file_get_contents';
function file_get_contents($filename) {
    global $json_input, $original_file_get_contents;
    if ($filename === 'php://input') {
        return $json_input;
    }
    return $original_file_get_contents($filename);
}

// Capturar salida
ob_start();
include 'auth.php';
$output = ob_get_clean();

echo "<h3>Respuesta de auth.php:</h3>";
echo "<pre>" . htmlspecialchars($output) . "</pre>";

$response = json_decode($output, true);
if ($response) {
    echo "<h3>JSON decodificado:</h3>";
    echo "<pre>" . json_encode($response, JSON_PRETTY_PRINT) . "</pre>";
}

if (isset($response['success']) && $response['success']) {
    echo "<p style='color: green; font-size: 20px;'>🎉 ¡GOOGLE SIGN-IN FUNCIONA!</p>";
} elseif (isset($response['error'])) {
    echo "<p style='color: red; font-size: 20px;'>❌ Error: " . htmlspecialchars($response['error']) . "</p>";
} else {
    echo "<p style='color: orange; font-size: 20px;'>⚠️ Respuesta inesperada.</p>";
}
?>


