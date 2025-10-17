<?php
// CORREGIR usuario_aplicacion_key DE bitj2a@gmail.com
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔧 CORREGIR KEY DE bitj2a@gmail.com</h1>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $email = 'bitj2a@gmail.com';
    $old_key = 'bitj2a@gmail.com_lumetrix';
    $new_key = 'bitj2a@gmail.com_memoflip';
    
    echo "<h2>Cambiando key de:</h2>";
    echo "<p><strong>De:</strong> " . htmlspecialchars($old_key) . "</p>";
    echo "<p><strong>A:</strong> " . htmlspecialchars($new_key) . "</p>";
    
    // Verificar que la nueva key existe en memoflip_usuarios
    $check_sql = "SELECT COUNT(*) as count FROM memoflip_usuarios WHERE usuario_aplicacion_key = :new_key";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->execute([':new_key' => $new_key]);
    $exists = $check_stmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
    
    if (!$exists) {
        echo "<p style='color: red;'>❌ La key " . htmlspecialchars($new_key) . " NO existe en memoflip_usuarios</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ La key " . htmlspecialchars($new_key) . " existe en memoflip_usuarios</p>";
    
    // Actualizar la key en usuarios_aplicaciones
    $update_sql = "UPDATE usuarios_aplicaciones SET usuario_aplicacion_key = :new_key WHERE email = :email";
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([
        ':new_key' => $new_key,
        ':email' => $email
    ]);
    
    if ($update_stmt->rowCount() > 0) {
        echo "<p style='color: green; font-size: 20px;'>✅ ¡KEY CORREGIDA EXITOSAMENTE!</p>";
        
        // Verificar que ahora funciona
        $verify_sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email";
        $verify_stmt = $pdo->prepare($verify_sql);
        $verify_stmt->execute([':email' => $email]);
        $user = $verify_stmt->fetch(PDO::FETCH_ASSOC);
        
        echo "<p><strong>Nueva key:</strong> " . htmlspecialchars($user['usuario_aplicacion_key']) . "</p>";
        
        // Buscar datos de juego
        $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
        $game_stmt = $pdo->prepare($game_sql);
        $game_stmt->execute([':key' => $user['usuario_aplicacion_key']]);
        $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($game_data) {
            echo "<p style='color: green;'>✅ ¡DATOS DE JUEGO ENCONTRADOS!</p>";
            echo "<p>Nivel: " . $game_data['max_level_unlocked'] . "</p>";
            echo "<p>Monedas: " . $game_data['coins_total'] . "</p>";
            echo "<p>Vidas: " . $game_data['lives_current'] . "</p>";
            
            echo "<p style='color: green; font-size: 20px;'>🎉 ¡AHORA EL LOGIN DEBERÍA FUNCIONAR!</p>";
        } else {
            echo "<p style='color: red;'>❌ Aún no se encuentran datos de juego</p>";
        }
        
    } else {
        echo "<p style='color: red;'>❌ No se pudo actualizar la key</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
