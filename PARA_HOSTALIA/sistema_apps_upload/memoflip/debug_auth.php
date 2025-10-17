<?php
// DEBUG - CAPTURAR DATOS QUE LLEGAN AL SERVIDOR
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 DEBUG - DATOS QUE LLEGAN AL SERVIDOR</h1>";

echo "<h2>1. Método HTTP:</h2>";
echo "<p><strong>" . $_SERVER['REQUEST_METHOD'] . "</strong></p>";

echo "<h2>2. Headers recibidos:</h2>";
echo "<pre>";
foreach (getallheaders() as $name => $value) {
    echo htmlspecialchars($name) . ": " . htmlspecialchars($value) . "\n";
}
echo "</pre>";

echo "<h2>3. GET parameters:</h2>";
if (!empty($_GET)) {
    echo "<pre>";
    print_r($_GET);
    echo "</pre>";
} else {
    echo "<p>No hay parámetros GET</p>";
}

echo "<h2>4. POST parameters:</h2>";
if (!empty($_POST)) {
    echo "<pre>";
    print_r($_POST);
    echo "</pre>";
} else {
    echo "<p>No hay parámetros POST</p>";
}

echo "<h2>5. Raw input (php://input):</h2>";
$raw_input = file_get_contents('php://input');
if ($raw_input) {
    echo "<p><strong>Raw data:</strong></p>";
    echo "<pre>" . htmlspecialchars($raw_input) . "</pre>";
    
    echo "<p><strong>JSON decode attempt:</strong></p>";
    $json_data = json_decode($raw_input, true);
    if ($json_data) {
        echo "<pre>";
        print_r($json_data);
        echo "</pre>";
    } else {
        echo "<p>No es JSON válido</p>";
    }
} else {
    echo "<p>No hay datos raw</p>";
}

echo "<h2>6. Content-Type:</h2>";
echo "<p>" . ($_SERVER['CONTENT_TYPE'] ?? 'No especificado') . "</p>";

echo "<h2>7. Timestamp:</h2>";
echo "<p>" . date('Y-m-d H:i:s') . "</p>";
?>
