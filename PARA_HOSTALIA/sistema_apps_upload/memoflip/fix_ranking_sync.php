<?php
// 🔧 FIX RANKING SYNC - SINCRONIZAR USUARIOS CON RANKING
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'PMYSQL165.dns-servicio.com';
$dbname = '9606966_sistema_apps_db';
$username = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔧 SINCRONIZANDO USUARIOS CON RANKING...\n\n";
    
    // 1. Obtener todos los usuarios de memoflip_usuarios
    $stmt = $pdo->query("SELECT * FROM memoflip_usuarios ORDER BY total_score DESC, max_level_unlocked DESC");
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "👥 Usuarios encontrados: " . count($usuarios) . "\n\n";
    
    $sincronizados = 0;
    $errores = 0;
    
    foreach ($usuarios as $usuario) {
        echo "🔄 Sincronizando: " . $usuario['usuario_aplicacion_key'] . "\n";
        echo "   Nivel: " . $usuario['max_level_unlocked'] . "\n";
        echo "   Puntos: " . $usuario['total_score'] . "\n";
        echo "   Monedas: " . $usuario['coins_total'] . "\n";
        
        // Insertar/actualizar en ranking_cache
        $sql = "INSERT INTO memoflip_ranking_cache (
                    usuario_aplicacion_key, 
                    nombre, 
                    email, 
                    max_level_unlocked, 
                    coins_total, 
                    total_score,
                    levels_completed,
                    total_stars,
                    avg_time,
                    registro_fecha
                ) VALUES (
                    :usuario_aplicacion_key,
                    :nombre,
                    :email,
                    :max_level_unlocked,
                    :coins_total,
                    :total_score,
                    :levels_completed,
                    :total_stars,
                    :avg_time,
                    :registro_fecha
                ) ON DUPLICATE KEY UPDATE
                    max_level_unlocked = VALUES(max_level_unlocked),
                    coins_total = VALUES(coins_total),
                    total_score = VALUES(total_score),
                    levels_completed = VALUES(levels_completed),
                    total_stars = VALUES(total_stars),
                    avg_time = VALUES(avg_time)";
        
        $stmt = $pdo->prepare($sql);
        
        // Extraer email del usuario_aplicacion_key (quitar _memoflip)
        $email = str_replace('_memoflip', '', $usuario['usuario_aplicacion_key']);
        $nombre = explode('@', $email)[0]; // Usar parte antes del @ como nombre
        
        $result = $stmt->execute([
            ':usuario_aplicacion_key' => $usuario['usuario_aplicacion_key'],
            ':nombre' => $nombre,
            ':email' => $email,
            ':max_level_unlocked' => $usuario['max_level_unlocked'],
            ':coins_total' => $usuario['coins_total'],
            ':total_score' => $usuario['total_score'],
            ':levels_completed' => $usuario['max_level_unlocked'], // Usar nivel como niveles completados
            ':total_stars' => $usuario['coins_total'], // Usar monedas como estrellas
            ':avg_time' => 0.00,
            ':registro_fecha' => $usuario['fecha_modificacion']
        ]);
        
        if ($result) {
            echo "   ✅ Sincronizado correctamente\n";
            $sincronizados++;
        } else {
            echo "   ❌ Error en sincronización\n";
            $errores++;
        }
        echo "\n";
    }
    
    echo "📊 RESUMEN:\n";
    echo "✅ Sincronizados: $sincronizados\n";
    echo "❌ Errores: $errores\n\n";
    
    // Verificar resultado final
    $stmt = $pdo->query("SELECT COUNT(*) FROM memoflip_ranking_cache WHERE usuario_aplicacion_key IS NOT NULL");
    $total_ranking = $stmt->fetchColumn();
    
    echo "🏆 Total en ranking: $total_ranking\n\n";
    
    // Mostrar ranking final
    $stmt = $pdo->query("SELECT usuario_aplicacion_key, nombre, email, max_level_unlocked, coins_total, total_score 
                        FROM memoflip_ranking_cache 
                        WHERE usuario_aplicacion_key IS NOT NULL
                        ORDER BY total_score DESC, max_level_unlocked DESC 
                        LIMIT 10");
    $ranking_final = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "🏆 RANKING FINAL:\n";
    foreach ($ranking_final as $i => $user) {
        $pos = $i + 1;
        echo "$pos. " . $user['usuario_aplicacion_key'] . " - Nivel: " . $user['max_level_unlocked'] . " - Puntos: " . $user['total_score'] . "\n";
    }
    
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>

