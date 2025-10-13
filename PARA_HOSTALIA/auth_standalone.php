<?php
/**
 * API de Autenticación para MemoFlip - STANDALONE
 * Versión sin dependencias externas
 */

// Sistema de envío de emails
require_once 'enviar_email.php';

// Headers para CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Iniciar sesión
session_start();

// Configuración de BD
define('DB_HOST', 'PMYSQL165.dns-servicio.com');
define('DB_NOMBRE', '9606966_sistema_apps_db');
define('DB_USUARIO', 'sistema_apps_user');
define('DB_CONTRA', 'GestionUploadSistemaApps!');
define('APP_CODIGO', 'memoflip');

// Conexión a la base de datos
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NOMBRE . ";charset=utf8",
        DB_USUARIO,
        DB_CONTRA,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos']);
    exit;
}

// Obtener método y datos
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Función helper: generar user key
function generateMemoFlipUserKey($email) {
    return $email . '_' . APP_CODIGO;
}

// Función para crear usuario MemoFlip
function createMemoFlipUser($pdo, $usuario_aplicacion_key) {
    try {
        $stmt = $pdo->prepare("
            INSERT IGNORE INTO memoflip_usuarios (usuario_aplicacion_key) 
            VALUES (?)
        ");
        $stmt->execute([$usuario_aplicacion_key]);
        return true;
    } catch (PDOException $e) {
        error_log("Error creando usuario MemoFlip: " . $e->getMessage());
        return false;
    }
}

// Función para regenerar vidas
function regenerateLives($pdo, $usuario_aplicacion_key) {
    try {
        // Lógica simple de regeneración
        $stmt = $pdo->prepare("
            UPDATE memoflip_usuarios 
            SET lives_current = LEAST(lives_current + 
                TIMESTAMPDIFF(HOUR, lives_last_regen, NOW()), 5),
                lives_last_regen = IF(lives_current < 5, NOW(), lives_last_regen)
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$usuario_aplicacion_key]);
        return true;
    } catch (PDOException $e) {
        error_log("Error regenerando vidas: " . $e->getMessage());
        return false;
    }
}

