<?php
/**
 * game.php - MemoFlip
 * Endpoints para guardar progreso, resultados de partidas y obtener datos del juego
 */

require_once '_common.php';

// ====================================
// ROUTER PRINCIPAL
// ====================================
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'save_progress':
            handle_save_progress($pdo, $input);
            break;
        
        case 'save_result':
            handle_save_result($pdo, $input);
            break;
        
        case 'use_life':
            handle_use_life($pdo);
            break;
        
        case 'update_settings':
            handle_update_settings($pdo, $input);
            break;
        
        default:
            handle_error('Acción no válida', 400);
    }
    
} elseif ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'get_progress':
            handle_get_progress($pdo);
            break;
        
        case 'get_level_stats':
            handle_get_level_stats($pdo);
            break;
        
        default:
            handle_error('Acción no válida', 400);
    }
    
} else {
    handle_error('Método no permitido', 405);
}

// ====================================
// FUNCIÓN: Guardar progreso general
// ====================================
function handle_save_progress($pdo, $input) {
    // Solo usuarios autenticados pueden guardar progreso
    require_login();
    
    try {
        $uakey = get_session_uakey();
        $max_level = intval($input['max_level_unlocked'] ?? 1);
        $coins = intval($input['coins_total'] ?? 0);
        $lives = intval($input['lives_current'] ?? 5);
        
        // Validaciones
        if ($max_level < 1 || $max_level > 1000) {
            throw new Exception('Nivel inválido');
        }
        
        if ($lives < 0 || $lives > 5) {
            throw new Exception('Número de vidas inválido');
        }
        
        // Actualizar progreso
        $stmt = $pdo->prepare("
            UPDATE memoflip_usuarios 
            SET max_level_unlocked = GREATEST(max_level_unlocked, ?),
                coins_total = ?,
                lives_current = ?
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$max_level, $coins, $lives, $uakey]);
        
        json_response([
            'success' => true,
            'message' => 'Progreso guardado correctamente'
        ]);
        
    } catch (Exception $e) {
        handle_error($e->getMessage(), 400, $e);
    }
}

