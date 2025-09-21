<?php
/**
 * Script para crear la estructura de base de datos de MemoFlip en Hostalia
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

    // 1. Registrar la aplicación MemoFlip
    echo "\n📋 Registrando aplicación MemoFlip...\n";
    
    $stmt = $pdo->prepare("
        INSERT INTO aplicaciones (app_codigo, app_nombre, app_descripcion, app_version, configuracion) 
        VALUES ('memoflip', 'MemoFlip - Juego de Memoria', 'Juego de memoria con cartas, 1000 niveles y mecánicas avanzadas', '1.0.0', '{\"max_levels\": 1000, \"lives\": 5, \"lives_regen_hours\": 1}')
        ON DUPLICATE KEY UPDATE 
            app_nombre = VALUES(app_nombre),
            app_descripcion = VALUES(app_descripcion),
            app_version = VALUES(app_version)
    ");
    $stmt->execute();
    echo "✅ Aplicación MemoFlip registrada\n";

    // 2. Crear tabla de usuarios MemoFlip
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
            INDEX idx_coins (coins_total),
            FOREIGN KEY (usuario_aplicacion_key) REFERENCES usuarios_aplicaciones(usuario_aplicacion_key) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    ");
    echo "✅ Tabla memoflip_usuarios creada\n";

    // 3. Crear tabla de records por nivel
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
            INDEX idx_stars (stars),
            FOREIGN KEY (usuario_aplicacion_key) REFERENCES usuarios_aplicaciones(usuario_aplicacion_key) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    ");
    echo "✅ Tabla memoflip_level_records creada\n";

    // 4. Crear tabla de sesiones de juego
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
            INDEX idx_fecha (fecha_creacion),
            FOREIGN KEY (usuario_aplicacion_key) REFERENCES usuarios_aplicaciones(usuario_aplicacion_key) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci
    ");
    echo "✅ Tabla memoflip_game_sessions creada\n";

    // 5. Crear tabla de configuración
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

    // 6. Insertar configuración inicial
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

    // 7. Crear vista de ranking
    echo "\n📊 Creando vista memoflip_ranking...\n";
    
    $pdo->exec("
        CREATE OR REPLACE VIEW memoflip_ranking AS
        SELECT 
            u.usuario_aplicacion_key,
            ua.email,
            ua.nombre,
            u.max_level_unlocked,
            u.coins_total,
            COUNT(lr.record_id) as levels_completed,
            SUM(lr.stars) as total_stars,
            AVG(lr.best_time_seconds) as avg_time,
            u.fecha_creacion as registro_fecha,
            ROW_NUMBER() OVER (ORDER BY u.max_level_unlocked DESC, u.coins_total DESC, AVG(lr.best_time_seconds) ASC) as ranking_position
        FROM memoflip_usuarios u
        LEFT JOIN usuarios_aplicaciones ua ON u.usuario_aplicacion_key = ua.usuario_aplicacion_key
        LEFT JOIN memoflip_level_records lr ON u.usuario_aplicacion_key = lr.usuario_aplicacion_key AND lr.times_completed > 0
        WHERE ua.activo = 1
        GROUP BY u.usuario_aplicacion_key, ua.email, ua.nombre, u.max_level_unlocked, u.coins_total, u.fecha_creacion
        ORDER BY u.max_level_unlocked DESC, u.coins_total DESC, avg_time ASC
    ");
    echo "✅ Vista memoflip_ranking creada\n";

    // 8. Crear procedimientos almacenados
    echo "\n🔄 Creando procedimientos almacenados...\n";
    
    // Procedimiento para crear usuario MemoFlip
    $pdo->exec("
        DROP PROCEDURE IF EXISTS CreateMemoFlipUser;
        CREATE PROCEDURE CreateMemoFlipUser(
            IN p_usuario_aplicacion_key VARCHAR(150)
        )
        BEGIN
            DECLARE EXIT HANDLER FOR SQLEXCEPTION
            BEGIN
                ROLLBACK;
                RESIGNAL;
            END;
            
            START TRANSACTION;
            
            INSERT IGNORE INTO memoflip_usuarios (usuario_aplicacion_key) 
            VALUES (p_usuario_aplicacion_key);
            
            COMMIT;
        END
    ");
    echo "✅ Procedimiento CreateMemoFlipUser creado\n";

    // Procedimiento para regenerar vidas
    $pdo->exec("
        DROP PROCEDURE IF EXISTS RegenerateLives;
        CREATE PROCEDURE RegenerateLives(
            IN p_usuario_aplicacion_key VARCHAR(150)
        )
        BEGIN
            DECLARE v_hours_passed INT DEFAULT 0;
            DECLARE v_current_lives INT DEFAULT 0;
            DECLARE v_max_lives INT DEFAULT 5;
            
            SELECT CAST(config_value AS UNSIGNED) INTO v_max_lives 
            FROM memoflip_config WHERE config_key = 'max_lives';
            
            SELECT 
                lives_current,
                TIMESTAMPDIFF(HOUR, lives_last_regen, NOW())
            INTO v_current_lives, v_hours_passed
            FROM memoflip_usuarios 
            WHERE usuario_aplicacion_key = p_usuario_aplicacion_key;
            
            IF v_hours_passed > 0 AND v_current_lives < v_max_lives THEN
                UPDATE memoflip_usuarios 
                SET 
                    lives_current = LEAST(v_max_lives, v_current_lives + v_hours_passed),
                    lives_last_regen = NOW()
                WHERE usuario_aplicacion_key = p_usuario_aplicacion_key;
            END IF;
        END
    ");
    echo "✅ Procedimiento RegenerateLives creado\n";

    // Procedimiento para guardar resultado de partida
    $pdo->exec("
        DROP PROCEDURE IF EXISTS SaveGameResult;
        CREATE PROCEDURE SaveGameResult(
            IN p_usuario_aplicacion_key VARCHAR(150),
            IN p_level_id INT,
            IN p_pairs INT,
            IN p_time_seconds INT,
            IN p_moves_used INT,
            IN p_fails INT,
            IN p_coins_earned INT,
            IN p_completed BOOLEAN,
            IN p_game_data JSON
        )
        BEGIN
            DECLARE v_current_best_coins INT DEFAULT 0;
            DECLARE v_is_new_record BOOLEAN DEFAULT FALSE;
            
            DECLARE EXIT HANDLER FOR SQLEXCEPTION
            BEGIN
                ROLLBACK;
                RESIGNAL;
            END;
            
            START TRANSACTION;
            
            INSERT INTO memoflip_game_sessions 
            (usuario_aplicacion_key, level_id, pairs, time_seconds, moves_used, fails, coins_earned, completed, game_data)
            VALUES (p_usuario_aplicacion_key, p_level_id, p_pairs, p_time_seconds, p_moves_used, p_fails, p_coins_earned, p_completed, p_game_data);
            
            IF p_completed THEN
                SELECT COALESCE(best_coins, 0) INTO v_current_best_coins
                FROM memoflip_level_records 
                WHERE usuario_aplicacion_key = p_usuario_aplicacion_key AND level_id = p_level_id;
                
                SET v_is_new_record = (p_coins_earned > v_current_best_coins);
                
                INSERT INTO memoflip_level_records 
                (usuario_aplicacion_key, level_id, best_coins, best_time_seconds, best_moves, times_played, times_completed)
                VALUES (p_usuario_aplicacion_key, p_level_id, p_coins_earned, p_time_seconds, p_moves_used, 1, 1)
                ON DUPLICATE KEY UPDATE
                    best_coins = IF(p_coins_earned > best_coins, p_coins_earned, best_coins),
                    best_time_seconds = IF(p_coins_earned > best_coins, p_time_seconds, best_time_seconds),
                    best_moves = IF(p_coins_earned > best_coins, p_moves_used, best_moves),
                    times_played = times_played + 1,
                    times_completed = times_completed + 1,
                    fecha_mejor_record = IF(p_coins_earned > best_coins, NOW(), fecha_mejor_record);
                
                UPDATE memoflip_usuarios SET
                    max_level_unlocked = GREATEST(max_level_unlocked, p_level_id + 1),
                    coins_total = IF(v_is_new_record, coins_total + (p_coins_earned - v_current_best_coins), coins_total)
                WHERE usuario_aplicacion_key = p_usuario_aplicacion_key;
            ELSE
                INSERT INTO memoflip_level_records 
                (usuario_aplicacion_key, level_id, times_played)
                VALUES (p_usuario_aplicacion_key, p_level_id, 1)
                ON DUPLICATE KEY UPDATE times_played = times_played + 1;
                
                UPDATE memoflip_usuarios SET
                    lives_current = GREATEST(0, lives_current - 1)
                WHERE usuario_aplicacion_key = p_usuario_aplicacion_key;
            END IF;
            
            COMMIT;
        END
    ");
    echo "✅ Procedimiento SaveGameResult creado\n";

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
    
    // Verificar procedimientos
    $procedures = ['CreateMemoFlipUser', 'RegenerateLives', 'SaveGameResult'];
    foreach ($procedures as $proc) {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM information_schema.routines WHERE routine_schema = ? AND routine_name = ?");
        $stmt->execute([$database, $proc]);
        $exists = $stmt->fetch()['count'] > 0;
        echo ($exists ? "✅" : "❌") . " Procedimiento $proc: " . ($exists ? "OK" : "ERROR") . "\n";
    }

    echo "\n🎉 ¡BASE DE DATOS MEMOFLIP CONFIGURADA CORRECTAMENTE!\n";
    echo "\n📱 Próximos pasos:\n";
    echo "1. ✅ Base de datos configurada\n";
    echo "2. 📁 Subir archivos de PARA_HOSTALIA/ al servidor\n";
    echo "3. 🎮 Acceder a: https://colisan.com/sistema_apps_upload/app_memoflip.html\n";
    echo "4. 🗑️ Eliminar este archivo setup_database.php del servidor\n";
    
} catch (PDOException $e) {
    echo "❌ ERROR DE BASE DE DATOS: " . $e->getMessage() . "\n";
    echo "Línea: " . $e->getLine() . "\n";
    echo "Archivo: " . $e->getFile() . "\n";
} catch (Exception $e) {
    echo "❌ ERROR GENERAL: " . $e->getMessage() . "\n";
}

echo "\n--- FIN DEL SETUP ---\n";
?>
