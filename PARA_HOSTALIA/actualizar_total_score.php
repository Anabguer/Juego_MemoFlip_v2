<?php
// Script para actualizar total_score = coins_total
require_once '_common.php';

try {
    echo "<h2>📊 Actualizando total_score...</h2>";
    
    // 1. Mostrar datos actuales
    echo "<h3>📋 Datos actuales:</h3>";
    $stmt = $pdo->query("SELECT usuario_aplicacion_key, coins_total, total_score FROM memoflip_usuarios ORDER BY coins_total DESC");
    echo "<table border='1'><tr><th>Usuario</th><th>Coins</th><th>Score Actual</th><th>Score Nuevo</th></tr>";
    $users = [];
    while ($row = $stmt->fetch()) {
        $users[] = $row;
        echo "<tr><td>{$row['usuario_aplicacion_key']}</td><td>{$row['coins_total']}</td><td>{$row['total_score']}</td><td>{$row['coins_total']}</td></tr>";
    }
    echo "</table>";
    
    // 2. Actualizar total_score = coins_total
    echo "<h3>🔄 Actualizando scores...</h3>";
    $stmt = $pdo->prepare("UPDATE memoflip_usuarios SET total_score = coins_total WHERE coins_total > 0");
    $affected = $stmt->execute();
    echo "✅ Actualizados {$affected} usuarios<br>";
    
    // 3. Mostrar datos actualizados
    echo "<h3>✅ Datos actualizados:</h3>";
    $stmt = $pdo->query("SELECT usuario_aplicacion_key, coins_total, total_score FROM memoflip_usuarios ORDER BY total_score DESC");
    echo "<table border='1'><tr><th>Usuario</th><th>Coins</th><th>Score</th></tr>";
    while ($row = $stmt->fetch()) {
        echo "<tr><td>{$row['usuario_aplicacion_key']}</td><td>{$row['coins_total']}</td><td>{$row['total_score']}</td></tr>";
    }
    echo "</table>";
    
    echo "<h3>🎯 Ranking actualizado! Ahora total_score = coins_total</h3>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>

