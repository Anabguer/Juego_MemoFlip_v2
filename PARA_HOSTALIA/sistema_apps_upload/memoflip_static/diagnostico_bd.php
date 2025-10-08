<?php
/**
 * Diagnóstico de Base de Datos - MemoFlip
 * Verifica qué tablas existen y muestra estructura
 */

require_once '_common.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diagnóstico BD - MemoFlip</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .ok { color: #0f0; }
        .error { color: #f00; }
        .warning { color: #ff0; }
        .info { color: #0ff; }
        h2 { color: #0ff; border-bottom: 2px solid #0ff; padding-bottom: 5px; margin-top: 30px; }
        pre { background: #000; padding: 10px; border-left: 3px solid #0ff; overflow-x: auto; font-size: 12px; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border: 1px solid #0ff; }
        th { background: #003; color: #0ff; }
        .exists { background: #003300; }
        .missing { background: #330000; }
    </style>
</head>
<body>
    <h1>🔍 Diagnóstico de Base de Datos - MemoFlip</h1>
    
    <h2>🔌 Conexión a Base de Datos</h2>
    <pre><?php
    try {
        echo "✅ Conectado a: " . DB_HOST . "\n";
        echo "   Base de datos: " . DB_NOMBRE . "\n";
        echo "   Usuario: " . DB_USUARIO . "\n";
        
        // Test de conexión
        $stmt = $pdo->query("SELECT VERSION() as version, DATABASE() as db_name, NOW() as current_time");
        $info = $stmt->fetch();
        echo "\n   MySQL Version: " . $info['version'] . "\n";
        echo "   BD actual: " . $info['db_name'] . "\n";
        echo "   Hora servidor: " . $info['current_time'] . "\n";
    } catch (Exception $e) {
        echo "❌ ERROR: " . $e->getMessage() . "\n";
    }
    ?></pre>
    
    <h2>📋 TODAS las Tablas en la Base de Datos</h2>
    <pre><?php
    try {
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "Total de tablas: " . count($tables) . "\n\n";
        
        foreach ($tables as $table) {
            // Marcar las relevantes para MemoFlip y sistema multi-app
            if (strpos($table, 'memoflip') !== false) {
                echo "✅ $table (MEMOFLIP)\n";
            } elseif (strpos($table, 'usuario') !== false || strpos($table, 'aplicacion') !== false) {
                echo "🔑 $table (MULTI-APP)\n";
            } else {
                echo "   $table\n";
            }
        }
    } catch (Exception $e) {
        echo "❌ ERROR: " . $e->getMessage() . "\n";
    }
    ?></pre>
    
    <h2>🎯 Tablas Requeridas para MemoFlip</h2>
    <table>
        <tr>
            <th>Tabla</th>
            <th>Estado</th>
            <th>Descripción</th>
        </tr>
        <?php
        $requiredTables = [
            'usuarios_aplicaciones' => 'Sistema multi-app (compartida con Lumetrix)',
            'aplicaciones' => 'Catálogo de aplicaciones (compartida)',
            'memoflip_usuarios' => 'Progreso principal del usuario',
            'memoflip_level_records' => 'Récords por nivel',
            'memoflip_game_sessions' => 'Historial de partidas',
            'memoflip_config' => 'Configuración global del juego'
        ];
        
        $allTables = [];
        try {
            $stmt = $pdo->query("SHOW TABLES");
            $allTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        } catch (Exception $e) {
            echo "<tr><td colspan='3' class='error'>Error: " . $e->getMessage() . "</td></tr>";
        }
        
        foreach ($requiredTables as $table => $desc) {
            $exists = in_array($table, $allTables);
            $statusClass = $exists ? 'exists ok' : 'missing error';
            $statusText = $exists ? '✅ EXISTE' : '❌ FALTA';
            
            echo "<tr class='$statusClass'>";
            echo "<td><strong>$table</strong></td>";
            echo "<td>$statusText</td>";
            echo "<td>$desc</td>";
            echo "</tr>";
        }
        ?>
    </table>
    
    <h2>📊 Estructura de tabla usuarios_aplicaciones (si existe)</h2>
    <pre><?php
    try {
        $stmt = $pdo->query("DESCRIBE usuarios_aplicaciones");
        $columns = $stmt->fetchAll();
        
        echo "Columnas:\n";
        foreach ($columns as $col) {
            echo "  - " . $col['Field'] . " (" . $col['Type'] . ")";
            if ($col['Key'] === 'PRI') echo " [PRIMARY KEY]";
            if ($col['Key'] === 'UNI') echo " [UNIQUE]";
            echo "\n";
        }
        
        // Contar registros
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios_aplicaciones");
        $count = $stmt->fetch();
        echo "\nTotal de usuarios registrados: " . $count['total'] . "\n";
        
        // Contar usuarios de MemoFlip
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios_aplicaciones WHERE usuario_aplicacion_key LIKE '%_memoflip'");
        $memoflipUsers = $stmt->fetch();
        echo "Usuarios de MemoFlip: " . $memoflipUsers['total'] . "\n";
        
    } catch (Exception $e) {
        echo "❌ Tabla no existe o error: " . $e->getMessage() . "\n";
    }
    ?></pre>
    
    <h2>📊 Estructura de tabla memoflip_usuarios (si existe)</h2>
    <pre><?php
    try {
        $stmt = $pdo->query("DESCRIBE memoflip_usuarios");
        $columns = $stmt->fetchAll();
        
        echo "Columnas:\n";
        foreach ($columns as $col) {
            echo "  - " . $col['Field'] . " (" . $col['Type'] . ")";
            if ($col['Key'] === 'PRI') echo " [PRIMARY KEY]";
            if ($col['Key'] === 'UNI') echo " [UNIQUE]";
            echo "\n";
        }
        
        // Contar registros
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM memoflip_usuarios");
        $count = $stmt->fetch();
        echo "\nTotal de usuarios: " . $count['total'] . "\n";
        
    } catch (Exception $e) {
        echo "❌ Tabla no existe o error: " . $e->getMessage() . "\n";
    }
    ?></pre>
    
    <h2>🔑 Formato de clave usuario_aplicacion_key</h2>
    <pre><?php
    echo "Formato correcto: email_memoflip\n";
    echo "Ejemplo: ana@ejemplo.com_memoflip\n\n";
    
    echo "Esta clave debe ser IDÉNTICA entre:\n";
    echo "  - usuarios_aplicaciones.usuario_aplicacion_key\n";
    echo "  - memoflip_usuarios.usuario_aplicacion_key\n\n";
    
    echo "De esta forma, el mismo usuario puede jugar\n";
    echo "Lumetrix, MemoFlip y otras apps con el mismo login.\n";
    ?></pre>
    
    <h2>🧪 Test de Usuarios Existentes (primeros 5)</h2>
    <pre><?php
    try {
        $stmt = $pdo->query("SELECT usuario_aplicacion_key, email, nombre, app_codigo, activo, fecha_registro 
                             FROM usuarios_aplicaciones 
                             LIMIT 5");
        $users = $stmt->fetchAll();
        
        if (count($users) > 0) {
            foreach ($users as $user) {
                echo "👤 " . $user['usuario_aplicacion_key'] . "\n";
                echo "   Email: " . $user['email'] . "\n";
                echo "   Nombre: " . $user['nombre'] . "\n";
                echo "   App: " . $user['app_codigo'] . "\n";
                echo "   Activo: " . ($user['activo'] ? 'Sí' : 'No') . "\n";
                echo "   Registro: " . $user['fecha_registro'] . "\n\n";
            }
        } else {
            echo "⚠️ No hay usuarios registrados todavía\n";
        }
    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
    }
    ?></pre>
    
    <h2>⚙️ Procedimientos Almacenados para MemoFlip</h2>
    <pre><?php
    try {
        $stmt = $pdo->query("SHOW PROCEDURE STATUS WHERE Db = '" . DB_NOMBRE . "' AND Name LIKE '%MemoFlip%'");
        $procedures = $stmt->fetchAll();
        
        if (count($procedures) > 0) {
            echo "Procedimientos encontrados:\n";
            foreach ($procedures as $proc) {
                echo "  ✅ " . $proc['Name'] . "\n";
            }
        } else {
            echo "⚠️ No hay procedimientos almacenados para MemoFlip\n";
            echo "   Necesitarás ejecutar: database/estructura_memoflip.sql\n";
        }
    } catch (Exception $e) {
        echo "❌ Error: " . $e->getMessage() . "\n";
    }
    ?></pre>
    
    <h2>📝 Resumen y Próximos Pasos</h2>
    <pre><?php
    $allTables = [];
    try {
        $stmt = $pdo->query("SHOW TABLES");
        $allTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    } catch (Exception $e) {}
    
    $hasUsersTable = in_array('usuarios_aplicaciones', $allTables);
    $hasMemoflipUsers = in_array('memoflip_usuarios', $allTables);
    $hasMemoflipRecords = in_array('memoflip_level_records', $allTables);
    $hasMemoflipSessions = in_array('memoflip_game_sessions', $allTables);
    
    if ($hasUsersTable && $hasMemoflipUsers && $hasMemoflipRecords && $hasMemoflipSessions) {
        echo "✅ TODAS LAS TABLAS NECESARIAS EXISTEN\n\n";
        echo "MemoFlip está listo para usar.\n";
        echo "Puedes probar el sistema de autenticación en:\n";
        echo "  https://colisan.com/sistema_apps_upload/memoflip_static/test_auth.html\n";
    } else {
        echo "⚠️ FALTAN TABLAS\n\n";
        
        if (!$hasUsersTable) {
            echo "❌ usuarios_aplicaciones (CRÍTICA - sistema multi-app)\n";
        }
        if (!$hasMemoflipUsers) {
            echo "❌ memoflip_usuarios (progreso del juego)\n";
        }
        if (!$hasMemoflipRecords) {
            echo "❌ memoflip_level_records (récords por nivel)\n";
        }
        if (!$hasMemoflipSessions) {
            echo "❌ memoflip_game_sessions (historial de partidas)\n";
        }
        
        echo "\nPara crearlas, ejecuta el archivo SQL:\n";
        echo "  database/estructura_memoflip.sql\n";
        echo "\nO súbelo a Hostalia como setup_memoflip.php para ejecutarlo automáticamente.\n";
    }
    ?></pre>
    
    <h2>🔗 Links útiles</h2>
    <pre>
<a href="test_auth.html" style="color: #0ff;">🧪 Test de Autenticación</a>
<a href="auth.php?action=check_session" style="color: #0ff;">🔐 Verificar Sesión (API)</a>
<a href="diagnostico_completo.php" style="color: #0ff;">📦 Diagnóstico de Archivos</a>
<a href="./" style="color: #0ff;">🎮 Volver al Juego</a>
    </pre>
    
</body>
</html>

