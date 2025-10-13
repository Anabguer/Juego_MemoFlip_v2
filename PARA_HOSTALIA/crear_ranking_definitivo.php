<?php
// Script para crear ranking definitivo (sin vista)
require_once '_common.php';

try {
    echo "<h2>🔧 Creando ranking definitivo...</h2>";
    
    // 1. Crear tabla temporal para ranking
    echo "<h3>🔨 Creando tabla temporal de ranking...</h3>";
    
    // Eliminar tabla si existe
    $pdo->exec("DROP TABLE IF EXISTS memoflip_ranking_temp");
    
    // Crear tabla temporal
    $sql = "
    CREATE TEMPORARY TABLE memoflip_ranking_temp AS
    SELECT 
        ua.usuario_aplicacion_key,
        ua.nombre,
        ua.email,
        COALESCE(u.max_level_unlocked, 1) as max_level_unlocked,
        COALESCE(u.coins_total, 0) as coins_total,
        COALESCE(u.total_score, 0) as total_score,
        COALESCE(lr.levels_completed, 0) as levels_completed,
        COALESCE(lr.total_stars, 0) as total_stars,
        COALESCE(lr.avg_time, 0) as avg_time,
        ua.fecha_registro as registro_fecha
    FROM usuarios_aplicaciones ua
    LEFT JOIN memoflip_usuarios u ON ua.usuario_aplicacion_key = u.usuario_aplicacion_key
    LEFT JOIN (
        SELECT 
            usuario_aplicacion_key,
            COUNT(DISTINCT level_id) as levels_completed,
            SUM(stars) as total_stars,
            AVG(best_time_seconds) as avg_time
        FROM memoflip_level_records 
        WHERE times_completed > 0
        GROUP BY usuario_aplicacion_key
    ) lr ON ua.usuario_aplicacion_key = lr.usuario_aplicacion_key
    WHERE ua.activo = 1 AND ua.app_codigo = 'memoflip'
    ORDER BY COALESCE(u.total_score, 0) DESC, COALESCE(u.max_level_unlocked, 1) DESC, COALESCE(u.coins_total, 0) DESC
    ";
    
    $pdo->exec($sql);
    echo "✅ Tabla temporal creada<br>";
    
    // 2. Agregar posición con UPDATE
    echo "<h3>📊 Calculando posiciones...</h3>";
    $stmt = $pdo->query("SELECT usuario_aplicacion_key FROM memoflip_ranking_temp ORDER BY total_score DESC, max_level_unlocked DESC, coins_total DESC");
    $users = $stmt->fetchAll();
    
    $position = 1;
    foreach ($users as $user) {
        $stmt = $pdo->prepare("UPDATE memoflip_ranking_temp SET ranking_position = ? WHERE usuario_aplicacion_key = ?");
        $stmt->execute([$position, $user['usuario_aplicacion_key']]);
        $position++;
    }
    echo "✅ Posiciones calculadas<br>";
    
    // 3. Mostrar ranking final
    echo "<h3>🏆 Ranking final:</h3>";
    $stmt = $pdo->query("SELECT * FROM memoflip_ranking_temp ORDER BY ranking_position ASC");
    echo "<table border='1'><tr><th>Pos</th><th>Usuario</th><th>Nivel</th><th>Coins</th><th>Score</th></tr>";
    while ($row = $stmt->fetch()) {
        echo "<tr><td>{$row['ranking_position']}</td><td>{$row['nombre']}</td><td>{$row['max_level_unlocked']}</td><td>{$row['coins_total']}</td><td>{$row['total_score']}</td></tr>";
    }
    echo "</table>";
    
    // 4. Crear función para obtener ranking
    echo "<h3>🔧 Creando función de ranking...</h3>";
    
    // Crear tabla permanente para cache de ranking
    $pdo->exec("DROP TABLE IF EXISTS memoflip_ranking_cache");
    $pdo->exec("
    CREATE TABLE memoflip_ranking_cache AS
    SELECT * FROM memoflip_ranking_temp
    ");
    echo "✅ Cache de ranking creado<br>";
    
    echo "<h3>🎯 Ranking creado exitosamente!</h3>";
    echo "<p>✅ Usar tabla <code>memoflip_ranking_cache</code> en lugar de vista</p>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>

