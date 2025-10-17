<?php
// 🔍 DEBUG: Ver estructura real de las tablas

header('Content-Type: application/json');

try {
    $host = 'localhost';
    $dbname = 'sistema_apps';
    $username = 'sistema_apps_user';
    $password = 'GestionUploadSistemaApps!';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $result = [];
    
    // Ver estructura de memoflip_usuarios
    try {
        $stmt = $pdo->query("DESCRIBE memoflip_usuarios");
        $result['memoflip_usuarios'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $result['memoflip_usuarios_error'] = $e->getMessage();
    }
    
    // Ver estructura de memoflip_ranking_cache
    try {
        $stmt = $pdo->query("DESCRIBE memoflip_ranking_cache");
        $result['memoflip_ranking_cache'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $result['memoflip_ranking_cache_error'] = $e->getMessage();
    }
    
    // Ver algunos datos de ejemplo
    try {
        $stmt = $pdo->query("SELECT * FROM memoflip_usuarios LIMIT 2");
        $result['memoflip_usuarios_data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $result['memoflip_usuarios_data_error'] = $e->getMessage();
    }
    
    echo json_encode($result, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()], JSON_PRETTY_PRINT);
}
?>
