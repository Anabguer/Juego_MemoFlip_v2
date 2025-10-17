<?php
// 🔍 DEBUG DEL RANKING - MEMOFLIP

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Conectar a la base de datos
    $host = 'localhost';
    $dbname = 'sistema_apps';
    $username = 'sistema_apps_user';
    $password = 'GestionUploadSistemaApps!';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $debug = [];
    
    // 1. Verificar si la tabla existe
    try {
        $stmt = $pdo->query("SHOW TABLES LIKE 'memoflip_ranking_cache'");
        $debug['table_exists'] = $stmt->rowCount() > 0;
    } catch (Exception $e) {
        $debug['table_exists'] = false;
        $debug['table_error'] = $e->getMessage();
    }
    
    // 2. Ver estructura de la tabla
    try {
        $stmt = $pdo->query("DESCRIBE memoflip_ranking_cache");
        $debug['table_structure'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $debug['table_structure'] = null;
        $debug['structure_error'] = $e->getMessage();
    }
    
    // 3. Ver cuántos registros hay
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM memoflip_ranking_cache");
        $debug['total_records'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    } catch (Exception $e) {
        $debug['total_records'] = 0;
        $debug['count_error'] = $e->getMessage();
    }
    
    // 4. Ver algunos registros de ejemplo
    try {
        $stmt = $pdo->query("SELECT * FROM memoflip_ranking_cache LIMIT 5");
        $debug['sample_records'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $debug['sample_records'] = [];
        $debug['sample_error'] = $e->getMessage();
    }
    
    // 5. Verificar tabla memoflip_usuarios también
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as total FROM memoflip_usuarios");
        $debug['usuarios_total'] = $stmt->fetch(PDO::FETCH_ASSOC)['total'];
    } catch (Exception $e) {
        $debug['usuarios_total'] = 0;
        $debug['usuarios_error'] = $e->getMessage();
    }
    
    echo json_encode([
        'success' => true,
        'debug' => $debug,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
