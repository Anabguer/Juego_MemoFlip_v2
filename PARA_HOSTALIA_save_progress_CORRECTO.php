<?php
// 🎯 ENDPOINT CORRECTO PARA GUARDAR PROGRESO - MEMOFLIP
// Usando los nombres reales de las columnas de las tablas

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido']);
    exit();
}

try {
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
    $host = 'localhost';
    $dbname = 'sistema_apps';
    $username = 'sistema_apps_user';
    $password = 'GestionUploadSistemaApps!';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    error_log("💾 [MEMOFLIP] Guardando: user=$user_key, level=$level, coins=$coins, lives=$lives, total_score=$total_score");
    
    // 🔥 USAR LOS NOMBRES CORRECTOS DE LAS COLUMNAS
    // Tabla memoflip_usuarios:
    // - usuario_aplicacion_key, max_level_unlocked, coins_total, total_score, lives_current
    
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
    
    // 🔥 ACTUALIZAR RANKING CACHE CON NOMBRES CORRECTOS
    // Tabla memoflip_ranking_cache:
    // - usuario_aplicacion_key, max_level_unlocked, coins_total, total_score
    
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
    
    error_log("✅ [MEMOFLIP] Guardado exitoso en BD con nombres correctos");
    
    echo json_encode([
        'ok' => true,
        'message' => 'Progreso guardado correctamente en base de datos',
        'data' => [
            'user_key' => $user_key,
            'level' => (int)$level,
            'coins' => (int)$coins,
            'lives' => (int)$lives,
            'total_score' => (int)$total_score,
            'timestamp' => date('Y-m-d H:i:s'),
            'database_saved' => true,
            'tables_updated' => ['memoflip_usuarios', 'memoflip_ranking_cache']
        ]
    ]);
    
} catch (Exception $e) {
    error_log("❌ [MEMOFLIP] Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage()
    ]);
}
?>
