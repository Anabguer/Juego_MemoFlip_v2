<?php
// TEST DIRECTO DE CONTRASEÑA
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔐 TEST DIRECTO DE CONTRASEÑA</h1>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $email = 'bitj2a@gmail.com';
    $test_password = '111111';
    $usuario_key = $email . '_memoflip';
    
    echo "<h2>1. Buscar usuario:</h2>";
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':key' => $usuario_key]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "<p style='color: red;'>❌ Usuario no encontrado con key: " . htmlspecialchars($usuario_key) . "</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Usuario encontrado</p>";
    echo "<p><strong>Email:</strong> " . htmlspecialchars($user['email']) . "</p>";
    echo "<p><strong>Hash actual:</strong> " . htmlspecialchars($user['password_hash']) . "</p>";
    
    echo "<h2>2. Verificar contraseña '111111':</h2>";
    $verify_111111 = password_verify('111111', $user['password_hash']);
    echo "<p><strong>password_verify('111111'):</strong> " . ($verify_111111 ? 'TRUE ✅' : 'FALSE ❌') . "</p>";
    
    echo "<h2>3. Verificar otras contraseñas comunes:</h2>";
    $common_passwords = ['123456', 'password', '123123', 'bitj2a', 'Bitj2a', '1234', '000000'];
    
    foreach ($common_passwords as $pwd) {
        $result = password_verify($pwd, $user['password_hash']);
        echo "<p><strong>password_verify('$pwd'):</strong> " . ($result ? 'TRUE ✅' : 'FALSE ❌') . "</p>";
        if ($result) {
            echo "<p style='color: green; font-size: 20px;'>🎉 ¡CONTRASEÑA CORRECTA ENCONTRADA: '$pwd'!</p>";
        }
    }
    
    echo "<h2>4. Generar nuevo hash para '111111':</h2>";
    $new_hash = password_hash('111111', PASSWORD_DEFAULT);
    echo "<p><strong>Nuevo hash:</strong> " . htmlspecialchars($new_hash) . "</p>";
    
    $new_verify = password_verify('111111', $new_hash);
    echo "<p><strong>Verificación con nuevo hash:</strong> " . ($new_verify ? 'TRUE ✅' : 'FALSE ❌') . "</p>";
    
    echo "<h2>5. ¿Actualizar contraseña a '111111'?</h2>";
    echo "<p><a href='update_password_111111.php'>Actualizar contraseña de bitj2a@gmail.com a '111111'</a></p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
