<?php
// DEBUG EXACTO DEL AUTH.PHP
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 DEBUG EXACTO DEL AUTH.PHP</h1>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $email = 'bitj2a@gmail.com';
    $password = '111111';
    
    echo "<h2>1. Simulando EXACTAMENTE el auth.php:</h2>";
    
    // Generar usuario_aplicacion_key (igual que auth.php)
    $usuario_aplicacion_key = $email . '_memoflip';
    echo "<p><strong>usuario_aplicacion_key generado:</strong> " . htmlspecialchars($usuario_aplicacion_key) . "</p>";
    
    // Buscar usuario (igual que auth.php)
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':key' => $usuario_aplicacion_key]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "<p style='color: red;'>❌ Usuario no encontrado</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Usuario encontrado</p>";
    echo "<p><strong>Hash en BD:</strong> " . htmlspecialchars($user['password_hash']) . "</p>";
    
    // Verificar contraseña (igual que auth.php)
    echo "<h2>2. Verificando contraseña:</h2>";
    echo "<p><strong>Contraseña a verificar:</strong> " . htmlspecialchars($password) . "</p>";
    
    $password_verify_result = password_verify($password, $user['password_hash']);
    echo "<p><strong>password_verify() resultado:</strong> " . ($password_verify_result ? 'TRUE' : 'FALSE') . "</p>";
    
    if (!$password_verify_result) {
        echo "<p style='color: red;'>❌ password_verify() devuelve FALSE</p>";
        
        // Generar nuevo hash para comparar
        $new_hash = password_hash($password, PASSWORD_DEFAULT);
        echo "<p><strong>Nuevo hash generado:</strong> " . htmlspecialchars($new_hash) . "</p>";
        
        // Verificar si el nuevo hash funciona
        $new_verify = password_verify($password, $new_hash);
        echo "<p><strong>Verificación con nuevo hash:</strong> " . ($new_verify ? 'TRUE' : 'FALSE') . "</p>";
        
        echo "<h2>3. ¿Actualizar hash en BD?</h2>";
        echo "<p><a href='update_bitj2a_hash.php'>Actualizar hash de bitj2a@gmail.com</a></p>";
        
    } else {
        echo "<p style='color: green;'>✅ password_verify() devuelve TRUE</p>";
        echo "<p style='color: green; font-size: 20px;'>🎉 ¡LA CONTRASEÑA ES CORRECTA!</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
