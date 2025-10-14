<?php
/**
 * Script para ELIMINAR tablas vacías de MemoFlip que no se usan
 * 
 * Tablas a eliminar:
 * - memoflip_game_sessions (vacía)
 * - memoflip_level_records (vacía)
 * - memoflip_ranking (vacía)
 * 
 * Ejecutar UNA SOLA VEZ desde:
 * https://colisan.com/sistema_apps_upload/memoflip/limpiar_tablas_vacias.php
 */

header('Content-Type: text/html; charset=utf-8');

// Configuración de base de datos
$host = 'PMYSQL165.dns-servicio.com';
$dbname = '9606966_sistema_apps_db';
$username = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>🗑️ Limpieza de Tablas Vacías - MemoFlip</h1>";
    echo "<hr>";
    
    // Tablas a eliminar (las 3 que están vacías y no se usan)
    $tablasAEliminar = [
        'memoflip_game_sessions',
        'memoflip_level_records',
        'memoflip_ranking'
    ];
    
    echo "<h2>📋 Tablas a eliminar:</h2>";
    echo "<ul>";
    foreach ($tablasAEliminar as $tabla) {
        echo "<li><code>{$tabla}</code></li>";
    }
    echo "</ul>";
    echo "<hr>";
    
    // Verificar que estén vacías antes de eliminar
    echo "<h2>🔍 Verificando que estén vacías...</h2>";
    
    foreach ($tablasAEliminar as $tabla) {
        // Verificar si la tabla existe
        $stmtExists = $pdo->query("SHOW TABLES LIKE '{$tabla}'");
        
        if ($stmtExists->rowCount() === 0) {
            echo "<p style='color: orange;'>⚠️ <strong>{$tabla}</strong>: No existe (ya fue eliminada)</p>";
            continue;
        }
        
        // Contar registros
        $stmtCount = $pdo->query("SELECT COUNT(*) as count FROM `{$tabla}`");
        $count = $stmtCount->fetchColumn();
        
        if ($count > 0) {
            echo "<p style='color: red;'>❌ <strong>{$tabla}</strong>: Tiene {$count} registros - NO SE ELIMINARÁ (por seguridad)</p>";
        } else {
            echo "<p style='color: green;'>✅ <strong>{$tabla}</strong>: Vacía (0 registros) - Lista para eliminar</p>";
        }
    }
    
    echo "<hr>";
    echo "<h2>🗑️ Eliminando tablas vacías...</h2>";
    
    $eliminadas = 0;
    $errores = 0;
    
    foreach ($tablasAEliminar as $tabla) {
        try {
            // Verificar de nuevo que existe
            $stmtExists = $pdo->query("SHOW TABLES LIKE '{$tabla}'");
            
            if ($stmtExists->rowCount() === 0) {
                continue; // Ya no existe
            }
            
            // Verificar de nuevo que está vacía
            $stmtCount = $pdo->query("SELECT COUNT(*) as count FROM `{$tabla}`");
            $count = $stmtCount->fetchColumn();
            
            if ($count > 0) {
                echo "<p style='color: red;'>❌ <strong>{$tabla}</strong>: OMITIDA (tiene datos)</p>";
                $errores++;
                continue;
            }
            
            // Eliminar la tabla
            $pdo->exec("DROP TABLE `{$tabla}`");
            echo "<p style='color: green;'>✅ <strong>{$tabla}</strong>: ELIMINADA correctamente</p>";
            $eliminadas++;
            
        } catch (PDOException $e) {
            echo "<p style='color: red;'>❌ Error eliminando <strong>{$tabla}</strong>: " . $e->getMessage() . "</p>";
            $errores++;
        }
    }
    
    echo "<hr>";
    echo "<h2>📊 RESUMEN</h2>";
    echo "<p><strong>Tablas eliminadas:</strong> {$eliminadas}</p>";
    echo "<p><strong>Errores:</strong> {$errores}</p>";
    
    if ($eliminadas > 0) {
        echo "<p style='color: green; font-size: 18px;'>✅ <strong>¡Limpieza completada!</strong></p>";
        echo "<p>Las tablas vacías han sido eliminadas. Ahora solo quedan las 3 tablas que se usan:</p>";
        echo "<ul>";
        echo "<li><code>memoflip_config</code> - Configuración del juego</li>";
        echo "<li><code>memoflip_usuarios</code> - Progreso de usuarios</li>";
        echo "<li><code>memoflip_ranking_cache</code> - Ranking global</li>";
        echo "</ul>";
    }
    
    echo "<hr>";
    echo "<p style='color: orange;'>⚠️ <strong>IMPORTANTE:</strong> Elimina este archivo después de usarlo por seguridad.</p>";
    
} catch (PDOException $e) {
    echo "<p style='color: red;'>❌ <strong>Error de conexión a la base de datos:</strong> " . $e->getMessage() . "</p>";
}
?>

