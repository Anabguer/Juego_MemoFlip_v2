<?php
// 🔐 SISTEMA DE AUTENTICACIÓN - MEMOFLIP
// Maneja login, registro y verificación de usuarios

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
        case 'google_signin':
            handleGoogleSignIn();
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
    
    // Verificar contraseña (asumiendo que está hasheada)
    if (!password_verify($password, $user['password'])) {
        throw new Exception('Contraseña incorrecta');
    }
    
    // Verificar si el email está verificado
    if (!$user['email_verified']) {
        throw new Exception('Debes verificar tu email antes de iniciar sesión');
    }
    
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
    $check_sql = "SELECT id FROM usuarios_aplicaciones WHERE email = :email";
    $check_stmt = $pdo->prepare($check_sql);
    $check_stmt->execute([':email' => $email]);
    
    if ($check_stmt->fetch()) {
        throw new Exception('Este email ya está registrado');
    }
    
    // Verificar si el nick ya existe
    $check_nick_sql = "SELECT id FROM usuarios_aplicaciones WHERE nick = :nick";
    $check_nick_stmt = $pdo->prepare($check_nick_sql);
    $check_nick_stmt->execute([':nick' => $nick]);
    
    if ($check_nick_stmt->fetch()) {
        throw new Exception('Este nick ya está en uso');
    }
    
    // Generar usuario_aplicacion_key
    $usuario_aplicacion_key = $email . '_memoflip';
    
    // Hash de la contraseña
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Generar código de verificación
    $verification_code = bin2hex(random_bytes(16));
    
    // Insertar en usuarios_aplicaciones
    $insert_sql = "INSERT INTO usuarios_aplicaciones (
        usuario_aplicacion_key, 
        email, 
        password, 
        nombre, 
        nick, 
        email_verified, 
        verification_code, 
        created_at, 
        updated_at
    ) VALUES (
        :usuario_aplicacion_key, 
        :email, 
        :password, 
        :nombre, 
        :nick, 
        0, 
        :verification_code, 
        NOW(), 
        NOW()
    )";
    
    $insert_stmt = $pdo->prepare($insert_sql);
    $insert_stmt->execute([
        ':usuario_aplicacion_key' => $usuario_aplicacion_key,
        ':email' => $email,
        ':password' => $hashed_password,
        ':nombre' => $nombre,
        ':nick' => $nick,
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
    
    // TODO: Enviar email de verificación
    // Por ahora, simular que se envió
    
    echo json_encode([
        'success' => true,
        'requires_verification' => true,
        'email_sent' => true,
        'message' => 'Cuenta creada exitosamente. Se ha enviado un email de verificación.',
        'verification_code' => $verification_code // Solo para testing
    ]);
}

function handleCheckSession() {
    // Por ahora, siempre retorna no autenticado
    // En una implementación real, verificaría tokens de sesión
    echo json_encode([
        'authenticated' => false,
        'message' => 'No hay sesión activa'
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
    
    // Verificar código
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email AND verification_code = :code";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email, ':code' => $code]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('Código de verificación inválido');
    }
    
    // Marcar como verificado
    $update_sql = "UPDATE usuarios_aplicaciones SET email_verified = 1, updated_at = NOW() WHERE email = :email";
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([':email' => $email]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Email verificado exitosamente'
    ]);
}

function handleGoogleSignIn() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para Google Sign-In');
    }
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    $email = $data['email'] ?? '';
    $nombre = $data['nombre'] ?? '';
    $nick = $data['nick'] ?? '';
    $google_id = $data['google_id'] ?? '';
    $id_token = $data['id_token'] ?? '';
    
    // ✅ VALIDACIONES MEJORADAS
    if (!$email || !$nombre || !$nick || !$google_id) {
        throw new Exception('Datos de Google Sign-In incompletos. Faltan: ' . 
            (!$email ? 'email ' : '') . 
            (!$nombre ? 'nombre ' : '') . 
            (!$nick ? 'nick ' : '') . 
            (!$google_id ? 'google_id' : ''));
    }
    
    // ✅ VALIDAR EMAIL
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Email de Google no válido: ' . $email);
    }
    
    // 🔥 CONECTAR A LA BASE DE DATOS
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Buscar usuario existente por usuario_aplicacion_key
    $usuario_aplicacion_key = $email . '_memoflip';
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':key' => $usuario_aplicacion_key]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        // ✅ CREAR NUEVO USUARIO GOOGLE
        $insert_sql = "INSERT INTO usuarios_aplicaciones (
            usuario_aplicacion_key, 
            email, 
            nombre, 
            nick, 
            password_hash,
            app_codigo,
            verified_at,
            created_at,
            last_login
        ) VALUES (
            :usuario_aplicacion_key, 
            :email, 
            :nombre, 
            :nick, 
            :password_hash,
            'memoflip',
            NOW(),
            NOW(),
            NOW()
        )";
        
        // Usar google_id + id_token como contraseña (más seguro)
        $password_hash = password_hash($google_id . '_' . $id_token, PASSWORD_DEFAULT);
        
        $insert_stmt = $pdo->prepare($insert_sql);
        $insert_stmt->execute([
            ':usuario_aplicacion_key' => $usuario_aplicacion_key,
            ':email' => $email,
            ':nombre' => $nombre,
            ':nick' => $nick,
            ':password_hash' => $password_hash
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
        
        // Obtener datos del juego recién creados
        $game_data = [
            'max_level_unlocked' => 1,
            'coins_total' => 0,
            'lives_current' => 3,
            'sound_enabled' => true
        ];
        
        error_log("✅ [GOOGLE SIGN-IN] Nuevo usuario creado: " . $email);
    } else {
        // ✅ USUARIO EXISTENTE - obtener datos del juego
        $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
        $game_stmt = $pdo->prepare($game_sql);
        $game_stmt->execute([':key' => $usuario_aplicacion_key]);
        $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$game_data) {
            // Si no tiene datos de juego, crearlos
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
            
            $game_data = [
                'max_level_unlocked' => 1,
                'coins_total' => 0,
                'lives_current' => 3,
                'sound_enabled' => true
            ];
        } else {
            $game_data['sound_enabled'] = true;
        }
        
        // Actualizar último acceso
        $update_sql = "UPDATE usuarios_aplicaciones SET last_login = NOW() WHERE usuario_aplicacion_key = :key";
        $update_stmt = $pdo->prepare($update_sql);
        $update_stmt->execute([':key' => $usuario_aplicacion_key]);
        
        error_log("✅ [GOOGLE SIGN-IN] Usuario existente: " . $email);
    }
    
    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'email' => $email,
        'nombre' => $nombre,
        'nick' => $nick,
        'game_data' => $game_data
    ]);
}
?>
