<?php
/**
 * API del Juego MemoFlip - Hostalia
 * Estructura: sistema_apps_api/memoflip/
 */

require_once 'config.php';

// Headers
header('Content-Type: application/json');

// Obtener método y datos
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Niveles hardcodeados para MemoFlip (hasta que se suban los assets)
function getLevelsData() {
    return [
        ['id' => 1, 'pairs' => 2, 'time_sec' => 0, 'tags' => [], 'note' => 'tutorial', 'chapter' => 1],
        ['id' => 2, 'pairs' => 2, 'time_sec' => 0, 'tags' => [], 'note' => 'tutorial', 'chapter' => 1],
        ['id' => 3, 'pairs' => 3, 'time_sec' => 0, 'tags' => [], 'note' => 'tutorial', 'chapter' => 1],
        ['id' => 4, 'pairs' => 3, 'time_sec' => 45, 'tags' => ['crono'], 'note' => 'primer cronómetro', 'chapter' => 1],
        ['id' => 5, 'pairs' => 4, 'time_sec' => 0, 'tags' => [], 'note' => 'respiro', 'chapter' => 1],
        ['id' => 6, 'pairs' => 4, 'time_sec' => 50, 'tags' => ['crono'], 'note' => '', 'chapter' => 1],
        ['id' => 7, 'pairs' => 3, 'time_sec' => 0, 'tags' => ['niebla'], 'note' => 'primera niebla', 'chapter' => 1],
        ['id' => 8, 'pairs' => 5, 'time_sec' => 0, 'tags' => [], 'note' => '', 'chapter' => 1],
        ['id' => 9, 'pairs' => 4, 'time_sec' => 55, 'tags' => ['crono', 'niebla'], 'note' => 'combinación', 'chapter' => 1],
        ['id' => 10, 'pairs' => 6, 'time_sec' => 65, 'tags' => ['crono'], 'note' => 'nivel pico', 'chapter' => 1],
        ['id' => 11, 'pairs' => 3, 'time_sec' => 0, 'tags' => ['barajar'], 'note' => 'primer barajar', 'chapter' => 1],
        ['id' => 12, 'pairs' => 5, 'time_sec' => 0, 'tags' => [], 'note' => 'respiro', 'chapter' => 1],
        ['id' => 13, 'pairs' => 4, 'time_sec' => 50, 'tags' => ['crono', 'barajar'], 'note' => '', 'chapter' => 1],
        ['id' => 14, 'pairs' => 6, 'time_sec' => 0, 'tags' => ['niebla'], 'note' => '', 'chapter' => 1],
        ['id' => 15, 'pairs' => 7, 'time_sec' => 70, 'tags' => ['crono'], 'note' => 'nivel medio', 'chapter' => 1],
        ['id' => 16, 'pairs' => 4, 'time_sec' => 0, 'tags' => ['triple'], 'note' => 'primer triple', 'chapter' => 1],
        ['id' => 17, 'pairs' => 5, 'time_sec' => 0, 'tags' => ['camaleon'], 'note' => 'primer camaleón', 'chapter' => 1],
        ['id' => 18, 'pairs' => 6, 'time_sec' => 65, 'tags' => ['crono', 'camaleon'], 'note' => '', 'chapter' => 1],
        ['id' => 19, 'pairs' => 3, 'time_sec' => 0, 'tags' => ['triple', 'niebla'], 'note' => 'triple + niebla', 'chapter' => 1],
        ['id' => 20, 'pairs' => 8, 'time_sec' => 80, 'tags' => ['crono'], 'note' => 'final tutorial', 'chapter' => 1],
        ['id' => 21, 'pairs' => 5, 'time_sec' => 0, 'tags' => ['trampa'], 'note' => 'primera trampa', 'chapter' => 1],
        ['id' => 22, 'pairs' => 6, 'time_sec' => 0, 'tags' => ['bomba'], 'note' => 'primera bomba', 'chapter' => 1],
        ['id' => 23, 'pairs' => 7, 'time_sec' => 70, 'tags' => ['crono', 'bomba'], 'note' => 'bomba + crono', 'chapter' => 1],
        ['id' => 24, 'pairs' => 4, 'time_sec' => 0, 'tags' => ['triple', 'camaleon'], 'note' => '', 'chapter' => 1],
        ['id' => 25, 'pairs' => 9, 'time_sec' => 85, 'tags' => ['crono'], 'note' => 'nivel grande', 'chapter' => 1],
        ['id' => 26, 'pairs' => 6, 'time_sec' => 0, 'tags' => ['niebla', 'barajar'], 'note' => '', 'chapter' => 1],
        ['id' => 27, 'pairs' => 8, 'time_sec' => 80, 'tags' => ['crono', 'trampa'], 'note' => '', 'chapter' => 1],
        ['id' => 28, 'pairs' => 5, 'time_sec' => 0, 'tags' => ['triple', 'bomba'], 'note' => '', 'chapter' => 1],
        ['id' => 29, 'pairs' => 10, 'time_sec' => 95, 'tags' => ['crono', 'camaleon'], 'note' => 'preparación boss', 'chapter' => 1],
        ['id' => 30, 'pairs' => 7, 'time_sec' => 0, 'tags' => ['fantasma'], 'note' => 'primer fantasma', 'chapter' => 1],
        ['id' => 31, 'pairs' => 8, 'time_sec' => 0, 'tags' => ['comodin'], 'note' => 'primer comodín', 'chapter' => 1],
        ['id' => 32, 'pairs' => 9, 'time_sec' => 85, 'tags' => ['crono', 'fantasma'], 'note' => '', 'chapter' => 1],
        ['id' => 33, 'pairs' => 6, 'time_sec' => 0, 'tags' => ['espejo'], 'note' => 'primer espejo', 'chapter' => 1],
        ['id' => 34, 'pairs' => 11, 'time_sec' => 100, 'tags' => ['crono', 'comodin'], 'note' => '', 'chapter' => 1],
        ['id' => 35, 'pairs' => 7, 'time_sec' => 0, 'tags' => ['triple', 'espejo'], 'note' => '', 'chapter' => 1],
        ['id' => 36, 'pairs' => 10, 'time_sec' => 90, 'tags' => ['crono', 'niebla', 'barajar'], 'note' => 'triple mecánica', 'chapter' => 1],
        ['id' => 37, 'pairs' => 8, 'time_sec' => 0, 'tags' => ['camaleon', 'trampa'], 'note' => '', 'chapter' => 1],
        ['id' => 38, 'pairs' => 12, 'time_sec' => 110, 'tags' => ['crono', 'bomba'], 'note' => 'nivel grande', 'chapter' => 1],
        ['id' => 39, 'pairs' => 9, 'time_sec' => 0, 'tags' => ['triple', 'fantasma', 'comodin'], 'note' => 'preparación final', 'chapter' => 1],
        ['id' => 40, 'pairs' => 6, 'time_sec' => 65, 'tags' => ['crono', 'espejo', 'camaleon'], 'note' => '', 'chapter' => 1],
        ['id' => 41, 'pairs' => 11, 'time_sec' => 0, 'tags' => ['niebla', 'trampa'], 'note' => '', 'chapter' => 1],
        ['id' => 42, 'pairs' => 10, 'time_sec' => 95, 'tags' => ['crono', 'barajar', 'bomba'], 'note' => '', 'chapter' => 1],
        ['id' => 43, 'pairs' => 8, 'time_sec' => 0, 'tags' => ['triple', 'espejo', 'fantasma'], 'note' => '', 'chapter' => 1],
        ['id' => 44, 'pairs' => 12, 'time_sec' => 115, 'tags' => ['crono', 'camaleon', 'comodin'], 'note' => '', 'chapter' => 1],
        ['id' => 45, 'pairs' => 9, 'time_sec' => 0, 'tags' => ['niebla', 'trampa', 'bomba'], 'note' => '', 'chapter' => 1],
        ['id' => 46, 'pairs' => 11, 'time_sec' => 100, 'tags' => ['crono', 'fantasma', 'espejo'], 'note' => '', 'chapter' => 1],
        ['id' => 47, 'pairs' => 7, 'time_sec' => 0, 'tags' => ['triple', 'barajar', 'comodin'], 'note' => '', 'chapter' => 1],
        ['id' => 48, 'pairs' => 12, 'time_sec' => 120, 'tags' => ['crono', 'niebla', 'camaleon', 'bomba'], 'note' => 'pre-boss', 'chapter' => 1],
        ['id' => 49, 'pairs' => 10, 'time_sec' => 0, 'tags' => ['triple', 'trampa', 'fantasma', 'espejo'], 'note' => 'pre-boss', 'chapter' => 1],
        ['id' => 50, 'pairs' => 12, 'time_sec' => 150, 'tags' => ['boss', 'crono', 'niebla', 'barajar', 'camaleon', 'bomba'], 'note' => 'BOSS OCÉANO', 'chapter' => 1],
        ['id' => 51, 'pairs' => 3, 'time_sec' => 0, 'tags' => [], 'note' => 'nuevo capítulo', 'chapter' => 2],
        ['id' => 52, 'pairs' => 4, 'time_sec' => 50, 'tags' => ['crono'], 'note' => '', 'chapter' => 2],
        ['id' => 53, 'pairs' => 5, 'time_sec' => 0, 'tags' => ['niebla'], 'note' => '', 'chapter' => 2],
        ['id' => 54, 'pairs' => 6, 'time_sec' => 65, 'tags' => ['crono', 'barajar'], 'note' => '', 'chapter' => 2],
        ['id' => 55, 'pairs' => 4, 'time_sec' => 0, 'tags' => ['triple', 'camaleon'], 'note' => '', 'chapter' => 2]
    ];
}

