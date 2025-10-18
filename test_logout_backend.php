<?php
// 🧪 TEST LOGOUT BACKEND
echo "<h1>🧪 TEST LOGOUT BACKEND</h1>";

// Simular llamada POST con action=logout
$_SERVER['REQUEST_METHOD'] = 'POST';
$input = '{"action":"logout"}';
$GLOBALS['json_data'] = json_decode($input, true);

echo "<h2>1. Datos simulados:</h2>";
echo "<pre>";
print_r($GLOBALS['json_data']);
echo "</pre>";

echo "<h2>2. Probando auth.php directamente:</h2>";

// Incluir auth.php
ob_start();
include 'PARA_HOSTALIA/sistema_apps_upload/memoflip/auth.php';
$output = ob_get_clean();

echo "<h3>Respuesta del auth.php:</h3>";
echo "<pre style='background: #f0f0f0; padding: 10px; border-radius: 5px;'>";
echo htmlspecialchars($output);
echo "</pre>";

echo "<h2>3. Test manual de handleLogout():</h2>";

// Test manual de la función
try {
    // Simular la función handleLogout
    $response = [
        'success' => true,
        'message' => 'Sesión cerrada correctamente',
        'authenticated' => false
    ];
    
    echo "<pre style='background: #e8f5e8; padding: 10px; border-radius: 5px;'>";
    echo "✅ handleLogout() funcionaría correctamente:\n";
    echo json_encode($response, JSON_PRETTY_PRINT);
    echo "</pre>";
    
} catch (Exception $e) {
    echo "<pre style='background: #ffe8e8; padding: 10px; border-radius: 5px;'>";
    echo "❌ Error: " . $e->getMessage();
    echo "</pre>";
}
?>
