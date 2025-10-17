<?php
// 🏆 ENDPOINT PARA OBTENER RANKING - MEMOFLIP

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
    // Obtener parámetros
    $action = $_GET['action'] ?? 'global';
    $limit = (int)($_GET['limit'] ?? 20);
    
    // Conectar a la base de datos
    $host = 'localhost';
    $dbname = 'sistema_apps';
    $username = 'sistema_apps_user';
    $password = 'GestionUploadSistemaApps!';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    error_log("🏆 [RANKING] Obteniendo ranking: action=$action, limit=$limit");
    
    if ($action === 'global') {
        // 🔥 OBTENER RANKING GLOBAL desde memoflip_ranking_cache
        $sql = "SELECT 
                    usuario_aplicacion_key,
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
                ORDER BY total_score DESC, max_level_unlocked DESC, coins_total DESC
                LIMIT :limit";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        
        $ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Agregar posición en el ranking
        $position = 1;
        foreach ($ranking as &$player) {
            $player['ranking_position'] = $position++;
        }
        
        error_log("✅ [RANKING] Ranking obtenido: " . count($ranking) . " jugadores");
        
        echo json_encode([
            'success' => true,
            'ranking' => $ranking,
            'total' => count($ranking),
            'action' => $action,
            'limit' => $limit
        ]);
        
    } else {
        throw new Exception('Acción no válida');
    }
    
} catch (Exception $e) {
    error_log("❌ [RANKING] Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
