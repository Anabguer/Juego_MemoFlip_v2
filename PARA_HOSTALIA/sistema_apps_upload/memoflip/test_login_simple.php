<?php
// TEST SIMPLE DE LOGIN
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

try {
    // Simular el login que está haciendo el AAB
    $test_data = [
        "action" => "login",
        "email" => "bitj2a@gmail.com", 
        "password" => "111111"
    ];
    
    echo "<h1>🧪 TEST SIMPLE DE LOGIN</h1>";
    echo "<p>Probando con:</p>";
    echo "<pre>" . json_encode($test_data, JSON_PRETTY_PRINT) . "</pre>";
    
    // Conectar a BD
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Buscar usuario
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $test_data['email']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "<p style='color: red;'>❌ Usuario no encontrado</p>";
        exit();
    }
    
    echo "<p>✅ Usuario encontrado: " . htmlspecialchars($user['email']) . "</p>";
    echo "<p>Nombre: " . htmlspecialchars($user['nombre']) . "</p>";
    echo "<p>Nick: " . htmlspecialchars($user['nick']) . "</p>";
    
    // Verificar contraseña
    if (!password_verify($test_data['password'], $user['password_hash'])) {
        echo "<p style='color: red;'>❌ Contraseña incorrecta</p>";
        exit();
    }
    
    echo "<p>✅ Contraseña correcta</p>";
    
    // Verificar si está verificado
    if (!$user['verified_at']) {
        echo "<p style='color: red;'>❌ Usuario NO verificado</p>";
        echo "<p>verified_at: " . ($user['verified_at'] ?? 'NULL') . "</p>";
        exit();
    }
    
    echo "<p>✅ Usuario verificado</p>";
    echo "<p>Verificado en: " . htmlspecialchars($user['verified_at']) . "</p>";
    
    // Verificar datos de juego
    $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
    $game_stmt = $pdo->prepare($game_sql);
    $game_stmt->execute([':key' => $user['usuario_aplicacion_key']]);
    $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($game_data) {
        echo "<p>✅ Datos de juego encontrados:</p>";
        echo "<ul>";
        echo "<li>Nivel: " . $game_data['max_level_unlocked'] . "</li>";
        echo "<li>Monedas: " . $game_data['coins_total'] . "</li>";
        echo "<li>Vidas: " . $game_data['lives_current'] . "</li>";
        echo "</ul>";
    } else {
        echo "<p>❌ No hay datos de juego</p>";
    }
    
    echo "<p style='color: green; font-size: 20px;'>🎉 ¡LOGIN DEBERÍA FUNCIONAR!</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ ERROR: " . $e->getMessage() . "</p>";
}
?>
