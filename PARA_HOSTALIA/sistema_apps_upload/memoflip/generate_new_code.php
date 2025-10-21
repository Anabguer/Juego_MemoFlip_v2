<?php
// 🧪 GENERAR NUEVO CÓDIGO
// Este script genera un código nuevo para testing

echo "<h1>🧪 GENERAR NUEVO CÓDIGO</h1>";

$email = 'agl0305@gmail.com';

echo "<h2>1. Generando código nuevo para: $email</h2>";

try {
    require_once 'config_hostalia.php';
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Generar código de verificación
    $verification_code = sprintf('%06d', mt_rand(0, 999999));
    
    echo "<p>Código generado: <strong style='font-size: 24px; color: blue;'>$verification_code</strong></p>";
    
    // Actualizar código en la base de datos
    $update_sql = "UPDATE usuarios_aplicaciones SET 
        verification_code = :code,
        verification_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR)
        WHERE email = :email AND app_codigo = 'memoflip'";
    
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([
        ':code' => $verification_code,
        ':email' => $email
    ]);
    
    echo "<p style='color: green;'>✅ Código guardado en BD</p>";
    
    // Verificar que se guardó
    $sql = "SELECT verification_code, verification_expiry FROM usuarios_aplicaciones WHERE email = :email AND app_codigo = 'memoflip'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "<p>Código en BD: <strong>" . ($user['verification_code'] ?? 'NULL') . "</strong></p>";
    echo "<p>Expira: <strong>" . ($user['verification_expiry'] ?? 'NULL') . "</strong></p>";
    
    echo "<h2>2. Test de verificación:</h2>";
    echo "<p>Ahora puedes probar con el código: <strong style='font-size: 20px; color: red;'>$verification_code</strong></p>";
    
    echo "<h2>3. Enviar email (opcional):</h2>";
    echo "<p><a href='test_email_servidor.php' target='_blank'>🧪 Test de email</a></p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>


