<?php
/**
 * Setup de tabla memoflip_config
 * Ejecutar UNA SOLA VEZ para crear la tabla de configuración global
 */

require_once '_common.php';

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Setup memoflip_config</title>
    <style>
        body { font-family: monospace; padding: 20px; background: #1a1a1a; color: #0f0; }
        .ok { color: #0f0; }
        .error { color: #f00; }
        .warning { color: #ff0; }
        h2 { color: #0ff; border-bottom: 2px solid #0ff; padding-bottom: 5px; }
        pre { background: #000; padding: 10px; border-left: 3px solid #0ff; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>⚙️ Setup tabla memoflip_config</h1>
    
    <?php
    try {
        // Verificar si ya existe
        $stmt = $pdo->query("SHOW TABLES LIKE 'memoflip_config'");
        $exists = $stmt->rowCount() > 0;
        
        if ($exists) {
            echo "<h2 class='warning'>⚠️ La tabla ya existe</h2>";
            echo "<pre>La tabla memoflip_config ya está creada.\nNo es necesario ejecutar este script de nuevo.</pre>";
            
            // Mostrar contenido actual
            $stmt = $pdo->query("SELECT * FROM memoflip_config ORDER BY config_key");
            $configs = $stmt->fetchAll();
            
            echo "<h2>📊 Configuración actual</h2>";
            echo "<pre>";
            foreach ($configs as $config) {
                echo $config['config_key'] . " = " . $config['config_value'];
                echo " (" . $config['config_type'] . ")\n";
            }
            echo "</pre>";
            
        } else {
            echo "<h2 class='ok'>✅ Creando tabla memoflip_config...</h2>";
            
            // Crear tabla
            $pdo->exec("
                CREATE TABLE memoflip_config (
                    config_key VARCHAR(100) PRIMARY KEY,
                    config_value TEXT NOT NULL,
                    config_type ENUM('string', 'int', 'float', 'boolean', 'json') DEFAULT 'string',
                    descripcion TEXT,
                    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
            ");
            
            echo "<pre>✅ Tabla creada correctamente</pre>";
            
            // Insertar configuración inicial
            echo "<h2 class='ok'>📝 Insertando configuración inicial...</h2>";
            
            $pdo->exec("
                INSERT INTO memoflip_config (config_key, config_value, config_type, descripcion) VALUES
                ('max_lives', '5', 'int', 'Número máximo de vidas'),
                ('lives_regen_hours', '1', 'int', 'Horas para regenerar 1 vida'),
                ('score_time_max', '50', 'int', 'Puntos máximos por tiempo'),
                ('score_eff_max', '50', 'int', 'Puntos máximos por eficiencia'),
                ('score_pen_fail', '2', 'int', 'Penalización por fallo'),
                ('score_pen_bomb', '4', 'int', 'Penalización por bomba'),
                ('global_seed', '12345', 'int', 'Semilla global para generación determinista'),
                ('version', '1.0.0', 'string', 'Versión actual del juego')
            ");
            
            echo "<pre>✅ Configuración inicial insertada</pre>";
            
            // Mostrar configuración creada
            $stmt = $pdo->query("SELECT * FROM memoflip_config ORDER BY config_key");
            $configs = $stmt->fetchAll();
            
            echo "<h2 class='ok'>📊 Configuración creada</h2>";
            echo "<pre>";
            foreach ($configs as $config) {
                echo $config['config_key'] . " = " . $config['config_value'];
                echo " (" . $config['config_type'] . ")\n";
                if ($config['descripcion']) {
                    echo "   → " . $config['descripcion'] . "\n";
                }
            }
            echo "</pre>";
            
            echo "<h2 class='ok'>🎉 SETUP COMPLETADO</h2>";
            echo "<pre>";
            echo "La tabla memoflip_config está lista.\n\n";
            echo "Ahora puedes:\n";
            echo "  1. Probar el sistema de autenticación:\n";
            echo "     https://colisan.com/sistema_apps_upload/memoflip_static/test_auth.html\n\n";
            echo "  2. Jugar MemoFlip:\n";
            echo "     https://colisan.com/sistema_apps_upload/memoflip_static/\n\n";
            echo "  3. Volver al diagnóstico de BD:\n";
            echo "     https://colisan.com/sistema_apps_upload/memoflip_static/diagnostico_bd.php\n";
            echo "</pre>";
        }
        
    } catch (PDOException $e) {
        echo "<h2 class='error'>❌ ERROR</h2>";
        echo "<pre class='error'>";
        echo "Error SQL: " . $e->getMessage() . "\n\n";
        echo "Código de error: " . $e->getCode() . "\n";
        echo "</pre>";
    }
    ?>
    
    <h2>🔗 Links</h2>
    <pre>
<a href="diagnostico_bd.php" style="color: #0ff;">🔍 Diagnóstico de BD</a>
<a href="test_auth.html" style="color: #0ff;">🧪 Test de Autenticación</a>
<a href="./" style="color: #0ff;">🎮 Volver al Juego</a>
    </pre>
    
    <h2>⚠️ IMPORTANTE</h2>
    <pre class="warning">
Este script solo debe ejecutarse UNA VEZ.
Si la tabla ya existe, no hace nada.

Para mayor seguridad, puedes eliminar este archivo
después de ejecutarlo.
    </pre>
    
</body>
</html>

