<?php
// TEST DIRECTO DEL AUTH.PHP
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🧪 TEST DIRECTO DEL AUTH.PHP</h1>";

// Simular la llamada POST que hace el AAB
$_SERVER['REQUEST_METHOD'] = 'POST';
$_GET['action'] = 'login';

// Simular el JSON que envía el AAB
$json_data = '{"action":"login","email":"bitj2a@gmail.com","password":"111111"}';

// Capturar la salida del auth.php
ob_start();

// Simular php://input
$temp_file = tempnam(sys_get_temp_dir(), 'auth_test');
file_put_contents($temp_file, $json_data);

// Redirigir php://input temporalmente
$original_input = 'php://input';
$GLOBALS['test_input'] = $temp_file;

// Función para interceptar file_get_contents
function test_file_get_contents($filename) {
    if ($filename === 'php://input') {
        return file_get_contents($GLOBALS['test_input']);
    }
    return file_get_contents($filename);
}

echo "<p>Simulando llamada POST con JSON:</p>";
echo "<pre>" . htmlspecialchars($json_data) . "</pre>";

echo "<p>Resultado del auth.php:</p>";
echo "<div style='border: 1px solid #ccc; padding: 10px; background: #f9f9f9;'>";

// Incluir auth.php
try {
    include 'auth.php';
} catch (Exception $e) {
    echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
}

echo "</div>";

// Limpiar
unlink($temp_file);
?>
