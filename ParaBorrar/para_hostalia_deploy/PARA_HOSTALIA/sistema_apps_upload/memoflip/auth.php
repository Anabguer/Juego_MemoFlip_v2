<?php
/**
 * auth.php - MemoFlip CON VERIFICACIÓN DE EMAIL
 * Endpoints: register, login, verify_code, resend_code, check_session, logout
 */

require_once '_common.php';
require_once 'enviar_email.php';

// ====================================
// ROUTER PRINCIPAL
// ====================================
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $action = $input['action'] ?? '';
    
    switch ($action) {
        case 'register':
            handle_register($pdo, $input);
            break;
        
        case 'verify_code':
            handle_verify_code($pdo, $input);
            break;
        
        case 'resend_code':
            handle_resend_code($pdo, $input);
            break;
        
        case 'login':
            handle_login($pdo, $input);
            break;
        
        case 'guest':
            handle_guest();
            break;
        
        case 'logout':
            handle_logout();
            break;
        
        default:
            handle_error('Acción no válida', 400);
    }
    
} elseif ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    
    switch ($action) {
        case 'check_session':
            handle_check_session($pdo);
            break;
        
        default:
            handle_error('Acción no válida', 400);
    }
    
} else {
    handle_error('Método no permitido', 405);
}

// ====================================
// FUNCIÓN: Registrar usuario CON VERIFICACIÓN
// ====================================
function handle_register($pdo, $input) {
    try {
        $email = trim($input['email'] ?? '');
        $nombre = trim($input['nombre'] ?? '');
        $nick = trim($input['nick'] ?? '');
        $password = $input['password'] ?? '';
        
        // Validaciones
        if (empty($email) || empty($nombre) || empty($nick) || empty($password)) {
            throw new Exception('Todos los campos son obligatorios');
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new Exception('Email inválido');
        }
        
        if (strlen($password) < 6) {
            throw new Exception('La contraseña debe tener al menos 6 caracteres');
        }
        
        $usuario_aplicacion_key = uakey_from_email($email);
        $password_hash = password_hash($password, PASSWORD_DEFAULT);
        
        // Verificar si ya existe
        $stmt = $pdo->prepare("
            SELECT usuario_aplicacion_id, verified_at 
            FROM usuarios_aplicaciones 
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$usuario_aplicacion_key]);
        
        if ($existente = $stmt->fetch()) {
            // Si ya existe y está verificado
            if (!empty($existente['verified_at'])) {
                throw new Exception('El usuario ya está registrado en MemoFlip');
            } else {
                // Si existe pero NO está verificado, permitir reenvío de código
                throw new Exception('Ya existe un registro pendiente de verificación. Usa "Reenviar código".');
            }
        }
        
        // Generar código de verificación
        $codigo = generarCodigoVerificacion();
        $expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        // Insertar nuevo usuario (INACTIVO hasta verificar)
        $stmt = $pdo->prepare("
            INSERT INTO usuarios_aplicaciones 
            (usuario_aplicacion_key, email, nombre, nick, password_hash, app_codigo, 
             verification_code, verification_expiry, activo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
        ");
        $stmt->execute([
            $usuario_aplicacion_key, 
            $email, 
            $nombre, 
            $nick, 
            $password_hash, 
            APP_CODIGO,
            $codigo,
            $expiry
        ]);
        
        // Enviar email con código
        $emailEnviado = enviarEmailVerificacion($email, $nombre, $codigo);
        
        if ($emailEnviado) {
            json_response([
                'success' => true,
                'message' => 'Registro exitoso. Revisa tu email para el código de verificación.',
                'email_sent' => true,
                'requires_verification' => true
            ], 201);
        } else {
            // Si falla el envío, devolver el código para desarrollo
            json_response([
                'success' => true,
                'message' => 'Registro exitoso pero no se pudo enviar el email.',
                'email_sent' => false,
                'requires_verification' => true,
                'verification_code' => $codigo // Solo para debug
            ], 201);
        }
        
    } catch (Exception $e) {
        handle_error($e->getMessage(), 400, $e);
    }
}

// ====================================
// FUNCIÓN: Verificar código
// ====================================
function handle_verify_code($pdo, $input) {
    try {
        $email = trim($input['email'] ?? '');
        $codigo = trim($input['codigo'] ?? '');
        
        if (empty($email) || empty($codigo)) {
            throw new Exception('Email y código requeridos');
        }
        
        $usuario_key = uakey_from_email($email);
        
        // Buscar usuario
        $stmt = $pdo->prepare("
            SELECT * FROM usuarios_aplicaciones 
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$usuario_key]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            throw new Exception('Usuario no encontrado');
        }
        
        // Verificar si ya está verificado
        if (!empty($usuario['verified_at'])) {
            json_response([
                'success' => true,
                'message' => 'Email ya verificado',
                'already_verified' => true
            ]);
            return;
        }
        
        // Verificar código
        if ($usuario['verification_code'] !== $codigo) {
            throw new Exception('Código incorrecto');
        }
        
        // Verificar si el código ha expirado
        if (!codigoEsValido($usuario['verification_expiry'])) {
            throw new Exception('El código ha expirado. Solicita uno nuevo.');
        }
        
        // ✅ CÓDIGO VÁLIDO: Activar cuenta
        $stmt = $pdo->prepare("
            UPDATE usuarios_aplicaciones 
            SET verified_at = NOW(), 
                activo = 1,
                verification_code = NULL,
                verification_expiry = NULL
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$usuario_key]);
        
        // Crear usuario MemoFlip
        create_memoflip_user($pdo, $usuario_key);
        
        // Establecer sesión automáticamente
        set_user_session($email);
        
        json_response([
            'success' => true,
            'message' => '¡Cuenta verificada correctamente!',
            'verified' => true
        ]);
        
    } catch (Exception $e) {
        handle_error($e->getMessage(), 400, $e);
    }
}

