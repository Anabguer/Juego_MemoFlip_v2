<?php
/**
 * _common.php - MemoFlip
 * Configuración compartida, conexión DB y funciones comunes
 * Incluir este archivo al inicio de cada endpoint PHP
 */

// ====================================
// CONFIGURACIÓN DE SESIÓN (estilo Lumetrix)
// ====================================
session_set_cookie_params([
    'lifetime' => 60 * 60 * 24 * 30,        // 30 días
    'path'     => '/sistema_apps_upload/',  // Accesible desde toda la app
    'secure'   => true,                      // Solo HTTPS
    'httponly' => true,                      // No accesible desde JS
    'samesite' => 'Lax',                    // Protección CSRF
]);
session_name('PHPSESSID');
session_start();

// ====================================
// CONFIGURACIÓN DE BASE DE DATOS
// ====================================
define('DB_HOST', 'PMYSQL165.dns-servicio.com');
define('DB_USUARIO', 'sistema_apps_user');
define('DB_CONTRA', 'GestionUploadSistemaApps!');
define('DB_NOMBRE', '9606966_sistema_apps_db');

// ====================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ====================================
define('APP_CODIGO', 'memoflip');
define('APP_NOMBRE', 'MemoFlip');
define('APP_VERSION', '1.0.0');

// ====================================
// HEADERS CORS Y SEGURIDAD
// ====================================
header('Access-Control-Allow-Origin: https://colisan.com');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ====================================
// CONEXIÓN A BASE DE DATOS
// ====================================
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NOMBRE . ";charset=utf8mb4",
        DB_USUARIO,
        DB_CONTRA,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Error de conexión a la base de datos'
    ]);
    error_log('DB Error MemoFlip: ' . $e->getMessage());
    exit;
}

// ====================================
// FUNCIÓN: Generar clave canónica usuario_aplicacion_key
// ====================================
/**
 * Genera la clave canónica: email_memoflip
 * Esta es la ÚNICA fuente de verdad para identificar usuarios
 */
function uakey_from_email(string $email, string $app = APP_CODIGO): string {
    return strtolower(trim($email)) . '_' . $app;
}

// ====================================
// FUNCIÓN: Requiere autenticación (sesión válida)
// ====================================
/**
 * Verifica que el usuario esté autenticado
 * Si no lo está, devuelve 401 y termina la ejecución
 */
function require_login() {
    if (empty($_SESSION['uakey'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'unauthorized',
            'message' => 'Debe iniciar sesión'
        ]);
        exit;
    }
}

// ====================================
// FUNCIÓN: Obtener uakey de la sesión
// ====================================
/**
 * Obtiene el uakey del usuario autenticado
 * Retorna null si no hay sesión
 */
function get_session_uakey(): ?string {
    return $_SESSION['uakey'] ?? null;
}

// ====================================
// FUNCIÓN: Establecer sesión de usuario
// ====================================
/**
 * Establece la sesión del usuario después del login/registro
 */
function set_user_session(string $email) {
    $_SESSION['uakey'] = uakey_from_email($email);
    $_SESSION['email'] = $email;
    $_SESSION['app'] = APP_CODIGO;
    $_SESSION['login_time'] = time();
}

// ====================================
// FUNCIÓN: Cerrar sesión
// ====================================
/**
 * Limpia la sesión del usuario
 */
function logout_user() {
    $_SESSION = [];
    session_destroy();
}

// ====================================
// FUNCIÓN: Crear usuario MemoFlip si no existe
// ====================================
/**
 * Crea un usuario en memoflip_usuarios si no existe
 */
function create_memoflip_user($pdo, string $usuario_aplicacion_key): bool {
    try {
        $stmt = $pdo->prepare("
            INSERT IGNORE INTO memoflip_usuarios 
            (usuario_aplicacion_key, max_level_unlocked, coins_total, lives_current) 
            VALUES (?, 1, 0, 5)
        ");
        $stmt->execute([$usuario_aplicacion_key]);
        return true;
    } catch (PDOException $e) {
        error_log("Error creando usuario MemoFlip: " . $e->getMessage());
        return false;
    }
}

// ====================================
// FUNCIÓN: Regenerar vidas
// ====================================
/**
 * Regenera vidas basándose en el tiempo transcurrido
 */
function regenerate_lives($pdo, string $usuario_aplicacion_key): bool {
    try {
        // Obtener datos del usuario
        $stmt = $pdo->prepare("
            SELECT lives_current, lives_last_regen, 
                   TIMESTAMPDIFF(HOUR, lives_last_regen, NOW()) as hours_passed
            FROM memoflip_usuarios 
            WHERE usuario_aplicacion_key = ?
        ");
        $stmt->execute([$usuario_aplicacion_key]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return false;
        }
        
        $max_lives = 5;
        $current_lives = $user['lives_current'];
        $hours_passed = $user['hours_passed'];
        
        // Solo regenerar si han pasado horas y no tiene vidas máximas
        if ($hours_passed > 0 && $current_lives < $max_lives) {
            $new_lives = min($max_lives, $current_lives + $hours_passed);
            
            $stmt = $pdo->prepare("
                UPDATE memoflip_usuarios 
                SET lives_current = ?, lives_last_regen = NOW()
                WHERE usuario_aplicacion_key = ?
            ");
            $stmt->execute([$new_lives, $usuario_aplicacion_key]);
        }
        
        return true;
    } catch (PDOException $e) {
        error_log("Error regenerando vidas: " . $e->getMessage());
        return false;
    }
}

// ====================================
// FUNCIÓN: Validar user_key (SOLO para modo invitado/local)
// ====================================
/**
 * Valida formato de user_key
 * IMPORTANTE: Para endpoints autenticados, usar require_login() en su lugar
 */
function validate_userkey_format(string $user_key): bool {
    if (empty($user_key)) {
        return false;
    }
    
    // Formato válido: email_memoflip o guest_*
    return (strpos($user_key, '_memoflip') !== false || strpos($user_key, 'guest_') === 0);
}

// ====================================
// FUNCIÓN: Respuesta JSON estandarizada
// ====================================
/**
 * Envía una respuesta JSON y termina la ejecución
 */
function json_response(array $data, int $http_code = 200) {
    http_response_code($http_code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// ====================================
// FUNCIÓN: Manejo de errores
// ====================================
/**
 * Maneja errores de forma consistente
 */
function handle_error(string $message, int $code = 500, ?Exception $e = null) {
    if ($e) {
        error_log("MemoFlip Error: {$message} - " . $e->getMessage());
    }
    
    json_response([
        'success' => false,
        'error' => $message
    ], $code);
}

// ====================================
// CONFIGURACIÓN DE ERRORES
// ====================================
// En producción, NO mostrar errores al cliente
ini_set('display_errors', '0');
error_reporting(E_ALL);
?>

