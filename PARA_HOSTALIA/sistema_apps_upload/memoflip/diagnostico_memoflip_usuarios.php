<?php
// DIAGNÓSTICO DE LA TABLA memoflip_usuarios
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 DIAGNÓSTICO DE memoflip_usuarios</h1>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>1. Todos los registros en memoflip_usuarios:</h2>";
    $sql = "SELECT * FROM memoflip_usuarios";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>usuario_aplicacion_key</th><th>max_level_unlocked</th><th>coins_total</th><th>total_score</th><th>lives_current</th><th>fecha_modificacion</th></tr>";
    
    foreach ($usuarios as $usuario) {
        echo "<tr>";
        echo "<td>" . htmlspecialchars($usuario['usuario_aplicacion_key']) . "</td>";
        echo "<td>" . $usuario['max_level_unlocked'] . "</td>";
        echo "<td>" . $usuario['coins_total'] . "</td>";
        echo "<td>" . $usuario['total_score'] . "</td>";
        echo "<td>" . $usuario['lives_current'] . "</td>";
        echo "<td>" . htmlspecialchars($usuario['fecha_modificacion']) . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h2>2. Buscando específicamente bitj2a@gmail.com_memoflip:</h2>";
    $sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':key' => 'bitj2a@gmail.com_memoflip']);
    $bitj2a = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($bitj2a) {
        echo "<p style='color: green;'>✅ Usuario bitj2a encontrado en memoflip_usuarios:</p>";
        echo "<pre>" . json_encode($bitj2a, JSON_PRETTY_PRINT) . "</pre>";
    } else {
        echo "<p style='color: red;'>❌ Usuario bitj2a NO encontrado en memoflip_usuarios</p>";
    }
    
    echo "<h2>3. Comparando usuarios_aplicaciones vs memoflip_usuarios:</h2>";
    
    // Usuarios en usuarios_aplicaciones
    $sql = "SELECT usuario_aplicacion_key, email, nombre FROM usuarios_aplicaciones WHERE app_codigo = 'memoflip'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $usuarios_app = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h3>Usuarios en usuarios_aplicaciones:</h3>";
    echo "<table border='1' style='border-collapse: collapse;'>";
    echo "<tr><th>usuario_aplicacion_key</th><th>email</th><th>nombre</th><th>En memoflip_usuarios</th></tr>";
    
    foreach ($usuarios_app as $user_app) {
        $key = $user_app['usuario_aplicacion_key'];
        
        // Verificar si existe en memoflip_usuarios
        $check_sql = "SELECT COUNT(*) as count FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
        $check_stmt = $pdo->prepare($check_sql);
        $check_stmt->execute([':key' => $key]);
        $exists = $check_stmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;
        
        echo "<tr>";
        echo "<td>" . htmlspecialchars($user_app['usuario_aplicacion_key']) . "</td>";
        echo "<td>" . htmlspecialchars($user_app['email']) . "</td>";
        echo "<td>" . htmlspecialchars($user_app['nombre']) . "</td>";
        echo "<td>" . ($exists ? '✅ SÍ' : '❌ NO') . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
