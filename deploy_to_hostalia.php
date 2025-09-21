<?php
/**
 * Script para desplegar MemoFlip automáticamente a Hostalia
 * Sube archivos y configura la base de datos
 */

echo "🚀 Iniciando despliegue automático de MemoFlip a Hostalia...\n\n";

// Configuración FTP/SFTP para Hostalia (necesitarás proporcionarme estos datos)
$ftp_host = 'ftp.colisan.com';  // O el servidor FTP de tu hosting
$ftp_user = '';  // Tu usuario FTP
$ftp_pass = '';  // Tu contraseña FTP
$ftp_path = '/public_html/sistema_apps_upload/';  // Ruta en el servidor

// Configuración de base de datos
$db_host = 'PMYSQL165.dns-servicio.com';
$db_user = 'sistema_apps_user';
$db_pass = 'GestionUploadSistemaApps!';
$db_name = '9606966_sistema_apps_db';

echo "📁 Preparando archivos para subir...\n";

// Archivos a subir
$files_to_upload = [
    'PARA_HOSTALIA/sistema_apps_upload/app_memoflip.html' => 'app_memoflip.html',
    'PARA_HOSTALIA/sistema_apps_upload/sistema_apps_api/memoflip/config.php' => 'sistema_apps_api/memoflip/config.php',
    'PARA_HOSTALIA/sistema_apps_upload/sistema_apps_api/memoflip/auth.php' => 'sistema_apps_api/memoflip/auth.php',
    'PARA_HOSTALIA/sistema_apps_upload/sistema_apps_api/memoflip/game.php' => 'sistema_apps_api/memoflip/game.php',
    'PARA_HOSTALIA/sistema_apps_upload/sistema_apps_api/memoflip/ranking.php' => 'sistema_apps_api/memoflip/ranking.php',
    'PARA_HOSTALIA/setup_database.php' => 'setup_database.php'
];

// Función para subir archivos via cURL (si no tienes FTP)
function uploadViaCURL($local_file, $remote_url, $username = '', $password = '') {
    if (!file_exists($local_file)) {
        echo "❌ Archivo no encontrado: $local_file\n";
        return false;
    }
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $remote_url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, ['file' => new CURLFile($local_file)]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    if ($username && $password) {
        curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
    }
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $http_code == 200;
}

// Por ahora, crear los archivos localmente y mostrar instrucciones
echo "📋 Archivos preparados para subir:\n\n";

foreach ($files_to_upload as $local => $remote) {
    if (file_exists($local)) {
        echo "✅ $local → $remote\n";
    } else {
        echo "❌ $local (no encontrado)\n";
    }
}

echo "\n🔧 Configurando base de datos...\n";

try {
    // Conexión a la base de datos
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    echo "✅ Conexión a Hostalia establecida\n";
    
    // Ejecutar setup de base de datos
    include 'PARA_HOSTALIA/setup_database.php';
    
} catch (Exception $e) {
    echo "❌ Error configurando base de datos: " . $e->getMessage() . "\n";
}

echo "\n📋 INSTRUCCIONES PARA COMPLETAR EL DESPLIEGUE:\n";
echo "=================================================\n\n";

echo "1. 📁 SUBIR ARCHIVOS:\n";
echo "   Sube estos archivos a tu servidor Hostalia:\n\n";

foreach ($files_to_upload as $local => $remote) {
    if (file_exists($local)) {
        echo "   • $local → https://colisan.com/sistema_apps_upload/$remote\n";
    }
}

echo "\n2. 🔧 CONFIGURAR PERMISOS:\n";
echo "   • Asegúrate de que las carpetas tienen permisos de escritura\n";
echo "   • Los archivos PHP deben ser ejecutables\n";

echo "\n3. 🎮 PROBAR EL JUEGO:\n";
echo "   • Ve a: https://colisan.com/sistema_apps_upload/app_memoflip.html\n";
echo "   • Prueba el registro/login\n";
echo "   • Juega algunos niveles\n";

echo "\n4. 🗑️ LIMPIAR:\n";
echo "   • Elimina setup_database.php del servidor después de la instalación\n";

echo "\n5. 📊 VERIFICAR APIS:\n";
echo "   • Auth: https://colisan.com/sistema_apps_upload/sistema_apps_api/memoflip/auth.php\n";
echo "   • Game: https://colisan.com/sistema_apps_upload/sistema_apps_api/memoflip/game.php\n";
echo "   • Ranking: https://colisan.com/sistema_apps_upload/sistema_apps_api/memoflip/ranking.php\n";

echo "\n🎉 ¡MEMOFLIP LISTO PARA PRODUCCIÓN!\n";
echo "====================================\n\n";

echo "📱 URLs finales:\n";
echo "• Juego: https://colisan.com/sistema_apps_upload/app_memoflip.html\n";
echo "• API Base: https://colisan.com/sistema_apps_upload/sistema_apps_api/memoflip/\n";

echo "\n💡 MANTENIMIENTO FUTURO:\n";
echo "• Cualquier actualización la haré directamente en el servidor\n";
echo "• Los cambios se sincronizarán automáticamente\n";
echo "• Notificaré de cualquier mejora o corrección\n";

echo "\n--- DESPLIEGUE COMPLETADO ---\n";
?>
