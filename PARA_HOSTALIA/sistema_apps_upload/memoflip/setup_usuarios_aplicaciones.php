<?php
// 🔧 CONFIGURAR TABLA usuarios_aplicaciones PARA MEMOFLIP

header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>🔧 CONFIGURACIÓN DE TABLA usuarios_aplicaciones</h1>";
    
    // Verificar si la tabla existe
    $check_sql = "SHOW TABLES LIKE 'usuarios_aplicaciones'";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->execute();
    $table_exists = $check_stmt->fetch();
    
    if (!$table_exists) {
        echo "<h2>📋 CREANDO TABLA usuarios_aplicaciones</h2>";
        
        $create_sql = "CREATE TABLE usuarios_aplicaciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_aplicacion_key VARCHAR(255) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            nombre VARCHAR(255) NOT NULL,
            nick VARCHAR(100) UNIQUE NOT NULL,
            email_verified BOOLEAN DEFAULT FALSE,
            verification_code VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_email (email),
            INDEX idx_nick (nick),
            INDEX idx_usuario_key (usuario_aplicacion_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $pdo->exec($create_sql);
        echo "<p style='color: green;'>✅ Tabla usuarios_aplicaciones creada exitosamente</p>";
    } else {
        echo "<h2>📋 TABLA usuarios_aplicaciones YA EXISTE</h2>";
        
        // Verificar estructura
        $structure_sql = "DESCRIBE usuarios_aplicaciones";
        $structure_stmt = $pdo->prepare($structure_sql);
        $structure_stmt->execute();
        $structure = $structure_stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<h3>🔍 Estructura actual:</h3>";
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
        foreach ($structure as $field) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($field['Field']) . "</td>";
            echo "<td>" . htmlspecialchars($field['Type']) . "</td>";
            echo "<td>" . htmlspecialchars($field['Null']) . "</td>";
            echo "<td>" . htmlspecialchars($field['Key']) . "</td>";
            echo "<td>" . htmlspecialchars($field['Default']) . "</td>";
            echo "<td>" . htmlspecialchars($field['Extra']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Verificar si faltan campos
        $required_fields = ['nick', 'email_verified', 'verification_code'];
        $existing_fields = array_column($structure, 'Field');
        $missing_fields = array_diff($required_fields, $existing_fields);
        
        if (!empty($missing_fields)) {
            echo "<h3>⚠️ CAMPOS FALTANTES:</h3>";
            echo "<p style='color: orange;'>Faltan los siguientes campos: " . implode(', ', $missing_fields) . "</p>";
            
            foreach ($missing_fields as $field) {
                switch ($field) {
                    case 'nick':
                        $pdo->exec("ALTER TABLE usuarios_aplicaciones ADD COLUMN nick VARCHAR(100) UNIQUE NOT NULL DEFAULT ''");
                        echo "<p style='color: green;'>✅ Campo 'nick' agregado</p>";
                        break;
                    case 'email_verified':
                        $pdo->exec("ALTER TABLE usuarios_aplicaciones ADD COLUMN email_verified BOOLEAN DEFAULT FALSE");
                        echo "<p style='color: green;'>✅ Campo 'email_verified' agregado</p>";
                        break;
                    case 'verification_code':
                        $pdo->exec("ALTER TABLE usuarios_aplicaciones ADD COLUMN verification_code VARCHAR(255)");
                        echo "<p style='color: green;'>✅ Campo 'verification_code' agregado</p>";
                        break;
                }
            }
        } else {
            echo "<p style='color: green;'>✅ Todos los campos requeridos están presentes</p>";
        }
    }
    
    // Mostrar datos de ejemplo
    echo "<h3>📊 DATOS ACTUALES:</h3>";
    $data_sql = "SELECT id, usuario_aplicacion_key, email, nombre, nick, email_verified, created_at FROM usuarios_aplicaciones LIMIT 5";
    $data_stmt = $pdo->prepare($data_sql);
    $data_stmt->execute();
    $data = $data_stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($data)) {
        echo "<p style='color: blue;'>📝 No hay usuarios registrados aún</p>";
    } else {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>ID</th><th>Usuario Key</th><th>Email</th><th>Nombre</th><th>Nick</th><th>Verificado</th><th>Creado</th></tr>";
        foreach ($data as $row) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($row['id']) . "</td>";
            echo "<td>" . htmlspecialchars($row['usuario_aplicacion_key']) . "</td>";
            echo "<td>" . htmlspecialchars($row['email']) . "</td>";
            echo "<td>" . htmlspecialchars($row['nombre']) . "</td>";
            echo "<td>" . htmlspecialchars($row['nick']) . "</td>";
            echo "<td>" . ($row['email_verified'] ? '✅' : '❌') . "</td>";
            echo "<td>" . htmlspecialchars($row['created_at']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
    echo "<h3>🎯 PRÓXIMOS PASOS:</h3>";
    echo "<ol>";
    echo "<li>✅ Tabla usuarios_aplicaciones configurada</li>";
    echo "<li>📁 Subir auth.php al servidor</li>";
    echo "<li>🧪 Probar registro con nick obligatorio</li>";
    echo "<li>🏆 Verificar que el ranking muestre el nick</li>";
    echo "</ol>";
    
} catch (Exception $e) {
    echo "<h2>❌ ERROR:</h2>";
    echo "<p style='color: red;'>" . htmlspecialchars($e->getMessage()) . "</p>";
}
?>
