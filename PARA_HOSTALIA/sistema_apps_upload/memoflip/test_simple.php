<?php
// Test simple para verificar que PHP funciona
header('Content-Type: text/html; charset=utf-8');
echo "<h1>✅ PHP FUNCIONA</h1>";
echo "<p>Fecha: " . date('Y-m-d H:i:s') . "</p>";
echo "<p>Servidor: " . $_SERVER['SERVER_NAME'] . "</p>";
echo "<p>Directorio: " . getcwd() . "</p>";

echo "<h2>Archivos en el directorio:</h2>";
$files = scandir('.');
foreach ($files as $file) {
    if ($file != '.' && $file != '..' && strpos($file, '.php') !== false) {
        echo "<p>📁 $file</p>";
    }
}
?>
