<?php
// 🎯 ENDPOINT REAL PARA GUARDAR PROGRESO DEL JUEGO - MEMOFLIP
// Conecta con la base de datos real de Hostalia

// Configurar headers para CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'error' => 'Método no permitido. Solo se acepta POST.'
    ]);
    exit();
}

try {
    // Obtener datos del cuerpo de la petición
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    // Extraer datos
    $user_key = $data['user_key'] ?? null;
    $level = $data['level'] ?? null;
    $coins = $data['coins'] ?? null;
    $lives = $data['lives'] ?? null;
    $total_score = $data['total_score'] ?? $coins;
    
    // Validar datos requeridos
    if (!$user_key || $level === null || $coins === null || $lives === null) {
        throw new Exception('Faltan datos requeridos: user_key, level, coins, lives');
    }
    
    // 🔥 CONECTAR A LA BASE DE DATOS REAL
    $host = 'localhost';
    $dbname = 'sistema_apps';
    $username = 'sistema_apps_user';
    $password = 'GestionUploadSistemaApps!';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    error_log("💾 [MEMOFLIP] Guardando progreso: user_key=$user_key, level=$level, coins=$coins, lives=$lives, total_score=$total_score");
    
    // 🔥 ACTUALIZAR O INSERTAR EN memoflip_usuarios
    $sql = "INSERT INTO memoflip_usuarios (usuario_aplicacion_key, nivel_actual, total_puntos, vidas, total_score, ultima_sincronizacion) 
            VALUES (:user_key, :level, :coins, :lives, :total_score, NOW()) 
            ON DUPLICATE KEY UPDATE 
            nivel_actual = VALUES(nivel_actual), 
            total_puntos = VALUES(total_puntos), 
            vidas = VALUES(vidas), 
            total_score = VALUES(total_score), 
            ultima_sincronizacion = NOW()";
    
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':user_key', $user_key);
    $stmt->bindParam(':level', $level, PDO::PARAM_INT);
    $stmt->bindParam(':coins', $coins, PDO::PARAM_INT);
    $stmt->bindParam(':lives', $lives, PDO::PARAM_INT);
    $stmt->bindParam(':total_score', $total_score, PDO::PARAM_INT);
    
    $stmt->execute();
    
    // 🔥 ACTUALIZAR RANKING CACHE
    $ranking_sql = "INSERT INTO memoflip_ranking_cache (usuario_aplicacion_key, nivel_actual, total_puntos, total_score, ultima_actualizacion) 
                    VALUES (:user_key, :level, :coins, :total_score, NOW()) 
                    ON DUPLICATE KEY UPDATE 
                    nivel_actual = VALUES(nivel_actual), 
                    total_puntos = VALUES(total_puntos), 
                    total_score = VALUES(total_score), 
                    ultima_actualizacion = NOW()";
    
    $ranking_stmt = $pdo->prepare($ranking_sql);
    $ranking_stmt->bindParam(':user_key', $user_key);
    $ranking_stmt->bindParam(':level', $level, PDO::PARAM_INT);
    $ranking_stmt->bindParam(':coins', $coins, PDO::PARAM_INT);
    $ranking_stmt->bindParam(':total_score', $total_score, PDO::PARAM_INT);
    
    $ranking_stmt->execute();
    
    error_log("✅ [MEMOFLIP] Progreso guardado en BD: usuario=$user_key, nivel=$level, puntos=$coins");
    
    // Respuesta exitosa
    $response = [
        'ok' => true,
        'message' => 'Progreso guardado exitosamente en base de datos',
        'data' => [
            'user_key' => $user_key,
            'level' => (int)$level,
            'coins' => (int)$coins,
            'lives' => (int)$lives,
            'total_score' => (int)$total_score,
            'timestamp' => date('Y-m-d H:i:s'),
            'database_saved' => true
        ]
    ];
    
    http_response_code(200);
    echo json_encode($response);
    
} catch (PDOException $e) {
    error_log("❌ [MEMOFLIP] Error BD: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Error de base de datos',
        'details' => $e->getMessage()
    ]);
    
} catch (Exception $e) {
    error_log("❌ [MEMOFLIP] Error: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Error interno del servidor',
        'details' => $e->getMessage()
    ]);
}
?>
