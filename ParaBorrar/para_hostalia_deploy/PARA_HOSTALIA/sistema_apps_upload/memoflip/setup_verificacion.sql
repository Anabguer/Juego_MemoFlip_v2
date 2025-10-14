-- =========================================
-- AGREGAR SISTEMA DE VERIFICACIÓN POR EMAIL
-- MemoFlip - Columnas correctas
-- =========================================

-- Verificar si las columnas existen y agregarlas si no
SET @dbname = '9606966_sistema_apps_db';

-- Agregar verification_code
SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA=@dbname
        AND TABLE_NAME='usuarios_aplicaciones'
        AND COLUMN_NAME='verification_code') = 0,
    'ALTER TABLE usuarios_aplicaciones ADD COLUMN verification_code VARCHAR(10) DEFAULT NULL COMMENT "Código de verificación de 6 dígitos"',
    'SELECT "Column verification_code already exists" AS message'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar verification_expiry
SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA=@dbname
        AND TABLE_NAME='usuarios_aplicaciones'
        AND COLUMN_NAME='verification_expiry') = 0,
    'ALTER TABLE usuarios_aplicaciones ADD COLUMN verification_expiry DATETIME DEFAULT NULL COMMENT "Fecha de expiración del código"',
    'SELECT "Column verification_expiry already exists" AS message'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Agregar verified_at
SET @s = (SELECT IF(
    (SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA=@dbname
        AND TABLE_NAME='usuarios_aplicaciones'
        AND COLUMN_NAME='verified_at') = 0,
    'ALTER TABLE usuarios_aplicaciones ADD COLUMN verified_at DATETIME DEFAULT NULL COMMENT "Fecha cuando se verificó el email"',
    'SELECT "Column verified_at already exists" AS message'
));
PREPARE stmt FROM @s;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Marcar usuarios existentes como verificados (ya están activos)
UPDATE usuarios_aplicaciones 
SET verified_at = fecha_creacion
WHERE activo = 1 AND verified_at IS NULL;

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_verification_code ON usuarios_aplicaciones(verification_code);
CREATE INDEX IF NOT EXISTS idx_verified_at ON usuarios_aplicaciones(verified_at);

-- Mostrar resultados
SELECT 
    'Setup completado' AS mensaje,
    COUNT(*) AS usuarios_totales,
    SUM(CASE WHEN verified_at IS NOT NULL THEN 1 ELSE 0 END) AS usuarios_verificados,
    SUM(CASE WHEN verified_at IS NULL THEN 1 ELSE 0 END) AS usuarios_pendientes
FROM usuarios_aplicaciones
WHERE app_codigo = 'memoflip';

