<?php
// 🔐 AUTH.PHP LIMPIO - MEMOFLIP
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Leer JSON del POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $GLOBALS['json_data'] = json_decode($input, true);
    $action = $GLOBALS['json_data']['action'] ?? $_POST['action'] ?? $_GET['action'] ?? '';
} else {
    $action = $_GET['action'] ?? '';
}

try {
    switch ($action) {
        case 'login':
            handleLogin();
            break;
        case 'check_session':
            handleCheckSession();
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Acción no válida: ' . $action]);
            break;
    }
} catch (Exception $e) {
    error_log("❌ [AUTH] Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

function handleLogin() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para login');
    }
    
    $data = $GLOBALS['json_data'];
    
    if (!$data) {
        $data = $_POST;
    }
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    
    if (!$email || !$password) {
        throw new Exception('Email y contraseña son obligatorios');
    }
    
    // 🔥 CONECTAR A LA BASE DE DATOS
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Buscar usuario por usuario_aplicacion_key específico
    $usuario_aplicacion_key = $email . '_memoflip';
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':key' => $usuario_aplicacion_key]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('Usuario no encontrado');
    }
    
    // Verificar contraseña
    if (!password_verify($password, $user['password_hash'])) {
        throw new Exception('Contraseña incorrecta');
    }
    
    // Verificar si está verificado
    if (!$user['verified_at']) {
        throw new Exception('Debes verificar tu email antes de iniciar sesión');
    }
    
    // Actualizar último acceso
    $update_sql = "UPDATE usuarios_aplicaciones SET last_login = NOW() WHERE usuario_aplicacion_key = :key";
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([':key' => $usuario_aplicacion_key]);
    
    // Obtener datos del juego
    $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
    $game_stmt = $pdo->prepare($game_sql);
    $game_stmt->execute([':key' => $usuario_aplicacion_key]);
    $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'email' => $user['email'],
        'nombre' => $user['nombre'],
        'nick' => $user['nick'],
        'game_data' => $game_data ? [
            'max_level_unlocked' => (int)$game_data['max_level_unlocked'],
            'coins_total' => (int)$game_data['coins_total'],
            'lives_current' => (int)$game_data['lives_current'],
            'sound_enabled' => true
        ] : [
            'max_level_unlocked' => 1,
            'coins_total' => 0,
            'lives_current' => 3,
            'sound_enabled' => true
        ]
    ]);
}

function handleCheckSession() {
    echo json_encode([
        'authenticated' => false,
        'message' => 'No hay sesión activa'
    ]);
}
?>
