<?php
/**
 * DESCARGAR PHPMailer para MemoFlip
 * Este script descarga PHPMailer automáticamente
 */

echo "📧 Descargando PHPMailer para MemoFlip...\n\n";

// Crear directorio si no existe
$phpmailer_dir = __DIR__ . '/../includes/PHPMailer';
if (!file_exists($phpmailer_dir)) {
    mkdir($phpmailer_dir, 0755, true);
    echo "✅ Directorio creado: $phpmailer_dir\n";
}

// URLs de descarga de PHPMailer
$files = [
    'PHPMailer.php' => 'https://raw.githubusercontent.com/PHPMailer/PHPMailer/master/src/PHPMailer.php',
    'SMTP.php' => 'https://raw.githubusercontent.com/PHPMailer/PHPMailer/master/src/SMTP.php',
    'Exception.php' => 'https://raw.githubusercontent.com/PHPMailer/PHPMailer/master/src/Exception.php'
];

foreach ($files as $filename => $url) {
    $filepath = $phpmailer_dir . '/' . $filename;
    
    echo "📥 Descargando $filename...\n";
    
    $content = file_get_contents($url);
    if ($content !== false) {
        file_put_contents($filepath, $content);
        echo "✅ $filename descargado correctamente\n";
    } else {
        echo "❌ Error descargando $filename\n";
    }
}

echo "\n🎉 PHPMailer instalado correctamente!\n";
echo "📍 Ubicación: $phpmailer_dir\n";
echo "🔧 Ahora los emails de MemoFlip usarán SMTP automáticamente\n\n";

// Verificar que los archivos existen
echo "🔍 Verificando archivos...\n";
foreach ($files as $filename => $url) {
    $filepath = $phpmailer_dir . '/' . $filename;
    if (file_exists($filepath)) {
        echo "✅ $filename: " . filesize($filepath) . " bytes\n";
    } else {
        echo "❌ $filename: NO ENCONTRADO\n";
    }
}

echo "\n📋 PRÓXIMOS PASOS:\n";
echo "1. Ejecutar este script: php descargar_phpmailer.php\n";
echo "2. Subir auth.php y enviar_email.php a Hostalia\n";
echo "3. Ejecutar setup_verificacion.sql en phpMyAdmin\n";
echo "4. ¡Probar el registro en la app!\n";
?>
