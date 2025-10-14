<?php
/**
 * TEST SIMPLE: Ver qué pasa al llamar auth.php
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<pre style='background: #1e1e1e; color: #00ff00; padding: 20px; border-radius: 10px; font-family: monospace;'>";
echo "=== TEST AUTH.PHP ===\n\n";

// 1. Ver qué archivos existen
echo "1. Archivos en directorio actual:\n";
$files = scandir('.');
foreach ($files as $file) {
    if ($file != '.' && $file != '..' && !is_dir($file)) {
        echo "   - $file\n";
    }
}
echo "\n";

// 2. Ver si auth.php existe
echo "2. Verificando auth.php:\n";
if (file_exists('auth.php')) {
    echo "   ✅ auth.php EXISTE\n";
    echo "   Tamaño: " . filesize('auth.php') . " bytes\n";
} else {
    echo "   ❌ auth.php NO EXISTE\n";
}
echo "\n";

// 3. Ver si enviar_email.php existe
echo "3. Verificando enviar_email.php:\n";
if (file_exists('enviar_email.php')) {
    echo "   ✅ enviar_email.php EXISTE\n";
    echo "   Tamaño: " . filesize('enviar_email.php') . " bytes\n";
} else {
    echo "   ❌ enviar_email.php NO EXISTE\n";
}
echo "\n";

// 4. Intentar hacer una petición real
echo "4. Simulando petición de registro:\n";
echo "   URL: auth.php\n";
echo "   Método: POST\n";
echo "   Action: register\n\n";

// Simular datos POST
$postData = [
    'action' => 'register',
    'email' => 'test@test.com',
    'nombre' => 'Test User',
    'nick' => 'testuser',
    'password' => 'test123'
];

echo "   Datos: " . json_encode($postData, JSON_PRETTY_PRINT) . "\n\n";

// Hacer petición cURL a auth.php
echo "5. Llamando a auth.php con cURL:\n\n";

$ch = curl_init('https://colisan.com/sistema_apps_upload/memoflip/auth.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

echo "   HTTP Code: $httpCode\n";
if ($curlError) {
    echo "   cURL Error: $curlError\n";
}
echo "\n   Respuesta:\n";
echo "   " . str_replace("\n", "\n   ", $response) . "\n\n";

// Decodificar respuesta
$data = json_decode($response, true);
if ($data) {
    echo "6. Respuesta decodificada:\n";
    echo "   " . print_r($data, true) . "\n";
} else {
    echo "6. ❌ No se pudo decodificar JSON\n";
    echo "   Respuesta raw: $response\n";
}

echo "\n=== FIN TEST ===\n";
echo "</pre>";

echo "<hr>";
echo "<p><strong>Conclusión:</strong></p>";
echo "<ul>";

if ($httpCode == 200) {
    echo "<li style='color: green;'>✅ auth.php responde correctamente (HTTP 200)</li>";
} else if ($httpCode == 500) {
    echo "<li style='color: red;'>❌ Error 500 en auth.php - Revisar logs del servidor</li>";
} else if ($httpCode == 404) {
    echo "<li style='color: red;'>❌ auth.php no encontrado (404)</li>";
} else {
    echo "<li style='color: orange;'>⚠️ HTTP Code: $httpCode</li>";
}

if ($data && isset($data['success'])) {
    if ($data['success']) {
        echo "<li style='color: green;'>✅ Registro exitoso</li>";
    } else {
        echo "<li style='color: red;'>❌ Error: " . ($data['error'] ?? 'desconocido') . "</li>";
    }
}

echo "</ul>";

echo "<p><a href='verificar_tabla_usuarios.php'>Ver tabla usuarios</a></p>";
?>

