<?php
// 🎯 ENDPOINT PARA GUARDAR PROGRESO DEL JUEGO - MEMOFLIP
// Este archivo debe subirse a: /sistema_apps_upload/memoflip/api/save_progress.php

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
    
    // TODO: Aquí debes conectar a tu base de datos real
    // Por ahora, simulamos el guardado exitoso
    
    error_log("💾 [MEMOFLIP] Guardando progreso: user_key=$user_key, level=$level, coins=$coins, lives=$lives, total_score=$total_score");
    
    // Simular respuesta exitosa
    $response = [
        'ok' => true,
        'message' => 'Progreso guardado exitosamente',
        'data' => [
            'user_key' => $user_key,
            'level' => (int)$level,
            'coins' => (int)$coins,
            'lives' => (int)$lives,
            'total_score' => (int)$total_score,
            'timestamp' => date('Y-m-d H:i:s')
        ]
    ];
    
    error_log("✅ [MEMOFLIP] Progreso guardado exitosamente");
    
    // Devolver respuesta exitosa
    http_response_code(200);
    echo json_encode($response);
    
} catch (Exception $e) {
    error_log("❌ [MEMOFLIP] Error guardando progreso: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Error interno del servidor',
        'details' => $e->getMessage()
    ]);
}
?>
