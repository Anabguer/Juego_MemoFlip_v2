<?php
// Verificar dónde están los archivos
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 VERIFICACIÓN DE ARCHIVOS</h1>";

echo "<h2>📁 Archivos en el directorio actual (" . getcwd() . "):</h2>";
$files = scandir('.');
echo "<ul>";
foreach ($files as $file) {
    if ($file != '.' && $file != '..' && strpos($file, '.php') !== false) {
        echo "<li>📄 $file</li>";
    }
}
echo "</ul>";

echo "<h2>🌐 URLs para probar:</h2>";
echo "<p><a href='test_ranking_error.php'>test_ranking_error.php</a> (en directorio actual)</p>";
echo "<p><a href='/test_ranking_error.php'>/test_ranking_error.php</a> (en raíz)</p>";
echo "<p><a href='ranking.php'>ranking.php</a> (en directorio actual)</p>";
echo "<p><a href='/ranking.php'>/ranking.php</a> (en raíz)</p>";

echo "<h2>📊 Información del servidor:</h2>";
echo "<p><strong>Directorio actual:</strong> " . getcwd() . "</p>";
echo "<p><strong>Script actual:</strong> " . $_SERVER['SCRIPT_NAME'] . "</p>";
echo "<p><strong>Document root:</strong> " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
?>
