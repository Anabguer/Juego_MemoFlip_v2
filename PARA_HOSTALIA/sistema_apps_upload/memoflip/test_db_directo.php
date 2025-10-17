<?php
echo "<h1>🔍 Test Directo de Base de Datos</h1>";
echo "<p><strong>Fecha:</strong> " . date('Y-m-d H:i:s') . "</p>";

echo "<h2>1️⃣ Test con credenciales de Hostalia</h2>";

$credenciales = [
    'host' => 'PMYSQL165.dns-servicio.com',
    'dbname' => '9606966_sistema_apps_db',
    'username' => 'sistema_apps_user',
    'password' => 'GestionUploadSistemaApps!'
];

try {
    $dsn = "mysql:host={$credenciales['host']};dbname={$credenciales['dbname']};charset=utf8mb4";
    echo "<div style='color: blue;'>Intentando conectar con: {$credenciales['host']}</div>";
    
    $pdo = new PDO($dsn, $credenciales['username'], $credenciales['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<div style='color: green; background: #d4edda; padding: 10px; border-radius: 5px;'>";
    echo "✅ <strong>¡CONEXIÓN EXITOSA!</strong><br>";
    echo "Host: {$credenciales['host']}<br>";
    echo "Base: {$credenciales['dbname']}<br>";
    echo "Usuario: {$credenciales['username']}";
    echo "</div>";
    
    // Verificar tablas de MemoFlip
    echo "<h2>2️⃣ Verificando tablas de MemoFlip</h2>";
    
    $stmt = $pdo->query("SHOW TABLES LIKE 'memoflip_%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (empty($tables)) {
        echo "<div style='color: red;'>❌ No se encontraron tablas de MemoFlip</div>";
    } else {
        echo "<div style='color: green;'>✅ Tablas encontradas: " . implode(', ', $tables) . "</div>";
        
        // Verificar datos en cada tabla
        foreach ($tables as $table) {
            try {
                $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
                $count = $stmt->fetchColumn();
                echo "<div style='color: blue;'>📊 $table: $count registros</div>";
            } catch (PDOException $e) {
                echo "<div style='color: red;'>❌ Error en $table: " . $e->getMessage() . "</div>";
            }
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
    echo "❌ <strong>ERROR DE CONEXIÓN:</strong><br>";
    echo $e->getMessage();
    echo "</div>";
}

echo "<h2>4️⃣ Test con credenciales alternativas</h2>";

// Test con localhost
$credenciales_localhost = [
    'host' => 'localhost',
    'dbname' => 'sistema_apps',
    'username' => 'sistema_apps_user',
    'password' => 'GestionUploadSistemaApps!'
];

try {
    $dsn = "mysql:host={$credenciales_localhost['host']};dbname={$credenciales_localhost['dbname']};charset=utf8mb4";
    $pdo = new PDO($dsn, $credenciales_localhost['username'], $credenciales_localhost['password']);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<div style='color: green; background: #d4edda; padding: 10px; border-radius: 5px;'>";
    echo "✅ <strong>¡LOCALHOST TAMBIÉN FUNCIONA!</strong><br>";
    echo "Host: {$credenciales_localhost['host']}<br>";
    echo "Base: {$credenciales_localhost['dbname']}";
    echo "</div>";
    
} catch (PDOException $e) {
    echo "<div style='color: red;'>❌ Localhost falla: " . $e->getMessage() . "</div>";
}
?>