// ====================================
// FUNCIÓN: Guardar resultado de partida
// ====================================
function handle_save_result($pdo, $input) {
    // Solo usuarios autenticados pueden guardar resultados
    require_login();
    
    try {
        $uakey = get_session_uakey();
        
        // Datos de la partida
        $level_id = intval($input['level_id'] ?? 0);
        $pairs = intval($input['pairs'] ?? 0);
        $time_seconds = intval($input['time_seconds'] ?? 0);
        $moves_used = intval($input['moves_used'] ?? 0);
        $fails = intval($input['fails'] ?? 0);
        $coins_earned = intval($input['coins_earned'] ?? 0);
        $completed = boolval($input['completed'] ?? false);
        $stars = intval($input['stars'] ?? 0);
        $game_data = json_encode($input['game_data'] ?? []);
        
        // Validaciones
        if ($level_id < 1 || $level_id > 1000) {
            throw new Exception('Nivel inválido');
        }
        
        $pdo->beginTransaction();
        
        try {
            // 1. Guardar sesión de juego
            $stmt = $pdo->prepare("
                INSERT INTO memoflip_game_sessions 
                (usuario_aplicacion_key, level_id, pairs, time_seconds, moves_used, fails, coins_earned, completed, game_data)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            $stmt->execute([
                $uakey, $level_id, $pairs, $time_seconds, $moves_used, 
                $fails, $coins_earned, $completed, $game_data
            ]);
            
            // 2. Si completó el nivel, actualizar récords
            if ($completed) {
                // Obtener récord actual
                $stmt = $pdo->prepare("
                    SELECT best_coins FROM memoflip_level_records 
                    WHERE usuario_aplicacion_key = ? AND level_id = ?
                ");
                $stmt->execute([$uakey, $level_id]);
                $record = $stmt->fetch();
                $current_best = $record ? $record['best_coins'] : 0;
                
                $is_new_record = ($coins_earned > $current_best);
                $coins_diff = $is_new_record ? ($coins_earned - $current_best) : 0;
                
                // Actualizar o insertar récord
                $stmt = $pdo->prepare("
                    INSERT INTO memoflip_level_records 
                    (usuario_aplicacion_key, level_id, best_coins, best_time_seconds, best_moves, times_played, times_completed, stars)
                    VALUES (?, ?, ?, ?, ?, 1, 1, ?)
                    ON DUPLICATE KEY UPDATE
                        best_coins = IF(? > best_coins, ?, best_coins),
                        best_time_seconds = IF(? > best_coins, ?, best_time_seconds),
                        best_moves = IF(? > best_coins, ?, best_moves),
                        stars = IF(? > stars, ?, stars),
                        times_played = times_played + 1,
                        times_completed = times_completed + 1,
                        fecha_mejor_record = IF(? > best_coins, NOW(), fecha_mejor_record)
                ");
                $stmt->execute([
                    $uakey, $level_id, $coins_earned, $time_seconds, $moves_used, $stars,
                    $coins_earned, $coins_earned,
                    $coins_earned, $time_seconds,
                    $coins_earned, $moves_used,
                    $stars, $stars,
                    $coins_earned
                ]);
                
                // 3. Actualizar progreso del usuario
                $stmt = $pdo->prepare("
                    UPDATE memoflip_usuarios 
                    SET max_level_unlocked = GREATEST(max_level_unlocked, ?),
                        coins_total = coins_total + ?
                    WHERE usuario_aplicacion_key = ?
                ");
                $stmt->execute([$level_id + 1, $coins_diff, $uakey]);
                
            } else {
                // Si falló, solo incrementar intentos y restar una vida
                $stmt = $pdo->prepare("
                    INSERT INTO memoflip_level_records 
                    (usuario_aplicacion_key, level_id, times_played)
                    VALUES (?, ?, 1)
                    ON DUPLICATE KEY UPDATE times_played = times_played + 1
                ");
                $stmt->execute([$uakey, $level_id]);
                
                $stmt = $pdo->prepare("
                    UPDATE memoflip_usuarios 
                    SET lives_current = GREATEST(0, lives_current - 1)
                    WHERE usuario_aplicacion_key = ?
                ");
                $stmt->execute([$uakey]);
            }
            
            $pdo->commit();
            
            // Obtener datos actualizados
            $stmt = $pdo->prepare("
                SELECT max_level_unlocked, coins_total, lives_current
                FROM memoflip_usuarios 
                WHERE usuario_aplicacion_key = ?
            ");
            $stmt->execute([$uakey]);
            $userData = $stmt->fetch();
            
            json_response([
                'success' => true,
                'message' => $completed ? 'Nivel completado' : 'Intento registrado',
                'is_new_record' => $is_new_record ?? false,
                'game_data' => [
                    'max_level_unlocked' => $userData['max_level_unlocked'],
                    'coins_total' => $userData['coins_total'],
                    'lives_current' => $userData['lives_current']
                ]
            ]);
            
        } catch (Exception $e) {
            $pdo->rollBack();
            throw $e;
        }
        
    } catch (Exception $e) {
        handle_error($e->getMessage(), 400, $e);
    }
}

// ====================================
// FUNCIÓN: Usar una vida
// ====================================
function handle_use_life($pdo) {
    require_login();
    
    try {
        $uakey = get_session_uakey();
        
        // Restar una vida
        $stmt = $pdo->prepare("
            UPDATE memoflip_usuarios 
            SET lives_current = GREATEST(0, lives_current - 1)
            WHERE usuario_aplicacion_key = ? AND lives_current > 0
        ");
        $stmt->execute([$uakey]);
        
        if ($stmt->rowCount() === 0) {
            throw new Exception('No tienes vidas disponibles');
        }
        
        // Obtener vidas actuales
        $stmt = $pdo->prepare("
            SELECT lives_current FROM memoflip_usuarios 
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$uakey]);
        $data = $stmt->fetch();
        
        json_response([
            'success' => true,
            'lives_current' => $data['lives_current']
        ]);
        
    } catch (Exception $e) {
        handle_error($e->getMessage(), 400, $e);
    }
}

// ====================================
// FUNCIÓN: Actualizar configuración
// ====================================
function handle_update_settings($pdo, $input) {
    require_login();
    
    try {
        $uakey = get_session_uakey();
        $sound_enabled = boolval($input['sound_enabled'] ?? true);
        
        $stmt = $pdo->prepare("
            UPDATE memoflip_usuarios 
            SET sound_enabled = ?
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$sound_enabled, $uakey]);
        
        json_response([
            'success' => true,
            'message' => 'Configuración actualizada'
        ]);
        
    } catch (Exception $e) {
        handle_error($e->getMessage(), 400, $e);
    }
}

// ====================================
// FUNCIÓN: Obtener progreso
// ====================================
function handle_get_progress($pdo) {
    require_login();
    
    try {
        $uakey = get_session_uakey();
        
        // Regenerar vidas antes de obtener datos
        regenerate_lives($pdo, $uakey);
        
        $stmt = $pdo->prepare("
            SELECT max_level_unlocked, coins_total, lives_current, sound_enabled,
                   lives_last_regen
            FROM memoflip_usuarios 
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$uakey]);
        $data = $stmt->fetch();
        
        if (!$data) {
            create_memoflip_user($pdo, $uakey);
            $data = [
                'max_level_unlocked' => 1,
                'coins_total' => 0,
                'lives_current' => 5,
                'sound_enabled' => true
            ];
        }
        
        json_response([
            'success' => true,
            'game_data' => [
                'max_level_unlocked' => $data['max_level_unlocked'],
                'coins_total' => $data['coins_total'],
                'lives_current' => $data['lives_current'],
                'sound_enabled' => (bool)$data['sound_enabled']
            ]
        ]);
        
    } catch (Exception $e) {
        handle_error('Error al obtener progreso', 500, $e);
    }
}

// ====================================
// FUNCIÓN: Obtener estadísticas de un nivel
// ====================================
function handle_get_level_stats($pdo) {
    require_login();
    
    try {
        $uakey = get_session_uakey();
        $level_id = intval($_GET['level_id'] ?? 0);
        
        if ($level_id < 1 || $level_id > 1000) {
            throw new Exception('Nivel inválido');
        }
        
        $stmt = $pdo->prepare("
            SELECT best_coins, best_time_seconds, best_moves, 
                   times_played, times_completed, stars
            FROM memoflip_level_records 
            WHERE usuario_aplicacion_key = ? AND level_id = ?
        ");
        $stmt->execute([$uakey, $level_id]);
        $stats = $stmt->fetch();
        
        if (!$stats) {
            json_response([
                'success' => true,
                'played' => false,
                'stats' => null
            ]);
        } else {
            json_response([
                'success' => true,
                'played' => true,
                'stats' => $stats
            ]);
        }
        
    } catch (Exception $e) {
        handle_error('Error al obtener estadísticas', 500, $e);
    }
}
?>

