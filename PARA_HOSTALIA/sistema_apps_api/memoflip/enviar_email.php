<?php
/**
 * SISTEMA DE ENVÍO DE EMAILS
 * Envía emails de verificación con código
 */

function enviarEmailVerificacion($email, $nombre, $codigo) {
    $asunto = "MemoFlip - Verifica tu cuenta";
    
    $mensaje = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }
            .container { background-color: white; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; text-align: center; }
            .code-box { background-color: #f0f0f0; border: 2px dashed #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace; }
            .info { color: #666; font-size: 14px; margin-top: 20px; line-height: 1.6; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; text-align: left; }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎮 MemoFlip</h1>
                <p>Verificación de cuenta</p>
            </div>
            
            <div class='content'>
                <h2>¡Hola $nombre!</h2>
                <p>Gracias por registrarte en <strong>MemoFlip</strong>.</p>
                <p>Para activar tu cuenta, usa el siguiente código de verificación:</p>
                
                <div class='code-box'>
                    <div class='code'>$codigo</div>
                </div>
                
                <div class='info'>
                    <p><strong>Instrucciones:</strong></p>
                    <p>1. Abre la aplicación MemoFlip</p>
                    <p>2. Introduce este código en la pantalla de verificación</p>
                    <p>3. ¡Empieza a jugar!</p>
                </div>
                
                <div class='warning'>
                    <strong>⚠️ Importante:</strong> Este código expira en <strong>24 horas</strong>.<br>
                    Si no solicitaste este registro, ignora este correo.
                </div>
            </div>
            
            <div class='footer'>
                <p>© 2024 MemoFlip - @intocables13</p>
                <p>Este es un correo automático, por favor no respondas.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Cabeceras para HTML
    $headers = "MIME-Version: 1.0\r\n";
    $headers .= "Content-type: text/html; charset=UTF-8\r\n";
    $headers .= "From: MemoFlip <noreply@colisan.com>\r\n";
    $headers .= "Reply-To: info@intocables13.com\r\n";
    
    // Enviar email
    $enviado = mail($email, $asunto, $mensaje, $headers);
    
    // Log del envío
    error_log("[MEMOFLIP EMAIL] Enviado a: $email | Código: $codigo | Status: " . ($enviado ? 'OK' : 'FAIL'));
    
    return $enviado;
}

/**
 * Generar código de verificación de 6 dígitos
 */
function generarCodigoVerificacion() {
    return str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
}

/**
 * Verificar si un código es válido (no expirado)
 * @param string $verification_expiry - DateTime cuando expira el código
 * @return bool
 */
function codigoEsValido($verification_expiry) {
    if (empty($verification_expiry)) {
        return false;
    }
    
    $timestamp_expiracion = strtotime($verification_expiry);
    $timestamp_actual = time();
    
    return $timestamp_actual < $timestamp_expiracion;
}
?>

