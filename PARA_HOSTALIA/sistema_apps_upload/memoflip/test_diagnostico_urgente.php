<?php
echo "<h1>🚨 Diagnóstico Urgente - MemoFlip</h1>";
echo "<p><strong>Fecha:</strong> " . date('Y-m-d H:i:s') . "</p>";

// Conectar con las credenciales que funcionan
$host = 'PMYSQL165.dns-servicio.com';
$dbname = '9606966_sistema_apps_db';
$username = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<div style='color: green; background: #d4edda; padding: 10px; border-radius: 5px;'>";
    echo "✅ <strong>Conectado a la base de datos</strong>";
    echo "</div>";
    
    // Test 1: Verificar datos existentes
    echo "<h2>1️⃣ Datos Existentes en las Tablas</h2>";
    
    // Contar usuarios
    $stmt = $pdo->query("SELECT COUNT(*) FROM memoflip_usuarios");
    $count_usuarios = $stmt->fetchColumn();
    echo "<p>👥 Usuarios en memoflip_usuarios: <strong>$count_usuarios</strong></p>";
    
    // Contar ranking
    $stmt = $pdo->query("SELECT COUNT(*) FROM memoflip_ranking_cache");
    $count_ranking = $stmt->fetchColumn();
    echo "<p>🏆 Registros en memoflip_ranking_cache: <strong>$count_ranking</strong></p>";
    
    // Mostrar últimos usuarios
    echo "<h3>👥 Últimos usuarios registrados:</h3>";
    $stmt = $pdo->query("SELECT usuario_aplicacion_key, max_level_unlocked, coins_total, total_score, fecha_modificacion FROM memoflip_usuarios ORDER BY fecha_modificacion DESC LIMIT 5");
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (!empty($usuarios)) {
        echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 10px 0;'>";
        echo "<tr style='background: #f8f9fa;'><th>Usuario</th><th>Nivel</th><th>Monedas</th><th>Puntos</th><th>Última Modificación</th></tr>";
        foreach ($usuarios as $user) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($user['usuario_aplicacion_key']) . "</td>";
            echo "<td>" . $user['max_level_unlocked'] . "</td>";
            echo "<td>" . $user['coins_total'] . "</td>";
            echo "<td>" . $user['total_score'] . "</td>";
            echo "<td>" . $user['fecha_modificacion'] . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    } else {
        echo "<p style='color: orange;'>⚠️ No hay usuarios en la tabla</p>";
    }
    
    // Test 2: Probar inserción de datos
    echo "<h2>2️⃣ Test de Inserción de Datos</h2>";
    
    $test_user_id = 'test_diagnostico_urgente_memoflip';
    $test_level = 15;
    $test_coins = 3000;
    $test_score = 15000;
    $test_lives = 5;
    
    // Limpiar antes de insertar
    $stmt = $pdo->prepare("DELETE FROM memoflip_usuarios WHERE usuario_aplicacion_key = ?");
    $stmt->execute([$test_user_id]);
    
    // Insertar datos de prueba
    $sql = "INSERT INTO memoflip_usuarios (usuario_aplicacion_key, max_level_unlocked, coins_total, total_score, lives_current, fecha_modificacion) 
            VALUES (?, ?, ?, ?, ?, NOW()) 
            ON DUPLICATE KEY UPDATE 
            max_level_unlocked = VALUES(max_level_unlocked), 
            coins_total = VALUES(coins_total), 
            total_score = VALUES(total_score), 
            lives_current = VALUES(lives_current), 
            fecha_modificacion = NOW()";
    
    $stmt = $pdo->prepare($sql);
    if ($stmt->execute([$test_user_id, $test_level, $test_coins, $test_score, $test_lives])) {
        echo "<p style='color:green;'>✅ Inserción en memoflip_usuarios exitosa</p>";
        
        // Verificar inserción
        $stmt = $pdo->prepare("SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = ?");
        $stmt->execute([$test_user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo "<p style='color:green;'>✅ Usuario encontrado:</p>";
            echo "<ul>";
            echo "<li>Nivel: " . $user['max_level_unlocked'] . "</li>";
            echo "<li>Monedas: " . $user['coins_total'] . "</li>";
            echo "<li>Puntos: " . $user['total_score'] . "</li>";
            echo "<li>Vidas: " . $user['lives_current'] . "</li>";
            echo "</ul>";
        }
        
        // Test de ranking cache
        $sql2 = "INSERT INTO memoflip_ranking_cache (usuario_aplicacion_key, nombre, email, max_level_unlocked, coins_total, total_score) 
                 VALUES (?, ?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 max_level_unlocked = VALUES(max_level_unlocked), 
                 coins_total = VALUES(coins_total), 
                 total_score = VALUES(total_score)";
        
        $stmt2 = $pdo->prepare($sql2);
        if ($stmt2->execute([$test_user_id, 'TestUser', 'test@diagnostico.com', $test_level, $test_coins, $test_score])) {
            echo "<p style='color:green;'>✅ Inserción en memoflip_ranking_cache exitosa</p>";
        } else {
            echo "<p style='color:red;'>❌ Error en memoflip_ranking_cache</p>";
        }
        
    } else {
        echo "<p style='color:red;'>❌ Error en inserción en memoflip_usuarios</p>";
    }
    
    // Test 3: Probar consulta de ranking
    echo "<h2>3️⃣ Test de Consulta de Ranking</h2>";
    
    $sql_ranking = "SELECT 
                        usuario_aplicacion_key,
                        nombre,
                        email,
                        max_level_unlocked,
                        coins_total,
                        total_score,
                        levels_completed,
                        total_stars,
                        avg_time,
                        registro_fecha
                    FROM memoflip_ranking_cache 
                    ORDER BY total_score DESC, max_level_unlocked DESC, coins_total DESC
                    LIMIT 10";
    
    $stmt = $pdo->prepare($sql_ranking);
    if ($stmt->execute()) {
        $ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo "<p style='color:green;'>✅ Consulta de ranking exitosa</p>";
        echo "<p>📊 Registros encontrados: <strong>" . count($ranking) . "</strong></p>";
        
        if (!empty($ranking)) {
            echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 10px 0;'>";
            echo "<tr style='background: #f8f9fa;'><th>Usuario</th><th>Nombre</th><th>Nivel</th><th>Puntos</th><th>Monedas</th></tr>";
            foreach ($ranking as $row) {
                echo "<tr>";
                echo "<td>" . htmlspecialchars($row['usuario_aplicacion_key']) . "</td>";
                echo "<td>" . htmlspecialchars($row['nombre'] ?? 'N/A') . "</td>";
                echo "<td>" . $row['max_level_unlocked'] . "</td>";
                echo "<td>" . $row['total_score'] . "</td>";
                echo "<td>" . $row['coins_total'] . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        } else {
            echo "<p style='color: orange;'>⚠️ No hay datos en el ranking</p>";
        }
    } else {
        echo "<p style='color:red;'>❌ Error en consulta de ranking</p>";
    }
    
    // Limpiar datos de prueba
    $stmt = $pdo->prepare("DELETE FROM memoflip_usuarios WHERE usuario_aplicacion_key = ?");
    $stmt->execute([$test_user_id]);
    
    $stmt = $pdo->prepare("DELETE FROM memoflip_ranking_cache WHERE usuario_aplicacion_key = ?");
    $stmt->execute([$test_user_id]);
    
    echo "<p style='color:green;'>✅ Datos de prueba eliminados</p>";
    
    // Test 4: Verificar endpoints
    echo "<h2>4️⃣ Test de Endpoints</h2>";
    
    echo "<p><a href='game.php?action=ranking&limit=5' target='_blank'>🔗 Probar game.php ranking</a></p>";
    echo "<p><a href='ranking.php?limit=5' target='_blank'>🔗 Probar ranking.php</a></p>";
    echo "<p><a href='api/save_progress.php' target='_blank'>🔗 Probar save_progress.php</a></p>";
    
} catch (PDOException $e) {
    echo "<div style='color: red; background: #f8d7da; padding: 10px; border-radius: 5px;'>";
    echo "❌ <strong>ERROR:</strong> " . $e->getMessage();
    echo "</div>";
}
?>

