<?php
// 🔍 VERIFICAR SI LOS ARCHIVOS ESTÁN SUBIDOS

header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 VERIFICACIÓN DE ARCHIVOS SUBIDOS</h1>";

$files_to_check = [
    'auth.php',
    'setup_usuarios_aplicaciones.php', 
    'ranking.php'
];

echo "<h2>📁 Archivos en el servidor:</h2>";
echo "<ul>";

foreach ($files_to_check as $file) {
    if (file_exists($file)) {
        $size = filesize($file);
        $modified = date('Y-m-d H:i:s', filemtime($file));
        echo "<li style='color: green;'>✅ <strong>$file</strong> - {$size} bytes - Modificado: $modified</li>";
    } else {
        echo "<li style='color: red;'>❌ <strong>$file</strong> - NO ENCONTRADO</li>";
    }
}

echo "</ul>";

echo "<h2>🎯 PRÓXIMOS PASOS:</h2>";
echo "<ol>";
echo "<li>Si todos los archivos están presentes, ejecuta: <a href='setup_usuarios_aplicaciones.php'>setup_usuarios_aplicaciones.php</a></li>";
echo "<li>Luego prueba: <a href='ranking.php'>ranking.php</a></li>";
echo "</ol>";

echo "<h2>🔧 INFORMACIÓN DEL SERVIDOR:</h2>";
echo "<p><strong>Directorio actual:</strong> " . getcwd() . "</p>";
echo "<p><strong>Fecha del servidor:</strong> " . date('Y-m-d H:i:s') . "</p>";
?>
