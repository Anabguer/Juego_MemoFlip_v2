<?php
// Script para crear la vista memoflip_ranking
require_once '_common.php';

try {
    echo "<h2>🔧 Creando vista memoflip_ranking...</h2>";
    
    // 1. Eliminar vista si existe
    echo "<h3>🗑️ Eliminando vista existente...</h3>";
    try {
        $pdo->exec("DROP VIEW IF EXISTS memoflip_ranking");
        echo "✅ Vista anterior eliminada<br>";
    } catch (Exception $e) {
        echo "ℹ️ No había vista anterior<br>";
    }
    
    // 2. Crear nueva vista
    echo "<h3>🔨 Creando nueva vista...</h3>";
    $sql = "
    CREATE VIEW memoflip_ranking AS
    SELECT 
        ROW_NUMBER() OVER (ORDER BY u.total_score DESC, u.max_level_unlocked DESC, u.coins_total DESC) as ranking_position,
        ua.usuario_aplicacion_key,
        ua.nombre,
        ua.email,
        u.max_level_unlocked,
        u.coins_total,
        u.total_score,
        COALESCE(COUNT(lr.level_id), 0) as levels_completed,
        COALESCE(SUM(lr.stars), 0) as total_stars,
        COALESCE(AVG(lr.best_time_seconds), 0) as avg_time,
        ua.fecha_registro as registro_fecha
    FROM usuarios_aplicaciones ua
    LEFT JOIN memoflip_usuarios u ON ua.usuario_aplicacion_key = u.usuario_aplicacion_key
    LEFT JOIN memoflip_level_records lr ON ua.usuario_aplicacion_key = lr.usuario_aplicacion_key AND lr.times_completed > 0
    WHERE ua.activo = 1 AND ua.app_codigo = 'memoflip'
    GROUP BY ua.usuario_aplicacion_key, ua.nombre, ua.email, u.max_level_unlocked, u.coins_total, u.total_score, ua.fecha_registro
    ORDER BY u.total_score DESC, u.max_level_unlocked DESC, u.coins_total DESC
    ";
    
    $pdo->exec($sql);
    echo "✅ Vista memoflip_ranking creada<br>";
    
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

