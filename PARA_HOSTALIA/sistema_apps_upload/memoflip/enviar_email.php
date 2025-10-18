<?php
// 📧 ENVIAR EMAIL - MEMOFLIP CON PHPMailer
// Sistema de envío de emails para verificación y recuperación de contraseñas

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

/**
 * Envía email de recuperación de contraseña usando PHPMailer
 */
function enviarEmailRecuperacion($email, $nombre, $codigo) {
    // Configuración SMTP de Hostalia
    $mail_host = 'smtp.colisan.com';
    $mail_user = 'info@colisan.com';
    $mail_pass = 'IgdAmg19521954';
    
    $asunto = "🔐 Recuperar contraseña - MemoFlip";
    $html = generarTemplateEmailRecuperacion($nombre, $codigo);
    
    // Instantiation and passing `true` enables exceptions
    $mail = new PHPMailer(true);
    
    try {
        // Configuración SSL para evitar problemas de certificados
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Server settings
        $mail->SMTPDebug = 0; // 0 = off, 1 = client, 2 = client y server
        $mail->isSMTP(); // Send using SMTP
        $mail->Host = $mail_host; // Set the SMTP server to send through
        $mail->SMTPAuth = true; // Enable SMTP authentication
        $mail->Username = $mail_user; // SMTP username
        $mail->Password = $mail_pass; // SMTP password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Enable TLS encryption
        $mail->Port = 587; // TCP port to connect to
        
        // Recipients
        $mail->setFrom('info@colisan.com', 'MemoFlip');
        $mail->addAddress($email, $nombre); // Add a recipient
        
        // Content
        $mail->isHTML(true); // Set email format to HTML
        $mail->Subject = $asunto;
        $mail->Body = $html;
        $mail->AltBody = 'Tu código de recuperación es: ' . $codigo . '. Este código expira en 15 minutos.';
        $mail->CharSet = 'UTF-8';
        
        $mail->send();
        
        error_log("✅ [PHPMailer] Email de recuperación enviado a: " . $email);
        return true;
        
    } catch (Exception $e) {
        error_log("❌ [PHPMailer] Error enviando email a " . $email . ": " . $e->getMessage());
        return false;
    }
}

/**
 * Envía email de verificación de registro usando PHPMailer
 */
function enviarEmailVerificacion($email, $nombre, $codigo) {
    // Configuración SMTP de Hostalia
    $mail_host = 'smtp.colisan.com';
    $mail_user = 'info@colisan.com';
    $mail_pass = 'IgdAmg19521954';
    
    $asunto = "✅ Verificar cuenta - MemoFlip";
    $html = generarTemplateEmailVerificacion($nombre, $codigo);
    
    // Instantiation and passing `true` enables exceptions
    $mail = new PHPMailer(true);
    
    try {
        // Configuración SSL para evitar problemas de certificados
        $mail->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );
        
        // Server settings
        $mail->SMTPDebug = 0; // 0 = off, 1 = client, 2 = client y server
        $mail->isSMTP(); // Send using SMTP
        $mail->Host = $mail_host; // Set the SMTP server to send through
        $mail->SMTPAuth = true; // Enable SMTP authentication
        $mail->Username = $mail_user; // SMTP username
        $mail->Password = $mail_pass; // SMTP password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // Enable TLS encryption
        $mail->Port = 587; // TCP port to connect to
        
        // Recipients
        $mail->setFrom('info@colisan.com', 'MemoFlip');
        $mail->addAddress($email, $nombre); // Add a recipient
        
        // Content
        $mail->isHTML(true); // Set email format to HTML
        $mail->Subject = $asunto;
        $mail->Body = $html;
        $mail->AltBody = 'Tu código de verificación es: ' . $codigo . '. Este código expira en 15 minutos.';
        $mail->CharSet = 'UTF-8';
        
        $mail->send();
        
        error_log("✅ [PHPMailer] Email de verificación enviado a: " . $email);
        return true;
        
    } catch (Exception $e) {
        error_log("❌ [PHPMailer] Error enviando email de verificación a " . $email . ": " . $e->getMessage());
        return false;
    }
}

/**
 * Genera el template HTML para email de recuperación
 */
