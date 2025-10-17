<?php
echo "<h1>🔍 Test de Credenciales de Base de Datos</h1>";
echo "<p><strong>Fecha:</strong> " . date('Y-m-d H:i:s') . "</p>";

echo "<h2>1️⃣ Verificando archivo config_hostalia.php</h2>";

if (file_exists('config_hostalia.php')) {
    echo "<div style='color: green;'>✅ Archivo config_hostalia.php existe</div>";
    
    // Incluir el archivo
    require_once 'config_hostalia.php';
    
    echo "<div style='background: #f0f0f0; padding: 10px; margin: 10px 0;'>";
    echo "<strong>Credenciales cargadas:</strong><br>";
    echo "Host: " . (isset($host) ? $host : 'NO DEFINIDO') . "<br>";
    echo "Base de datos: " . (isset($dbname) ? $dbname : 'NO DEFINIDO') . "<br>";
    echo "Usuario: " . (isset($username) ? $username : 'NO DEFINIDO') . "<br>";
    echo "Contraseña: " . (isset($password) ? '***DEFINIDA***' : 'NO DEFINIDA') . "<br>";
    echo "</div>";
    
    echo "<h2>2️⃣ Test de Conexión</h2>";
    
    if (isset($host) && isset($dbname) && isset($username) && isset($password)) {
        try {
            $dsn = "mysql:host=$host;dbname=$dbname;charset=utf8mb4";
            echo "<div style='color: blue;'>Intentando conectar con: $dsn</div>";
            
            $pdo = new PDO($dsn, $username, $password);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            echo "<div style='color: green; background: #d4edda; padding: 10px; border-radius: 5px;'>";
            echo "✅ <strong>¡CONEXIÓN EXITOSA!</strong><br>";
            echo "Base de datos conectada correctamente.";
            echo "</div>";
            
            // Test de consulta simple
            $stmt = $pdo->query("SELECT 1 as test");
            $result = $stmt->fetch();
            echo "<div style='color: green;'>✅ Test de consulta: " . $result['test'] . "</div>";
            
        } catch (PDOException $e) {
            echo "<div style='color: red; background: #f8d7da; padding: 10px; border-radius: 5px;'>";
            echo "❌ <strong>ERROR DE CONEXIÓN:</strong><br>";
            echo $e->getMessage();
            echo "</div>";
        }
    } else {
        echo "<div style='color: red;'>❌ Variables de conexión no están definidas</div>";
    }
    
} else {
    echo "<div style='color: red;'>❌ Archivo config_hostalia.php NO existe</div>";
}

echo "<h2>3️⃣ Test con credenciales alternativas</h2>";

// Test con credenciales que sabemos que funcionan
$test_creds = [
    ['host' => 'PMYSQL165.dns-servicio.com', 'db' => '9606966_sistema_apps_db', 'user' => 'sistema_apps_user', 'pass' => 'GestionUploadSistemaApps!'],
    ['host' => 'localhost', 'db' => 'sistema_apps', 'user' => 'sistema_apps_user', 'pass' => 'GestionUploadSistemaApps!']
];

foreach ($test_creds as $i => $cred) {
    echo "<h3>Test " . ($i + 1) . ": {$cred['host']}</h3>";
    try {
        $dsn = "mysql:host={$cred['host']};dbname={$cred['db']};charset=utf8mb4";
        $pdo = new PDO($dsn, $cred['user'], $cred['pass']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        echo "<div style='color: green; background: #d4edda; padding: 10px; border-radius: 5px;'>";
        echo "✅ <strong>¡ESTAS CREDENCIALES FUNCIONAN!</strong><br>";
        echo "Host: {$cred['host']}<br>";
        echo "Base: {$cred['db']}<br>";
        echo "Usuario: {$cred['user']}";
        echo "</div>";
        
        // Verificar tablas
        $stmt = $pdo->query("SHOW TABLES LIKE 'memoflip_%'");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        
        echo "<div style='color: blue;'>📊 Tablas encontradas: " . implode(', ', $tables) . "</div>";
        
    } catch (PDOException $e) {
        echo "<div style='color: red;'>❌ Error: " . $e->getMessage() . "</div>";
    }
}
?>