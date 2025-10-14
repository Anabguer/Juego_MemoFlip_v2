<?php
/**
 * Script para verificar la estructura de la tabla memoflip_usuarios
 */

header('Content-Type: text/html; charset=utf-8');

require_once __DIR__ . '/config_db.php';

$mysqli = @new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if ($mysqli->connect_errno) {
    die('❌ Error de conexión: ' . $mysqli->connect_error);
}

$mysqli->set_charset('utf8mb4');

echo "<h1>🔍 Estructura de memoflip_usuarios</h1>";
echo "<hr>";

// Mostrar estructura de la tabla
$result = $mysqli->query("DESCRIBE memoflip_usuarios");

if ($result) {
    echo "<h2>Columnas:</h2>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
    
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td><strong>{$row['Field']}</strong></td>";
        echo "<td>{$row['Type']}</td>";
        echo "<td>{$row['Null']}</td>";
        echo "<td>{$row['Key']}</td>";
        echo "<td>{$row['Default']}</td>";
        echo "<td>{$row['Extra']}</td>";
        echo "</tr>";
    }
    
    echo "</table>";
} else {
    echo "<p style='color: red;'>❌ Error al obtener estructura: " . $mysqli->error . "</p>";
}

// Mostrar algunos registros de ejemplo
echo "<hr>";
echo "<h2>Registros de ejemplo (primeros 5):</h2>";

$result = $mysqli->query("SELECT * FROM memoflip_usuarios LIMIT 5");

if ($result) {
    echo "<table border='1' cellpadding='5'>";
    
    // Encabezados
    $fields = $result->fetch_fields();
    echo "<tr>";
    foreach ($fields as $field) {
        echo "<th>{$field->name}</th>";
    }
    echo "</tr>";
    
    // Datos
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        foreach ($row as $value) {
            echo "<td>" . htmlspecialchars($value) . "</td>";
        }
        echo "</tr>";
    }
    
    echo "</table>";
    
    echo "<p><strong>Total de registros:</strong> ";
    $count = $mysqli->query("SELECT COUNT(*) as total FROM memoflip_usuarios")->fetch_assoc()['total'];
    echo $count . "</p>";
} else {
    echo "<p style='color: red;'>❌ Error al obtener registros: " . $mysqli->error . "</p>";
}

$mysqli->close();

echo "<hr>";
echo "<p style='color: green;'>✅ Diagnóstico completado</p>";
?>

