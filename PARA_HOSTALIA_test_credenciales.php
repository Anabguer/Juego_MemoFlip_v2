<?php
// 🔍 TEST DE CREDENCIALES - MEMOFLIP

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

$credentials = [
    ['host' => 'localhost', 'user' => 'sistema_apps_user', 'pass' => 'GestionUploadSistemaApps!', 'db' => 'sistema_apps'],
    ['host' => 'localhost', 'user' => 'root', 'pass' => '', 'db' => 'sistema_apps'],
    ['host' => '127.0.0.1', 'user' => 'sistema_apps_user', 'pass' => 'GestionUploadSistemaApps!', 'db' => 'sistema_apps'],
    ['host' => 'localhost', 'user' => 'memoflip_user', 'pass' => 'memoflip_pass', 'db' => 'memoflip_db'],
    ['host' => 'localhost', 'user' => 'sistema_apps', 'pass' => 'sistema_apps', 'db' => 'sistema_apps']
];

$results = [];

foreach ($credentials as $i => $cred) {
    try {
        $pdo = new PDO("mysql:host={$cred['host']};dbname={$cred['db']};charset=utf8mb4", $cred['user'], $cred['pass']);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        
        // Probar una query simple
        $stmt = $pdo->query("SELECT 1 as test");
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $results[] = [
            'test' => $i + 1,
            'credentials' => $cred,
            'status' => 'SUCCESS',
            'message' => 'Conexión exitosa'
        ];
        
    } catch (Exception $e) {
        $results[] = [
            'test' => $i + 1,
            'credentials' => $cred,
            'status' => 'ERROR',
            'message' => $e->getMessage()
        ];
    }
}

echo json_encode([
    'success' => true,
    'results' => $results,
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
