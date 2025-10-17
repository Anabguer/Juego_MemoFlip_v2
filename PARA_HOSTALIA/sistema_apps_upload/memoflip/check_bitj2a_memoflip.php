<?php
// VERIFICAR SI bitj2a@gmail.com TIENE REGISTRO EN MEMOFLIP
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 VERIFICAR bitj2a@gmail.com EN MEMOFLIP</h1>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $email = 'bitj2a@gmail.com';
    
    echo "<h2>1. Buscar por email SIN app_codigo:</h2>";
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<p>Usuarios encontrados: " . count($users) . "</p>";
    foreach ($users as $user) {
        echo "<p>- " . htmlspecialchars($user['usuario_aplicacion_key']) . " (app: " . htmlspecialchars($user['app_codigo']) . ")</p>";
    }
    
    echo "<h2>2. Buscar por email Y app_codigo = 'memoflip':</h2>";
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email AND app_codigo = 'memoflip'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $memoflip_user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($memoflip_user) {
        echo "<p style='color: green;'>✅ Usuario MemoFlip encontrado:</p>";
        echo "<p>Key: " . htmlspecialchars($memoflip_user['usuario_aplicacion_key']) . "</p>";
        echo "<p>App: " . htmlspecialchars($memoflip_user['app_codigo']) . "</p>";
        
        // Verificar datos de juego
        $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
        $game_stmt = $pdo->prepare($game_sql);
        $game_stmt->execute([':key' => $memoflip_user['usuario_aplicacion_key']]);
        $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($game_data) {
            echo "<p style='color: green;'>✅ Datos de juego encontrados:</p>";
            echo "<p>Nivel: " . $game_data['max_level_unlocked'] . "</p>";
            echo "<p>Monedas: " . $game_data['coins_total'] . "</p>";
        } else {
            echo "<p style='color: red;'>❌ No hay datos de juego</p>";
        }
        
    } else {
        echo "<p style='color: red;'>❌ NO hay usuario con app_codigo = 'memoflip'</p>";
        
        echo "<h2>3. ¿Crear usuario MemoFlip?</h2>";
        echo "<p>¿Quieres crear un registro MemoFlip para bitj2a@gmail.com?</p>";
        
        // Buscar el usuario de Lumetrix para copiar datos
        $lumetrix_sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email AND app_codigo = 'lumetrix'";
        $lumetrix_stmt = $pdo->prepare($lumetrix_sql);
        $lumetrix_stmt->execute([':email' => $email]);
        $lumetrix_user = $lumetrix_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($lumetrix_user) {
            echo "<p>Usuario Lumetrix encontrado:</p>";
            echo "<p>Nombre: " . htmlspecialchars($lumetrix_user['nombre']) . "</p>";
            echo "<p>Nick: " . htmlspecialchars($lumetrix_user['nick']) . "</p>";
            
            echo "<p><a href='create_bitj2a_memoflip.php'>Crear usuario MemoFlip</a></p>";
        }
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
