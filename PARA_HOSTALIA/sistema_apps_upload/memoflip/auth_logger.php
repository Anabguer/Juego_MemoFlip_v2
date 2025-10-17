<?php
// AUTH CON LOGGER - Para capturar datos del AAB
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// LOG TODO LO QUE LLEGA
$log_data = [
    'timestamp' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'get' => $_GET,
    'post' => $_POST,
    'raw_input' => file_get_contents('php://input'),
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'No especificado'
];

// Guardar log
file_put_contents('auth_debug_log.txt', json_encode($log_data, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'login':
            handleLogin();
            break;
        case 'register':
            handleRegister();
            break;
        case 'check_session':
            handleCheckSession();
            break;
        case 'verify_email':
            handleVerifyEmail();
            break;
        case 'forgot_password':
            handleForgotPassword();
            break;
        case 'reset_password':
            handleResetPassword();
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
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        // Intentar con POST normal
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
    
    // Buscar usuario en usuarios_aplicaciones
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('Usuario no encontrado');
    }
    
    // Verificar contraseña
    if (!password_verify($password, $user['password_hash'])) {
        throw new Exception('Contraseña incorrecta');
    }
    
    // ✅ CORREGIDO: Verificar si el email está verificado usando verified_at
    if (!$user['verified_at']) {
        throw new Exception('Debes verificar tu email antes de iniciar sesión');
    }
    
    // Actualizar último acceso
    $update_sql = "UPDATE usuarios_aplicaciones SET last_login = NOW() WHERE email = :email";
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([':email' => $email]);
    
    // Obtener datos del juego
    $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
    $game_stmt = $pdo->prepare($game_sql);
    $game_stmt->execute([':key' => $user['usuario_aplicacion_key']]);
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

function handleRegister() {
    // Implementar si es necesario
    throw new Exception('Registro no implementado');
}

function handleCheckSession() {
    echo json_encode(['authenticated' => false, 'message' => 'No hay sesión activa']);
}

function handleVerifyEmail() {
    throw new Exception('Verificación no implementada');
}

function handleForgotPassword() {
    throw new Exception('Recuperación no implementada');
}

function handleResetPassword() {
    throw new Exception('Reset no implementado');
}
?>
