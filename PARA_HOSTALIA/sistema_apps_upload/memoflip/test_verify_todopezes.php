<?php
// 🧪 TEST VERIFICACIÓN TODOPEZES
// Este script prueba la verificación para todopezes@gmail.com

echo "<h1>🧪 TEST VERIFICACIÓN TODOPEZES</h1>";

$email = 'todopezes@gmail.com';

echo "<h2>1. Verificando estado de la cuenta: $email</h2>";

try {
    require_once 'config_hostalia.php';
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Buscar usuario
    $usuario_aplicacion_key = $email . '_memoflip';
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':key' => $usuario_aplicacion_key]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "<p style='color: red;'>❌ Usuario no encontrado</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Usuario encontrado</p>";
    echo "<p>Email: <strong>" . $user['email'] . "</strong></p>";
    echo "<p>Nombre: <strong>" . $user['nombre'] . "</strong></p>";
    echo "<p>Nick: <strong>" . $user['nick'] . "</strong></p>";
    echo "<p>Código de verificación: <strong>" . ($user['verification_code'] ?: 'NULL') . "</strong></p>";
    echo "<p>Expira: <strong>" . ($user['verification_expiry'] ?: 'N/A') . "</strong></p>";
    echo "<p>Verificado en: <strong>" . ($user['verified_at'] ?: 'N/A') . "</strong></p>";
    
    $current_time = time();
    $expiry_timestamp = $user['verification_expiry'] ? strtotime($user['verification_expiry']) : 0;
    
    if ($user['verification_code'] && $expiry_timestamp > $current_time) {
        echo "<p style='color: green; font-size: 18px;'>✅ CÓDIGO VÁLIDO</p>";
        echo "<p>Usa este código: <strong>" . $user['verification_code'] . "</strong></p>";
    } elseif (!$user['verification_code']) {
        echo "<p style='color: orange; font-size: 18px;'>⚠️ NO HAY CÓDIGO DE VERIFICACIÓN</p>";
    } else {
        echo "<p style='color: red; font-size: 18px;'>❌ CÓDIGO EXPIRADO</p>";
    }
    
    echo "<h2>2. Test de verificación con código correcto:</h2>";
    
    if ($user['verification_code'] && $expiry_timestamp > $current_time) {
        $test_data = [
            'action' => 'verify_code',
            'email' => $email,
            'code' => $user['verification_code'],
            'new_password' => 'nuevapassword123'
        ];
        
        $json_input = json_encode($test_data);
        
        echo "<h3>Datos que envía la APK:</h3>";
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
            echo "<p style='color: green; font-size: 20px;'>🎉 ¡VERIFICACIÓN FUNCIONA!</p>";
        } elseif (isset($response['error'])) {
            echo "<p style='color: red; font-size: 20px;'>❌ Error: " . htmlspecialchars($response['error']) . "</p>";
        } else {
            echo "<p style='color: orange; font-size: 20px;'>⚠️ Respuesta inesperada.</p>";
        }
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>


