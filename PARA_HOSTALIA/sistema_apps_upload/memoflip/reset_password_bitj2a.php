<?php
// RESET PASSWORD PARA bitj2a@gmail.com
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔐 RESET PASSWORD - bitj2a@gmail.com</h1>";

try {
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $email = 'bitj2a@gmail.com';
    $new_password = '111111';
    
    echo "<p>Reseteando contraseña para: <strong>" . htmlspecialchars($email) . "</strong></p>";
    echo "<p>Nueva contraseña: <strong>" . htmlspecialchars($new_password) . "</strong></p>";
    
    // Hash de la nueva contraseña
    $hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
    
    // Actualizar contraseña
    $sql = "UPDATE usuarios_aplicaciones SET password_hash = :password_hash WHERE email = :email";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':password_hash' => $hashed_password,
        ':email' => $email
    ]);
    
    if ($stmt->rowCount() > 0) {
        echo "<p style='color: green; font-size: 20px;'>✅ ¡Contraseña actualizada exitosamente!</p>";
        echo "<p>Ahora puedes hacer login con:</p>";
        echo "<ul>";
        echo "<li><strong>Email:</strong> " . htmlspecialchars($email) . "</li>";
        echo "<li><strong>Contraseña:</strong> " . htmlspecialchars($new_password) . "</li>";
        echo "</ul>";
    } else {
        echo "<p style='color: red;'>❌ No se pudo actualizar la contraseña</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color: red;'>❌ Error: " . $e->getMessage() . "</p>";
}
?>
