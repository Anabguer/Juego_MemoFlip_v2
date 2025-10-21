<?php
// 🧪 TEST SIMPLE FIX
// Este script prueba directamente la función handleVerifyCode

echo "<h1>🧪 TEST SIMPLE FIX</h1>";

// Incluir auth.php para acceder a las funciones
require_once 'auth.php';

echo "<h2>1. Simulando datos:</h2>";
$email = 'agl0305@gmail.com';
$code = '822518';
$new_password = 'nuevapassword123';

echo "<p>Email: <strong>$email</strong></p>";
echo "<p>Code: <strong>$code</strong></p>";
echo "<p>New Password: <strong>$new_password</strong></p>";

echo "<h2>2. Simulando GLOBALS y SERVER:</h2>";
$_SERVER['REQUEST_METHOD'] = 'POST';
$GLOBALS['json_data'] = [
    'email' => $email,
    'code' => $code,
    'new_password' => $new_password
];

echo "<p>REQUEST_METHOD: <strong>POST</strong></p>";
echo "<p>GLOBALS['json_data'] configurado</p>";

echo "<h2>3. Llamando a handleVerifyCode():</h2>";

try {
    // Capturar la salida
    ob_start();
    handleVerifyCode();
    $output = ob_get_clean();
    
    echo "<h3>Respuesta:</h3>";
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
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>


