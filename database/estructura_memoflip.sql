-- =========================================
-- ESTRUCTURA DE BASE DE DATOS - MEMOFLIP
-- =========================================
-- Se integra con el sistema multi-aplicación existente
-- Usa el mismo formato usuario_aplicacion_key: email_memoflip

-- Registrar la aplicación en el sistema
INSERT INTO aplicaciones (app_codigo, app_nombre, app_descripcion, app_version, configuracion) 
VALUES ('memoflip', 'MemoFlip - Juego de Memoria', 'Juego de memoria con cartas, 1000 niveles y mecánicas avanzadas', '1.0.0', '{"max_levels": 1000, "lives": 5, "lives_regen_hours": 1}')
ON DUPLICATE KEY UPDATE 
    app_nombre = VALUES(app_nombre),
    app_descripcion = VALUES(app_descripcion),
    app_version = VALUES(app_version);

-- =========================================
-- TABLA PRINCIPAL: PROGRESO DE USUARIOS
-- =========================================
CREATE TABLE memoflip_usuarios (
    usuario_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_aplicacion_key VARCHAR(150) NOT NULL UNIQUE,  -- email_memoflip
    max_level_unlocked INT DEFAULT 1,                     -- último nivel desbloqueado
    coins_total INT DEFAULT 0,                            -- monedas acumuladas totales
    lives_current INT DEFAULT 5,                          -- vidas actuales (0-5)
    lives_last_regen TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- última regeneración de vida
    sound_enabled BOOLEAN DEFAULT TRUE,                   -- sonido activado/desactivado
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_usuario_key (usuario_aplicacion_key),
    INDEX idx_max_level (max_level_unlocked),
    INDEX idx_coins (coins_total),
    FOREIGN KEY (usuario_aplicacion_key) REFERENCES usuarios_aplicaciones(usuario_aplicacion_key) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- =========================================
-- TABLA: RECORDS POR NIVEL
-- =========================================
CREATE TABLE memoflip_level_records (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_aplicacion_key VARCHAR(150) NOT NULL,
    level_id INT NOT NULL,                                -- número del nivel (1-1000)
    best_coins INT DEFAULT 0,                             -- mejor puntuación en monedas
    best_time_seconds INT DEFAULT 0,                      -- mejor tiempo en segundos
    best_moves INT DEFAULT 0,                             -- mejor número de movimientos
    times_played INT DEFAULT 0,                           -- veces jugado este nivel
    times_completed INT DEFAULT 0,                        -- veces completado
    stars INT DEFAULT 0,                                  -- estrellas obtenidas (0-3)
    fecha_primer_intento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_mejor_record TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_user_level (usuario_aplicacion_key, level_id),
    INDEX idx_usuario (usuario_aplicacion_key),
    INDEX idx_level (level_id),
    INDEX idx_coins (best_coins),
    INDEX idx_stars (stars),
    FOREIGN KEY (usuario_aplicacion_key) REFERENCES usuarios_aplicaciones(usuario_aplicacion_key) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- =========================================
-- TABLA: HISTORIAL DE PARTIDAS
-- =========================================
CREATE TABLE memoflip_game_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_aplicacion_key VARCHAR(150) NOT NULL,
    level_id INT NOT NULL,
    pairs INT NOT NULL,                                   -- número de parejas del nivel
    time_seconds INT DEFAULT 0,                           -- tiempo total jugado
    moves_used INT DEFAULT 0,                             -- movimientos realizados
    fails INT DEFAULT 0,                                  -- fallos cometidos
    coins_earned INT DEFAULT 0,                           -- monedas ganadas
    completed BOOLEAN DEFAULT FALSE,                      -- si completó el nivel
    game_data JSON,                                       -- datos extra: mecánicas usadas, bombas activadas, etc.
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_usuario (usuario_aplicacion_key),
    INDEX idx_level (level_id),
    INDEX idx_completed (completed),
    INDEX idx_fecha (fecha_creacion),
    FOREIGN KEY (usuario_aplicacion_key) REFERENCES usuarios_aplicaciones(usuario_aplicacion_key) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- =========================================
-- TABLA: CONFIGURACIÓN GLOBAL DEL JUEGO
-- =========================================
CREATE TABLE memoflip_config (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT NOT NULL,
    config_type ENUM('string', 'int', 'float', 'boolean', 'json') DEFAULT 'string',
    descripcion TEXT,
    fecha_modificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

-- Configuración inicial del juego
INSERT INTO memoflip_config (config_key, config_value, config_type, descripcion) VALUES
('max_lives', '5', 'int', 'Número máximo de vidas'),
('lives_regen_hours', '1', 'int', 'Horas para regenerar 1 vida'),
('score_time_max', '50', 'int', 'Puntos máximos por tiempo'),
('score_eff_max', '50', 'int', 'Puntos máximos por eficiencia'),
('score_pen_fail', '2', 'int', 'Penalización por fallo'),
('score_pen_bomb', '4', 'int', 'Penalización por bomba'),
('global_seed', '12345', 'int', 'Semilla global para generación determinista'),
('version', '1.0.0', 'string', 'Versión actual del juego');

-- =========================================
-- VISTA: RANKING GLOBAL
-- =========================================
CREATE VIEW memoflip_ranking AS
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
ORDER BY u.max_level_unlocked DESC, u.coins_total DESC, avg_time ASC;

-- =========================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- =========================================

-- Crear usuario MemoFlip (cuando se registra por primera vez)
DELIMITER $$
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
    
    -- Insertar en memoflip_usuarios si no existe
    INSERT IGNORE INTO memoflip_usuarios (usuario_aplicacion_key) 
    VALUES (p_usuario_aplicacion_key);
    
    COMMIT;
END$$

-- Regenerar vidas automáticamente
DELIMITER $$
CREATE PROCEDURE RegenerateLives(
    IN p_usuario_aplicacion_key VARCHAR(150)
)
BEGIN
    DECLARE v_hours_passed INT DEFAULT 0;
    DECLARE v_current_lives INT DEFAULT 0;
    DECLARE v_max_lives INT DEFAULT 5;
    
    -- Obtener configuración de vidas máximas
    SELECT CAST(config_value AS UNSIGNED) INTO v_max_lives 
    FROM memoflip_config WHERE config_key = 'max_lives';
    
    -- Obtener vidas actuales y calcular horas pasadas
    SELECT 
        lives_current,
        TIMESTAMPDIFF(HOUR, lives_last_regen, NOW())
    INTO v_current_lives, v_hours_passed
    FROM memoflip_usuarios 
    WHERE usuario_aplicacion_key = p_usuario_aplicacion_key;
    
    -- Si han pasado horas y no tiene vidas máximas, regenerar
    IF v_hours_passed > 0 AND v_current_lives < v_max_lives THEN
        UPDATE memoflip_usuarios 
        SET 
            lives_current = LEAST(v_max_lives, v_current_lives + v_hours_passed),
            lives_last_regen = NOW()
        WHERE usuario_aplicacion_key = p_usuario_aplicacion_key;
    END IF;
END$$

-- Guardar resultado de partida
DELIMITER $$
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
    
    -- Insertar sesión de juego
    INSERT INTO memoflip_game_sessions 
    (usuario_aplicacion_key, level_id, pairs, time_seconds, moves_used, fails, coins_earned, completed, game_data)
    VALUES (p_usuario_aplicacion_key, p_level_id, p_pairs, p_time_seconds, p_moves_used, p_fails, p_coins_earned, p_completed, p_game_data);
    
    -- Solo procesar si completó el nivel
    IF p_completed THEN
        -- Verificar si es nuevo récord
        SELECT COALESCE(best_coins, 0) INTO v_current_best_coins
        FROM memoflip_level_records 
        WHERE usuario_aplicacion_key = p_usuario_aplicacion_key AND level_id = p_level_id;
        
        SET v_is_new_record = (p_coins_earned > v_current_best_coins);
        
        -- Actualizar o insertar récord del nivel
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
        
        -- Actualizar progreso del usuario
        UPDATE memoflip_usuarios SET
            max_level_unlocked = GREATEST(max_level_unlocked, p_level_id + 1),
            coins_total = IF(v_is_new_record, coins_total + (p_coins_earned - v_current_best_coins), coins_total)
        WHERE usuario_aplicacion_key = p_usuario_aplicacion_key;
    ELSE
        -- Solo incrementar intentos si no completó
        INSERT INTO memoflip_level_records 
        (usuario_aplicacion_key, level_id, times_played)
        VALUES (p_usuario_aplicacion_key, p_level_id, 1)
        ON DUPLICATE KEY UPDATE times_played = times_played + 1;
        
        -- Restar una vida
        UPDATE memoflip_usuarios SET
            lives_current = GREATEST(0, lives_current - 1)
        WHERE usuario_aplicacion_key = p_usuario_aplicacion_key;
    END IF;
    
    COMMIT;
END$$

DELIMITER ;

-- =========================================
-- ÍNDICES ADICIONALES PARA RENDIMIENTO
-- =========================================
CREATE INDEX idx_memoflip_usuarios_lives ON memoflip_usuarios(lives_current, lives_last_regen);
CREATE INDEX idx_memoflip_sessions_date_level ON memoflip_game_sessions(fecha_creacion, level_id);
CREATE INDEX idx_memoflip_records_coins_time ON memoflip_level_records(best_coins DESC, best_time_seconds ASC);