function generarTemplateEmailRecuperacion($nombre, $codigo) {
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Recuperar contraseña - MemoFlip</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                color: #666;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .codigo-container {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 2px dashed #dee2e6;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
            }
            .codigo-label {
                font-size: 14px;
                color: #6c757d;
                margin-bottom: 10px;
                font-weight: bold;
            }
            .codigo {
                font-size: 32px;
                font-weight: bold;
                color: #dc3545;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                margin: 0;
            }
            .expiry {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
                font-size: 14px;
            }
            .warning {
                background: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #721c24;
                font-size: 14px;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #6c757d;
                font-size: 12px;
                border-top: 1px solid #dee2e6;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎮 MemoFlip</h1>
                <p>Juego de Memoria</p>
            </div>
            
            <div class='content'>
                <div class='greeting'>
                    ¡Hola, " . htmlspecialchars($nombre) . "!
                </div>
                
                <div class='message'>
                    Recibimos una solicitud para recuperar tu contraseña.<br>
                    Introduce el siguiente código en la aplicación:
                </div>
                
                <div class='codigo-container'>
                    <div class='codigo-label'>TU CÓDIGO DE RECUPERACIÓN</div>
                    <div class='codigo'>" . $codigo . "</div>
                </div>
                
                <div class='expiry'>
                    ⏰ Este código expira en <strong>15 minutos</strong>
                </div>
                
                <div class='warning'>
                    ⚠️ Si no solicitaste recuperar tu contraseña, ignora este email.<br>
                    Tu cuenta permanecerá segura.
                </div>
            </div>
            
            <div class='footer'>
                <p>© 2025 MemoFlip - Juego de Memoria</p>
                <p>Si tienes problemas, contacta: <a href='mailto:soporte@memoflip.com'>soporte@memoflip.com</a></p>
            </div>
        </div>
    </body>
    </html>";
}

/**
 * Genera el template HTML para email de verificación
 */
function generarTemplateEmailVerificacion($nombre, $codigo) {
    return "
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset='UTF-8'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <title>Verificar cuenta - MemoFlip</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }
            .header p {
                margin: 10px 0 0 0;
                opacity: 0.9;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
            }
            .greeting {
                font-size: 18px;
                color: #333;
                margin-bottom: 20px;
            }
            .message {
                font-size: 16px;
                color: #666;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .codigo-container {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 2px dashed #dee2e6;
                border-radius: 10px;
                padding: 20px;
                margin: 20px 0;
            }
            .codigo-label {
                font-size: 14px;
                color: #6c757d;
                margin-bottom: 10px;
                font-weight: bold;
            }
            .codigo {
                font-size: 32px;
                font-weight: bold;
                color: #28a745;
                letter-spacing: 8px;
                font-family: 'Courier New', monospace;
                margin: 0;
            }
            .expiry {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #856404;
                font-size: 14px;
            }
            .welcome {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                color: #155724;
                font-size: 14px;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px;
                text-align: center;
                color: #6c757d;
                font-size: 12px;
                border-top: 1px solid #dee2e6;
            }
            .footer a {
                color: #007bff;
                text-decoration: none;
            }
        </style>
    </head>
    <body>
        <div class='container'>
            <div class='header'>
                <h1>🎮 MemoFlip</h1>
                <p>Juego de Memoria</p>
            </div>
            
            <div class='content'>
                <div class='greeting'>
                    ¡Bienvenido, " . htmlspecialchars($nombre) . "!
                </div>
                
                <div class='message'>
                    Gracias por registrarte en MemoFlip.<br>
                    Para activar tu cuenta, introduce el siguiente código:
                </div>
                
                <div class='codigo-container'>
                    <div class='codigo-label'>TU CÓDIGO DE VERIFICACIÓN</div>
                    <div class='codigo'>" . $codigo . "</div>
                </div>
                
                <div class='expiry'>
                    ⏰ Este código expira en <strong>15 minutos</strong>
                </div>
                
                <div class='welcome'>
                    🎉 ¡Estás a un paso de comenzar a jugar!<br>
                    Después de verificar tu cuenta, podrás disfrutar de todos los niveles.
                </div>
            </div>
            
            <div class='footer'>
                <p>© 2025 MemoFlip - Juego de Memoria</p>
                <p>Si tienes problemas, contacta: <a href='mailto:soporte@memoflip.com'>soporte@memoflip.com</a></p>
            </div>
        </div>
    </body>
    </html>";
}

/**
 * Función auxiliar para generar códigos de verificación
 */
function generarCodigoVerificacion() {
    return str_pad(rand(100000, 999999), 6, '0', STR_PAD_LEFT);
}

/**
 * Función auxiliar para verificar si un código ha expirado
 */
function codigoEsValido($verification_expiry) {
    if (!$verification_expiry) {
        return false;
    }
    
    $expiry_timestamp = strtotime($verification_expiry);
    $current_timestamp = time();
    
    return $expiry_timestamp > $current_timestamp;
}
?>