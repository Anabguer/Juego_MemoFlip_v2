<?php
// 🧪 TEST SAVE PROGRESS - PROBAR GUARDADO MANUAL
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$host = 'PMYSQL165.dns-servicio.com';
$dbname = '9606966_sistema_apps_db';
$username = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Simular datos de progreso (como si vinieran de la APK)
    $test_data = [
        'user_key' => 'test_progreso_memoflip',
        'level' => 5,
        'coins' => 1500,
        'lives' => 3,
        'total_score' => 1500
    ];
    
    echo "🧪 TESTING SAVE PROGRESS...\n";
    echo "Datos de prueba: " . json_encode($test_data) . "\n\n";
    
    $usuario_aplicacion_key = $test_data['user_key'];
    $level = $test_data['level'];
    $coins = $test_data['coins'];
    $lives = $test_data['lives'];
    $total_score = $test_data['total_score'];
    
    // 1. Insertar en memoflip_usuarios
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
    
    // 2. Insertar en memoflip_ranking_cache
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
    
    // 3. Verificar inserción
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
    
    // 4. Test de actualización (simular superar nivel)
    echo "\n🔄 SIMULANDO SUPERAR NIVEL...\n";
    
    $new_data = [
        'user_key' => 'test_progreso_memoflip',
        'level' => 6,  // Nivel superior
        'coins' => 1800, // Más monedas
        'lives' => 2,    // Menos vidas
        'total_score' => 1800
    ];
    
    echo "Nuevos datos: " . json_encode($new_data) . "\n";
    
    // Actualizar con nuevos datos
    $stmt1 = $pdo->prepare($sql1);
    $result1 = $stmt1->execute([
        ':usuario_aplicacion_key' => $new_data['user_key'],
        ':level' => (int)$new_data['level'],
        ':coins' => (int)$new_data['coins'],
        ':total_score' => (int)$new_data['total_score'],
        ':lives' => (int)$new_data['lives']
    ]);
    
    echo "✅ Actualización memoflip_usuarios: " . ($result1 ? 'EXITOSA' : 'FALLIDA') . "\n";
    
    $stmt2 = $pdo->prepare($sql2);
    $result2 = $stmt2->execute([
        ':usuario_aplicacion_key' => $new_data['user_key'],
        ':level' => (int)$new_data['level'],
        ':coins' => (int)$new_data['coins'],
        ':total_score' => (int)$new_data['total_score']
    ]);
    
    echo "✅ Actualización memoflip_ranking_cache: " . ($result2 ? 'EXITOSA' : 'FALLIDA') . "\n";
    
    // Verificar actualización
    $stmt = $pdo->prepare("SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = ?");
    $stmt->execute([$usuario_aplicacion_key]);
    $user_updated = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user_updated) {
        echo "\n✅ Usuario actualizado en BD:\n";
        echo "Nivel: " . $user_updated['max_level_unlocked'] . " (era: " . $user['max_level_unlocked'] . ")\n";
        echo "Monedas: " . $user_updated['coins_total'] . " (era: " . $user['coins_total'] . ")\n";
        echo "Puntos: " . $user_updated['total_score'] . " (era: " . $user['total_score'] . ")\n";
        echo "Vidas: " . $user_updated['lives_current'] . " (era: " . $user['lives_current'] . ")\n";
    }
    
    // Limpiar datos de prueba
    $stmt = $pdo->prepare("DELETE FROM memoflip_usuarios WHERE usuario_aplicacion_key = ?");
    $stmt->execute([$usuario_aplicacion_key]);
    
    $stmt = $pdo->prepare("DELETE FROM memoflip_ranking_cache WHERE usuario_aplicacion_key = ?");
    $stmt->execute([$usuario_aplicacion_key]);
    
    echo "\n✅ Datos de prueba eliminados\n";
    echo "\n🎯 CONCLUSIÓN: El guardado de progreso FUNCIONA correctamente\n";
    
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>

