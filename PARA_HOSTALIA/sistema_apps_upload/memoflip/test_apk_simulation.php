<?php
// 🧪 TEST SIMULACIÓN APK
// Este script simula exactamente lo que hace la APK

echo "<h1>🧪 TEST SIMULACIÓN APK</h1>";

// Simular exactamente lo que hace la APK
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['CONTENT_TYPE'] = 'application/json';

// Datos que envía la APK
$apk_data = [
    'action' => 'verify_code',
    'email' => 'agl0305@gmail.com',
    'code' => '822518',
    'new_password' => 'nuevapassword123'
];

echo "<h2>1. Datos que envía la APK:</h2>";
echo "<pre>" . json_encode($apk_data, JSON_PRETTY_PRINT) . "</pre>";

// Simular php://input
$json_input = json_encode($apk_data);
echo "<p>JSON input: <pre>" . $json_input . "</pre></p>";

// Simular el procesamiento de auth.php
$input = $json_input;
$json_data = json_decode($input, true);
$action = $json_data['action'] ?? $_POST['action'] ?? $_GET['action'] ?? '';

echo "<h2>2. Procesamiento de auth.php:</h2>";
echo "<p>input: <pre>" . $input . "</pre></p>";
echo "<p>json_data: <pre>" . json_encode($json_data, JSON_PRETTY_PRINT) . "</pre></p>";
echo "<p>action: <strong>$action</strong></p>";

if (empty($action)) {
    echo "<p style='color: red; font-size: 18px;'>❌ PROBLEMA: action está vacío</p>";
} else {
    echo "<p style='color: green; font-size: 18px;'>✅ action detectado correctamente</p>";
}

echo "<h2>3. Test de auth.php:</h2>";

// Simular GLOBALS para auth.php
$GLOBALS['json_data'] = $json_data;

// Simular file_get_contents('php://input') para auth.php
// Esto es lo que realmente lee auth.php
function file_get_contents($filename) {
    global $json_input;
    if ($filename === 'php://input') {
        return $json_input;
    }
    return \file_get_contents($filename);
}

try {
    // Capturar la salida de auth.php
    ob_start();
    include 'auth.php';
    $output = ob_get_clean();
    
    echo "<h3>Respuesta de auth.php:</h3>";
    echo "<pre>" . htmlspecialchars($output) . "</pre>";
    
    // Intentar decodificar JSON
    $response = json_decode($output, true);
    if ($response) {
        echo "<h3>JSON decodificado:</h3>";
        echo "<pre>" . json_encode($response, JSON_PRETTY_PRINT) . "</pre>";
        
        if ($response['success']) {
            echo "<p style='color: green; font-size: 20px;'>🎉 ¡FUNCIONA!</p>";
        } else {
            echo "<p style='color: red; font-size: 20px;'>❌ Error: " . $response['error'] . "</p>";
        }
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error en auth.php: " . $e->getMessage() . "</p>";
}
?>