// Router de endpoints
switch ($method) {
    case 'POST':
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'register':
                try {
                    $email = $input['email'] ?? '';
                    $nombre = $input['nombre'] ?? '';
                    $nick = $input['nick'] ?? $nombre;
                    $password = $input['password'] ?? '';
                    
                    if (empty($email) || empty($nombre) || empty($password)) {
                        throw new Exception('Datos incompletos');
                    }
                    
                    $usuario_key = generateMemoFlipUserKey($email);
                    
                    // Verificar si ya existe
                    $stmt = $pdo->prepare("
                        SELECT * FROM usuarios_aplicaciones 
                        WHERE usuario_aplicacion_key = ?
                    ");
                    $stmt->execute([$usuario_key]);
                    if ($stmt->rowCount() > 0) {
                        throw new Exception('El usuario ya existe');
                    }
                    
                    // Generar código de verificación
                    $codigo = generarCodigoVerificacion();
                    $expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
                    
                    // Hash de password
                    $password_hash = password_hash($password, PASSWORD_DEFAULT);
                    
                    // Insertar usuario (INACTIVO hasta verificar)
                    $stmt = $pdo->prepare("
                        INSERT INTO usuarios_aplicaciones (
                            usuario_aplicacion_key,
                            email,
                            nombre,
                            nick,
                            password_hash,
                            app_codigo,
                            verification_code,
                            verification_expiry,
                            activo,
                            verified_at
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NULL)
                    ");
                    $stmt->execute([
                        $usuario_key,
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
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Registro exitoso. Revisa tu email para el código de verificación.',
                        'email_sent' => $emailEnviado,
                        'requires_verification' => true,
                        'user_key' => $usuario_key,
                        'verification_code' => $emailEnviado ? null : $codigo // Solo si falla email
                    ]);
                    
                } catch (Exception $e) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            case 'verify_code':
                try {
                    $email = $input['email'] ?? '';
                    $codigo = $input['codigo'] ?? '';
                    
                    if (empty($email) || empty($codigo)) {
                        throw new Exception('Email y código requeridos');
                    }
                    
                    $usuario_key = generateMemoFlipUserKey($email);
                    
                    // Buscar usuario y verificar código
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
                        echo json_encode([
                            'success' => true,
                            'message' => 'Email ya verificado',
                            'already_verified' => true
                        ]);
                        break;
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
                    createMemoFlipUser($pdo, $usuario_key);
                    
                    echo json_encode([
                        'success' => true,
                        'message' => '¡Cuenta verificada correctamente!',
                        'verified' => true,
                        'user_key' => $usuario_key
                    ]);
                    
                } catch (Exception $e) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            case 'resend_code':
                try {
                    $email = $input['email'] ?? '';
                    
                    if (empty($email)) {
                        throw new Exception('Email requerido');
                    }
                    
                    $usuario_key = generateMemoFlipUserKey($email);
                    
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
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Código reenviado a tu email',
                        'email_sent' => $emailEnviado,
                        'verification_code' => $emailEnviado ? null : $codigo
                    ]);
                    
                } catch (Exception $e) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            case 'login':
                try {
                    $email = $input['email'] ?? '';
                    $password = $input['password'] ?? '';
                    
                    if (empty($email) || empty($password)) {
                        throw new Exception('Email y contraseña requeridos');
                    }
                    
                    $usuario_key = generateMemoFlipUserKey($email);
                    
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
                    
                    // Verificar si el email está verificado
                    if (empty($usuario['verified_at'])) {
                        throw new Exception('Debes verificar tu email antes de iniciar sesión');
                    }
                    
                    // Verificar password
                    if (!password_verify($password, $usuario['password_hash'])) {
                        throw new Exception('Contraseña incorrecta');
                    }
                    
                    // Guardar sesión
                    $_SESSION['user_key'] = $usuario_key;
                    $_SESSION['email'] = $email;
                    $_SESSION['nombre'] = $usuario['nombre'];
                    
                    // Crear usuario MemoFlip si no existe
                    createMemoFlipUser($pdo, $usuario_key);
                    
                    // Regenerar vidas si es necesario
                    regenerateLives($pdo, $usuario_key);
                    
                    // Obtener datos del usuario MemoFlip
                    $stmt = $pdo->prepare("
                        SELECT * FROM memoflip_usuarios 
                        WHERE usuario_aplicacion_key = ?
                    ");
                    $stmt->execute([$usuario_key]);
                    $memoflipUser = $stmt->fetch();
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Login exitoso',
                        'user_key' => $usuario_key,
                        'email' => $email,
                        'nombre' => $usuario['nombre'],
                        'authenticated' => true,
                        'game_data' => [
                            'max_level_unlocked' => $memoflipUser['max_level_unlocked'] ?? 1,
                            'coins_total' => $memoflipUser['coins_total'] ?? 0,
                            'lives_current' => $memoflipUser['lives_current'] ?? 5,
                            'sound_enabled' => $memoflipUser['sound_enabled'] ?? true
                        ]
                    ]);
                    
                } catch (Exception $e) {
                    http_response_code(401);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            case 'logout':
                try {
                    // Cerrar sesión
                    session_destroy();
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Sesión cerrada'
                    ]);
                    
                } catch (Exception $e) {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'error' => $e->getMessage()
                    ]);
                }
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Acción no válida: ' . $action]);
                break;
        }
        break;
        
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'check_session':
                // Verificar si hay sesión activa
                if (isset($_SESSION['user_key'])) {
                    $user_key = $_SESSION['user_key'];
                    
                    // Regenerar vidas
                    regenerateLives($pdo, $user_key);
                    
                    // Obtener datos del usuario
                    $stmt = $pdo->prepare("
                        SELECT u.*, ua.email, ua.nombre 
                        FROM memoflip_usuarios u
                        JOIN usuarios_aplicaciones ua ON u.usuario_aplicacion_key = ua.usuario_aplicacion_key
                        WHERE u.usuario_aplicacion_key = ?
                    ");
                    $stmt->execute([$user_key]);
                    $user = $stmt->fetch();
                    
                    if ($user) {
                        echo json_encode([
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
                        echo json_encode([
                            'success' => false,
                            'authenticated' => false
                        ]);
                    }
                } else {
                    echo json_encode([
                        'success' => false,
                        'authenticated' => false
                    ]);
                }
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Acción no válida']);
                break;
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
?>

