<?php
// 🧪 TEST AUTH.PHP RESET_PASSWORD
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'reset_password') {
    $email = $_POST['test_email'] ?? '';
    $codigo = $_POST['test_codigo'] ?? '';
    $nueva_password = $_POST['test_password'] ?? '';
    
    if (!$email || !$codigo || !$nueva_password) {
        echo json_encode(['success' => false, 'error' => 'Email, código y nueva contraseña son obligatorios']);
        exit;
    }
    
    if (strlen($nueva_password) < 6) {
        echo json_encode(['success' => false, 'error' => 'La contraseña debe tener al menos 6 caracteres']);
        exit;
    }
    
    try {
        // 🔥 CONECTAR A LA BASE DE DATOS
        require_once 'config_hostalia.php';
        
        $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Buscar usuario por usuario_aplicacion_key específico
        $usuario_aplicacion_key = $email . '_memoflip';
        $sql = "SELECT * FROM usuarios_aplicaciones WHERE usuario_aplicacion_key = :key";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':key' => $usuario_aplicacion_key]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            echo json_encode(['success' => false, 'error' => 'Usuario no encontrado']);
            exit;
        }
        
        // Verificar código de recuperación
        if (!$user['verification_code'] || $user['verification_code'] !== $codigo) {
            echo json_encode(['success' => false, 'error' => 'Código de recuperación incorrecto']);
            exit;
        }
        
        // Verificar que el código no haya expirado
        if (!$user['verification_expiry'] || strtotime($user['verification_expiry']) < time()) {
            echo json_encode(['success' => false, 'error' => 'Código de recuperación expirado. Solicita uno nuevo.']);
            exit;
        }
        
        // Hashear nueva contraseña
        $password_hash = password_hash($nueva_password, PASSWORD_DEFAULT);
        
        // Actualizar contraseña y limpiar código de recuperación
        $update_sql = "UPDATE usuarios_aplicaciones SET 
                       password_hash = :password_hash,
                       verification_code = NULL,
                       verification_expiry = NULL
                       WHERE usuario_aplicacion_key = :key";
        $update_stmt = $pdo->prepare($update_sql);
        $update_stmt->execute([
            ':password_hash' => $password_hash,
            ':key' => $usuario_aplicacion_key
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.',
            'password_updated' => true
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
?>
