<?php
// 🔍 VERIFICAR AUTH.PHP DEL SERVIDOR
echo "<h1>🔍 VERIFICAR AUTH.PHP DEL SERVIDOR</h1>";

$auth_file = 'auth.php';
if (file_exists($auth_file)) {
    echo "<p style='color: green;'>✅ auth.php existe</p>";
    
    $content = file_get_contents($auth_file);
    
    echo "<h2>Verificaciones:</h2>";
    
    // Verificar si tiene el caso 'logout'
    if (strpos($content, "case 'logout':") !== false) {
        echo "<p style='color: green;'>✅ Tiene caso 'logout'</p>";
    } else {
        echo "<p style='color: red;'>❌ NO tiene caso 'logout'</p>";
    }
    
    // Verificar si tiene handleLogout()
    if (strpos($content, 'function handleLogout()') !== false) {
        echo "<p style='color: green;'>✅ Tiene función handleLogout()</p>";
    } else {
        echo "<p style='color: red;'>❌ NO tiene función handleLogout()</p>";
    }
    
    // Verificar si tiene el caso 'register'
    if (strpos($content, "case 'register':") !== false) {
        echo "<p style='color: green;'>✅ Tiene caso 'register'</p>";
    } else {
        echo "<p style='color: red;'>❌ NO tiene caso 'register'</p>";
    }
    
    // Verificar si tiene handleRegister()
    if (strpos($content, 'function handleRegister()') !== false) {
        echo "<p style='color: green;'>✅ Tiene función handleRegister()</p>";
    } else {
        echo "<p style='color: red;'>❌ NO tiene función handleRegister()</p>";
    }
    
    echo "<h2>Líneas relevantes del switch:</h2>";
    $lines = explode("\n", $content);
    $in_switch = false;
    foreach ($lines as $i => $line) {
        if (strpos($line, 'switch ($action)') !== false) {
            $in_switch = true;
        }
        if ($in_switch && (strpos($line, 'case') !== false || strpos($line, 'default:') !== false)) {
            echo "<pre>" . ($i + 1) . ": " . htmlspecialchars($line) . "</pre>";
        }
        if ($in_switch && strpos($line, '}') !== false && strpos($line, 'switch') === false) {
            break;
        }
    }
    
} else {
    echo "<p style='color: red;'>❌ auth.php NO existe</p>";
}
?>

