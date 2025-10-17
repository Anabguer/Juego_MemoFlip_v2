<?php
// 🔍 VERIFICAR TABLAS DE MEMOFLIP EN LA BASE DE DATOS

header('Content-Type: application/json');

try {
    // Conectar a la base de datos
    $host = 'localhost';
    $dbname = 'sistema_apps';
    $username = 'sistema_apps_user';
    $password = 'GestionUploadSistemaApps!';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Verificar tablas existentes
    $tables = ['memoflip_usuarios', 'memoflip_ranking_cache', 'usuarios_aplicaciones', 'aplicaciones'];
    $results = [];
    
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
            $exists = $stmt->rowCount() > 0;
            $results[$table] = $exists;
            
            if ($exists) {
                // Mostrar estructura de la tabla
                $desc = $pdo->query("DESCRIBE $table");
                $columns = $desc->fetchAll(PDO::FETCH_ASSOC);
                $results[$table . '_columns'] = $columns;
            }
        } catch (Exception $e) {
            $results[$table] = false;
            $results[$table . '_error'] = $e->getMessage();
        }
    }
    
    echo json_encode([
        'ok' => true,
        'message' => 'Verificación de tablas completada',
        'database' => $dbname,
        'tables' => $results
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'ok' => false,
        'error' => 'Error conectando a la base de datos',
        'details' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
