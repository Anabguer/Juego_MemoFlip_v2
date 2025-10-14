<?php
/**
 * auth.php - MemoFlip
 * Endpoints de autenticación: register, login, check_session, logout
 */

require_once '_common.php';

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
// FUNCIÓN: Registrar usuario
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
            SELECT usuario_aplicacion_id 
            FROM usuarios_aplicaciones 
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$usuario_aplicacion_key]);
        
        if ($stmt->fetch()) {
            throw new Exception('El usuario ya está registrado en MemoFlip');
        }
        
        // Insertar nuevo usuario en usuarios_aplicaciones
        $stmt = $pdo->prepare("
            INSERT INTO usuarios_aplicaciones 
            (usuario_aplicacion_key, email, nombre, nick, password_hash, app_codigo) 
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([$usuario_aplicacion_key, $email, $nombre, $nick, $password_hash, APP_CODIGO]);
        $user_id = $pdo->lastInsertId();
        
        // Crear usuario en memoflip_usuarios
        create_memoflip_user($pdo, $usuario_aplicacion_key);
        
        // Establecer sesión
        set_user_session($email);
        
        // Respuesta exitosa
        json_response([
            'success' => true,
            'message' => 'Usuario registrado correctamente',
            'user_id' => $user_id,
            'game_data' => [
                'max_level_unlocked' => 1,
                'coins_total' => 0,
                'lives_current' => 5,
                'sound_enabled' => true
            ]
        ], 201);
        
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
            SELECT usuario_aplicacion_id, password_hash, activo, nombre
            FROM usuarios_aplicaciones 
            WHERE usuario_aplicacion_key = ? AND app_codigo = ?
        ");
        $stmt->execute([$usuario_aplicacion_key, APP_CODIGO]);
        $user = $stmt->fetch();
        
        if (!$user) {
            throw new Exception('Usuario o contraseña incorrectos');
        }
        
        if (!$user['activo']) {
            throw new Exception('Usuario desactivado. Contacte al administrador');
        }
        
        // Verificar contraseña
        if (!password_verify($password, $user['password_hash'])) {
            throw new Exception('Usuario o contraseña incorrectos');
        }
        
        // Crear usuario MemoFlip si no existe
        create_memoflip_user($pdo, $usuario_aplicacion_key);
        
        // Regenerar vidas
        regenerate_lives($pdo, $usuario_aplicacion_key);
        
        // Obtener datos del juego
        $stmt = $pdo->prepare("
            SELECT max_level_unlocked, coins_total, lives_current, sound_enabled
            FROM memoflip_usuarios 
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$usuario_aplicacion_key]);
        $gameData = $stmt->fetch();
        
        // Actualizar último acceso
        $stmt = $pdo->prepare("
            UPDATE usuarios_aplicaciones 
            SET ultimo_acceso = NOW() 
            WHERE usuario_aplicacion_id = ?
        ");
        $stmt->execute([$user['usuario_aplicacion_id']]);
        
        // Establecer sesión
        set_user_session($email);
        
        // Respuesta exitosa
        json_response([
            'success' => true,
            'message' => 'Login exitoso',
            'user_id' => $user['usuario_aplicacion_id'],
            'nombre' => $user['nombre'],
            'game_data' => [
                'max_level_unlocked' => $gameData['max_level_unlocked'] ?? 1,
                'coins_total' => $gameData['coins_total'] ?? 0,
                'lives_current' => $gameData['lives_current'] ?? 5,
                'sound_enabled' => (bool)($gameData['sound_enabled'] ?? true)
            ]
        ]);
        
    } catch (Exception $e) {
        handle_error($e->getMessage(), 401, $e);
    }
}

// ====================================
// FUNCIÓN: Modo invitado (sin base de datos)
// ====================================
function handle_guest() {
    try {
        // Generar ID de invitado único
        $guest_id = 'guest_' . time() . '_' . bin2hex(random_bytes(4));
        
        // NO crear sesión para invitados (datos solo en localStorage)
        json_response([
            'success' => true,
            'message' => 'Modo invitado activado',
            'is_guest' => true,
            'guest_id' => $guest_id,
            'game_data' => [
                'max_level_unlocked' => 1,
                'coins_total' => 0,
                'lives_current' => 5,
                'sound_enabled' => true
            ]
        ]);
        
    } catch (Exception $e) {
        handle_error('Error al crear usuario invitado', 500, $e);
    }
}

// ====================================
// FUNCIÓN: Verificar sesión activa
// ====================================
function handle_check_session($pdo) {
    try {
        $uakey = get_session_uakey();
        
        if (!$uakey) {
            json_response([
                'success' => false,
                'authenticated' => false,
                'message' => 'No hay sesión activa'
            ]);
        }
        
        // Regenerar vidas
        regenerate_lives($pdo, $uakey);
        
        // Obtener datos actuales del juego
        $stmt = $pdo->prepare("
            SELECT u.max_level_unlocked, u.coins_total, u.lives_current, u.sound_enabled,
                   ua.email, ua.nombre
            FROM memoflip_usuarios u
            LEFT JOIN usuarios_aplicaciones ua ON u.usuario_aplicacion_key = ua.usuario_aplicacion_key
            WHERE u.usuario_aplicacion_key = ?
        ");
        $stmt->execute([$uakey]);
        $data = $stmt->fetch();
        
        if (!$data) {
            // Usuario en sesión pero no en BD, crear
            create_memoflip_user($pdo, $uakey);
            $data = [
                'max_level_unlocked' => 1,
                'coins_total' => 0,
                'lives_current' => 5,
                'sound_enabled' => true,
                'email' => $_SESSION['email'] ?? '',
                'nombre' => ''
            ];
        }
        
        json_response([
            'success' => true,
            'authenticated' => true,
            'email' => $data['email'],
            'nombre' => $data['nombre'],
            'game_data' => [
                'max_level_unlocked' => $data['max_level_unlocked'],
                'coins_total' => $data['coins_total'],
                'lives_current' => $data['lives_current'],
                'sound_enabled' => (bool)$data['sound_enabled']
            ]
        ]);
        
    } catch (Exception $e) {
        handle_error('Error al verificar sesión', 500, $e);
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

