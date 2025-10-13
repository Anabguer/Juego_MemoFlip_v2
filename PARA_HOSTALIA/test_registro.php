<?php
/**
 * TEST: Probar registro de usuario
 * Simula el registro desde la app
 */

// Headers
header('Content-Type: application/json');

// Configuración
$host = 'PMYSQL165.dns-servicio.com';
$dbname = '9606966_sistema_apps_db';
$username = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';

// Datos de prueba
$test_email = 'test_' . time() . '@test.com';
$test_nombre = 'Usuario Test';
$test_password = 'test123';

$log = [];
$log[] = "=== TEST REGISTRO MEMOFLIP ===";
$log[] = "Email: $test_email";
$log[] = "Nombre: $test_nombre";
$log[] = "";

try {
    // 1. Verificar que el archivo auth.php existe
    $log[] = "1. Verificando auth.php...";
    if (file_exists('auth.php')) {
        $log[] = "   ✅ auth.php existe";
    } else {
        $log[] = "   ❌ auth.php NO existe";
        throw new Exception('auth.php no encontrado');
    }
    
    // 2. Verificar que enviar_email.php existe
    $log[] = "2. Verificando enviar_email.php...";
    if (file_exists('enviar_email.php')) {
        $log[] = "   ✅ enviar_email.php existe";
    } else {
        $log[] = "   ❌ enviar_email.php NO existe";
    }
    
    // 3. Conectar a BD
    $log[] = "3. Conectando a base de datos...";
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    $log[] = "   ✅ Conexión exitosa";
    
    // 4. Verificar tabla usuarios_aplicaciones
    $log[] = "4. Verificando tabla usuarios_aplicaciones...";
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM usuarios_aplicaciones");
    $result = $stmt->fetch();
    $log[] = "   ✅ Tabla existe. Total usuarios: " . $result['total'];
    
    // 5. Verificar columnas de verificación
    $log[] = "5. Verificando columnas de verificación...";
    $stmt = $pdo->query("SHOW COLUMNS FROM usuarios_aplicaciones LIKE 'verification_code'");
    if ($stmt->rowCount() > 0) {
        $log[] = "   ✅ verification_code existe";
    } else {
        $log[] = "   ❌ verification_code NO existe";
    }
    
    $stmt = $pdo->query("SHOW COLUMNS FROM usuarios_aplicaciones LIKE 'verification_expiry'");
    if ($stmt->rowCount() > 0) {
        $log[] = "   ✅ verification_expiry existe";
    } else {
        $log[] = "   ❌ verification_expiry NO existe";
    }
    
    $stmt = $pdo->query("SHOW COLUMNS FROM usuarios_aplicaciones LIKE 'verified_at'");
    if ($stmt->rowCount() > 0) {
        $log[] = "   ✅ verified_at existe";
    } else {
        $log[] = "   ❌ verified_at NO existe";
    }
    
    // 6. Simular registro mediante inclusión de auth.php
    $log[] = "6. Simulando registro...";
    
    // Preparar datos POST simulados
    $_POST = [];
    $input = [
        'action' => 'register',
        'email' => $test_email,
        'nombre' => $test_nombre,
        'nick' => 'test',
        'password' => $test_password
    ];
    
    // Guardar input JSON
    file_put_contents('php://input', json_encode($input));
    
    $log[] = "   📤 Datos: " . json_encode($input);
    $log[] = "";
    $log[] = "7. Llamando a auth.php...";
    $log[] = "   (Redirigiendo output...)";
    $log[] = "";
    
    // Capturar output de auth.php
    ob_start();
    
    // Simular REQUEST_METHOD
    $_SERVER['REQUEST_METHOD'] = 'POST';
    
    // Llamar a auth.php
    include('auth.php');
    
    $auth_output = ob_get_clean();
    
    $log[] = "8. Respuesta de auth.php:";
    $log[] = $auth_output;
    
} catch (Exception $e) {
    $log[] = "";
    $log[] = "❌ ERROR: " . $e->getMessage();
    $log[] = "Trace: " . $e->getTraceAsString();
}

// Output
echo "<pre style='background: #1e1e1e; color: #00ff00; padding: 20px; border-radius: 10px; font-family: monospace;'>";
foreach ($log as $line) {
    echo htmlspecialchars($line) . "\n";
}
echo "</pre>";

echo "<hr>";
echo "<p><a href='verificar_tabla_usuarios.php'>← Ver tabla usuarios</a> | <a href='index.html'>← Volver al inicio</a></p>";
?>

