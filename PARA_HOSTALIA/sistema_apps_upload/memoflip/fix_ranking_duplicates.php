<?php
// 🔧 FIX RANKING DUPLICATES - CORREGIR DUPLICADOS Y POSICIONES
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$host = 'PMYSQL165.dns-servicio.com';
$dbname = '9606966_sistema_apps_db';
$username = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "🔧 CORRIGIENDO DUPLICADOS Y POSICIONES DE RANKING...\n\n";
    
    // 1. Ver duplicados actuales
    echo "1️⃣ DUPLICADOS ACTUALES:\n";
    $stmt = $pdo->query("SELECT usuario_aplicacion_key, COUNT(*) as count 
                        FROM memoflip_ranking_cache 
                        GROUP BY usuario_aplicacion_key 
                        HAVING COUNT(*) > 1");
    $duplicates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($duplicates as $dup) {
        echo "   🔄 " . $dup['usuario_aplicacion_key'] . " - " . $dup['count'] . " entradas\n";
    }
    
    // 2. Limpiar duplicados - mantener solo el mejor registro
    echo "\n2️⃣ LIMPIANDO DUPLICADOS...\n";
    
    foreach ($duplicates as $dup) {
        $user_key = $dup['usuario_aplicacion_key'];
        echo "   🧹 Limpiando duplicados de: $user_key\n";
        
        // Obtener todos los registros de este usuario
        $stmt = $pdo->prepare("SELECT * FROM memoflip_ranking_cache WHERE usuario_aplicacion_key = ? ORDER BY total_score DESC, max_level_unlocked DESC");
        $stmt->execute([$user_key]);
        $user_records = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if (count($user_records) > 1) {
            // Mantener el mejor registro (primero)
            $best_record = $user_records[0];
            echo "     ✅ Mejor registro: Nivel " . $best_record['max_level_unlocked'] . ", Puntos " . $best_record['total_score'] . "\n";
            
            // Eliminar todos los registros de este usuario
            $stmt = $pdo->prepare("DELETE FROM memoflip_ranking_cache WHERE usuario_aplicacion_key = ?");
            $stmt->execute([$user_key]);
            
            // Insertar solo el mejor registro
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
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $best_record['usuario_aplicacion_key'],
                $best_record['nombre'],
                $best_record['email'],
                $best_record['max_level_unlocked'],
                $best_record['coins_total'],
                $best_record['total_score'],
                $best_record['levels_completed'],
                $best_record['total_stars'],
                $best_record['avg_time'],
                $best_record['registro_fecha']
            ]);
            
            echo "     ✅ Registro único insertado\n";
        }
    }
    
    // 3. Actualizar posiciones de ranking
    echo "\n3️⃣ ACTUALIZANDO POSICIONES DE RANKING...\n";
    
    // Obtener ranking ordenado
    $stmt = $pdo->query("SELECT usuario_aplicacion_key FROM memoflip_ranking_cache 
                        ORDER BY total_score DESC, max_level_unlocked DESC, coins_total DESC");
    $ranking = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Actualizar posiciones
    foreach ($ranking as $position => $user_key) {
        $ranking_position = $position + 1;
        $stmt = $pdo->prepare("UPDATE memoflip_ranking_cache SET ranking_position = ? WHERE usuario_aplicacion_key = ?");
        $stmt->execute([$ranking_position, $user_key]);
        echo "   🏆 Posición $ranking_position: $user_key\n";
    }
    
    // 4. Verificar resultado final
    echo "\n4️⃣ RANKING FINAL:\n";
    $stmt = $pdo->query("SELECT ranking_position, usuario_aplicacion_key, nombre, email, max_level_unlocked, coins_total, total_score 
                        FROM memoflip_ranking_cache 
                        ORDER BY ranking_position ASC");
    $final_ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($final_ranking as $row) {
        echo "   " . $row['ranking_position'] . ". " . $row['usuario_aplicacion_key'] . 
             " - Nivel: " . $row['max_level_unlocked'] . 
             " - Puntos: " . $row['total_score'] . 
             " - Monedas: " . $row['coins_total'] . "\n";
    }
    
    // 5. Verificar que no hay duplicados
    echo "\n5️⃣ VERIFICACIÓN FINAL:\n";
    $stmt = $pdo->query("SELECT usuario_aplicacion_key, COUNT(*) as count 
                        FROM memoflip_ranking_cache 
                        GROUP BY usuario_aplicacion_key 
                        HAVING COUNT(*) > 1");
    $remaining_duplicates = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($remaining_duplicates)) {
        echo "   ✅ No hay duplicados restantes\n";
    } else {
        echo "   ❌ Aún hay duplicados:\n";
        foreach ($remaining_duplicates as $dup) {
            echo "      - " . $dup['usuario_aplicacion_key'] . " (" . $dup['count'] . " entradas)\n";
        }
    }
    
    echo "\n🎯 CORRECCIÓN COMPLETADA\n";
    
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>

