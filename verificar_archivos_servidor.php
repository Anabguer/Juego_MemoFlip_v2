<?php
// 🔍 VERIFICAR ARCHIVOS EN EL SERVIDOR
echo "<h1>🔍 VERIFICAR ARCHIVOS EN EL SERVIDOR</h1>";

$base_path = "/sistema_apps_upload/memoflip/";
$files_to_check = [
    "index.html",
    "_next/static/css/",
    "_next/static/chunks/",
    "logo.png"
];

echo "<h2>Archivos a verificar:</h2>";
echo "<ul>";
foreach ($files_to_check as $file) {
    $full_path = $_SERVER['DOCUMENT_ROOT'] . $base_path . $file;
    if (file_exists($full_path)) {
        echo "<li style='color: green;'>✅ $file - EXISTE</li>";
        if (is_dir($full_path)) {
            $files = scandir($full_path);
            echo "<ul>";
            foreach ($files as $f) {
                if ($f != '.' && $f != '..') {
                    echo "<li style='color: blue;'>📁 $f</li>";
                }
            }
            echo "</ul>";
        }
    } else {
        echo "<li style='color: red;'>❌ $file - NO EXISTE</li>";
    }
}
echo "</ul>";

echo "<h2>Estructura del directorio:</h2>";
$memoflip_path = $_SERVER['DOCUMENT_ROOT'] . $base_path;
if (is_dir($memoflip_path)) {
    $files = scandir($memoflip_path);
    echo "<ul>";
    foreach ($files as $file) {
        if ($file != '.' && $file != '..') {
            $file_path = $memoflip_path . $file;
            if (is_dir($file_path)) {
                echo "<li style='color: blue;'>📁 $file/</li>";
            } else {
                echo "<li style='color: green;'>📄 $file</li>";
            }
        }
    }
    echo "</ul>";
} else {
    echo "<p style='color: red;'>❌ Directorio no existe: $memoflip_path</p>";
}
?>
