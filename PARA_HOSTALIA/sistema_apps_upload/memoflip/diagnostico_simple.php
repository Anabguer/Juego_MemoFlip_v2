<?php
// 🔍 DIAGNÓSTICO SIMPLE DE MEMOFLIP
echo "<h1>🔍 Diagnóstico MemoFlip - Simple</h1>";
echo "<p><strong>Fecha:</strong> " . date('Y-m-d H:i:s') . "</p>";

echo "<h2>1️⃣ Verificación de Base de Datos</h2>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<div style='color: green; background: #d4edda; padding: 10px; border-radius: 5px;'>";
    echo "✅ <strong>Base de datos conectada correctamente</strong><br>";
    echo "<strong>Host:</strong> $host<br>";
    echo "<strong>Base de datos:</strong> $dbname<br>";
    echo "<strong>Usuario:</strong> $username<br>";
    echo "</div>";
    
    // Verificar tablas
    echo "<h2>2️⃣ Verificación de Tablas</h2>";
    
    $tables = ['memoflip_usuarios', 'memoflip_progreso', 'memoflip_runs', 'memoflip_ranking_cache'];
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
            $count = $stmt->fetchColumn();
            echo "<div style='color: green;'>✅ Tabla <strong>$table</strong>: $count registros</div>";
        } catch (PDOException $e) {
            echo "<div style='color: red;'>❌ Tabla <strong>$table</strong>: NO EXISTE</div>";
        }
    }
    
    // Test de inserción
    echo "<h2>3️⃣ Test de Inserción</h2>";
    
    $testUser = 'test_' . time();
    $testData = [
        'user_key' => $testUser . '_memoflip',
        'nickname' => 'Test User',
        'email' => 'test@example.com',
        'created_at' => date('Y-m-d H:i:s')
    ];
    
    try {
        $stmt = $pdo->prepare("INSERT INTO memoflip_usuarios (user_key, nickname, email, created_at) VALUES (?, ?, ?, ?)");
        $stmt->execute([$testData['user_key'], $testData['nickname'], $testData['email'], $testData['created_at']]);
        
        echo "<div style='color: green; background: #d4edda; padding: 10px; border-radius: 5px;'>";
        echo "✅ <strong>Test de inserción exitoso</strong><br>";
        echo "Usuario de prueba creado: " . $testData['user_key'];
        echo "</div>";
        
        // Limpiar test
        $stmt = $pdo->prepare("DELETE FROM memoflip_usuarios WHERE user_key = ?");
        $stmt->execute([$testData['user_key']]);
        echo "<div style='color: blue;'>🧹 Usuario de prueba eliminado</div>";
        
    } catch (PDOException $e) {
        echo "<div style='color: red; background: #f8d7da; padding: 10px; border-radius: 5px;'>";
        echo "❌ <strong>Error en test de inserción:</strong> " . $e->getMessage();
        echo "</div>";
    }
    
} catch (PDOException $e) {
    echo "<div style='color: red; background: #f8d7da; padding: 10px; border-radius: 5px;'>";
    echo "❌ <strong>Error de conexión:</strong> " . $e->getMessage();
    echo "</div>";
} catch (Exception $e) {
    echo "<div style='color: red; background: #f8d7da; padding: 10px; border-radius: 5px;'>";
    echo "❌ <strong>Error general:</strong> " . $e->getMessage();
    echo "</div>";
}

echo "<h2>4️⃣ Test de Endpoints</h2>";
echo "<p><a href='ranking.php?limit=5' target='_blank'>🏆 Probar Ranking</a></p>";
echo "<p><a href='game.php' target='_blank'>🎮 Probar Game Endpoint</a></p>";

echo "<h2>5️⃣ Información del Sistema</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>Servidor:</strong> " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p><strong>Directorio actual:</strong> " . __DIR__ . "</p>";
?>

