<?php
// 🧪 TEST REGISTRO
// Este script prueba el registro de usuarios

echo "<h1>🧪 TEST REGISTRO</h1>";

$email = 'todopezes@gmail.com';
$password = '123456';
$nombre = 'Todopezes';
$nick = 'Todopezes';

echo "<h2>1. Probando registro para: $email</h2>";

// Simular los datos que envía la APK
$test_data = [
    'action' => 'register',
    'email' => $email,
    'password' => $password,
    'nombre' => $nombre,
    'nick' => $nick
];

$json_input = json_encode($test_data);

echo "<h2>2. Datos que envía la APK:</h2>";
echo "<pre>" . json_encode($test_data, JSON_PRETTY_PRINT) . "</pre>";

echo "<h2>3. Simulando auth.php:</h2>";

// Simular $_SERVER variables
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['HTTP_CONTENT_TYPE'] = 'application/json';

// Simular GLOBALS para auth.php
$GLOBALS['json_data'] = $test_data;

// Simular file_get_contents('php://input') para auth.php
$original_file_get_contents = 'file_get_contents';
function file_get_contents($filename) {
    global $json_input, $original_file_get_contents;
    if ($filename === 'php://input') {
        return $json_input;
    }
    return $original_file_get_contents($filename);
}

// Capturar la salida de auth.php
ob_start();
include 'auth.php';
$output = ob_get_clean();

echo "<p>Action: <strong>" . ($GLOBALS['json_data']['action'] ?? 'NO DETECTADO') . "</strong></p>";
echo "<p>Email: <strong>" . ($GLOBALS['json_data']['email'] ?? 'NO DETECTADO') . "</strong></p>";
echo "<p>Password: <strong>" . ($GLOBALS['json_data']['password'] ?? 'NO DETECTADO') . "</strong></p>";
echo "<p>Nombre: <strong>" . ($GLOBALS['json_data']['nombre'] ?? 'NO DETECTADO') . "</strong></p>";
echo "<p>Nick: <strong>" . ($GLOBALS['json_data']['nick'] ?? 'NO DETECTADO') . "</strong></p>";

if (($GLOBALS['json_data']['action'] ?? '') === 'register' && 
    ($GLOBALS['json_data']['email'] ?? '') && 
    ($GLOBALS['json_data']['password'] ?? '') &&
    ($GLOBALS['json_data']['nombre'] ?? '') &&
    ($GLOBALS['json_data']['nick'] ?? '')) {
    echo "<p style='color: green; font-size: 18px;'>✅ Datos válidos</p>";
} else {
    echo "<p style='color: red; font-size: 18px;'>❌ Datos inválidos</p>";
}

echo "<h2>4. Test de auth.php:</h2>";
echo "<h3>Respuesta de auth.php:</h3>";
echo "<pre>" . htmlspecialchars($output) . "</pre>";

$response = json_decode($output, true);
if ($response) {
    echo "<h3>JSON decodificado:</h3>";
    echo "<pre>" . json_encode($response, JSON_PRETTY_PRINT) . "</pre>";
}

if (isset($response['success']) && $response['success']) {
    echo "<p style='color: green; font-size: 20px;'>🎉 ¡REGISTRO FUNCIONA!</p>";
} elseif (isset($response['error'])) {
    echo "<p style='color: red; font-size: 20px;'>❌ Error: " . htmlspecialchars($response['error']) . "</p>";
} else {
    echo "<p style='color: orange; font-size: 20px;'>⚠️ Respuesta inesperada.</p>";
}
?>


