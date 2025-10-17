<?php
// DEBUG COMPLETO DEL AUTH
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 DEBUG COMPLETO DEL AUTH</h1>";

echo "<h2>1. Método HTTP:</h2>";
echo "<p>" . $_SERVER['REQUEST_METHOD'] . "</p>";

echo "<h2>2. GET parameters:</h2>";
echo "<pre>" . print_r($_GET, true) . "</pre>";

echo "<h2>3. POST parameters:</h2>";
echo "<pre>" . print_r($_POST, true) . "</pre>";

echo "<h2>4. Raw input (php://input):</h2>";
$input = file_get_contents('php://input');
echo "<p><strong>Raw:</strong> " . htmlspecialchars($input) . "</p>";

$json_data = json_decode($input, true);
echo "<p><strong>JSON decode:</strong></p>";
echo "<pre>" . print_r($json_data, true) . "</pre>";

echo "<h2>5. Simulando lógica del auth.php:</h2>";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $json_data['action'] ?? $_POST['action'] ?? $_GET['action'] ?? '';
    echo "<p><strong>Acción detectada:</strong> '" . htmlspecialchars($action) . "'</p>";
    
    if ($action === 'login') {
        echo "<p style='color: green;'>✅ Acción 'login' detectada correctamente</p>";
        
        $email = $json_data['email'] ?? $_POST['email'] ?? '';
        $password = $json_data['password'] ?? $_POST['password'] ?? '';
        
        echo "<p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>";
        echo "<p><strong>Password:</strong> " . htmlspecialchars($password) . "</p>";
        
        if ($email && $password) {
            echo "<p style='color: green;'>✅ Email y password encontrados</p>";
            
            // Probar conexión BD
            try {
                require_once 'config_hostalia.php';
                
                $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
                $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                
                echo "<p style='color: green;'>✅ Conexión BD exitosa</p>";
                
                // Buscar usuario
                $sql = "SELECT * FROM usuarios_aplicaciones WHERE email = :email";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([':email' => $email]);
                $user = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($user) {
                    echo "<p style='color: green;'>✅ Usuario encontrado: " . htmlspecialchars($user['email']) . "</p>";
                    
                    if (password_verify($password, $user['password_hash'])) {
                        echo "<p style='color: green;'>✅ Contraseña correcta</p>";
                        
                        if ($user['verified_at']) {
                            echo "<p style='color: green;'>✅ Usuario verificado</p>";
                            
                            // Buscar datos de juego
                            $game_sql = "SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :key";
                            $game_stmt = $pdo->prepare($game_sql);
                            $game_stmt->execute([':key' => $user['usuario_aplicacion_key']]);
                            $game_data = $game_stmt->fetch(PDO::FETCH_ASSOC);
                            
                            if ($game_data) {
                                echo "<p style='color: green;'>✅ Datos de juego encontrados</p>";
                                echo "<p style='color: green; font-size: 20px;'>🎉 ¡LOGIN DEBERÍA FUNCIONAR!</p>";
                            } else {
                                echo "<p style='color: red;'>❌ No hay datos de juego</p>";
                            }
                        } else {
                            echo "<p style='color: red;'>❌ Usuario no verificado</p>";
                        }
                    } else {
                        echo "<p style='color: red;'>❌ Contraseña incorrecta</p>";
                    }
                } else {
                    echo "<p style='color: red;'>❌ Usuario no encontrado</p>";
                }
                
            } catch (Exception $e) {
                echo "<p style='color: red;'>❌ Error BD: " . $e->getMessage() . "</p>";
            }
            
        } else {
            echo "<p style='color: red;'>❌ Email o password faltantes</p>";
        }
        
    } else {
        echo "<p style='color: red;'>❌ Acción no es 'login': '" . htmlspecialchars($action) . "'</p>";
    }
    
} else {
    echo "<p>No es POST</p>";
}

echo "<h2>6. Test directo del auth.php:</h2>";
echo "<p><a href='javascript:testAuth()'>Probar auth.php directamente</a></p>";

echo "<script>";
echo "function testAuth() {";
echo "  fetch('auth.php', {";
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
echo "    alert('Respuesta auth.php: ' + JSON.stringify(data, null, 2));";
echo "  })";
echo "  .catch(error => {";
echo "    alert('Error: ' + error);";
echo "  });";
echo "}";
echo "</script>";
?>
