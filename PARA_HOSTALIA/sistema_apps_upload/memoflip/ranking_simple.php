<?php
// RANKING SIMPLE SIN JOIN - SOLO PARA QUE FUNCIONE
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
    exit();
}

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $limit = max(1, min(100, $limit));
    
    // RANKING SIMPLE SIN JOIN - SOLO memoflip_usuarios
    $sql = "SELECT 
                usuario_aplicacion_key, 
                SUBSTRING_INDEX(usuario_aplicacion_key, '@', 1) as nombre,
                REPLACE(usuario_aplicacion_key, '_memoflip', '') as email,
                max_level_unlocked, 
                coins_total, 
                total_score,
                max_level_unlocked as levels_completed,
                coins_total as total_stars,
                0.00 as avg_time,
                fecha_modificacion as registro_fecha
            FROM 
                memoflip_usuarios 
            ORDER BY 
                total_score DESC, max_level_unlocked DESC, coins_total DESC 
            LIMIT :limit";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
    $stmt->execute();
    
    $ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $ranked_players = [];
    foreach ($ranking as $index => $player) {
        $player['ranking_position'] = $index + 1;
        $ranked_players[] = $player;
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Ranking obtenido correctamente',
        'ranking' => $ranked_players,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    error_log("RANKING Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
