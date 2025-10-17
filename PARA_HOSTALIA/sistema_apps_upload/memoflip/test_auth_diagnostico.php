<?php
// DIAGNÓSTICO DEL SISTEMA DE AUTENTICACIÓN
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔐 DIAGNÓSTICO DE AUTENTICACIÓN</h1>";

echo "<h2>1. Verificando si auth.php existe y es accesible...</h2>";
if (file_exists('auth.php')) {
    echo "<p style='color: green;'>✅ auth.php existe</p>";
    echo "<p>Tamaño: " . filesize('auth.php') . " bytes</p>";
    echo "<p>Modificado: " . date('Y-m-d H:i:s', filemtime('auth.php')) . "</p>";
} else {
    echo "<p style='color: red;'>❌ auth.php NO existe</p>";
}

echo "<h2>2. Probando conexión a base de datos...</h2>";
try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p style='color: green;'>✅ Conexión a BD exitosa</p>";
    
    echo "<h2>3. Verificando estructura de usuarios_aplicaciones...</h2>";
    $sql = "DESCRIBE usuarios_aplicaciones";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $structure = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
    foreach ($structure as $field) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($field['Field']) . "</td>";
        echo "<td>" . htmlspecialchars($field['Type']) . "</td>";
        echo "<td>" . htmlspecialchars($field['Null']) . "</td>";
        echo "<td>" . htmlspecialchars($field['Key']) . "</td>";
        echo "<td>" . htmlspecialchars($field['Default']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h2>4. Verificando usuarios con email_verified...</h2>";
    $sql = "SELECT email, email_verified, created_at FROM usuarios_aplicaciones WHERE email_verified = 1 LIMIT 5";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $verified_users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<p>Usuarios verificados: " . count($verified_users) . "</p>";
    if (!empty($verified_users)) {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Email</th><th>Verificado</th><th>Creado</th></tr>";
        foreach ($verified_users as $user) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($user['email']) . "</td>";
            echo "<td>" . ($user['email_verified'] ? '✅' : '❌') . "</td>";
            echo "<td>" . htmlspecialchars($user['created_at']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
    echo "<h2>5. Verificando usuarios SIN verificar...</h2>";
    $sql = "SELECT email, email_verified, created_at FROM usuarios_aplicaciones WHERE email_verified = 0 LIMIT 5";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $unverified_users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<p>Usuarios NO verificados: " . count($unverified_users) . "</p>";
    if (!empty($unverified_users)) {
        echo "<table border='1' style='border-collapse: collapse;'>";
        echo "<tr><th>Email</th><th>Verificado</th><th>Creado</th></tr>";
        foreach ($unverified_users as $user) {
            echo "<tr>";
            echo "<td>" . htmlspecialchars($user['email']) . "</td>";
            echo "<td>" . ($user['email_verified'] ? '✅' : '❌') . "</td>";
            echo "<td>" . htmlspecialchars($user['created_at']) . "</td>";
            echo "</tr>";
        }
        echo "</table>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}

echo "<h2>6. URLs para probar manualmente:</h2>";
echo "<p><a href='auth.php?action=check_session' target='_blank'>auth.php?action=check_session</a></p>";
echo "<p><a href='ranking.php' target='_blank'>ranking.php</a></p>";
?>
