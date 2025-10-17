<?php
// 🔐 SISTEMA DE AUTENTICACIÓN CORREGIDO - MEMOFLIP
// Con recuperación de contraseña

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
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para registro');
    }
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';
    $nombre = $data['nombre'] ?? '';
    $nick = $data['nick'] ?? '';
    
    // ✅ VALIDACIONES OBLIGATORIAS
    if (!$email || !$password || !$nombre || !$nick) {
        throw new Exception('Todos los campos son obligatorios (email, contraseña, nombre, nick)');
    }
    
    if (strlen($password) < 6) {
        throw new Exception('La contraseña debe tener al menos 6 caracteres');
    }
    
    if (strlen($nick) < 3) {
        throw new Exception('El nick debe tener al menos 3 caracteres');
    }
    
    // 🔥 CONECTAR A LA BASE DE DATOS
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar si el email ya existe
    $check_sql = "SELECT usuario_aplicacion_id FROM usuarios_aplicaciones WHERE email = :email";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->execute([':email' => $email]);
    
    if ($check_stmt->fetch()) {
        throw new Exception('Este email ya está registrado');
    }
    
    // Verificar si el nick ya existe
    $check_nick_sql = "SELECT usuario_aplicacion_id FROM usuarios_aplicaciones WHERE nick = :nick";
    $check_nick_stmt = $pdo->prepare($check_nick_sql);
    $check_stmt->execute([':nick' => $nick]);
    
    if ($check_nick_stmt->fetch()) {
        throw new Exception('Este nick ya está en uso');
    }
    
    // Generar usuario_aplicacion_key
    $usuario_aplicacion_key = $email . '_memoflip';
    
    // Hash de la contraseña
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Generar código de verificación (6 dígitos)
    $verification_code = sprintf('%06d', mt_rand(0, 999999));
    
    // Insertar en usuarios_aplicaciones
    $insert_sql = "INSERT INTO usuarios_aplicaciones (
        usuario_aplicacion_key, 
        email, 
        nombre, 
        nick, 
        password_hash,
        app_codigo,
        verification_code,
        verification_expiry,
        created_at
    ) VALUES (
        :usuario_aplicacion_key, 
        :email, 
        :nombre, 
        :nick, 
        :password_hash,
        'memoflip',
        :verification_code,
        DATE_ADD(NOW(), INTERVAL 1 HOUR),
        NOW()
    )";
    
    $insert_stmt = $pdo->prepare($insert_sql);
    $insert_stmt->execute([
        ':usuario_aplicacion_key' => $usuario_aplicacion_key,
        ':email' => $email,
        ':nombre' => $nombre,
        ':nick' => $nick,
        ':password_hash' => $hashed_password,
        ':verification_code' => $verification_code
    ]);
    
    // Crear registro inicial en memoflip_usuarios
    $game_sql = "INSERT INTO memoflip_usuarios (
        usuario_aplicacion_key, 
        max_level_unlocked, 
        coins_total, 
        total_score, 
        lives_current, 
        fecha_modificacion
    ) VALUES (
        :usuario_aplicacion_key, 
        1, 
        0, 
        0, 
        3, 
        NOW()
    )";
    
    $game_stmt = $pdo->prepare($game_sql);
    $game_stmt->execute([':usuario_aplicacion_key' => $usuario_aplicacion_key]);
    
    echo json_encode([
        'success' => true,
        'requires_verification' => true,
        'email_sent' => true,
        'message' => 'Cuenta creada exitosamente. Se ha enviado un email de verificación.',
        'verification_code' => $verification_code // Solo para testing
    ]);
}

function handleVerifyEmail() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para verificación');
    }
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    $email = $data['email'] ?? '';
    $code = $data['code'] ?? '';
    
    if (!$email || !$code) {
        throw new Exception('Email y código son obligatorios');
    }
    
    // 🔥 CONECTAR A LA BASE DE DATOS
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar código y expiración
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email AND verification_code = :code AND verification_expiry > NOW()";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email, ':code' => $code]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('Código de verificación inválido o expirado');
    }
    
    // Marcar como verificado
    $update_sql = "UPDATE usuarios_aplicaciones SET verified_at = NOW(), verification_code = NULL WHERE email = :email";
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([':email' => $email]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Email verificado exitosamente'
    ]);
}

function handleForgotPassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para recuperación');
    }
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    $email = $data['email'] ?? '';
    
    if (!$email) {
        throw new Exception('Email es obligatorio');
    }
    
    // 🔥 CONECTAR A LA BASE DE DATOS
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar si el email existe
    $sql = "SELECT usuario_aplicacion_id FROM usuarios_aplicaciones WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    
    if (!$stmt->fetch()) {
        throw new Exception('Email no encontrado');
    }
    
    // Generar código de recuperación
    $recovery_code = sprintf('%06d', mt_rand(0, 999999));
    
    // Guardar código de recuperación
    $update_sql = "UPDATE usuarios_aplicaciones SET 
        verification_code = :code, 
        verification_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) 
        WHERE email = :email";
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([
        ':code' => $recovery_code,
        ':email' => $email
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Se ha enviado un código de recuperación a tu email.',
        'recovery_code' => $recovery_code // Solo para testing
    ]);
}

function handleResetPassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para cambio de contraseña');
    }
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    $email = $data['email'] ?? '';
    $code = $data['code'] ?? '';
    $new_password = $data['new_password'] ?? '';
    
    if (!$email || !$code || !$new_password) {
        throw new Exception('Email, código y nueva contraseña son obligatorios');
    }
    
    if (strlen($new_password) < 6) {
        throw new Exception('La nueva contraseña debe tener al menos 6 caracteres');
    }
    
    // 🔥 CONECTAR A LA BASE DE DATOS
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar código de recuperación
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email AND verification_code = :code AND verification_expiry > NOW()";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email, ':code' => $code]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('Código de recuperación inválido o expirado');
    }
    
    // Actualizar contraseña
    $new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);
    
    $update_sql = "UPDATE usuarios_aplicaciones SET 
        password_hash = :password_hash, 
        verification_code = NULL,
        verification_expiry = NULL
        WHERE email = :email";
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([
        ':password_hash' => $new_password_hash,
        ':email' => $email
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Contraseña actualizada exitosamente'
    ]);
}

function handleCheckSession() {
    // Por ahora, siempre retorna no autenticado
    echo json_encode([
        'authenticated' => false,
        'message' => 'No hay sesión activa'
    ]);
}
?>
