<?php
// 🧪 TEST PHPMailer - MEMOFLIP
// Script de prueba para verificar el funcionamiento del sistema de correo

echo "<h1>🧪 Test PHPMailer - MemoFlip</h1>";
echo "<hr>";

// Incluir el archivo de envío de emails
require_once 'enviar_email.php';

// Datos de prueba
$email_test = 'bitj2a@gmail.com'; // Cambiar por tu email para probar
$nombre_test = 'Usuario Test';
$codigo_test = '123456';

echo "<h2>📧 Probando envío de email de recuperación...</h2>";
echo "<p><strong>Email destino:</strong> " . $email_test . "</p>";
echo "<p><strong>Nombre:</strong> " . $nombre_test . "</p>";
echo "<p><strong>Código:</strong> " . $codigo_test . "</p>";
echo "<hr>";

// Probar envío de email de recuperación
echo "<h3>🔄 Enviando email de recuperación...</h3>";
$resultado_recuperacion = enviarEmailRecuperacion($email_test, $nombre_test, $codigo_test);

if ($resultado_recuperacion) {
    echo "<p style='color: green; font-weight: bold;'>✅ Email de recuperación enviado correctamente</p>";
} else {
    echo "<p style='color: red; font-weight: bold;'>❌ Error enviando email de recuperación</p>";
}

echo "<hr>";

// Probar envío de email de verificación
echo "<h3>🔄 Enviando email de verificación...</h3>";
$resultado_verificacion = enviarEmailVerificacion($email_test, $nombre_test, $codigo_test);

if ($resultado_verificacion) {
    echo "<p style='color: green; font-weight: bold;'>✅ Email de verificación enviado correctamente</p>";
} else {
    echo "<p style='color: red; font-weight: bold;'>❌ Error enviando email de verificación</p>";
}

echo "<hr>";

// Verificar archivos PHPMailer
echo "<h2>📁 Verificando archivos PHPMailer...</h2>";

$archivos_phpmailer = [
    'PHPMailer/DSNConfigurator.php',
    'PHPMailer/Exception.php',
    'PHPMailer/OAuth.php',
    'PHPMailer/OAuthTokenProvider.php',
    'PHPMailer/PHPMailer.php',
    'PHPMailer/POP3.php',
    'PHPMailer/SMTP.php'
];

foreach ($archivos_phpmailer as $archivo) {
    if (file_exists($archivo)) {
        echo "<p style='color: green;'>✅ " . $archivo . " - OK</p>";
    } else {
        echo "<p style='color: red;'>❌ " . $archivo . " - NO ENCONTRADO</p>";
    }
}

echo "<hr>";

// Información del sistema
echo "<h2>ℹ️ Información del sistema</h2>";
echo "<p><strong>PHP Version:</strong> " . phpversion() . "</p>";
echo "<p><strong>Server:</strong> " . $_SERVER['SERVER_SOFTWARE'] . "</p>";
echo "<p><strong>Date:</strong> " . date('Y-m-d H:i:s') . "</p>";

echo "<hr>";
echo "<p><em>Test completado. Revisa tu email para verificar la recepción.</em></p>";
?>




