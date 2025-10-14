<?php
// Script para limpiar datos falsos del ranking
require_once '_common.php';

try {
    echo "<h2>🧹 Limpiando datos falsos del ranking...</h2>";
    
    // 1. Mostrar datos actuales
    echo "<h3>📊 Datos actuales:</h3>";
    $stmt = $pdo->query("SELECT usuario_aplicacion_key, max_level_unlocked, coins_total, total_score FROM memoflip_usuarios ORDER BY total_score DESC LIMIT 10");
    echo "<table border='1'><tr><th>Usuario</th><th>Nivel</th><th>Monedas</th><th>Score</th></tr>";
    while ($row = $stmt->fetch()) {
        echo "<tr><td>{$row['usuario_aplicacion_key']}</td><td>{$row['max_level_unlocked']}</td><td>{$row['coins_total']}</td><td>{$row['total_score']}</td></tr>";
    }
    echo "</table>";
    
    // 2. Limpiar datos obviamente falsos (usuarios de prueba, datos irreales)
    echo "<h3>🗑️ Eliminando datos falsos...</h3>";
    
    // Eliminar usuarios de prueba (ejemplos)
    $testUsers = [
        'test@test.com',
        'prueba@prueba.com',
        'demo@demo.com',
        'admin@admin.com',
        'usuario@usuario.com'
    ];
    
    foreach ($testUsers as $email) {
        $stmt = $pdo->prepare("DELETE FROM memoflip_usuarios WHERE usuario_aplicacion_key LIKE ?");
        $stmt->execute(["%{$email}%"]);
        echo "✅ Eliminado: {$email}<br>";
    }
    
    // Eliminar datos con scores irreales (más de 1 millón, por ejemplo)
    $stmt = $pdo->prepare("DELETE FROM memoflip_usuarios WHERE total_score > 1000000");
    $deleted = $stmt->execute();
    echo "✅ Eliminados usuarios con scores irreales<br>";
    
    // Eliminar datos con niveles irreales (más de 1000, por ejemplo)
    $stmt = $pdo->prepare("DELETE FROM memoflip_usuarios WHERE max_level_unlocked > 1000");
    $deleted = $stmt->execute();
    echo "✅ Eliminados usuarios con niveles irreales<br>";
    
    // 3. Mostrar datos limpios
    echo "<h3>✅ Datos después de limpiar:</h3>";
    $stmt = $pdo->query("SELECT usuario_aplicacion_key, max_level_unlocked, coins_total, total_score FROM memoflip_usuarios ORDER BY total_score DESC LIMIT 10");
    echo "<table border='1'><tr><th>Usuario</th><th>Nivel</th><th>Monedas</th><th>Score</th></tr>";
    while ($row = $stmt->fetch()) {
        echo "<tr><td>{$row['usuario_aplicacion_key']}</td><td>{$row['max_level_unlocked']}</td><td>{$row['coins_total']}</td><td>{$row['total_score']}</td></tr>";
    }
    echo "</table>";
    
    echo "<h3>🎯 Ranking limpio! Solo datos reales de jugadores.</h3>";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>

