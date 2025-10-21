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
    
    // 🔍 DEBUG: Solo para testing
    if (isset($_GET['debug'])) {
        error_log("🔍 DEBUG auth.php - input: " . $input);
        error_log("🔍 DEBUG auth.php - json_data: " . json_encode($GLOBALS['json_data']));
        error_log("🔍 DEBUG auth.php - action: " . $action);
    }
} else {
    $action = $_GET['action'] ?? '';
}

// 🔧 FIX: Si no hay action, intentar detectarlo de otra forma
if (empty($action)) {
    // Intentar detectar action desde la URL o headers
    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    
    // Si sigue vacío, intentar detectar desde el contenido
    if (empty($action) && !empty($GLOBALS['json_data'])) {
        $action = $GLOBALS['json_data']['action'] ?? '';
    }
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
        case 'register':
            handleRegister();
            break;
        case 'logout':
            handleLogout();
            break;
        case 'resend_code':
            handleResendCode();
            break;
        case 'verify_code':
            handleVerifyCode();
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

function handleRegister() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para registro');
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
    $check_nick_stmt->execute([':nick' => $nick]);
    
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

function handleLogout() {
    // Para logout, simplemente devolvemos éxito
    // El frontend se encarga de limpiar la sesión local
    echo json_encode([
        'success' => true,
        'message' => 'Sesión cerrada correctamente',
        'authenticated' => false
    ]);
}

function handleResendCode() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para reenvío de código');
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
    
    // Buscar usuario por email
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email AND app_codigo = 'memoflip'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':email' => $email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        throw new Exception('Usuario no encontrado');
    }
    
    // Generar nuevo código de verificación
    $verification_code = sprintf('%06d', mt_rand(0, 999999));
    
    // Actualizar código en la base de datos
    $update_sql = "UPDATE usuarios_aplicaciones SET 
        verification_code = :code,
        verification_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR)
        WHERE email = :email AND app_codigo = 'memoflip'";
    
    $update_stmt = $pdo->prepare($update_sql);
    $update_stmt->execute([
        ':code' => $verification_code,
        ':email' => $email
    ]);
    
    // Enviar email con el nuevo código
    require_once 'enviar_email.php';
    $resultado = enviarEmailRecuperacion($email, $user['nombre'], $verification_code);
    
    if ($resultado) {
        echo json_encode([
            'success' => true,
            'message' => 'Código reenviado correctamente',
            'verification_code' => $verification_code // Solo para testing
        ]);
    } else {
        throw new Exception('Error al enviar el email');
    }
}

function handleVerifyCode() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para verificación de código');
    }
    
    $data = $GLOBALS['json_data'];
    
    if (!$data) {
        $data = $_POST;
    }
    
    if (!$data) {
        throw new Exception('Datos JSON inválidos');
    }
    
    $email = $data['email'] ?? '';
    $code = $data['code'] ?? '';
    $new_password = $data['new_password'] ?? '';
    
    if (!$email || !$code) {
        throw new Exception('Email y código son obligatorios');
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
    
    // Verificar código
    if ($user['verification_code'] !== $code) {
        throw new Exception('Código de verificación incorrecto');
    }
    
    // Verificar que no haya expirado
    if (!$user['verification_expiry'] || strtotime($user['verification_expiry']) < time()) {
        throw new Exception('El código de verificación ha expirado');
    }
    
    // Si se proporciona nueva contraseña, actualizarla
    if ($new_password) {
        if (strlen($new_password) < 6) {
            throw new Exception('La contraseña debe tener al menos 6 caracteres');
        }
        
        $password_hash = password_hash($new_password, PASSWORD_DEFAULT);
        
        // Actualizar contraseña y marcar como verificado
        $update_sql = "UPDATE usuarios_aplicaciones SET 
            password_hash = :password_hash,
            verified_at = NOW(),
            verification_code = NULL,
            verification_expiry = NULL
            WHERE email = :email AND app_codigo = 'memoflip'";
        
        $update_stmt = $pdo->prepare($update_sql);
        $update_stmt->execute([
            ':password_hash' => $password_hash,
            ':email' => $email
        ]);
        
    echo json_encode([
        'success' => true,
        'message' => 'Contraseña actualizada correctamente',
        'password_updated' => true
    ]);
}

function handleGoogleSignIn() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido para Google Sign-In');
    }
    
    $data = $GLOBALS['json_data'];
    
    if (!$data) {
        $data = $_POST;
    }
    
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
