<?php
/**
 * Script para diagnosticar TODAS las tablas de MemoFlip
 * Ver cuáles existen, cuáles tienen datos, y cuál se debería usar
 */

header('Content-Type: text/html; charset=utf-8');

// Configuración de base de datos
$host = 'PMYSQL165.dns-servicio.com';
$dbname = '9606966_sistema_apps_db';
$username = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>🔍 DIAGNÓSTICO DE TABLAS MEMOFLIP</h1>";
    echo "<hr>";
    
    // Buscar TODAS las tablas que contienen 'memoflip'
    $stmt = $conn->query("SHOW TABLES LIKE '%memoflip%'");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<h2>📋 Tablas encontradas: " . count($tables) . "</h2>";
    echo "<ol>";
    foreach ($tables as $table) {
        echo "<li><strong>{$table}</strong></li>";
    }
    echo "</ol>";
    echo "<hr>";
    
    // Analizar cada tabla
    foreach ($tables as $table) {
        echo "<h2>🗄️ Tabla: <code>{$table}</code></h2>";
        
        // Obtener estructura
        $stmt = $conn->query("DESCRIBE {$table}");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<h3>Estructura (" . count($columns) . " columnas):</h3>";
        echo "<table border='1' cellpadding='5' style='border-collapse: collapse; font-size: 12px;'>";
        echo "<tr><th>Campo</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th></tr>";
        foreach ($columns as $col) {
            echo "<tr>";
            echo "<td><strong>{$col['Field']}</strong></td>";
            echo "<td>{$col['Type']}</td>";
            echo "<td>{$col['Null']}</td>";
            echo "<td>{$col['Key']}</td>";
            echo "<td>" . ($col['Default'] ?? 'NULL') . "</td>";
            echo "</tr>";
        }
        echo "</table>";
        
        // Contar registros
        $stmt = $conn->query("SELECT COUNT(*) as total FROM {$table}");
        $count = $stmt->fetch()['total'];
        
        echo "<h3>📊 Total de registros: <strong>{$count}</strong></h3>";
        
        if ($count > 0) {
            echo "<h3>Primeros 5 registros:</h3>";
            $stmt = $conn->query("SELECT * FROM {$table} LIMIT 5");
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if (count($rows) > 0) {
                echo "<div style='overflow-x: auto;'>";
                echo "<table border='1' cellpadding='5' style='border-collapse: collapse; font-size: 11px;'>";
                
                // Headers
                echo "<tr>";
                foreach (array_keys($rows[0]) as $key) {
                    echo "<th>{$key}</th>";
                }
                echo "</tr>";
                
                // Datos
                foreach ($rows as $row) {
                    echo "<tr>";
                    foreach ($row as $value) {
                        $display = is_null($value) ? '<em>NULL</em>' : htmlspecialchars(substr($value, 0, 50));
                        echo "<td>{$display}</td>";
                    }
                    echo "</tr>";
                }
                
                echo "</table>";
                echo "</div>";
            }
        } else {
            echo "<p style='color: red;'>⚠️ <strong>TABLA VACÍA</strong> - No tiene datos</p>";
        }
        
        echo "<hr style='margin: 30px 0;'>";
    }
    
    // ANÁLISIS FINAL
    echo "<h2>📊 ANÁLISIS Y RECOMENDACIONES</h2>";
    echo "<div style='background: #f0f0f0; padding: 20px; border-radius: 10px;'>";
    
    foreach ($tables as $table) {
        $stmt = $conn->query("SELECT COUNT(*) as total FROM {$table}");
        $count = $stmt->fetch()['total'];
        
        $color = $count > 0 ? 'green' : 'red';
        $status = $count > 0 ? "✅ EN USO ({$count} registros)" : "❌ VACÍA (sin datos)";
        
        echo "<p style='color: {$color};'><strong>{$table}:</strong> {$status}</p>";
    }
    
    echo "</div>";
    
    echo "<hr>";
    echo "<h2>💡 CONCLUSIÓN</h2>";
    echo "<p><strong>Las tablas con datos son las que se están usando.</strong></p>";
    echo "<p><strong>Las tablas vacías probablemente son duplicados o están mal configuradas.</strong></p>";
    
} catch(PDOException $e) {
    echo "<p style='color: red;'>❌ <strong>Error de conexión:</strong> " . $e->getMessage() . "</p>";
}
?>

