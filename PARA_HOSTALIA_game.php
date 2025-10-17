<?php
// 🎮 ENDPOINT PRINCIPAL DE JUEGO - MEMOFLIP
// Maneja todas las acciones del juego: save_progress, ranking, etc.

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'save_progress':
            handleSaveProgress();
            break;
        case 'ranking':
            handleRanking();
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Acción no válida: ' . $action]);
            break;
    }
} catch (Exception $e) {
    error_log("❌ [GAME] Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function handleSaveProgress() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para save_progress');
    }
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    $user_key = $data['user_key'] ?? null;
    $level = $data['level'] ?? null;
    $coins = $data['coins'] ?? null;
    $lives = $data['lives'] ?? null;
    $total_score = $data['total_score'] ?? $coins;
    
    if (!$user_key || $level === null || $coins === null || $lives === null) {
        throw new Exception('Faltan datos requeridos');
    }
    
    // 🔥 CONECTAR A LA BASE DE DATOS
    // Credenciales del documento GUIA_UNIVERSAL_DESPLIEGUE_JUEGOS_AGL.md
    $host = 'localhost';
    $dbname = 'sistema_apps';
    $username = 'sistema_apps_user';
    $password = 'GestionUploadSistemaApps!';
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed: ' . $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }
    
    error_log("💾 [GAME] Guardando: user=$user_key, level=$level, coins=$coins, lives=$lives, total_score=$total_score");
    
    // Guardar en memoflip_usuarios
    $sql1 = "INSERT INTO memoflip_usuarios (usuario_aplicacion_key, max_level_unlocked, coins_total, total_score, lives_current, fecha_modificacion) 
             VALUES (:user_key, :level, :coins, :total_score, :lives, NOW()) 
             ON DUPLICATE KEY UPDATE 
             max_level_unlocked = VALUES(max_level_unlocked), 
             coins_total = VALUES(coins_total), 
             total_score = VALUES(total_score), 
             lives_current = VALUES(lives_current), 
             fecha_modificacion = NOW()";
    
    $stmt1 = $pdo->prepare($sql1);
    $stmt1->execute([
        ':user_key' => $user_key,
        ':level' => (int)$level,
        ':coins' => (int)$coins,
        ':total_score' => (int)$total_score,
        ':lives' => (int)$lives
    ]);
    
    // Actualizar ranking cache
    $sql2 = "INSERT INTO memoflip_ranking_cache (usuario_aplicacion_key, max_level_unlocked, coins_total, total_score) 
             VALUES (:user_key, :level, :coins, :total_score) 
             ON DUPLICATE KEY UPDATE 
             max_level_unlocked = VALUES(max_level_unlocked), 
             coins_total = VALUES(coins_total), 
             total_score = VALUES(total_score)";
    
    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute([
        ':user_key' => $user_key,
        ':level' => (int)$level,
        ':coins' => (int)$coins,
        ':total_score' => (int)$total_score
    ]);
    
    error_log("✅ [GAME] Progreso guardado exitosamente");
    
    echo json_encode([
        'ok' => true,
        'message' => 'Progreso guardado correctamente',
        'data' => [
            'user_key' => $user_key,
            'level' => (int)$level,
            'coins' => (int)$coins,
            'lives' => (int)$lives,
            'total_score' => (int)$total_score,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ]);
}

function handleRanking() {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Método no permitido para ranking');
    }
    
    $limit = (int)($_GET['limit'] ?? 20);
    
    // 🔥 CONECTAR A LA BASE DE DATOS
    // Credenciales del documento GUIA_UNIVERSAL_DESPLIEGUE_JUEGOS_AGL.md
    $host = 'localhost';
    $dbname = 'sistema_apps';
    $username = 'sistema_apps_user';
    $password = 'GestionUploadSistemaApps!';
    
    try {
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed: ' . $e->getMessage(),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
        exit();
    }
    
    error_log("🏆 [GAME] Obteniendo ranking: limit=$limit");
    
    // Obtener ranking desde memoflip_ranking_cache
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
    
    error_log("✅ [GAME] Ranking obtenido: " . count($ranking) . " jugadores");
    
    echo json_encode([
        'success' => true,
        'ranking' => $ranking,
        'total' => count($ranking),
        'action' => 'ranking',
        'limit' => $limit
    ]);
}
?>
