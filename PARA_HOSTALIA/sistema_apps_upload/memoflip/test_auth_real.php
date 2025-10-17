<?php
// TEST REAL DEL AUTH.PHP CON POST
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🧪 TEST REAL DEL AUTH.PHP</h1>";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<h2>Resultado del auth.php:</h2>";
    echo "<div style='border: 1px solid #ccc; padding: 10px; background: #f9f9f9;'>";
    
    // Incluir auth.php directamente
    try {
        include 'auth.php';
    } catch (Exception $e) {
        echo "<p style='color: red;'>Error: " . $e->getMessage() . "</p>";
    }
    
    echo "</div>";
} else {
    echo "<h2>Formulario para probar login:</h2>";
    echo "<form method='POST' action='test_auth_real.php'>";
    echo "<p>Email: <input type='email' name='email' value='bitj2a@gmail.com'></p>";
    echo "<p>Contraseña: <input type='password' name='password' value='111111'></p>";
    echo "<p><input type='submit' value='Probar Login'></p>";
    echo "</form>";
    
    echo "<h2>O probar con JSON directo:</h2>";
    echo "<p><a href='javascript:testJSON()'>Probar con JSON (bitj2a@gmail.com / 111111)</a></p>";
    
    echo "<script>";
    echo "function testJSON() {";
    echo "  fetch('auth.php?action=login', {";
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
    echo "    alert('Respuesta: ' + JSON.stringify(data, null, 2));";
    echo "  })";
    echo "  .catch(error => {";
    echo "    alert('Error: ' + error);";
    echo "  });";
    echo "}";
    echo "</script>";
}
?>
