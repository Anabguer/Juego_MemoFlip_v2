<?php
// 🧪 TEST LOGOUT DETALLADO
echo "<h1>🧪 TEST LOGOUT DETALLADO</h1>";

// Simular exactamente lo que hace el frontend
$json_input = '{"action":"logout"}';
echo "<h2>1. JSON que envía el frontend:</h2>";
echo "<pre>" . $json_input . "</pre>";

// Simular el procesamiento del auth.php
$_SERVER['REQUEST_METHOD'] = 'POST';
$input = $json_input;
$GLOBALS['json_data'] = json_decode($input, true);

echo "<h2>2. Procesamiento en auth.php:</h2>";
echo "<h3>json_decode resultado:</h3>";
echo "<pre>";
var_dump($GLOBALS['json_data']);
echo "</pre>";

echo "<h3>Extracción de action:</h3>";
$action = $GLOBALS['json_data']['action'] ?? $_POST['action'] ?? $_GET['action'] ?? '';
echo "<pre>Action extraída: '" . $action . "'</pre>";

echo "<h3>¿Action está vacía?</h3>";
if (empty($action)) {
    echo "<p style='color: red;'>❌ SÍ, action está vacía</p>";
} else {
    echo "<p style='color: green;'>✅ NO, action tiene valor: " . $action . "</p>";
}

echo "<h2>3. Test del switch:</h2>";
switch ($action) {
    case 'logout':
        echo "<p style='color: green;'>✅ Caso 'logout' encontrado</p>";
        break;
    default:
        echo "<p style='color: red;'>❌ Caso default - action: '" . $action . "'</p>";
        break;
}

echo "<h2>4. Test de handleLogout():</h2>";
if ($action === 'logout') {
    echo "<pre style='background: #e8f5e8; padding: 10px;'>";
    echo json_encode([
        'success' => true,
        'message' => 'Sesión cerrada correctamente',
        'authenticated' => false
    ], JSON_PRETTY_PRINT);
    echo "</pre>";
} else {
    echo "<p style='color: red;'>❌ No se puede ejecutar handleLogout() porque action no es 'logout'</p>";
}
?>
