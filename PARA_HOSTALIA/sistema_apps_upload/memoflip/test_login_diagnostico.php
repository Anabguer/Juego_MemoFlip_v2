<?php
// DIAGNÓSTICO ESPECÍFICO DEL LOGIN
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔐 DIAGNÓSTICO DEL LOGIN</h1>";

echo "<h2>1. Verificando usuarios en la base de datos...</h2>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Ver todos los usuarios
    $sql = "SELECT email, nombre, nick, verified_at, created_at FROM usuarios_aplicaciones WHERE app_codigo = 'memoflip' LIMIT 10";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>Email</th><th>Nombre</th><th>Nick</th><th>Verificado</th><th>Creado</th></tr>";
    
    foreach ($users as $user) {
        $verified = $user['verified_at'] ? '✅ SÍ' : '❌ NO';
        echo "<tr>";
        echo "<td>" . htmlspecialchars($user['email']) . "</td>";
        echo "<td>" . htmlspecialchars($user['nombre']) . "</td>";
        echo "<td>" . htmlspecialchars($user['nick']) . "</td>";
        echo "<td>" . $verified . "</td>";
        echo "<td>" . htmlspecialchars($user['created_at']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h2>2. Test de login con usuario verificado...</h2>";
    
    // Buscar un usuario verificado
    $verified_user_sql = "SELECT * FROM usuarios_aplicaciones WHERE app_codigo = 'memoflip' AND verified_at IS NOT NULL LIMIT 1";
    $verified_stmt = $pdo->prepare($verified_user_sql);
    $verified_stmt->execute();
    $verified_user = $verified_stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($verified_user) {
        echo "<p>✅ Usuario verificado encontrado: " . htmlspecialchars($verified_user['email']) . "</p>";
        echo "<p>Nick: " . htmlspecialchars($verified_user['nick']) . "</p>";
        echo "<p>Verificado en: " . htmlspecialchars($verified_user['verified_at']) . "</p>";
        
        // Verificar si tiene datos en memoflip_usuarios
        $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
        $game_stmt = $pdo->prepare($game_sql);
        $game_stmt->execute([':key' => $verified_user['usuario_aplicacion_key']]);
        $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($game_data) {
            echo "<p>✅ Datos de juego encontrados:</p>";
            echo "<ul>";
            echo "<li>Nivel: " . $game_data['max_level_unlocked'] . "</li>";
            echo "<li>Monedas: " . $game_data['coins_total'] . "</li>";
            echo "<li>Vidas: " . $game_data['lives_current'] . "</li>";
            echo "</ul>";
        } else {
            echo "<p>❌ No hay datos de juego para este usuario</p>";
        }
        
    } else {
        echo "<p>❌ No hay usuarios verificados</p>";
    }
    
    echo "<h2>3. Test manual de auth.php...</h2>";
    echo "<p>URL para probar: <a href='auth.php?action=check_session' target='_blank'>auth.php?action=check_session</a></p>";
    
    echo "<h2>4. Test de login con POST...</h2>";
    if ($verified_user) {
        echo "<form method='POST' action='auth.php?action=login' target='_blank'>";
        echo "<p>Email: <input type='email' name='email' value='" . htmlspecialchars($verified_user['email']) . "' readonly></p>";
        echo "<p>Contraseña: <input type='password' name='password' placeholder='Introduce contraseña'></p>";
        echo "<p><input type='submit' value='Probar Login'></p>";
        echo "</form>";
        
        echo "<p><strong>NOTA:</strong> Este formulario no funcionará porque auth.php espera JSON, pero te permite ver si el endpoint responde.</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}

echo "<h2>5. Información del servidor...</h2>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Timestamp: " . date('Y-m-d H:i:s') . "</p>";
?>
