<?php
// 🔧 CONFIGURACIÓN DE BASE DE DATOS - HOSTALIA
// Archivo centralizado para todas las conexiones

// Configuración de la base de datos
$host = 'PMYSQL165.dns-servicio.com';
$dbname = '9606966_sistema_apps_db';
$username = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    error_log("✅ [CONFIG] Conexión a BD establecida correctamente");
} catch(PDOException $e) {
    error_log("❌ [CONFIG] Error de conexión: " . $e->getMessage());
    die("Error de conexión: " . $e->getMessage());
}

// Configuración específica de MemoFlip
$juego = 'memoflip';
$tabla_usuarios = 'usuarios_aplicaciones';
$tabla_progreso = 'memoflip_progreso';
$tabla_ranking = 'memoflip_ranking_cache';
?>
