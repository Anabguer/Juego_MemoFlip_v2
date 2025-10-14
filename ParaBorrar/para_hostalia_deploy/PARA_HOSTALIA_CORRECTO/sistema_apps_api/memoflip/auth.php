<?php
/**
 * API de Autenticación para MemoFlip - Hostalia
 * Estructura: sistema_apps_api/memoflip/
 */

require_once 'config.php';

// Headers
header('Content-Type: application/json');

// Clase de autenticación simplificada para Hostalia
class AuthFinal {
    private $pdo;
    private $app_codigo;
    
    public function __construct($pdo, $app_codigo = 'memoflip') {
        $this->pdo = $pdo;
        $this->app_codigo = $app_codigo;
    }
    
    /**
     * Registrar usuario en aplicación específica
     */
    public function registerUser($email, $nombre, $password) {
        try {
            $usuario_aplicacion_key = generateMemoFlipUserKey($email);
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            
            // Verificar si ya existe
            $stmt = $this->pdo->prepare("
                SELECT usuario_aplicacion_id 
                FROM usuarios_aplicaciones 
                WHERE usuario_aplicacion_key = ?
            ");
            $stmt->execute([$usuario_aplicacion_key]);
            
            if ($stmt->fetch()) {
                throw new Exception('El usuario ya existe en MemoFlip');
            }
            
            // Insertar nuevo usuario (adaptado a la estructura real)
            $stmt = $this->pdo->prepare("
                INSERT INTO usuarios_aplicaciones 
                (usuario_aplicacion_key, email, nombre, password_hash, app_codigo) 
                VALUES (?, ?, ?, ?, ?)
            ");
            $stmt->execute([$usuario_aplicacion_key, $email, $nombre, $password_hash, $this->app_codigo]);
            
            return [
                'success' => true,
                'message' => 'Usuario registrado correctamente',
                'user_id' => $this->pdo->lastInsertId()
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Login en aplicación específica
     */
    public function loginUser($email, $password) {
        try {
            $usuario_aplicacion_key = generateMemoFlipUserKey($email);
            
            // Buscar usuario
            $stmt = $this->pdo->prepare("
                SELECT usuario_aplicacion_id, password_hash, activo 
                FROM usuarios_aplicaciones 
                WHERE usuario_aplicacion_key = ? AND app_codigo = ?
            ");
            $stmt->execute([$usuario_aplicacion_key, $this->app_codigo]);
            $user = $stmt->fetch();
            
            if (!$user) {
                throw new Exception('Usuario no encontrado');
            }
            
            if (!$user['activo']) {
                throw new Exception('Usuario desactivado');
            }
            
            // Verificar contraseña
            if (!password_verify($password, $user['password_hash'])) {
                throw new Exception('Contraseña incorrecta');
            }
            
            // Actualizar último acceso
            $stmt = $this->pdo->prepare("
                UPDATE usuarios_aplicaciones 
                SET ultimo_acceso = NOW() 
                WHERE usuario_aplicacion_id = ?
            ");
            $stmt->execute([$user['usuario_aplicacion_id']]);
            
            return [
                'success' => true,
                'message' => 'Login exitoso',
                'user_id' => $user['usuario_aplicacion_id']
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}

// Obtener método y datos
$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

// Inicializar autenticación para MemoFlip
$auth = new AuthFinal($pdo, APP_CODIGO);

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
