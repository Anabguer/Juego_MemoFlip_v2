<?php
// 🚨 DEBUG SAVE PROGRESS - VER QUÉ DATOS LLEGAN
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

echo "=== DEBUG SAVE PROGRESS ===\n";
echo "Fecha: " . date('Y-m-d H:i:s') . "\n";
echo "Método: " . $_SERVER['REQUEST_METHOD'] . "\n";
echo "Content-Type: " . ($_SERVER['CONTENT_TYPE'] ?? 'No definido') . "\n";
echo "\n";

// Verificar datos recibidos
$raw_input = file_get_contents('php://input');
echo "Raw input: " . $raw_input . "\n\n";

$data = json_decode($raw_input, true);
echo "JSON decodificado:\n";
print_r($data);
echo "\n";

// Verificar POST también
echo "POST data:\n";
print_r($_POST);
echo "\n";

// Verificar GET también
echo "GET data:\n";
print_r($_GET);
echo "\n";

// Test de conexión a BD
$host = 'PMYSQL165.dns-servicio.com';
$dbname = '9606966_sistema_apps_db';
$username = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Conexión BD exitosa\n";
    
    // Si hay datos, intentar insertar
    if ($data && isset($data['user_key'])) {
        echo "\n=== INTENTANDO INSERTAR DATOS ===\n";
        
        $usuario_aplicacion_key = $data['user_key'] ?? null;
        $level = $data['level'] ?? null;
        $coins = $data['coins'] ?? null;
        $lives = $data['lives'] ?? null;
        $total_score = $data['total_score'] ?? $coins;
        
        echo "user_key: " . $usuario_aplicacion_key . "\n";
        echo "level: " . $level . "\n";
        echo "coins: " . $coins . "\n";
        echo "lives: " . $lives . "\n";
        echo "total_score: " . $total_score . "\n";
        
        if ($usuario_aplicacion_key && $level !== null && $coins !== null && $lives !== null) {
            // Insertar en memoflip_usuarios
            $sql1 = "INSERT INTO memoflip_usuarios (usuario_aplicacion_key, max_level_unlocked, coins_total, total_score, lives_current, fecha_modificacion)
                     VALUES (:usuario_aplicacion_key, :level, :coins, :total_score, :lives, NOW())
                     ON DUPLICATE KEY UPDATE
                     max_level_unlocked = VALUES(max_level_unlocked),
                     coins_total = VALUES(coins_total),
                     total_score = VALUES(total_score),
                     lives_current = VALUES(lives_current),
                     fecha_modificacion = NOW()";
            
            $stmt1 = $pdo->prepare($sql1);
            $result1 = $stmt1->execute([
                ':usuario_aplicacion_key' => $usuario_aplicacion_key,
                ':level' => (int)$level,
                ':coins' => (int)$coins,
                ':total_score' => (int)$total_score,
                ':lives' => (int)$lives
            ]);
            
            echo "✅ Inserción memoflip_usuarios: " . ($result1 ? 'EXITOSA' : 'FALLIDA') . "\n";
            
            // Insertar en memoflip_ranking_cache
            $sql2 = "INSERT INTO memoflip_ranking_cache (usuario_aplicacion_key, max_level_unlocked, coins_total, total_score)
                     VALUES (:usuario_aplicacion_key, :level, :coins, :total_score)
                     ON DUPLICATE KEY UPDATE
                     max_level_unlocked = VALUES(max_level_unlocked),
                     coins_total = VALUES(coins_total),
                     total_score = VALUES(total_score)";
            
            $stmt2 = $pdo->prepare($sql2);
            $result2 = $stmt2->execute([
                ':usuario_aplicacion_key' => $usuario_aplicacion_key,
                ':level' => (int)$level,
                ':coins' => (int)$coins,
                ':total_score' => (int)$total_score
            ]);
            
            echo "✅ Inserción memoflip_ranking_cache: " . ($result2 ? 'EXITOSA' : 'FALLIDA') . "\n";
            
            // Verificar inserción
            $stmt = $pdo->prepare("SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = ?");
            $stmt->execute([$usuario_aplicacion_key]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($user) {
                echo "\n✅ Usuario verificado en BD:\n";
                echo "Nivel: " . $user['max_level_unlocked'] . "\n";
                echo "Monedas: " . $user['coins_total'] . "\n";
                echo "Puntos: " . $user['total_score'] . "\n";
                echo "Vidas: " . $user['lives_current'] . "\n";
            }
            
        } else {
            echo "❌ Faltan datos requeridos\n";
        }
    } else {
        echo "❌ No hay datos de user_key\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Error BD: " . $e->getMessage() . "\n";
}

echo "\n=== FIN DEBUG ===\n";
?>

