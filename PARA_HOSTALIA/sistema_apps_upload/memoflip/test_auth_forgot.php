<?php
// 🧪 TEST AUTH.PHP FORGOT_PASSWORD
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'forgot_password') {
    $email = $_POST['test_email'] ?? '';
    
    if (!$email) {
        echo json_encode(['success' => false, 'error' => 'Email es obligatorio']);
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
        
        // Generar código de recuperación de 6 dígitos
        $codigo_recuperacion = str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
        $expiry_time = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        
        // Actualizar usuario con código de recuperación
        $update_sql = "UPDATE usuarios_aplicaciones SET 
                       verification_code = :codigo, 
                       verification_expiry = :expiry 
                       WHERE usuario_aplicacion_key = :key";
        $update_stmt = $pdo->prepare($update_sql);
        $update_stmt->execute([
            ':codigo' => $codigo_recuperacion,
            ':expiry' => $expiry_time,
            ':key' => $usuario_aplicacion_key
        ]);
        
        // Enviar email con código de recuperación
        $email_enviado = false;
        try {
            if (file_exists('enviar_email.php')) {
                require_once 'enviar_email.php';
                $email_enviado = enviarEmailRecuperacion($email, $user['nombre'], $codigo_recuperacion);
            } else {
                // Fallback: usar mail() básico
                $asunto = "Recuperar contraseña - MemoFlip";
                $mensaje = "Hola " . $user['nombre'] . ",\n\n";
                $mensaje .= "Tu código de recuperación es: " . $codigo_recuperacion . "\n\n";
                $mensaje .= "Este código expira en 15 minutos.\n\n";
                $mensaje .= "Si no solicitaste este código, ignora este email.\n\n";
                $mensaje .= "© 2025 MemoFlip";
                
                $email_enviado = mail($email, $asunto, $mensaje);
            }
        } catch (Exception $e) {
            error_log("❌ [AUTH] Error enviando email: " . $e->getMessage());
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Código de recuperación enviado a tu email',
            'email_sent' => $email_enviado,
            'codigo_dev' => $email_enviado ? null : $codigo_recuperacion
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
?>
