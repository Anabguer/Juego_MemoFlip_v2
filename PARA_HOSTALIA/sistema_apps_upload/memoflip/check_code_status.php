<?php
// 🔍 VERIFICAR ESTADO DEL CÓDIGO
// Este script verifica el estado actual del código

echo "<h1>🔍 VERIFICAR ESTADO DEL CÓDIGO</h1>";

$email = 'agl0305@gmail.com';

echo "<h2>1. Verificando código para: $email</h2>";

try {
    require_once 'config_hostalia.php';
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Buscar usuario
    $sql = "SELECT verification_code, verification_expiry, verified_at FROM usuarios_aplicaciones WHERE email = :email AND app_codigo = 'memoflip'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "<p>Email: <strong>$email</strong></p>";
        echo "<p>Código en BD: <strong>" . ($user['verification_code'] ?? 'NULL') . "</strong></p>";
        echo "<p>Expira: <strong>" . ($user['verification_expiry'] ?? 'NULL') . "</strong></p>";
        echo "<p>Verificado en: <strong>" . ($user['verified_at'] ?? 'NULL') . "</strong></p>";
        
        // Verificar si ha expirado
        if ($user['verification_expiry']) {
            $expiry_time = strtotime($user['verification_expiry']);
            $current_time = time();
            
            echo "<p>Expiry timestamp: <strong>$expiry_time</strong></p>";
            echo "<p>Current timestamp: <strong>$current_time</strong></p>";
            
            if ($expiry_time < $current_time) {
                echo "<p style='color: red;'>❌ CÓDIGO EXPIRADO</p>";
            } else {
                echo "<p style='color: green;'>✅ CÓDIGO VÁLIDO</p>";
            }
        }
        
        echo "<h2>2. Test con código 822518:</h2>";
        $test_code = '822518';
        echo "<p>Probando código: <strong>$test_code</strong></p>";
        
        if ($user['verification_code'] === $test_code) {
            echo "<p style='color: green;'>✅ CÓDIGO COINCIDE</p>";
        } else {
            echo "<p style='color: red;'>❌ CÓDIGO NO COINCIDE</p>";
            echo "<p>BD tiene: <strong>" . ($user['verification_code'] ?? 'NULL') . "</strong></p>";
            echo "<p>Probando: <strong>$test_code</strong></p>";
        }
        
    } else {
        echo "<p style='color: red;'>❌ Usuario no encontrado</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>


