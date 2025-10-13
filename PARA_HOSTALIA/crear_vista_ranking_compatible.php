<?php
// Script para crear la vista memoflip_ranking (compatible MySQL 5.7)
require_once '_common.php';

try {
    echo "<h2>🔧 Creando vista memoflip_ranking (MySQL 5.7)...</h2>";
    
    // 1. Eliminar vista si existe
    echo "<h3>🗑️ Eliminando vista existente...</h3>";
    try {
        $pdo->exec("DROP VIEW IF EXISTS memoflip_ranking");
        echo "✅ Vista anterior eliminada<br>";
    } catch (Exception $e) {
        echo "ℹ️ No había vista anterior<br>";
    }
    
    // 2. Crear nueva vista (sin ROW_NUMBER)
    echo "<h3>🔨 Creando nueva vista compatible...</h3>";
    $sql = "
    CREATE VIEW memoflip_ranking AS
    SELECT 
        @row_number := @row_number + 1 AS ranking_position,
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
    CROSS JOIN (SELECT @row_number := 0) r
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
    echo "✅ Vista memoflip_ranking creada (MySQL 5.7)<br>";
    
    // 3. Probar la vista
    echo "<h3>🧪 Probando la vista...</h3>";
    $stmt = $pdo->query("SELECT * FROM memoflip_ranking LIMIT 5");
    echo "<table border='1'><tr><th>Pos</th><th>Usuario</th><th>Nivel</th><th>Coins</th><th>Score</th></tr>";
    while ($row = $stmt->fetch()) {
        echo "<tr><td>{$row['ranking_position']}</td><td>{$row['nombre']}</td><td>{$row['max_level_unlocked']}</td><td>{$row['coins_total']}</td><td>{$row['total_score']}</td></tr>";
    }
    echo "</table>";
    
    echo "<h3>🎯 Vista creada y funcionando!</h3>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>

