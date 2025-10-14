<?php
/**
 * save_progress.php
 * Endpoint dedicado para guardar progreso de usuario en MemoFlip
 * 
 * Acepta JSON con user_key, level, coins, lives
 * Usa INSERT ... ON DUPLICATE KEY UPDATE para sincronizar siempre al nivel más alto
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido. Usa POST.']);
    exit;
}

// Función de error
function fail($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg]);
    exit;
}

// Leer JSON del body
$raw = file_get_contents('php://input');
$in = json_decode($raw, true);

if (!$in) {
    fail('JSON inválido o vacío');
}

// Validar parámetros requeridos
$user_key = trim($in['user_key'] ?? '');
$level    = intval($in['level'] ?? -1);
$coins    = intval($in['coins'] ?? 0);
$lives    = intval($in['lives'] ?? 0);

if ($user_key === '' || $level < 0) {
    fail('Parámetros incompletos. Se requiere user_key y level >= 0');
}

// Incluir configuración de base de datos
$config_path = __DIR__ . '/config_db.php';
if (!file_exists($config_path)) {
    fail('Configuración de base de datos no encontrada', 500);
}

require_once $config_path;

// Conectar a la base de datos
$mysqli = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_errno) {
    fail('Error de conexión a la base de datos: ' . $mysqli->connect_error, 500);
}

$mysqli->set_charset('utf8mb4');

// Preparar INSERT ... ON DUPLICATE KEY UPDATE
// Esto garantiza que:
// 1. Si el usuario no existe, se crea con los valores proporcionados
// 2. Si el usuario existe, se actualiza solo si el nuevo nivel es mayor
$stmt = $mysqli->prepare("
    INSERT INTO memoflip_usuarios (usuario_aplicacion_key, max_level_unlocked, coins_total, lives_current, total_score)
    VALUES (?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        max_level_unlocked = GREATEST(max_level_unlocked, VALUES(max_level_unlocked)),
        coins_total = VALUES(coins_total),
        lives_current = VALUES(lives_current),
        total_score = VALUES(total_score)
");

if (!$stmt) {
    fail('Error al preparar consulta: ' . $mysqli->error, 500);
}

// total_score = coins (según la lógica del juego)
$total_score = $coins;
$stmt->bind_param('siiii', $user_key, $level, $coins, $lives, $total_score);
$ok = $stmt->execute();

if (!$ok) {
    fail('Error al ejecutar consulta: ' . $stmt->error, 500);
}

$affected_rows = $stmt->affected_rows;
$stmt->close();
$mysqli->close();

// Respuesta exitosa
echo json_encode([
    'ok' => true,
    'saved_level' => $level,
    'user_key' => $user_key,
    'affected_rows' => $affected_rows,
    'message' => 'Progreso guardado correctamente'
]);
