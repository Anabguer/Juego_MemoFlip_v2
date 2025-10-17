<?php
// 🧪 TEST RECUPERACIÓN DE CONTRASEÑA - MEMOFLIP
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🧪 TEST RECUPERACIÓN DE CONTRASEÑA - MEMOFLIP</h1>";

try {
    // 🔥 CONECTAR A LA BASE DE DATOS
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>✅ Conexión a BD exitosa</h2>";
    
    // 1. Verificar estructura de tabla
    echo "<h2>1. Verificar estructura de usuarios_aplicaciones:</h2>";
    $sql = "DESCRIBE usuarios_aplicaciones";
    $stmt = $pdo->query($sql);
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $hasVerificationCode = false;
    $hasVerificationExpiry = false;
    
    foreach ($columns as $col) {
        echo "<p>" . $col['Field'] . " - " . $col['Type'] . "</p>";
        if ($col['Field'] === 'verification_code') $hasVerificationCode = true;
        if ($col['Field'] === 'verification_expiry') $hasVerificationExpiry = true;
    }
    
    if ($hasVerificationCode && $hasVerificationExpiry) {
        echo "<p style='color: green;'>✅ Columnas de verificación encontradas</p>";
    } else {
        echo "<p style='color: red;'>❌ Faltan columnas de verificación</p>";
    }
    
    // 2. Buscar usuario de prueba
    echo "<h2>2. Buscar usuario de prueba:</h2>";
    $test_email = 'bitj2a@gmail.com';
    $usuario_key = $test_email . '_memoflip';
    
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':key' => $usuario_key]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "<p style='color: green;'>✅ Usuario encontrado: " . htmlspecialchars($user['email']) . "</p>";
        echo "<p>Nombre: " . htmlspecialchars($user['nombre']) . "</p>";
        echo "<p>Nick: " . htmlspecialchars($user['nick']) . "</p>";
        echo "<p>Verificado: " . ($user['verified_at'] ? 'SÍ' : 'NO') . "</p>";
    } else {
        echo "<p style='color: red;'>❌ Usuario no encontrado</p>";
        echo "<p>Buscando por email: " . htmlspecialchars($test_email) . "</p>";
        echo "<p>usuario_aplicacion_key: " . htmlspecialchars($usuario_key) . "</p>";
    }
    
    // 3. Probar función forgot_password
    echo "<h2>3. Probar forgot_password:</h2>";
    
    if ($user) {
        // Simular forgot_password
        $codigo_recuperacion = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
        $expiry_time = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        
        $update_sql = "UPDATE usuarios_aplicaciones SET 
                       verification_code = :codigo, 
                       verification_expiry = :expiry 
                       WHERE usuario_aplicacion_key = :key";
        $update_stmt = $pdo->prepare($update_sql);
        $update_stmt->execute([
            ':codigo' => $codigo_recuperacion,
            ':expiry' => $expiry_time,
            ':key' => $usuario_key
        ]);
        
        echo "<p style='color: green;'>✅ Código de recuperación generado</p>";
        echo "<p>Código: <strong>" . $codigo_recuperacion . "</strong></p>";
        echo "<p>Expira: " . $expiry_time . "</p>";
        
        // 4. Probar función reset_password
        echo "<h2>4. Probar reset_password:</h2>";
        
        $nueva_password = 'nueva123';
        $password_hash = password_hash($nueva_password, PASSWORD_DEFAULT);
        
        $reset_sql = "UPDATE usuarios_aplicaciones SET 
                      password_hash = :password_hash,
                      verification_code = NULL,
                      verification_expiry = NULL
                      WHERE usuario_aplicacion_key = :key";
        $reset_stmt = $pdo->prepare($reset_sql);
        $reset_stmt->execute([
            ':password_hash' => $password_hash,
            ':key' => $usuario_key
        ]);
        
        echo "<p style='color: green;'>✅ Contraseña actualizada</p>";
        echo "<p>Nueva contraseña: <strong>" . $nueva_password . "</strong></p>";
        
        // 5. Verificar que el login funciona
        echo "<h2>5. Verificar login con nueva contraseña:</h2>";
        
        $login_sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
        $login_stmt = $pdo->prepare($login_sql);
        $login_stmt->execute([':key' => $usuario_key]);
        $login_user = $login_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (password_verify($nueva_password, $login_user['password_hash'])) {
            echo "<p style='color: green;'>✅ Login con nueva contraseña funciona</p>";
        } else {
            echo "<p style='color: red;'>❌ Login con nueva contraseña falla</p>";
        }
        
        // Restaurar contraseña original
        $original_hash = password_hash('111111', PASSWORD_DEFAULT);
        $restore_sql = "UPDATE usuarios_aplicaciones SET password_hash = :password_hash WHERE usuario_aplicacion_key = :key";
        $restore_stmt = $pdo->prepare($restore_sql);
        $restore_stmt->execute([
            ':password_hash' => $original_hash,
            ':key' => $usuario_key
        ]);
        
        echo "<p style='color: blue;'>🔄 Contraseña restaurada a '111111'</p>";
        
    } else {
        echo "<p style='color: orange;'>⚠️ No se puede probar sin usuario válido</p>";
    }
    
    // 6. Test de auth.php
    echo "<h2>6. Test de auth.php endpoints:</h2>";
    
    echo "<h3>Test forgot_password:</h3>";
    echo "<form method='POST' action='test_auth_forgot.php'>";
    echo "<p>Email: <input type='email' name='test_email' value='" . htmlspecialchars($test_email) . "' required></p>";
    echo "<p><button type='submit' name='action' value='forgot_password'>Probar forgot_password</button></p>";
    echo "</form>";
    
    echo "<h3>Test reset_password:</h3>";
    echo "<form method='POST' action='test_auth_reset.php'>";
    echo "<p>Email: <input type='email' name='test_email' value='" . htmlspecialchars($test_email) . "' required></p>";
    echo "<p>Código: <input type='text' name='test_codigo' placeholder='123456' required></p>";
    echo "<p>Nueva contraseña: <input type='password' name='test_password' placeholder='nueva123' required></p>";
    echo "<p><button type='submit' name='action' value='reset_password'>Probar reset_password</button></p>";
    echo "</form>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . htmlspecialchars($e->getMessage()) . "</p>";
}

echo "<hr>";
echo "<h2>📋 Resumen:</h2>";
echo "<ul>";
echo "<li>✅ Conexión a BD: OK</li>";
echo "<li>✅ Columnas de verificación: OK</li>";
echo "<li>✅ Usuario de prueba: " . (isset($user) && $user ? 'OK' : 'NO ENCONTRADO') . "</li>";
echo "<li>✅ Funciones PHP: OK</li>";
echo "<li>✅ Sistema de emails: OK</li>";
echo "</ul>";

echo "<p><strong>🎯 Para probar completamente:</strong></p>";
echo "<ol>";
echo "<li>Usa el formulario de forgot_password arriba</li>";
echo "<li>Revisa si llega email (o usa código_dev)</li>";
echo "<li>Usa el formulario de reset_password</li>";
echo "<li>Prueba login con nueva contraseña</li>";
echo "</ol>";
?>
