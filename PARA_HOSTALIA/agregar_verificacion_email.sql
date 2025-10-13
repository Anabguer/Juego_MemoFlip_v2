-- =========================================
-- AGREGAR SISTEMA DE VERIFICACIÓN POR EMAIL
-- =========================================
-- Para la tabla usuarios_aplicaciones existente

-- Agregar columnas de verificación
ALTER TABLE usuarios_aplicaciones 
ADD COLUMN IF NOT EXISTS email_verificado TINYINT(1) DEFAULT 0 COMMENT 'Si el email está verificado',
ADD COLUMN IF NOT EXISTS codigo_verificacion VARCHAR(10) DEFAULT NULL COMMENT 'Código de verificación de 6 dígitos',
ADD COLUMN IF NOT EXISTS tiempo_verificacion TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp cuando se generó el código',
ADD COLUMN IF NOT EXISTS intentos_verificacion INT DEFAULT 0 COMMENT 'Número de intentos fallidos';

-- Índice para búsquedas rápidas
ALTER TABLE usuarios_aplicaciones 
ADD INDEX IF NOT EXISTS idx_email_verificado (email_verificado),
ADD INDEX IF NOT EXISTS idx_codigo_verificacion (codigo_verificacion);

-- Los usuarios existentes se marcan como verificados (ya están activos)
UPDATE usuarios_aplicaciones 
SET email_verificado = 1 
WHERE activo = 1 AND email_verificado = 0;

