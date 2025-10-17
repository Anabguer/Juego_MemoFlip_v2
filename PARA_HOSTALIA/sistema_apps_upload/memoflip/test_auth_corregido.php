<?php
// TEST DEL AUTH.PHP CORREGIDO
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🧪 TEST AUTH.PHP CORREGIDO</h1>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $email = 'bitj2a@gmail.com';
    $password = '111111';
    
    echo "<h2>Simulando auth.php corregido:</h2>";
    echo "<p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>";
    echo "<p><strong>Password:</strong> " . htmlspecialchars($password) . "</p>";
    
    // 1. Generar usuario_aplicacion_key
    $usuario_aplicacion_key = $email . '_memoflip';
    echo "<p><strong>usuario_aplicacion_key:</strong> " . htmlspecialchars($usuario_aplicacion_key) . "</p>";
    
    // 2. Buscar usuario por key específica
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':key' => $usuario_aplicacion_key]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "<p style='color: red;'>❌ Usuario no encontrado con key: " . htmlspecialchars($usuario_aplicacion_key) . "</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Usuario encontrado:</p>";
    echo "<p>Key: " . htmlspecialchars($user['usuario_aplicacion_key']) . "</p>";
    echo "<p>Email: " . htmlspecialchars($user['email']) . "</p>";
    echo "<p>Nombre: " . htmlspecialchars($user['nombre']) . "</p>";
    echo "<p>Nick: " . htmlspecialchars($user['nick']) . "</p>";
    
    // 3. Verificar contraseña
    if (!password_verify($password, $user['password_hash'])) {
        echo "<p style='color: red;'>❌ Contraseña incorrecta</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Contraseña correcta</p>";
    
    // 4. Verificar si está verificado
    if (!$user['verified_at']) {
        echo "<p style='color: red;'>❌ Usuario no verificado</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Usuario verificado</p>";
    
    // 5. Buscar datos de juego
    $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
    $game_stmt = $pdo->prepare($game_sql);
    $game_stmt->execute([':key' => $user['usuario_aplicacion_key']]);
    $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$game_data) {
        echo "<p style='color: red;'>❌ No hay datos de juego</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Datos de juego encontrados:</p>";
    echo "<p>Nivel: " . $game_data['max_level_unlocked'] . "</p>";
    echo "<p>Monedas: " . $game_data['coins_total'] . "</p>";
    echo "<p>Vidas: " . $game_data['lives_current'] . "</p>";
    
    // 6. Simular respuesta del auth.php
    $response = [
        'success' => true,
        'authenticated' => true,
        'email' => $user['email'],
        'nombre' => $user['nombre'],
        'nick' => $user['nick'],
        'game_data' => [
            'max_level_unlocked' => (int)$game_data['max_level_unlocked'],
            'coins_total' => (int)$game_data['coins_total'],
            'lives_current' => (int)$game_data['lives_current'],
            'sound_enabled' => true
        ]
    ];
    
    echo "<h2>Respuesta que debería dar auth.php:</h2>";
    echo "<pre style='background: #f0f0f0; padding: 10px;'>" . json_encode($response, JSON_PRETTY_PRINT) . "</pre>";
    
    echo "<p style='color: green; font-size: 20px;'>🎉 ¡TODO FUNCIONA CORRECTAMENTE!</p>";
    
    echo "<h2>Test directo del auth.php:</h2>";
    echo "<p><a href='javascript:testAuth()'>Probar auth.php directamente</a></p>";
    
    echo "<script>";
    echo "function testAuth() {";
    echo "  fetch('auth.php', {";
    echo "    method: 'POST',";
    echo "    headers: { 'Content-Type': 'application/json' },";
    echo "    body: JSON.stringify({";
    echo "      action: 'login',";
    echo "      email: 'bitj2a@gmail.com',";
    echo "      password: '111111'";
    echo "    })";
    echo "  })";
    echo "  .then(response => response.json())";
    echo "  .then(data => {";
    echo "    alert('Respuesta auth.php: ' + JSON.stringify(data, null, 2));";
    echo "  })";
    echo "  .catch(error => {";
    echo "    alert('Error: ' + error);";
    echo "  });";
    echo "}";
    echo "</script>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
