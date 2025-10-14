<?php
/**
 * API de Ranking para MemoFlip
 * Gestión del ranking global y estadísticas
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

// Router de endpoints
switch ($method) {
    case 'GET':
        $action = $_GET['action'] ?? 'global';
        
        switch ($action) {
            case 'global':
                try {
                    $limit = min((int)($_GET['limit'] ?? 50), 100); // Máximo 100
                    $offset = max((int)($_GET['offset'] ?? 0), 0);
                    
                    // Obtener ranking global
                    $stmt = $pdo->prepare("
                        SELECT 
                            usuario_aplicacion_key,
                            email,
                            nombre,
                            max_level_unlocked,
                            coins_total,
                            levels_completed,
                            total_stars,
                            ROUND(avg_time, 1) as avg_time,
                            registro_fecha,
                            ranking_position
                        FROM memoflip_ranking 
                        ORDER BY ranking_position
                        LIMIT ? OFFSET ?
                    ");
                    $stmt->execute([$limit, $offset]);
                    $ranking = $stmt->fetchAll();
                    
                    // Obtener total de jugadores
                    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM memoflip_ranking");
                    $stmt->execute();
                    $total = $stmt->fetch()['total'];
                    
                    echo json_encode([
                        'success' => true,
                        'ranking' => $ranking,
                        'pagination' => [
                            'total' => (int)$total,
                            'limit' => $limit,
                            'offset' => $offset,
                            'has_more' => ($offset + $limit) < $total
                        ]
                    ]);
                    
                } catch (Exception $e) {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            case 'user_position':
                try {
                    $user_key = $_GET['user_key'] ?? '';
                    
                    if (empty($user_key)) {
                        throw new Exception('user_key requerido');
                    }
                    
                    if (strpos($user_key, 'guest_') !== false) {
                        // Usuario invitado - sin posición
                        echo json_encode([
                            'success' => true,
                            'position' => null,
                            'total_players' => 0
                        ]);
                        break;
                    }
                    
                    // Obtener posición del usuario
                    $stmt = $pdo->prepare("
                        SELECT 
                            ranking_position,
                            max_level_unlocked,
                            coins_total,
                            levels_completed,
                            total_stars
                        FROM memoflip_ranking 
                        WHERE usuario_aplicacion_key = ?
                    ");
                    $stmt->execute([$user_key]);
                    $userRanking = $stmt->fetch();
                    
                    // Obtener total de jugadores
                    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM memoflip_ranking");
                    $stmt->execute();
                    $totalPlayers = $stmt->fetch()['total'];
                    
                    if ($userRanking) {
                        echo json_encode([
                            'success' => true,
                            'position' => (int)$userRanking['ranking_position'],
                            'total_players' => (int)$totalPlayers,
                            'user_stats' => [
                                'max_level_unlocked' => (int)$userRanking['max_level_unlocked'],
                                'coins_total' => (int)$userRanking['coins_total'],
                                'levels_completed' => (int)$userRanking['levels_completed'],
                                'total_stars' => (int)$userRanking['total_stars']
                            ]
                        ]);
                    } else {
                        echo json_encode([
                            'success' => true,
                            'position' => null,
                            'total_players' => (int)$totalPlayers,
                            'message' => 'Usuario no encontrado en el ranking'
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
                
            case 'top_by_level':
                try {
                    $level_id = (int)($_GET['level_id'] ?? 0);
                    $limit = min((int)($_GET['limit'] ?? 10), 50);
                    
                    if ($level_id <= 0) {
                        throw new Exception('level_id inválido');
                    }
                    
                    // Obtener mejores puntuaciones del nivel
                    $stmt = $pdo->prepare("
                        SELECT 
                            lr.usuario_aplicacion_key,
                            ua.nombre,
                            lr.best_coins,
                            lr.best_time_seconds,
                            lr.best_moves,
                            lr.stars,
                            lr.fecha_mejor_record
                        FROM memoflip_level_records lr
                        JOIN usuarios_aplicaciones ua ON lr.usuario_aplicacion_key = ua.usuario_aplicacion_key
                        WHERE lr.level_id = ? AND lr.times_completed > 0
                        ORDER BY lr.best_coins DESC, lr.best_time_seconds ASC
                        LIMIT ?
                    ");
                    $stmt->execute([$level_id, $limit]);
                    $topScores = $stmt->fetchAll();
                    
                    echo json_encode([
                        'success' => true,
                        'level_id' => $level_id,
                        'top_scores' => $topScores
                    ]);
                    
                } catch (Exception $e) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            case 'stats':
                try {
                    // Estadísticas generales del juego
                    $stats = [];
                    
                    // Total de jugadores
                    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM memoflip_usuarios");
                    $stmt->execute();
                    $stats['total_players'] = (int)$stmt->fetch()['total'];
                    
                    // Total de partidas jugadas
                    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM memoflip_game_sessions");
                    $stmt->execute();
                    $stats['total_games'] = (int)$stmt->fetch()['total'];
                    
                    // Partidas completadas
                    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM memoflip_game_sessions WHERE completed = 1");
                    $stmt->execute();
                    $stats['completed_games'] = (int)$stmt->fetch()['total'];
                    
                    // Nivel más alto alcanzado
                    $stmt = $pdo->prepare("SELECT MAX(max_level_unlocked) as max_level FROM memoflip_usuarios");
                    $stmt->execute();
                    $stats['highest_level'] = (int)$stmt->fetch()['max_level'];
                    
                    // Total de monedas en el juego
                    $stmt = $pdo->prepare("SELECT SUM(coins_total) as total_coins FROM memoflip_usuarios");
                    $stmt->execute();
                    $stats['total_coins'] = (int)$stmt->fetch()['total_coins'];
                    
                    // Nivel más jugado
                    $stmt = $pdo->prepare("
                        SELECT level_id, COUNT(*) as plays 
                        FROM memoflip_game_sessions 
                        GROUP BY level_id 
                        ORDER BY plays DESC 
                        LIMIT 1
                    ");
                    $stmt->execute();
                    $mostPlayed = $stmt->fetch();
                    $stats['most_played_level'] = [
                        'level_id' => (int)($mostPlayed['level_id'] ?? 1),
                        'plays' => (int)($mostPlayed['plays'] ?? 0)
                    ];
                    
                    // Tasa de éxito promedio
                    $successRate = $stats['total_games'] > 0 ? 
                        round(($stats['completed_games'] / $stats['total_games']) * 100, 1) : 0;
                    $stats['success_rate'] = $successRate;
                    
                    echo json_encode([
                        'success' => true,
                        'stats' => $stats
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
