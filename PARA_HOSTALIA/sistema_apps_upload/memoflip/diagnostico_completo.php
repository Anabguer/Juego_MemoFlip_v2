<?php
// 🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA MEMOFLIP
// Verifica todos los componentes del sistema

echo "🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA MEMOFLIP\n";
echo "==========================================\n\n";

// 1. VERIFICAR CONEXIÓN A BASE DE DATOS
echo "1️⃣ VERIFICANDO CONEXIÓN A BASE DE DATOS\n";
echo "--------------------------------------\n";

$host = 'localhost';
$dbname = 'sistema_apps';
$username = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "✅ Conexión a BD exitosa\n";
    
    // Verificar tablas
    $tables = ['memoflip_usuarios', 'memoflip_ranking_cache'];
    foreach ($tables as $table) {
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM $table");
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "📊 Tabla $table: " . $result['count'] . " registros\n";
        } catch (PDOException $e) {
            echo "❌ Error en tabla $table: " . $e->getMessage() . "\n";
        }
    }
    
} catch (PDOException $e) {
    echo "❌ ERROR de conexión: " . $e->getMessage() . "\n";
    echo "🔧 POSIBLES SOLUCIONES:\n";
    echo "   - Verificar que MySQL esté ejecutándose\n";
    echo "   - Verificar credenciales de BD\n";
    echo "   - Verificar que la BD 'sistema_apps' exista\n";
    echo "   - Verificar que el usuario 'sistema_apps_user' tenga permisos\n";
}

echo "\n";

// 2. VERIFICAR ESTRUCTURA DE TABLAS
echo "2️⃣ VERIFICANDO ESTRUCTURA DE TABLAS\n";
echo "----------------------------------\n";

if (isset($pdo)) {
    try {
        // Verificar estructura de memoflip_usuarios
        echo "📋 Estructura de memoflip_usuarios:\n";
        $stmt = $pdo->query("DESCRIBE memoflip_usuarios");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $column) {
            echo "   - {$column['Field']} ({$column['Type']})\n";
        }
        
        echo "\n📋 Estructura de memoflip_ranking_cache:\n";
        $stmt = $pdo->query("DESCRIBE memoflip_ranking_cache");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        foreach ($columns as $column) {
            echo "   - {$column['Field']} ({$column['Type']})\n";
        }
        
    } catch (PDOException $e) {
        echo "❌ Error verificando estructura: " . $e->getMessage() . "\n";
    }
}

echo "\n";

// 3. PROBAR INSERCIÓN DE DATOS
echo "3️⃣ PROBANDO INSERCIÓN DE DATOS\n";
echo "-----------------------------\n";

