<?php
// 🚨 VERIFICAR CUENTA DIRECTAMENTE
// Este script verifica la cuenta sin necesidad de código

echo "<h1>🚨 VERIFICAR CUENTA DIRECTAMENTE</h1>";

$email = 'agl0305@gmail.com';

echo "<h2>1. Verificando cuenta: $email</h2>";

try {
    require_once 'config_hostalia.php';
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar cuenta directamente
    $update_sql = "UPDATE usuarios_aplicaciones SET 
        verified_at = NOW(),
        verification_code = NULL,
        verification_expiry = NULL
        WHERE email = :email AND app_codigo = 'memoflip'";
    
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([':email' => $email]);
    
    echo "<p style='color: green; font-size: 20px;'>✅ CUENTA VERIFICADA DIRECTAMENTE</p>";
    
    // Verificar que se actualizó
    $sql = "SELECT verified_at FROM usuarios_aplicaciones WHERE email = :email AND app_codigo = 'memoflip'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "<p>Verificado en: <strong>" . ($user['verified_at'] ?? 'NULL') . "</strong></p>";
    
    echo "<h2>2. ¡LISTO!</h2>";
    echo "<p style='color: green; font-size: 18px;'>✅ Ahora puedes hacer login normalmente</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>


