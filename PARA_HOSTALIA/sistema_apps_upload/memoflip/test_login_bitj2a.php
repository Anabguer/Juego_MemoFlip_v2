<?php
// TEST LOGIN DIRECTO CON bitj2a@gmail.com
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🧪 TEST LOGIN DIRECTO - bitj2a@gmail.com</h1>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $email = 'bitj2a@gmail.com';
    $test_password = '111111';
    
    echo "<h2>Probando login con:</h2>";
    echo "<p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>";
    echo "<p><strong>Password:</strong> " . htmlspecialchars($test_password) . "</p>";
    
    // Buscar usuario
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        echo "<p style='color: red;'>❌ Usuario no encontrado</p>";
        exit();
    }
    
    echo "<p>✅ Usuario encontrado: " . htmlspecialchars($user['email']) . "</p>";
    echo "<p>Hash actual: " . htmlspecialchars($user['password_hash']) . "</p>";
    
    // Verificar contraseña
    if (password_verify($test_password, $user['password_hash'])) {
        echo "<p style='color: green;'>✅ Contraseña VERIFICADA correctamente</p>";
        
        // Verificar si está verificado
        if ($user['verified_at']) {
            echo "<p style='color: green;'>✅ Usuario verificado</p>";
            
            // Buscar datos de juego
            $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
            $game_stmt = $pdo->prepare($game_sql);
            $game_stmt->execute([':key' => $user['usuario_aplicacion_key']]);
            $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($game_data) {
                echo "<p style='color: green;'>✅ Datos de juego encontrados</p>";
                
                // Simular respuesta del auth.php
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
                
                echo "<p style='color: green; font-size: 20px;'>🎉 ¡LOGIN DEBERÍA FUNCIONAR!</p>";
                
            } else {
                echo "<p style='color: red;'>❌ No hay datos de juego</p>";
            }
            
        } else {
            echo "<p style='color: red;'>❌ Usuario no verificado</p>";
        }
        
    } else {
        echo "<p style='color: red;'>❌ Contraseña INCORRECTA</p>";
        echo "<p>El hash no coincide con la contraseña '111111'</p>";
        
        // Generar nuevo hash para comparar
        $new_hash = password_hash($test_password, PASSWORD_DEFAULT);
        echo "<p><strong>Nuevo hash generado:</strong> " . htmlspecialchars($new_hash) . "</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