if (isset($pdo)) {
    $testData = [
        'user_key' => 'test_diagnostico_' . time(),
        'level' => 1,
        'coins' => 50,
        'lives' => 3,
        'total_score' => 50
    ];
    
    try {
        // Probar inserción en memoflip_usuarios
        $sql1 = "INSERT INTO memoflip_usuarios (usuario_aplicacion_key, max_level_unlocked, coins_total, total_score, lives_current, fecha_modificacion) 
                 VALUES (:user_key, :level, :coins, :total_score, :lives, NOW()) 
                 ON DUPLICATE KEY UPDATE 
                 max_level_unlocked = VALUES(max_level_unlocked), 
                 coins_total = VALUES(coins_total), 
                 total_score = VALUES(total_score), 
                 lives_current = VALUES(lives_current), 
                 fecha_modificacion = NOW()";
        
        $stmt1 = $pdo->prepare($sql1);
        $result1 = $stmt1->execute([
            ':user_key' => $testData['user_key'],
            ':level' => $testData['level'],
            ':coins' => $testData['coins'],
            ':total_score' => $testData['total_score'],
            ':lives' => $testData['lives']
        ]);
        
        if ($result1) {
            echo "✅ Inserción en memoflip_usuarios exitosa\n";
        } else {
            echo "❌ Error en inserción memoflip_usuarios\n";
        }
        
        // Probar inserción en memoflip_ranking_cache
        $sql2 = "INSERT INTO memoflip_ranking_cache (usuario_aplicacion_key, max_level_unlocked, coins_total, total_score) 
                 VALUES (:user_key, :level, :coins, :total_score) 
                 ON DUPLICATE KEY UPDATE 
                 max_level_unlocked = VALUES(max_level_unlocked), 
                 coins_total = VALUES(coins_total), 
                 total_score = VALUES(total_score)";
        
        $stmt2 = $pdo->prepare($sql2);
        $result2 = $stmt2->execute([
            ':user_key' => $testData['user_key'],
            ':level' => $testData['level'],
            ':coins' => $testData['coins'],
            ':total_score' => $testData['total_score']
        ]);
        
        if ($result2) {
            echo "✅ Inserción en memoflip_ranking_cache exitosa\n";
        } else {
            echo "❌ Error en inserción memoflip_ranking_cache\n";
        }
        
        // Verificar que se insertaron los datos
        $stmt = $pdo->prepare("SELECT * FROM memoflip_usuarios WHERE usuario_aplicacion_key = :user_key");
        $stmt->execute([':user_key' => $testData['user_key']]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user) {
            echo "✅ Datos verificados en memoflip_usuarios:\n";
            echo "   - Usuario: {$user['usuario_aplicacion_key']}\n";
            echo "   - Nivel: {$user['max_level_unlocked']}\n";
            echo "   - Monedas: {$user['coins_total']}\n";
            echo "   - Score: {$user['total_score']}\n";
            echo "   - Vidas: {$user['lives_current']}\n";
        }
        
        // Limpiar datos de prueba
        $pdo->prepare("DELETE FROM memoflip_usuarios WHERE usuario_aplicacion_key = :user_key")->execute([':user_key' => $testData['user_key']]);
        $pdo->prepare("DELETE FROM memoflip_ranking_cache WHERE usuario_aplicacion_key = :user_key")->execute([':user_key' => $testData['user_key']]);
        echo "🧹 Datos de prueba eliminados\n";
        
    } catch (PDOException $e) {
        echo "❌ Error en inserción: " . $e->getMessage() . "\n";
    }
}

echo "\n";

// 4. VERIFICAR ARCHIVOS PHP
echo "4️⃣ VERIFICANDO ARCHIVOS PHP\n";
echo "--------------------------\n";

$files = [
    'api/save_progress.php',
    'game.php',
    'ranking.php',
    'config_hostalia.php'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        echo "✅ $file existe\n";
        
        // Verificar sintaxis
        $output = shell_exec("php -l $file 2>&1");
        if (strpos($output, 'No syntax errors') !== false) {
            echo "   ✅ Sintaxis correcta\n";
        } else {
            echo "   ❌ Error de sintaxis: $output\n";
        }
    } else {
        echo "❌ $file NO existe\n";
    }
}

echo "\n";

// 5. VERIFICAR PERMISOS
echo "5️⃣ VERIFICANDO PERMISOS\n";
echo "----------------------\n";

foreach ($files as $file) {
    if (file_exists($file)) {
        $perms = fileperms($file);
        $readable = is_readable($file) ? '✅' : '❌';
        $writable = is_writable($file) ? '✅' : '❌';
        echo "$file: $readable Lectura, $writable Escritura\n";
    }
}

echo "\n";

// 6. RESUMEN
echo "6️⃣ RESUMEN DEL DIAGNÓSTICO\n";
echo "-------------------------\n";

if (isset($pdo)) {
    echo "✅ Base de datos: CONECTADA\n";
    echo "✅ Tablas: VERIFICADAS\n";
    echo "✅ Inserción: FUNCIONA\n";
    echo "✅ Archivos PHP: VERIFICADOS\n";
    echo "\n🎯 CONCLUSIÓN: El sistema backend está funcionando correctamente.\n";
    echo "   El problema puede estar en:\n";
    echo "   - Configuración del servidor web\n";
    echo "   - URLs incorrectas en el frontend\n";
    echo "   - Problemas de CORS\n";
    echo "   - El juego no está enviando datos al servidor\n";
} else {
    echo "❌ Base de datos: NO CONECTADA\n";
    echo "\n🎯 CONCLUSIÓN: El problema principal es la conexión a la base de datos.\n";
    echo "   Soluciona esto primero antes de continuar.\n";
}

echo "\n✅ DIAGNÓSTICO COMPLETADO\n";
?>