// Router de endpoints
switch ($method) {
    case 'POST':
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'save_result':
                try {
                    $user_key = $input['user_key'] ?? '';
                    $level_id = (int)($input['level_id'] ?? 0);
                    $pairs = (int)($input['pairs'] ?? 0);
                    $time_seconds = (int)($input['time_seconds'] ?? 0);
                    $moves_used = (int)($input['moves_used'] ?? 0);
                    $fails = (int)($input['fails'] ?? 0);
                    $coins_earned = (int)($input['coins_earned'] ?? 0);
                    $completed = (bool)($input['completed'] ?? false);
                    $game_data = $input['game_data'] ?? [];
                    
                    validateUserKey($user_key);
                    
                    if ($level_id <= 0 || $pairs <= 0) {
                        throw new Exception('Datos de nivel inválidos');
                    }
                    
                    // Solo guardar en BD si no es invitado y existe la tabla
                    if (strpos($user_key, 'guest_') === false) {
                        // Verificar si existe la tabla
                        $stmt = $pdo->prepare("SHOW TABLES LIKE 'memoflip_usuarios'");
                        $stmt->execute();
                        
                        if ($stmt->rowCount() > 0) {
                            // Guardar resultado simplificado
                            $stmt = $pdo->prepare("
                                INSERT INTO memoflip_game_sessions 
                                (usuario_aplicacion_key, level_id, pairs, time_seconds, moves_used, fails, coins_earned, completed, game_data)
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                            ");
                            $stmt->execute([
                                $user_key, $level_id, $pairs, $time_seconds, $moves_used, 
                                $fails, $coins_earned, $completed, json_encode($game_data)
                            ]);
                            
                            // Actualizar usuario
                            if ($completed) {
                                $stmt = $pdo->prepare("
                                    UPDATE memoflip_usuarios 
                                    SET max_level_unlocked = GREATEST(max_level_unlocked, ?),
                                        coins_total = coins_total + ?
                                    WHERE usuario_aplicacion_key = ?
                                ");
                                $stmt->execute([$level_id + 1, $coins_earned, $user_key]);
                            } else {
                                $stmt = $pdo->prepare("
                                    UPDATE memoflip_usuarios 
                                    SET lives_current = GREATEST(0, lives_current - 1)
                                    WHERE usuario_aplicacion_key = ?
                                ");
                                $stmt->execute([$user_key]);
                            }
                        }
                        
                        echo json_encode([
                            'success' => true,
                            'message' => 'Resultado guardado correctamente',
                            'updated_data' => [
                                'max_level_unlocked' => $completed ? $level_id + 1 : $level_id,
                                'coins_total' => $coins_earned,
                                'lives_current' => $completed ? 5 : 4
                            ]
                        ]);
                    } else {
                        // Usuario invitado - solo confirmar
                        echo json_encode([
                            'success' => true,
                            'message' => 'Resultado procesado (usuario invitado)',
                            'updated_data' => [
                                'max_level_unlocked' => $completed ? $level_id + 1 : $level_id,
                                'coins_total' => $coins_earned,
                                'lives_current' => $completed ? 5 : 4
                            ]
                        ]);
                    }
                    
                } catch (Exception $e) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Acción no válida']);
                break;
        }
        break;
        
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'levels':
                try {
                    // Cargar niveles hardcodeados
                    $levels = getLevelsData();
                    
                    // Filtrar por capítulo si se especifica
                    $chapter = (int)($_GET['chapter'] ?? 0);
                    if ($chapter > 0) {
                        $levels = array_filter($levels, function($level) use ($chapter) {
                            return $level['chapter'] == $chapter;
                        });
                        $levels = array_values($levels); // Reindexar
                    }
                    
                    echo json_encode([
                        'success' => true,
                        'levels' => $levels
                    ]);
                    
                } catch (Exception $e) {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            case 'user_stats':
                try {
                    $user_key = $_GET['user_key'] ?? '';
                    validateUserKey($user_key);
                    
                    if (strpos($user_key, 'guest_') !== false) {
                        // Usuario invitado - datos por defecto
                        echo json_encode([
                            'success' => true,
                            'stats' => [
                                'max_level_unlocked' => 1,
                                'coins_total' => 0,
                                'lives_current' => 5,
                                'levels_completed' => 0,
                                'total_stars' => 0,
                                'avg_time' => 0,
                                'ranking_position' => null
                            ]
                        ]);
                        break;
                    }
                    
                    // Verificar si existe la tabla
                    $stmt = $pdo->prepare("SHOW TABLES LIKE 'memoflip_usuarios'");
                    $stmt->execute();
                    
                    if ($stmt->rowCount() > 0) {
                        // Regenerar vidas
                        regenerateLives($pdo, $user_key);
                        
                        // Obtener estadísticas del usuario
                        $stmt = $pdo->prepare("
                            SELECT max_level_unlocked, coins_total, lives_current
                            FROM memoflip_usuarios 
                            WHERE usuario_aplicacion_key = ?
                        ");
                        $stmt->execute([$user_key]);
                        $stats = $stmt->fetch();
                        
                        if (!$stats) {
                            // Crear usuario si no existe
                            createMemoFlipUser($pdo, $user_key);
                            $stats = [
                                'max_level_unlocked' => 1,
                                'coins_total' => 0,
                                'lives_current' => 5
                            ];
                        }
                        
                        $stats['levels_completed'] = 0;
                        $stats['total_stars'] = 0;
                        $stats['avg_time'] = 0;
                        $stats['ranking_position'] = null;
                        
                        echo json_encode([
                            'success' => true,
                            'stats' => $stats
                        ]);
                    } else {
                        // Tabla no existe aún
                        echo json_encode([
                            'success' => true,
                            'stats' => [
                                'max_level_unlocked' => 1,
                                'coins_total' => 0,
                                'lives_current' => 5,
                                'levels_completed' => 0,
                                'total_stars' => 0,
                                'avg_time' => 0,
                                'ranking_position' => null
                            ]
                        ]);
                    }
                    
                } catch (Exception $e) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Acción no válida']);
                break;
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
?>
