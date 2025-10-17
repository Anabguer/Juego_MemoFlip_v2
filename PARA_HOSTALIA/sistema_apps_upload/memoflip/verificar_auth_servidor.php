<?php
// VERIFICAR CÓDIGO DEL AUTH.PHP DEL SERVIDOR
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 VERIFICAR CÓDIGO DEL AUTH.PHP DEL SERVIDOR</h1>";

// Leer el auth.php del servidor línea por línea
$auth_content = file_get_contents('auth.php');
$lines = explode("\n", $auth_content);

echo "<h2>1. Líneas relevantes del auth.php del servidor:</h2>";

$relevant_lines = [];
foreach ($lines as $i => $line) {
    if (strpos($line, 'usuario_aplicacion_key') !== false || 
        strpos($line, 'WHERE email') !== false || 
        strpos($line, 'WHERE usuario_aplicacion_key') !== false ||
        strpos($line, 'password_verify') !== false ||
        strpos($line, 'handleLogin') !== false) {
        $relevant_lines[] = $i + 1;
        echo "<p><strong>Línea " . ($i + 1) . ":</strong> " . htmlspecialchars(trim($line)) . "</p>";
    }
}

echo "<h2>2. Buscar función handleLogin completa:</h2>";
$in_handleLogin = false;
$handleLogin_lines = [];

foreach ($lines as $i => $line) {
    if (strpos($line, 'function handleLogin()') !== false) {
        $in_handleLogin = true;
        $handleLogin_lines[] = ($i + 1) . ": " . htmlspecialchars(trim($line));
    } elseif ($in_handleLogin) {
        if (strpos($line, 'function ') !== false && strpos($line, 'handleLogin') === false) {
            $in_handleLogin = false;
        } else {
            $handleLogin_lines[] = ($i + 1) . ": " . htmlspecialchars(trim($line));
        }
    }
}

echo "<pre style='background: #f0f0f0; padding: 10px;'>";
foreach ($handleLogin_lines as $line) {
    echo $line . "\n";
}
echo "</pre>";

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
