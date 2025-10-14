<?php
/**
 * API de Autenticación para MemoFlip
 * Integración con sistema multi-aplicación
 */

// Configuración
require_once '../config/database.php';
require_once '../config/app_config_memoflip.php';
require_once '../includes/auth_final.php';

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
                    
                    // Registrar en sistema multi-aplicación
                    $result = $auth->registerUser($email, $nombre, $password);
                    
                    if ($result['success']) {
                        $usuario_key = generateMemoFlipUserKey($email);
                        
                        // Crear usuario en MemoFlip
                        createMemoFlipUser($pdo, $usuario_key);
                        
                        echo json_encode([
                            'success' => true,
                            'message' => 'Usuario registrado correctamente',
                            'user_key' => $usuario_key,
                            'user_id' => $result['user_id']
                        ]);
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
                
            case 'login':
                try {
                    $email = $input['email'] ?? '';
                    $password = $input['password'] ?? '';
                    
                    if (empty($email) || empty($password)) {
                        throw new Exception('Email y contraseña requeridos');
                    }
                    
                    // Login en sistema multi-aplicación
                    $result = $auth->loginUser($email, $password);
                    
                    if ($result['success']) {
                        $usuario_key = generateMemoFlipUserKey($email);
                        
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
                
            case 'guest':
                try {
                    $guest_id = 'guest_' . time() . '_' . rand(1000, 9999);
                    $usuario_key = generateMemoFlipUserKey($guest_id);
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'Usuario invitado creado',
                        'user_key' => $usuario_key,
                        'is_guest' => true,
                        'game_data' => [
                            'max_level_unlocked' => 1,
                            'coins_total' => 0,
                            'lives_current' => 5,
                            'sound_enabled' => true
                        ]
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
        // Verificar sesión o datos de usuario
        $user_key = $_GET['user_key'] ?? '';
        
        if (empty($user_key)) {
            http_response_code(400);
            echo json_encode(['error' => 'user_key requerido']);
            break;
        }
        
        try {
            // Regenerar vidas si no es invitado
            if (strpos($user_key, 'guest_') === false) {
                regenerateLives($pdo, $user_key);
            }
            
            // Obtener datos del usuario
            $stmt = $pdo->prepare("
                SELECT * FROM memoflip_usuarios 
                WHERE usuario_aplicacion_key = ?
            ");
            $stmt->execute([$user_key]);
            $user = $stmt->fetch();
            
            if ($user) {
                echo json_encode([
                    'success' => true,
                    'game_data' => [
                        'max_level_unlocked' => $user['max_level_unlocked'],
                        'coins_total' => $user['coins_total'],
                        'lives_current' => $user['lives_current'],
                        'sound_enabled' => $user['sound_enabled']
                    ]
                ]);
            } else {
                // Usuario no encontrado, crear si no es invitado
                if (strpos($user_key, 'guest_') === false) {
                    createMemoFlipUser($pdo, $user_key);
                }
                
                echo json_encode([
                    'success' => true,
                    'game_data' => [
                        'max_level_unlocked' => 1,
                        'coins_total' => 0,
                        'lives_current' => 5,
                        'sound_enabled' => true
                    ]
                ]);
            }
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
?>
