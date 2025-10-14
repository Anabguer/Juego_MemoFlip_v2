<?php
/**
 * Script de diagnóstico para ver la estructura real de la BD en Hostalia
 */

// Configuración de conexión Hostalia
$host = 'PMYSQL165.dns-servicio.com';
$usuario = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';
$database = '9606966_sistema_apps_db';

echo "🔍 Diagnóstico de base de datos Hostalia\n";
echo "========================================\n\n";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$database;charset=utf8",
        $usuario,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    echo "✅ Conexión establecida\n\n";

    // Ver todas las tablas
    echo "📋 TABLAS EXISTENTES:\n";
    echo "=====================\n";
    $stmt = $pdo->prepare("SHOW TABLES");
    $stmt->execute();
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    foreach ($tables as $table) {
        echo "• $table\n";
    }

    // Ver estructura de tabla aplicaciones si existe
    if (in_array('aplicaciones', $tables)) {
        echo "\n🔧 ESTRUCTURA DE TABLA 'aplicaciones':\n";
        echo "=====================================\n";
        $stmt = $pdo->prepare("DESCRIBE aplicaciones");
        $stmt->execute();
        $columns = $stmt->fetchAll();
        
        foreach ($columns as $column) {
            echo sprintf("%-20s %-15s %-10s %-10s %-15s %s\n", 
                $column['Field'], 
                $column['Type'], 
                $column['Null'], 
                $column['Key'], 
                $column['Default'] ?? 'NULL',
                $column['Extra']
            );
        }
        
        // Ver algunos registros de ejemplo
        echo "\n📊 REGISTROS EN 'aplicaciones':\n";
        echo "===============================\n";
        $stmt = $pdo->prepare("SELECT * FROM aplicaciones LIMIT 3");
        $stmt->execute();
        $apps = $stmt->fetchAll();
        
        if ($apps) {
            foreach ($apps as $app) {
                echo "• " . json_encode($app, JSON_PRETTY_PRINT) . "\n";
            }
        } else {
            echo "• (tabla vacía)\n";
        }
    }

    // Ver estructura de tabla usuarios_aplicaciones si existe
    if (in_array('usuarios_aplicaciones', $tables)) {
        echo "\n👤 ESTRUCTURA DE TABLA 'usuarios_aplicaciones':\n";
        echo "===============================================\n";
        $stmt = $pdo->prepare("DESCRIBE usuarios_aplicaciones");
        $stmt->execute();
        $columns = $stmt->fetchAll();
        
        foreach ($columns as $column) {
            echo sprintf("%-25s %-15s %-10s %-10s %-15s %s\n", 
                $column['Field'], 
                $column['Type'], 
                $column['Null'], 
                $column['Key'], 
                $column['Default'] ?? 'NULL',
                $column['Extra']
            );
        }
    }

    // Verificar si ya existen tablas MemoFlip
    $memoflip_tables = array_filter($tables, function($table) {
        return strpos($table, 'memoflip_') === 0;
    });

    if ($memoflip_tables) {
        echo "\n🎮 TABLAS MEMOFLIP EXISTENTES:\n";
        echo "==============================\n";
        foreach ($memoflip_tables as $table) {
            echo "• $table\n";
        }
    } else {
        echo "\n🎮 No hay tablas MemoFlip creadas aún\n";
    }

    echo "\n✅ Diagnóstico completado\n";
    
} catch (PDOException $e) {
    echo "❌ ERROR: " . $e->getMessage() . "\n";
}
?>
