<?php
// 🔍 VERIFICAR TABLA usuarios_aplicaciones

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h2>🔍 ESTRUCTURA DE TABLA usuarios_aplicaciones</h2>";
    
    // Ver estructura de la tabla
    $sql = "DESCRIBE usuarios_aplicaciones";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $structure = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<h3>📋 Estructura de la tabla:</h3>";
    echo "<table border='1'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    foreach ($structure as $field) {
        echo "<tr>";
        echo "<td>" . $field['Field'] . "</td>";
        echo "<td>" . $field['Type'] . "</td>";
        echo "<td>" . $field['Null'] . "</td>";
        echo "<td>" . $field['Key'] . "</td>";
        echo "<td>" . $field['Default'] . "</td>";
        echo "<td>" . $field['Extra'] . "</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<h3>📊 Datos de ejemplo (primeros 5 registros):</h3>";
    $sql = "SELECT * FROM usuarios_aplicaciones LIMIT 5";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<pre>" . json_encode($data, JSON_PRETTY_PRINT) . "</pre>";
    
    echo "<h3>🔗 RELACIÓN CON memoflip_usuarios:</h3>";
    $sql = "SELECT 
                ua.*,
                mu.usuario_aplicacion_key,
                mu.max_level_unlocked,
                mu.coins_total
            FROM usuarios_aplicaciones ua
            LEFT JOIN memoflip_usuarios mu ON ua.usuario_aplicacion_key = mu.usuario_aplicacion_key
            LIMIT 5";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $relation = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<pre>" . json_encode($relation, JSON_PRETTY_PRINT) . "</pre>";
    
} catch (Exception $e) {
    echo "<h2>❌ ERROR:</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