// ====================================
// FUNCIÓN: Reenviar código
// ====================================
function handle_resend_code($pdo, $input) {
    try {
        $email = trim($input['email'] ?? '');
        
        if (empty($email)) {
            throw new Exception('Email requerido');
        }
        
        $usuario_key = uakey_from_email($email);
        
        // Buscar usuario
        $stmt = $pdo->prepare("
            SELECT * FROM usuarios_aplicaciones 
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$usuario_key]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            throw new Exception('Usuario no encontrado');
        }
        
        if (!empty($usuario['verified_at'])) {
            throw new Exception('Email ya verificado');
        }
        
        // Generar nuevo código
        $codigo = generarCodigoVerificacion();
        $expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
        
        // Actualizar en base de datos
        $stmt = $pdo->prepare("
            UPDATE usuarios_aplicaciones 
            SET verification_code = ?, 
                verification_expiry = ?
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$codigo, $expiry, $usuario_key]);
        
        // Reenviar email
        $emailEnviado = enviarEmailVerificacion($email, $usuario['nombre'], $codigo);
        
        json_response([
            'success' => true,
            'message' => 'Código reenviado a tu email',
            'email_sent' => $emailEnviado,
            'verification_code' => $emailEnviado ? null : $codigo // Solo si falla email
        ]);
        
    } catch (Exception $e) {
        handle_error($e->getMessage(), 400, $e);
    }
}

