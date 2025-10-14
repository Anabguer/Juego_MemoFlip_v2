<?php
/**
 * API del Juego MemoFlip
 * Gestión de partidas, progreso y puntuación
 */

// Configuración
require_once '../config/database.php';
require_once '../config/app_config_memoflip.php';

// Headers para CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Conexión a la base de datos
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NOMBRE . ";charset=utf8",
        DB_USUARIO,
        DB_CONTRA,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

// Obtener método y datos
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Función para validar user_key
function validateUserKey($user_key) {
    if (empty($user_key)) {
        throw new Exception('user_key requerido');
    }
    
    // Validar formato
    if (strpos($user_key, '_memoflip') === false && strpos($user_key, 'guest_') !== 0) {
        throw new Exception('user_key inválido');
    }
    
    return true;
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
                    
                    // Solo guardar en BD si no es invitado
                    if (strpos($user_key, 'guest_') === false) {
                        $stmt = $pdo->prepare("CALL SaveGameResult(?, ?, ?, ?, ?, ?, ?, ?, ?)");
                        $stmt->execute([
                            $user_key,
                            $level_id,
                            $pairs,
                            $time_seconds,
                            $moves_used,
                            $fails,
                            $coins_earned,
                            $completed,
                            json_encode($game_data)
                        ]);
                        
                        // Obtener datos actualizados del usuario
                        $stmt = $pdo->prepare("
                            SELECT max_level_unlocked, coins_total, lives_current 
                            FROM memoflip_usuarios 
                            WHERE usuario_aplicacion_key = ?
                        ");
                        $stmt->execute([$user_key]);
                        $userData = $stmt->fetch();
                        
                        echo json_encode([
                            'success' => true,
                            'message' => 'Resultado guardado correctamente',
                            'updated_data' => [
                                'max_level_unlocked' => $userData['max_level_unlocked'] ?? 1,
                                'coins_total' => $userData['coins_total'] ?? 0,
                                'lives_current' => $userData['lives_current'] ?? 5
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
                
            case 'update_progress':
                try {
                    $user_key = $input['user_key'] ?? '';
                    $max_level = (int)($input['max_level_unlocked'] ?? 1);
                    $coins_total = (int)($input['coins_total'] ?? 0);
                    $lives_current = (int)($input['lives_current'] ?? 5);
                    $sound_enabled = (bool)($input['sound_enabled'] ?? true);
                    
                    validateUserKey($user_key);
                    
                    // Solo actualizar en BD si no es invitado
                    if (strpos($user_key, 'guest_') === false) {
                        // Crear usuario si no existe
                        $stmt = $pdo->prepare("
                            INSERT INTO memoflip_usuarios 
                            (usuario_aplicacion_key, max_level_unlocked, coins_total, lives_current, sound_enabled)
                            VALUES (?, ?, ?, ?, ?)
                            ON DUPLICATE KEY UPDATE
                                max_level_unlocked = GREATEST(max_level_unlocked, VALUES(max_level_unlocked)),
                                coins_total = VALUES(coins_total),
                                lives_current = VALUES(lives_current),
                                sound_enabled = VALUES(sound_enabled)
                        ");
                        $stmt->execute([$user_key, $max_level, $coins_total, $lives_current, $sound_enabled]);
                    }
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Progreso actualizado correctamente'
                    ]);
                    
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
                    
                    // Regenerar vidas
                    $stmt = $pdo->prepare("CALL RegenerateLives(?)");
                    $stmt->execute([$user_key]);
                    
                    // Obtener estadísticas del usuario
                    $stmt = $pdo->prepare("
                        SELECT 
                            u.max_level_unlocked,
                            u.coins_total,
                            u.lives_current,
                            COUNT(lr.record_id) as levels_completed,
                            COALESCE(SUM(lr.stars), 0) as total_stars,
                            COALESCE(AVG(lr.best_time_seconds), 0) as avg_time
                        FROM memoflip_usuarios u
                        LEFT JOIN memoflip_level_records lr ON u.usuario_aplicacion_key = lr.usuario_aplicacion_key 
                            AND lr.times_completed > 0
                        WHERE u.usuario_aplicacion_key = ?
                        GROUP BY u.usuario_aplicacion_key
                    ");
                    $stmt->execute([$user_key]);
                    $stats = $stmt->fetch();
                    
                    if (!$stats) {
                        // Crear usuario si no existe
                        $stmt = $pdo->prepare("
                            INSERT IGNORE INTO memoflip_usuarios (usuario_aplicacion_key) 
                            VALUES (?)
                        ");
                        $stmt->execute([$user_key]);
                        
                        $stats = [
                            'max_level_unlocked' => 1,
                            'coins_total' => 0,
                            'lives_current' => 5,
                            'levels_completed' => 0,
                            'total_stars' => 0,
                            'avg_time' => 0
                        ];
                    }
                    
                    // Obtener posición en ranking
                    $stmt = $pdo->prepare("
                        SELECT ranking_position 
                        FROM memoflip_ranking 
                        WHERE usuario_aplicacion_key = ?
                    ");
                    $stmt->execute([$user_key]);
                    $ranking = $stmt->fetch();
                    
                    $stats['ranking_position'] = $ranking['ranking_position'] ?? null;
                    
                    echo json_encode([
                        'success' => true,
                        'stats' => $stats
                    ]);
                    
                } catch (Exception $e) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            case 'level_record':
                try {
                    $user_key = $_GET['user_key'] ?? '';
                    $level_id = (int)($_GET['level_id'] ?? 0);
                    
                    validateUserKey($user_key);
                    
                    if ($level_id <= 0) {
                        throw new Exception('level_id inválido');
                    }
                    
                    if (strpos($user_key, 'guest_') !== false) {
                        // Usuario invitado - sin records
                        echo json_encode([
                            'success' => true,
                            'record' => null
                        ]);
                        break;
                    }
                    
                    // Obtener record del nivel
                    $stmt = $pdo->prepare("
                        SELECT * FROM memoflip_level_records 
                        WHERE usuario_aplicacion_key = ? AND level_id = ?
                    ");
                    $stmt->execute([$user_key, $level_id]);
                    $record = $stmt->fetch();
                    
                    echo json_encode([
                        'success' => true,
                        'record' => $record
                    ]);
                    
                } catch (Exception $e) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            case 'levels':
                try {
                    // Cargar niveles desde JSON
                    $levelsFile = '../assets/levels.json';
                    if (!file_exists($levelsFile)) {
                        throw new Exception('Archivo de niveles no encontrado');
                    }
                    
                    $levels = json_decode(file_get_contents($levelsFile), true);
                    if (!$levels) {
                        throw new Exception('Error cargando niveles');
                    }
                    
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
