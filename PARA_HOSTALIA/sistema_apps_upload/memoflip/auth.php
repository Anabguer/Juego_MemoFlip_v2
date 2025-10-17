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
    
    $data = $GLOBALS['json_data'];
    
    if (!$data) {
        $data = $_POST;
    }
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    $email = $data['email'] ?? '';
    $user_password = $data['password'] ?? '';
    
    if (!$email || !$user_password) {
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
    if (!password_verify($user_password, $user['password_hash'])) {
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

function handleForgotPassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para forgot_password');
    }
    
    $data = $GLOBALS['json_data'];
    
    if (!$data) {
        $data = $_POST;
    }
    
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
    
    // Buscar usuario por usuario_aplicacion_key específico
    $usuario_aplicacion_key = $email . '_memoflip';
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':key' => $usuario_aplicacion_key]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('Usuario no encontrado');
    }
    
    // Generar código de recuperación de 6 dígitos
    $codigo_recuperacion = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
    $expiry_time = date('Y-m-d H:i:s', strtotime('+15 minutes')); // Expira en 15 minutos
    
    // Actualizar usuario con código de recuperación
    $update_sql = "UPDATE usuarios_aplicaciones SET 
                   verification_code = :codigo, 
                   verification_expiry = :expiry 
                   WHERE usuario_aplicacion_key = :key";
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([
        ':codigo' => $codigo_recuperacion,
        ':expiry' => $expiry_time,
        ':key' => $usuario_aplicacion_key
    ]);
    
    // Enviar email con código de recuperación
    $email_enviado = false;
    try {
        // Incluir función de envío de email (si existe)
        if (file_exists('enviar_email.php')) {
            require_once 'enviar_email.php';
            $email_enviado = enviarEmailRecuperacion($email, $user['nombre'], $codigo_recuperacion);
        } else {
            // Fallback: usar mail() básico
            $asunto = "Recuperar contraseña - MemoFlip";
            $mensaje = "Hola " . $user['nombre'] . ",\n\n";
            $mensaje .= "Tu código de recuperación es: " . $codigo_recuperacion . "\n\n";
            $mensaje .= "Este código expira en 15 minutos.\n\n";
            $mensaje .= "Si no solicitaste este código, ignora este email.\n\n";
            $mensaje .= "© 2025 MemoFlip";
            
            $email_enviado = mail($email, $asunto, $mensaje);
        }
    } catch (Exception $e) {
        error_log("❌ [AUTH] Error enviando email: " . $e->getMessage());
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Código de recuperación enviado a tu email',
        'email_sent' => $email_enviado,
        'codigo_dev' => $email_enviado ? null : $codigo_recuperacion // Solo en desarrollo
    ]);
}

function handleResetPassword() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para reset_password');
    }
    
    $data = $GLOBALS['json_data'];
    
    if (!$data) {
        $data = $_POST;
    }
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    $email = $data['email'] ?? '';
    $codigo = $data['codigo'] ?? '';
    $nueva_password = $data['nueva_password'] ?? '';
    
    if (!$email || !$codigo || !$nueva_password) {
        throw new Exception('Email, código y nueva contraseña son obligatorios');
    }
    
    // Validar nueva contraseña
    if (strlen($nueva_password) < 6) {
        throw new Exception('La contraseña debe tener al menos 6 caracteres');
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
    
    // Verificar código de recuperación
    if (!$user['verification_code'] || $user['verification_code'] !== $codigo) {
        throw new Exception('Código de recuperación incorrecto');
    }
    
    // Verificar que el código no haya expirado
    if (!$user['verification_expiry'] || strtotime($user['verification_expiry']) < time()) {
        throw new Exception('Código de recuperación expirado. Solicita uno nuevo.');
    }
    
    // Hashear nueva contraseña
    $password_hash = password_hash($nueva_password, PASSWORD_DEFAULT);
    
    // Actualizar contraseña y limpiar código de recuperación
    $update_sql = "UPDATE usuarios_aplicaciones SET 
                   password_hash = :password_hash,
                   verification_code = NULL,
                   verification_expiry = NULL
                   WHERE usuario_aplicacion_key = :key";
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([
        ':password_hash' => $password_hash,
        ':key' => $usuario_aplicacion_key
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
        'password_updated' => true
    ]);
}
?>
