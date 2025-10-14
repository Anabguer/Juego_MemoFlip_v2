<?php
/**
 * Script de debug para verificar respuesta de login
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Simular datos de POST
$_SERVER['REQUEST_METHOD'] = 'POST';
$testEmail = 'tu_email@ejemplo.com'; // CAMBIA ESTO por tu email real
$testPassword = 'tu_password';        // CAMBIA ESTO por tu password real

// Configuración de BD
$host = 'PMYSQL165.dns-servicio.com';
$dbname = '9606966_sistema_apps_db';
$user = 'sistema_apps_user';
$pass = 'GestionUploadSistemaApps!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
    
    echo json_encode([
        'test' => 'Conexión exitosa',
        'paso_1' => 'Conectado a BD',
        'db' => $dbname
    ], JSON_PRETTY_PRINT);
    
    // Buscar usuario
    $usuario_key = 'MEMOFLIP_' . strtoupper(hash('sha256', $testEmail));
    
    $stmt = $pdo->prepare("
        SELECT ua.*, mu.* 
        FROM usuarios_aplicaciones ua
        LEFT JOIN memoflip_usuarios mu ON ua.usuario_aplicacion_key = mu.usuario_aplicacion_key
        WHERE ua.email = ?
    ");
    $stmt->execute([$testEmail]);
    $usuario = $stmt->fetch();
    
    if ($usuario) {
        echo "\n\n";
        echo json_encode([
            'paso_2' => 'Usuario encontrado',
            'email' => $usuario['email'],
            'nombre' => $usuario['nombre'],
            'max_level_unlocked' => $usuario['max_level_unlocked'] ?? 'NULL',
            'coins_total' => $usuario['coins_total'] ?? 'NULL',
            'lives_current' => $usuario['lives_current'] ?? 'NULL',
            'usuario_aplicacion_key' => $usuario_key,
            'datos_completos' => $usuario
        ], JSON_PRETTY_PRINT);
    } else {
        echo "\n\n";
        echo json_encode([
            'error' => 'Usuario NO encontrado',
            'email_buscado' => $testEmail,
            'key_generada' => $usuario_key
        ], JSON_PRETTY_PRINT);
    }
    
} catch (Exception $e) {
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>

