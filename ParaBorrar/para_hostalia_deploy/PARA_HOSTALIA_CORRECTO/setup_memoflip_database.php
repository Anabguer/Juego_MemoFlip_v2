<?php
/**
 * Script para crear la estructura de base de datos de MemoFlip en Hostalia
 * USAR NOMBRE "memoflip" para diferenciarlo del "memory" existente
 * Ejecutar una sola vez después de subir los archivos
 */

// Configuración de conexión Hostalia
$host = 'PMYSQL165.dns-servicio.com';
$usuario = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';
$database = '9606966_sistema_apps_db';

echo "🎮 Configurando base de datos MemoFlip en Hostalia...\n\n";

try {
    // Conexión a la base de datos
    $pdo = new PDO(
        "mysql:host=$host;dbname=$database;charset=utf8",
        $usuario,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    echo "✅ Conexión a Hostalia establecida\n";

    // 1. Verificar estructura de tabla aplicaciones
    echo "\n🔍 Verificando estructura de aplicaciones...\n";
    $stmt = $pdo->prepare("DESCRIBE aplicaciones");
    $stmt->execute();
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($columns as $column) {
        echo "• $column\n";
    }

    // 2. Registrar la aplicación MemoFlip (adaptado a estructura real)
    echo "\n📋 Registrando aplicación MemoFlip...\n";
    
    if (in_array('app_version', $columns)) {
        $stmt = $pdo->prepare("
            INSERT INTO aplicaciones (app_codigo, app_nombre, app_descripcion, app_version) 
            VALUES ('memoflip', 'MemoFlip - Juego de Memoria', 'Juego de memoria con cartas, 1000 niveles y mecánicas avanzadas', '1.0.0')
            ON DUPLICATE KEY UPDATE 
                app_nombre = VALUES(app_nombre),
                app_descripcion = VALUES(app_descripcion),
                app_version = VALUES(app_version)
        ");
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO aplicaciones (app_codigo, app_nombre, app_descripcion) 
            VALUES ('memoflip', 'MemoFlip - Juego de Memoria', 'Juego de memoria con cartas, 1000 niveles y mecánicas avanzadas')
            ON DUPLICATE KEY UPDATE 
                app_nombre = VALUES(app_nombre),
                app_descripcion = VALUES(app_descripcion)
        ");
    }
    $stmt->execute();
    echo "✅ Aplicación MemoFlip registrada\n";

    // 3. Crear tabla de usuarios MemoFlip
    echo "\n👤 Creando tabla memoflip_usuarios...\n";
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS memoflip_usuarios (
            usuario_id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_aplicacion_key VARCHAR(150) NOT NULL UNIQUE,
            max_level_unlocked INT DEFAULT 1,
            coins_total INT DEFAULT 0,
            lives_current INT DEFAULT 5,
            lives_last_regen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            sound_enabled BOOLEAN DEFAULT TRUE,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            INDEX idx_usuario_key (usuario_aplicacion_key),
            INDEX idx_max_level (max_level_unlocked),
            INDEX idx_coins (coins_total)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    ");
    echo "✅ Tabla memoflip_usuarios creada\n";

    // 4. Crear tabla de records por nivel
    echo "\n🏆 Creando tabla memoflip_level_records...\n";
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS memoflip_level_records (
            record_id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_aplicacion_key VARCHAR(150) NOT NULL,
            level_id INT NOT NULL,
            best_coins INT DEFAULT 0,
            best_time_seconds INT DEFAULT 0,
            best_moves INT DEFAULT 0,
            times_played INT DEFAULT 0,
            times_completed INT DEFAULT 0,
            stars INT DEFAULT 0,
            fecha_primer_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_mejor_record TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            
            UNIQUE KEY unique_user_level (usuario_aplicacion_key, level_id),
            INDEX idx_usuario (usuario_aplicacion_key),
            INDEX idx_level (level_id),
            INDEX idx_coins (best_coins),
            INDEX idx_stars (stars)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    ");
    echo "✅ Tabla memoflip_level_records creada\n";

    // 5. Crear tabla de sesiones de juego
    echo "\n🎯 Creando tabla memoflip_game_sessions...\n";
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS memoflip_game_sessions (
            session_id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_aplicacion_key VARCHAR(150) NOT NULL,
            level_id INT NOT NULL,
            pairs INT NOT NULL,
            time_seconds INT DEFAULT 0,
            moves_used INT DEFAULT 0,
            fails INT DEFAULT 0,
            coins_earned INT DEFAULT 0,
            completed BOOLEAN DEFAULT FALSE,
            game_data JSON,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            
            INDEX idx_usuario (usuario_aplicacion_key),
            INDEX idx_level (level_id),
            INDEX idx_completed (completed),
            INDEX idx_fecha (fecha_creacion)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    ");
    echo "✅ Tabla memoflip_game_sessions creada\n";

    // 6. Crear tabla de configuración
    echo "\n⚙️ Creando tabla memoflip_config...\n";
    
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS memoflip_config (
            config_key VARCHAR(100) PRIMARY KEY,
            config_value TEXT NOT NULL,
            config_type ENUM('string', 'int', 'float', 'boolean', 'json') DEFAULT 'string',
            descripcion TEXT,
            fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    ");
    echo "✅ Tabla memoflip_config creada\n";

    // 7. Insertar configuración inicial
    echo "\n🔧 Insertando configuración inicial...\n";
    
    $configs = [
        ['max_lives', '5', 'int', 'Número máximo de vidas'],
        ['lives_regen_hours', '1', 'int', 'Horas para regenerar 1 vida'],
        ['score_time_max', '50', 'int', 'Puntos máximos por tiempo'],
        ['score_eff_max', '50', 'int', 'Puntos máximos por eficiencia'],
        ['score_pen_fail', '2', 'int', 'Penalización por fallo'],
        ['score_pen_bomb', '4', 'int', 'Penalización por bomba'],
        ['global_seed', '12345', 'int', 'Semilla global para generación determinista'],
        ['version', '1.0.0', 'string', 'Versión actual del juego']
    ];
    
    foreach ($configs as $config) {
        $stmt = $pdo->prepare("
            INSERT IGNORE INTO memoflip_config (config_key, config_value, config_type, descripcion) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute($config);
    }
    echo "✅ Configuración inicial insertada\n";

    // 8. Crear vista de ranking (simplificada)
    echo "\n📊 Creando vista memoflip_ranking...\n";
    
    $pdo->exec("
        CREATE OR REPLACE VIEW memoflip_ranking AS
        SELECT 
            u.usuario_aplicacion_key,
            'Usuario' as email,
            'Jugador' as nombre,
            u.max_level_unlocked,
            u.coins_total,
            0 as levels_completed,
            0 as total_stars,
            0 as avg_time,
            u.fecha_creacion as registro_fecha,
            ROW_NUMBER() OVER (ORDER BY u.max_level_unlocked DESC, u.coins_total DESC) as ranking_position
        FROM memoflip_usuarios u
        ORDER BY u.max_level_unlocked DESC, u.coins_total DESC
    ");
    echo "✅ Vista memoflip_ranking creada\n";

    // 9. Crear índices adicionales
    echo "\n📈 Creando índices adicionales...\n";
    
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_memoflip_usuarios_lives ON memoflip_usuarios(lives_current, lives_last_regen)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_memoflip_sessions_date_level ON memoflip_game_sessions(fecha_creacion, level_id)");
    $pdo->exec("CREATE INDEX IF NOT EXISTS idx_memoflip_records_coins_time ON memoflip_level_records(best_coins DESC, best_time_seconds ASC)");
    echo "✅ Índices adicionales creados\n";

    // 10. Verificar instalación
    echo "\n🔍 Verificando instalación...\n";
    
    $tables = ['memoflip_usuarios', 'memoflip_level_records', 'memoflip_game_sessions', 'memoflip_config'];
    foreach ($tables as $table) {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = ? AND table_name = ?");
        $stmt->execute([$database, $table]);
        $exists = $stmt->fetch()['count'] > 0;
        echo ($exists ? "✅" : "❌") . " Tabla $table: " . ($exists ? "OK" : "ERROR") . "\n";
    }
    
    // Verificar vista
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM information_schema.views WHERE table_schema = ? AND table_name = 'memoflip_ranking'");
    $stmt->execute([$database]);
    $exists = $stmt->fetch()['count'] > 0;
    echo ($exists ? "✅" : "❌") . " Vista memoflip_ranking: " . ($exists ? "OK" : "ERROR") . "\n";

    echo "\n🎉 ¡BASE DE DATOS MEMOFLIP CONFIGURADA CORRECTAMENTE!\n";
    echo "\n📱 Próximos pasos:\n";
    echo "1. ✅ Base de datos configurada\n";
    echo "2. 📁 Archivos subidos al servidor\n";
    echo "3. 🎮 Acceder a: https://colisan.com/sistema_apps_upload/app_memoflip.html\n";
    echo "4. 🗑️ Eliminar este archivo setup_memoflip_database.php del servidor\n";
    
} catch (PDOException $e) {
    echo "❌ ERROR DE BASE DE DATOS: " . $e->getMessage() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
} catch (Exception $e) {
    echo "❌ ERROR GENERAL: " . $e->getMessage() . "\n";
}

echo "\n--- FIN DEL SETUP MEMOFLIP ---\n";
?>
