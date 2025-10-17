<?php
// VERIFICAR VERSIÓN DEL AUTH.PHP
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 VERIFICAR VERSIÓN DEL AUTH.PHP</h1>";

// Leer el auth.php del servidor
$auth_content = file_get_contents('auth.php');

echo "<h2>1. Búsqueda en auth.php:</h2>";

// Buscar si tiene la lógica corregida
if (strpos($auth_content, 'usuario_aplicacion_key = $email . \'_memoflip\'') !== false) {
    echo "<p style='color: green;'>✅ SÍ tiene la lógica corregida</p>";
} else {
    echo "<p style='color: red;'>❌ NO tiene la lógica corregida</p>";
}

// Buscar si busca por email
if (strpos($auth_content, 'WHERE email = :email') !== false) {
    echo "<p style='color: red;'>❌ SÍ busca por email (lógica antigua)</p>";
} else {
    echo "<p style='color: green;'>✅ NO busca por email (lógica nueva)</p>";
}

// Buscar si busca por usuario_aplicacion_key
if (strpos($auth_content, 'WHERE usuario_aplicacion_key = :key') !== false) {
    echo "<p style='color: green;'>✅ SÍ busca por usuario_aplicacion_key (lógica nueva)</p>";
} else {
    echo "<p style='color: red;'>❌ NO busca por usuario_aplicacion_key (lógica antigua)</p>";
}

echo "<h2>2. Líneas relevantes del auth.php:</h2>";
$lines = explode("\n", $auth_content);
foreach ($lines as $i => $line) {
    if (strpos($line, 'usuario_aplicacion_key') !== false || 
        strpos($line, 'WHERE email') !== false || 
        strpos($line, 'WHERE usuario_aplicacion_key') !== false) {
        echo "<p><strong>Línea " . ($i + 1) . ":</strong> " . htmlspecialchars(trim($line)) . "</p>";
    }
}

echo "<h2>3. Test directo del auth.php:</h2>";
echo "<p><a href='javascript:testAuth()'>Probar auth.php directamente</a></p>";

echo "<script>";
echo "function testAuth() {";
echo "  fetch('auth.php', {";
echo "    method: 'POST',";
echo "    headers: { 'Content-Type': 'application/json' },";
echo "    body: JSON.stringify({";
echo "      action: 'login',";
echo "      email: 'bitj2a@gmail.com',";
echo "      password: '111111'";
echo "    })";
echo "  })";
echo "  .then(response => response.json())";
echo "  .then(data => {";
echo "    alert('Respuesta auth.php: ' + JSON.stringify(data, null, 2));";
echo "  })";
echo "  .catch(error => {";
echo "    alert('Error: ' + error);";
echo "  });";
echo "}";
echo "</script>";
?>
