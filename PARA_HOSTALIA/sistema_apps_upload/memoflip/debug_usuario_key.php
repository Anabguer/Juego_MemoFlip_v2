<?php
// DEBUG DE usuario_aplicacion_key
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 DEBUG usuario_aplicacion_key</h1>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $email = 'bitj2a@gmail.com';
    
    // 1. Buscar en usuarios_aplicaciones
    echo "<h2>1. Usuario en usuarios_aplicaciones:</h2>";
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo "<p>✅ Usuario encontrado:</p>";
        echo "<p><strong>usuario_aplicacion_key:</strong> " . htmlspecialchars($user['usuario_aplicacion_key']) . "</p>";
        echo "<p><strong>email:</strong> " . htmlspecialchars($user['email']) . "</p>";
        echo "<p><strong>nombre:</strong> " . htmlspecialchars($user['nombre']) . "</p>";
        echo "<p><strong>nick:</strong> " . htmlspecialchars($user['nick']) . "</p>";
        
        $usuario_key = $user['usuario_aplicacion_key'];
        
        // 2. Buscar en memoflip_usuarios con esa key
        echo "<h2>2. Búsqueda en memoflip_usuarios con key exacta:</h2>";
        $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
        $game_stmt = $pdo->prepare($game_sql);
        $game_stmt->execute([':key' => $usuario_key]);
        $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($game_data) {
            echo "<p>✅ Datos de juego encontrados:</p>";
            echo "<pre>" . json_encode($game_data, JSON_PRETTY_PRINT) . "</pre>";
        } else {
            echo "<p>❌ NO se encontraron datos con key exacta: '" . htmlspecialchars($usuario_key) . "'</p>";
        }
        
        // 3. Buscar todas las keys que contengan "bitj2a"
        echo "<h2>3. Todas las keys que contengan 'bitj2a':</h2>";
        $search_sql = "SELECT usuario_aplicacion_key FROM memoflip_usuarios WHERE usuario_aplicacion_key LIKE '%bitj2a%'";
        $search_stmt = $pdo->prepare($search_sql);
        $search_stmt->execute();
        $all_keys = $search_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if ($all_keys) {
            echo "<p>Keys encontradas:</p>";
            foreach ($all_keys as $key_row) {
                echo "<p>- " . htmlspecialchars($key_row['usuario_aplicacion_key']) . "</p>";
            }
        } else {
            echo "<p>❌ No se encontraron keys que contengan 'bitj2a'</p>";
        }
        
        // 4. Mostrar TODAS las keys en memoflip_usuarios
        echo "<h2>4. TODAS las keys en memoflip_usuarios:</h2>";
        $all_sql = "SELECT usuario_aplicacion_key FROM memoflip_usuarios";
        $all_stmt = $pdo->prepare($all_sql);
        $all_stmt->execute();
        $all_game_keys = $all_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<p>Keys en memoflip_usuarios:</p>";
        foreach ($all_game_keys as $game_key_row) {
            echo "<p>- " . htmlspecialchars($game_key_row['usuario_aplicacion_key']) . "</p>";
        }
        
    } else {
        echo "<p>❌ Usuario no encontrado en usuarios_aplicaciones</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
