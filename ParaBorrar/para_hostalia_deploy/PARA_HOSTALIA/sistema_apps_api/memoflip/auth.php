<?php
/**
 * API de Autenticación para MemoFlip CON VERIFICACIÓN DE EMAIL
 * Integración con sistema multi-aplicación + verificación por código
 */

// Configuración
require_once '../config/database.php';
require_once '../config/app_config_memoflip.php';
require_once '../includes/auth_final.php';

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

// Inicializar autenticación para MemoFlip
$auth = new AuthFinal($pdo, APP_CODIGO);

// Obtener método y datos
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Función para crear usuario MemoFlip
function createMemoFlipUser($pdo, $usuario_aplicacion_key) {
    try {
        $stmt = $pdo->prepare("CALL CreateMemoFlipUser(?)");
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
        $stmt = $pdo->prepare("CALL RegenerateLives(?)");
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
                    $password = $input['password'] ?? '';
                    
                    if (empty($email) || empty($nombre) || empty($password)) {
                        throw new Exception('Datos incompletos');
                    }
                    
                    // Generar código de verificación
                    $codigo = generarCodigoVerificacion();
                    
                    // Registrar en sistema multi-aplicación (INACTIVO hasta verificar)
                    $result = $auth->registerUser($email, $nombre, $password, false); // false = inactivo
                    
                    if ($result['success']) {
                        $usuario_key = generateMemoFlipUserKey($email);
                        
                        // Guardar código de verificación en la base de datos
                        // Usar columnas CORRECTAS: verification_code, verification_expiry
                        $expiry = date('Y-m-d H:i:s', strtotime('+24 hours'));
                        
                        $stmt = $pdo->prepare("
                            UPDATE usuarios_aplicaciones 
                            SET verification_code = ?, 
                                verification_expiry = ?,
                                verified_at = NULL,
                                activo = 0
                            WHERE usuario_aplicacion_key = ?
                        ");
                        $stmt->execute([$codigo, $expiry, $usuario_key]);
                        
                        // Enviar email con código
                        $emailEnviado = enviarEmailVerificacion($email, $nombre, $codigo);
                        
                        if ($emailEnviado) {
                            echo json_encode([
                                'success' => true,
                                'message' => 'Registro exitoso. Revisa tu email para el código de verificación.',
                                'email_sent' => true,
                                'requires_verification' => true,
                                'user_key' => $usuario_key
                            ]);
                        } else {
                            // Si falla el envío, dar el código directamente (para desarrollo)
                            echo json_encode([
                                'success' => true,
                                'message' => 'Registro exitoso pero no se pudo enviar el email.',
                                'email_sent' => false,
                                'requires_verification' => true,
                                'verification_code' => $codigo, // Solo en desarrollo
                                'user_key' => $usuario_key
                            ]);
                        }
                    } else {
                        throw new Exception($result['message']);
                    }
                    
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
                        'verification_code' => $emailEnviado ? null : $codigo // Solo mostrar si falla email
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
                    
                    // Verificar si el email está verificado
                    $stmt = $pdo->prepare("
                        SELECT verified_at FROM usuarios_aplicaciones 
                        WHERE usuario_aplicacion_key = ?
                    ");
                    $stmt->execute([$usuario_key]);
                    $usuario = $stmt->fetch();
                    
                    if ($usuario && empty($usuario['verified_at'])) {
                        throw new Exception('Debes verificar tu email antes de iniciar sesión');
                    }
                    
                    // Login en sistema multi-aplicación
                    $result = $auth->loginUser($email, $password);
                    
                    if ($result['success']) {
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
                            'user_id' => $result['user_id'],
                            'email' => $email,
                            'nombre' => $result['nombre'] ?? '',
                            'game_data' => [
                                'max_level_unlocked' => $memoflipUser['max_level_unlocked'] ?? 1,
                                'coins_total' => $memoflipUser['coins_total'] ?? 0,
                                'lives_current' => $memoflipUser['lives_current'] ?? 5,
                                'sound_enabled' => $memoflipUser['sound_enabled'] ?? true
                            ]
                        ]);
                    } else {
                        throw new Exception($result['message']);
                    }
                    
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
                    // Cerrar sesión (si usas sesiones PHP)
                    if (session_status() === PHP_SESSION_ACTIVE) {
                        session_destroy();
                    }
                    
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
                echo json_encode(['error' => 'Acción no válida']);
                break;
        }
        break;
        
    case 'GET':
        $action = $_GET['action'] ?? '';
        
        switch ($action) {
            case 'check_session':
                // Verificar si hay sesión activa
                session_start();
                
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