// ====================================
// FUNCIÓN: Login de usuario
// ====================================
function handle_login($pdo, $input) {
    try {
        $email = trim($input['email'] ?? '');
        $password = $input['password'] ?? '';
        
        // Validaciones
        if (empty($email) || empty($password)) {
            throw new Exception('Email y contraseña requeridos');
        }
        
        $usuario_aplicacion_key = uakey_from_email($email);
        
        // Buscar usuario
        $stmt = $pdo->prepare("
            SELECT * FROM usuarios_aplicaciones 
            WHERE usuario_aplicacion_key = ? AND app_codigo = ?
        ");
        $stmt->execute([$usuario_aplicacion_key, APP_CODIGO]);
        $user = $stmt->fetch();
        
        if (!$user) {
            throw new Exception('Usuario o contraseña incorrectos');
        }
        
        // Verificar si el email está verificado
        if (empty($user['verified_at'])) {
            throw new Exception('Debes verificar tu email antes de iniciar sesión');
        }
        
        // Verificar si está activo
        if (!$user['activo']) {
            throw new Exception('Usuario desactivado');
        }
        
        // Verificar contraseña
        if (!password_verify($password, $user['password_hash'])) {
            throw new Exception('Usuario o contraseña incorrectos');
        }
        
        // Actualizar último acceso
        $stmt = $pdo->prepare("
            UPDATE usuarios_aplicaciones 
            SET ultimo_acceso = NOW() 
            WHERE usuario_aplicacion_id = ?
        ");
        $stmt->execute([$user['usuario_aplicacion_id']]);
        
        // Crear usuario MemoFlip si no existe
        create_memoflip_user($pdo, $usuario_aplicacion_key);
        
        // Regenerar vidas
        regenerate_lives($pdo, $usuario_aplicacion_key);
        
        // Establecer sesión
        set_user_session($email);
        
        // Obtener datos del usuario MemoFlip
        $stmt = $pdo->prepare("
            SELECT * FROM memoflip_usuarios 
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$usuario_aplicacion_key]);
        $memoflipUser = $stmt->fetch();
        
        json_response([
            'success' => true,
            'message' => 'Login exitoso',
            'email' => $email,
            'nombre' => $user['nombre'],
            'game_data' => [
                'max_level_unlocked' => $memoflipUser['max_level_unlocked'] ?? 1,
                'coins_total' => $memoflipUser['coins_total'] ?? 0,
                'lives_current' => $memoflipUser['lives_current'] ?? 5,
                'sound_enabled' => $memoflipUser['sound_enabled'] ?? true
            ]
        ]);
        
    } catch (Exception $e) {
        handle_error($e->getMessage(), 401, $e);
    }
}

// ====================================
// FUNCIÓN: Modo invitado
// ====================================
function handle_guest() {
    $guest_id = 'guest_' . uniqid();
    
    json_response([
        'success' => true,
        'guest_id' => $guest_id,
        'message' => 'Sesión de invitado creada'
    ]);
}

// ====================================
// FUNCIÓN: Verificar sesión activa
// ====================================
function handle_check_session($pdo) {
    $uakey = get_session_uakey();
    
    if (!$uakey) {
        json_response([
            'success' => false,
            'authenticated' => false
        ]);
        return;
    }
    
    // Regenerar vidas
    regenerate_lives($pdo, $uakey);
    
    // Obtener datos del usuario
    $stmt = $pdo->prepare("
        SELECT u.*, ua.email, ua.nombre 
        FROM memoflip_usuarios u
        JOIN usuarios_aplicaciones ua ON u.usuario_aplicacion_key = ua.usuario_aplicacion_key
        WHERE u.usuario_aplicacion_key = ?
    ");
    $stmt->execute([$uakey]);
    $user = $stmt->fetch();
    
    if ($user) {
        json_response([
            'success' => true,
            'authenticated' => true,
            'email' => $user['email'],
            'nombre' => $user['nombre'],
            'game_data' => [
                'max_level_unlocked' => $user['max_level_unlocked'],
                'coins_total' => $user['coins_total'],
                'lives_current' => $user['lives_current'],
                'sound_enabled' => $user['sound_enabled']
            ]
        ]);
    } else {
        // Sesión existe pero usuario no encontrado - limpiar sesión
        logout_user();
        json_response([
            'success' => false,
            'authenticated' => false
        ]);
    }
}

// ====================================
// FUNCIÓN: Cerrar sesión
// ====================================
function handle_logout() {
    logout_user();
    
    json_response([
        'success' => true,
        'message' => 'Sesión cerrada correctamente'
    ]);
}
?>
