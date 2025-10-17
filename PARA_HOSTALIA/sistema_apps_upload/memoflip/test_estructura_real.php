<?php
echo "<h1>🔍 Estructura Real de Tablas MemoFlip</h1>";
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
    
    // Ver estructura REAL de memoflip_usuarios
    echo "<h2>📋 Estructura REAL de memoflip_usuarios</h2>";
    
    $stmt = $pdo->query("DESCRIBE memoflip_usuarios");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 10px 0;'>";
    echo "<tr style='background: #f8f9fa;'><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td><strong>" . htmlspecialchars($column['Field']) . "</strong></td>";
        echo "<td>" . htmlspecialchars($column['Type']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Null']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Key']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Default']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Extra']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Ver datos existentes
    echo "<h2>👥 Datos existentes en memoflip_usuarios</h2>";
    
    $stmt = $pdo->query("SELECT * FROM memoflip_usuarios LIMIT 3");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($users)) {
        echo "<div style='color: orange;'>⚠️ No hay usuarios en la tabla</div>";
    } else {
        echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 10px 0;'>";
        
        // Headers
        if (!empty($users)) {
            echo "<tr style='background: #f8f9fa;'>";
            foreach (array_keys($users[0]) as $header) {
                echo "<th>" . htmlspecialchars($header) . "</th>";
            }
            echo "</tr>";
        }
        
        // Data
        foreach ($users as $user) {
            echo "<tr>";
            foreach ($user as $value) {
                echo "<td>" . htmlspecialchars($value ?? 'NULL') . "</td>";
            }
            echo "</tr>";
        }
        echo "</table>";
    }
    
    // Ver estructura de memoflip_ranking_cache
    echo "<h2>🏆 Estructura REAL de memoflip_ranking_cache</h2>";
    
    $stmt = $pdo->query("DESCRIBE memoflip_ranking_cache");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse; width: 100%; margin: 10px 0;'>";
    echo "<tr style='background: #f8f9fa;'><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
    foreach ($columns as $column) {
        echo "<tr>";
        echo "<td><strong>" . htmlspecialchars($column['Field']) . "</strong></td>";
        echo "<td>" . htmlspecialchars($column['Type']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Null']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Key']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Default']) . "</td>";
        echo "<td>" . htmlspecialchars($column['Extra']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    // Test de inserción con columnas correctas
    echo "<h2>🧪 Test de Inserción con Columnas Correctas</h2>";
    
    $test_user_id = 'test_estructura_memoflip';
    
    // Limpiar antes de insertar
    $stmt = $pdo->prepare("DELETE FROM memoflip_usuarios WHERE usuario_aplicacion_key = ?");
    $stmt->execute([$test_user_id]);
    
    // Obtener nombres de columnas reales
    $stmt = $pdo->query("DESCRIBE memoflip_usuarios");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<p><strong>Columnas disponibles:</strong> " . implode(', ', $columns) . "</p>";
    
    // Construir INSERT dinámico solo con columnas que existen
    $insert_columns = [];
    $insert_values = [];
    $insert_params = [];
    
    // Solo incluir columnas que existen
    if (in_array('usuario_aplicacion_key', $columns)) {
        $insert_columns[] = 'usuario_aplicacion_key';
        $insert_values[] = '?';
        $insert_params[] = $test_user_id;
    }
    
    if (in_array('max_level_unlocked', $columns)) {
        $insert_columns[] = 'max_level_unlocked';
        $insert_values[] = '?';
        $insert_params[] = 5;
    }
    
    if (in_array('coins_total', $columns)) {
        $insert_columns[] = 'coins_total';
        $insert_values[] = '?';
        $insert_params[] = 1000;
    }
    
    if (in_array('total_score', $columns)) {
        $insert_columns[] = 'total_score';
        $insert_values[] = '?';
        $insert_params[] = 5000;
    }
    
    if (in_array('lives_current', $columns)) {
        $insert_columns[] = 'lives_current';
        $insert_values[] = '?';
        $insert_params[] = 3;
    }
    
    if (in_array('fecha_modificacion', $columns)) {
        $insert_columns[] = 'fecha_modificacion';
        $insert_values[] = 'NOW()';
    }
    
    if (!empty($insert_columns)) {
        $sql = "INSERT INTO memoflip_usuarios (" . implode(', ', $insert_columns) . ") VALUES (" . implode(', ', $insert_values) . ")";
        
        echo "<p><strong>SQL generado:</strong> <code>" . htmlspecialchars($sql) . "</code></p>";
        
        $stmt = $pdo->prepare($sql);
        if ($stmt->execute($insert_params)) {
            echo "<p style='color:green;'>✅ Inserción exitosa con columnas correctas</p>";
            
            // Verificar inserción
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM memoflip_usuarios WHERE usuario_aplicacion_key = ?");
            $stmt->execute([$test_user_id]);
            if ($stmt->fetchColumn() > 0) {
                echo "<p style='color:green;'>✅ Usuario de prueba encontrado en la tabla</p>";
            }
        } else {
            echo "<p style='color:red;'>❌ Error en inserción</p>";
        }
        
        // Limpiar usuario de prueba
        $stmt = $pdo->prepare("DELETE FROM memoflip_usuarios WHERE usuario_aplicacion_key = ?");
        $stmt->execute([$test_user_id]);
        echo "<p style='color:green;'>✅ Usuario de prueba eliminado</p>";
    } else {
        echo "<p style='color:red;'>❌ No se encontraron columnas válidas para insertar</p>";
    }
    
} catch (PDOException $e) {
    echo "<div style='color: red; background: #f8d7da; padding: 10px; border-radius: 5px;'>";
    echo "❌ <strong>ERROR:</strong> " . $e->getMessage();
    echo "</div>";
}
?>

