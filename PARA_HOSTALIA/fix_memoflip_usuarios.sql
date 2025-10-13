-- =========================================
-- AJUSTAR TABLA memoflip_usuarios
-- =========================================

-- 1. Cambiar valor por defecto de vidas de 5 a 3
ALTER TABLE memoflip_usuarios 
MODIFY COLUMN lives_current INT DEFAULT 3;

-- 2. Añadir campo total_score que falta
ALTER TABLE memoflip_usuarios 
ADD COLUMN total_score INT DEFAULT 0 AFTER coins_total;

-- 3. Actualizar usuarios existentes para que tengan 3 vidas
UPDATE memoflip_usuarios 
SET lives_current = 3 
WHERE lives_current = 5;

-- 4. Verificar cambios
SELECT 
    usuario_aplicacion_key,
    max_level_unlocked,
    coins_total,
    total_score,
    lives_current,
    sound_enabled
FROM memoflip_usuarios 
LIMIT 5;

