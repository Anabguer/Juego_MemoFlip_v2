<?php
/**
 * ranking.php - MemoFlip
 * Endpoints para obtener el ranking global y personal
 */

require_once '_common.php';

// ====================================
// ROUTER PRINCIPAL
// ====================================
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['action'] ?? 'global';
    
    switch ($action) {
        case 'global':
            handle_global_ranking($pdo);
            break;
        
        case 'personal':
            handle_personal_ranking($pdo);
            break;
        
        case 'level_leaders':
            handle_level_leaders($pdo);
            break;
        
        default:
            handle_error('Acción no válida', 400);
    }
    
} else {
    handle_error('Método no permitido', 405);
}

// ====================================
// FUNCIÓN: Ranking global
// ====================================
function handle_global_ranking($pdo) {
    try {
        $limit = intval($_GET['limit'] ?? 100);
        $offset = intval($_GET['offset'] ?? 0);
        
        if ($limit > 500) {
            $limit = 500; // Máximo 500 resultados
        }
        
        // Obtener ranking usando la tabla cache
        $stmt = $pdo->prepare("
            SELECT 
                ranking_position,
                nombre,
                email,
                max_level_unlocked,
                coins_total,
                total_score,
                levels_completed,
                total_stars,
                avg_time,
                registro_fecha
            FROM memoflip_ranking_cache
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $ranking = $stmt->fetchAll();
        
        // Obtener total de jugadores
        $stmt = $pdo->query("
            SELECT COUNT(*) as total 
            FROM memoflip_usuarios u
            JOIN usuarios_aplicaciones ua ON u.usuario_aplicacion_key = ua.usuario_aplicacion_key
            WHERE ua.activo = 1
        ");
        $total = $stmt->fetch()['total'];
        
        json_response([
            'success' => true,
            'total_players' => $total,
            'showing' => count($ranking),
            'ranking' => $ranking
        ]);
        
    } catch (Exception $e) {
        handle_error('Error al obtener ranking', 500, $e);
    }
}

// ====================================
// FUNCIÓN: Ranking personal (posición del usuario)
// ====================================
function handle_personal_ranking($pdo) {
    require_login();
    
    try {
        $uakey = get_session_uakey();
        
        // Obtener posición del usuario en el ranking
        $stmt = $pdo->prepare("
            SELECT 
                ranking_position,
                nombre,
                email,
                max_level_unlocked,
                coins_total,
                total_score,
                levels_completed,
                total_stars,
                avg_time
            FROM memoflip_ranking_cache
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$uakey]);
        $personal = $stmt->fetch();
        
        if (!$personal) {
            // Usuario no tiene datos aún
            $stmt = $pdo->prepare("
                SELECT nombre, email 
                FROM usuarios_aplicaciones 
                WHERE usuario_aplicacion_key = ?
            ");
            $stmt->execute([$uakey]);
            $user = $stmt->fetch();
            
            $personal = [
                'ranking_position' => null,
                'nombre' => $user['nombre'] ?? '',
                'email' => $user['email'] ?? '',
                'max_level_unlocked' => 1,
                'coins_total' => 0,
                'levels_completed' => 0,
                'total_stars' => 0,
                'avg_time' => 0
            ];
        }
        
        // Obtener contexto (3 jugadores antes y después)
        $position = $personal['ranking_position'] ?? 1;
        $start = max(1, $position - 3);
        $end = $position + 3;
        
        $stmt = $pdo->prepare("
            SELECT 
                ranking_position,
                nombre,
                max_level_unlocked,
                coins_total,
                total_score,
                levels_completed,
                total_stars
            FROM memoflip_ranking_cache
            WHERE ranking_position BETWEEN ? AND ?
            ORDER BY ranking_position ASC
        ");
        $stmt->execute([$start, $end]);
        $context = $stmt->fetchAll();
        
        json_response([
            'success' => true,
            'personal' => $personal,
            'context' => $context
        ]);
        
    } catch (Exception $e) {
        handle_error('Error al obtener ranking personal', 500, $e);
    }
}

// ====================================
// FUNCIÓN: Líderes de un nivel específico
// ====================================
function handle_level_leaders($pdo) {
    try {
        $level_id = intval($_GET['level_id'] ?? 0);
        $limit = intval($_GET['limit'] ?? 10);
        
        if ($level_id < 1 || $level_id > 1000) {
            throw new Exception('Nivel inválido');
        }
        
        if ($limit > 100) {
            $limit = 100;
        }
        
        // Obtener top jugadores del nivel
        $stmt = $pdo->prepare("
            SELECT 
                ua.nombre,
                ua.email,
                lr.best_coins,
                lr.best_time_seconds,
                lr.best_moves,
                lr.stars,
                lr.fecha_mejor_record
            FROM memoflip_level_records lr
            JOIN usuarios_aplicaciones ua ON lr.usuario_aplicacion_key = ua.usuario_aplicacion_key
            WHERE lr.level_id = ? AND ua.activo = 1 AND lr.times_completed > 0
            ORDER BY lr.best_coins DESC, lr.best_time_seconds ASC
            LIMIT ?
        ");
        $stmt->execute([$level_id, $limit]);
        $leaders = $stmt->fetchAll();
        
        // Agregar posición
        $position = 1;
        foreach ($leaders as &$leader) {
            $leader['position'] = $position++;
        }
        
        json_response([
            'success' => true,
            'level_id' => $level_id,
            'leaders' => $leaders
        ]);
        
    } catch (Exception $e) {
        handle_error('Error al obtener líderes del nivel', 500, $e);
    }
}
?>

