<?php
// DEBUG: AUTH.PHP vs TEST MANUAL
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 DEBUG: AUTH.PHP vs TEST MANUAL</h1>";

echo "<h2>1. Test Manual (lo que funciona):</h2>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $email = 'bitj2a@gmail.com';
    $password = '111111';
    $usuario_aplicacion_key = $email . '_memoflip';
    
    echo "<p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>";
    echo "<p><strong>Password:</strong> " . htmlspecialchars($password) . "</p>";
    echo "<p><strong>usuario_aplicacion_key:</strong> " . htmlspecialchars($usuario_aplicacion_key) . "</p>";
    
    // Buscar usuario
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':key' => $usuario_aplicacion_key]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "<p style='color: green;'>✅ Usuario encontrado</p>";
        echo "<p><strong>Hash en BD:</strong> " . htmlspecialchars($user['password_hash']) . "</p>";
        
        // Verificar contraseña
        $password_ok = password_verify($password, $user['password_hash']);
        echo "<p><strong>password_verify():</strong> " . ($password_ok ? 'TRUE ✅' : 'FALSE ❌') . "</p>";
        
        if ($password_ok) {
            echo "<p style='color: green;'>✅ Contraseña correcta</p>";
            
            // Verificar si está verificado
            if ($user['verified_at']) {
                echo "<p style='color: green;'>✅ Usuario verificado</p>";
                
                // Buscar datos de juego
                $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
                $game_stmt = $pdo->prepare($game_sql);
                $game_stmt->execute([':key' => $usuario_aplicacion_key]);
                $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($game_data) {
                    echo "<p style='color: green;'>✅ Datos de juego encontrados</p>";
                    echo "<p style='color: green; font-size: 20px;'>🎉 ¡TEST MANUAL FUNCIONA!</p>";
                } else {
                    echo "<p style='color: red;'>❌ No hay datos de juego</p>";
                }
            } else {
                echo "<p style='color: red;'>❌ Usuario no verificado</p>";
            }
        } else {
            echo "<p style='color: red;'>❌ Contraseña incorrecta</p>";
        }
    } else {
        echo "<p style='color: red;'>❌ Usuario no encontrado</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error en test manual: " . $e->getMessage() . "</p>";
}

echo "<h2>2. Test del auth.php real:</h2>";
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
echo "    document.getElementById('auth_result').innerHTML = '<pre>' + JSON.stringify(data, null, 2) + '</pre>';";
echo "    if (data.success) {";
echo "      document.getElementById('auth_result').style.color = 'green';";
echo "    } else {";
echo "      document.getElementById('auth_result').style.color = 'red';";
echo "    }";
echo "  })";
echo "  .catch(error => {";
echo "    document.getElementById('auth_result').innerHTML = 'Error: ' + error;";
echo "    document.getElementById('auth_result').style.color = 'red';";
echo "  });";
echo "}";
echo "</script>";

echo "<div id='auth_result' style='background: #f0f0f0; padding: 10px; margin: 10px 0;'></div>";

echo "<h2>3. Comparación:</h2>";
echo "<p>Si el test manual funciona pero el auth.php falla, entonces hay un problema en el código del auth.php.</p>";
echo "<p>Si ambos fallan, entonces hay un problema en la base de datos.</p>";
?>
