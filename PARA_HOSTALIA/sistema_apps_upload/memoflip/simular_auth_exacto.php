<?php
// SIMULAR EXACTAMENTE EL AUTH.PHP LÍNEA POR LÍNEA
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 SIMULAR EXACTAMENTE EL AUTH.PHP</h1>";

// Simular la entrada JSON como lo hace el auth.php
$json_input = '{"action":"login","email":"bitj2a@gmail.com","password":"111111"}';

echo "<h2>1. Simulando entrada JSON:</h2>";
echo "<p><strong>JSON input:</strong> " . htmlspecialchars($json_input) . "</p>";

// Simular el procesamiento del auth.php
$_SERVER['REQUEST_METHOD'] = 'POST';
$GLOBALS['json_data'] = json_decode($json_input, true);

echo "<h2>2. Simulando procesamiento del auth.php:</h2>";
echo "<p><strong>json_data:</strong></p>";
echo "<pre>" . print_r($GLOBALS['json_data'], true) . "</pre>";

$data = $GLOBALS['json_data'];

if (!$data) {
    $data = $_POST;
}

if (!$data) {
    echo "<p style='color: red;'>❌ Datos JSON inválidos</p>";
    exit();
}

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

echo "<p><strong>Email extraído:</strong> " . htmlspecialchars($email) . "</p>";
echo "<p><strong>Password extraído:</strong> " . htmlspecialchars($password) . "</p>";

if (!$email || !$password) {
    echo "<p style='color: red;'>❌ Email y contraseña son obligatorios</p>";
    exit();
}

echo "<h2>3. Simulando conexión BD y búsqueda:</h2>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<p style='color: green;'>✅ Conexión BD exitosa</p>";
    
    // Buscar usuario por usuario_aplicacion_key específico (línea 70-73 del auth.php)
    $usuario_aplicacion_key = $email . '_memoflip';
    echo "<p><strong>usuario_aplicacion_key generado:</strong> " . htmlspecialchars($usuario_aplicacion_key) . "</p>";
    
    $sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([':key' => $usuario_aplicacion_key]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "<p><strong>SQL ejecutado:</strong> " . htmlspecialchars($sql) . "</p>";
    echo "<p><strong>Key usada:</strong> " . htmlspecialchars($usuario_aplicacion_key) . "</p>";
    
    if (!$user) {
        echo "<p style='color: red;'>❌ Usuario no encontrado</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Usuario encontrado</p>";
    echo "<p><strong>Email del usuario:</strong> " . htmlspecialchars($user['email']) . "</p>";
    echo "<p><strong>Hash del usuario:</strong> " . htmlspecialchars($user['password_hash']) . "</p>";
    
    // Verificar contraseña (línea 81 del auth.php)
    echo "<h2>4. Verificando contraseña:</h2>";
    echo "<p><strong>password_verify('" . htmlspecialchars($password) . "', hash):</strong></p>";
    
    $password_verify_result = password_verify($password, $user['password_hash']);
    echo "<p><strong>Resultado:</strong> " . ($password_verify_result ? 'TRUE ✅' : 'FALSE ❌') . "</p>";
    
    if (!$password_verify_result) {
        echo "<p style='color: red;'>❌ Contraseña incorrecta</p>";
        echo "<p><strong>DEBUG:</strong> ¿Por qué falla password_verify?</p>";
        echo "<p>- Password recibido: '" . htmlspecialchars($password) . "'</p>";
        echo "<p>- Hash en BD: " . htmlspecialchars($user['password_hash']) . "</p>";
        
        // Verificar si hay caracteres extraños
        echo "<p>- Longitud password: " . strlen($password) . "</p>";
        echo "<p>- Bytes password: " . implode(', ', array_map('ord', str_split($password))) . "</p>";
        
        exit();
    }
    
    echo "<p style='color: green;'>✅ Contraseña correcta</p>";
    
    // Verificar si está verificado (línea 86 del auth.php)
    if (!$user['verified_at']) {
        echo "<p style='color: red;'>❌ Usuario no verificado</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Usuario verificado</p>";
    
    // Buscar datos de juego (línea 96-98 del auth.php)
    $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
    $game_stmt = $pdo->prepare($game_sql);
    $game_stmt->execute([':key' => $usuario_aplicacion_key]);
    $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$game_data) {
        echo "<p style='color: red;'>❌ No hay datos de juego</p>";
        exit();
    }
    
    echo "<p style='color: green;'>✅ Datos de juego encontrados</p>";
    
    echo "<p style='color: green; font-size: 20px;'>🎉 ¡SIMULACIÓN COMPLETA EXITOSA!</p>";
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
