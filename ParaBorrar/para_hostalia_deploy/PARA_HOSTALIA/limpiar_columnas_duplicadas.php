<?php
/**
 * LIMPIAR COLUMNAS DUPLICADAS DE VERIFICACIÓN
 * Elimina: email_verificado, codigo_verificacion, tiempo_verificacion, intentos_verificacion
 * Mantiene: verification_code, verification_expiry, verified_at
 */

$host = 'PMYSQL165.dns-servicio.com';
$dbname = '9606966_sistema_apps_db';
$username = 'sistema_apps_user';
$password = 'GestionUploadSistemaApps!';

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Limpiar Columnas Duplicadas</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            padding: 30px;
        }
        h1 { color: #667eea; border-bottom: 3px solid #667eea; padding-bottom: 10px; }
        .step { margin: 20px 0; padding: 15px; background: #f8f9fa; border-left: 4px solid #667eea; border-radius: 5px; }
        .success { background: #d4edda; border-left-color: #28a745; color: #155724; }
        .error { background: #f8d7da; border-left-color: #dc3545; color: #721c24; }
        .warning { background: #fff3cd; border-left-color: #ffc107; color: #856404; }
        button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 12px 30px; font-size: 16px; font-weight: bold; border-radius: 8px; cursor: pointer; margin: 10px 5px; }
        button:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4); }
        .danger-btn { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); }
        .code { background: #1e1e1e; color: #00ff00; padding: 15px; border-radius: 5px; font-family: 'Courier New', monospace; margin: 10px 0; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧹 Limpiar Columnas Duplicadas</h1>
        
        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['limpiar'])) {
            echo "<h2>🗑️ Eliminando columnas duplicadas...</h2>";
            
            try {
                $pdo = new PDO(
                    "mysql:host=$host;dbname=$dbname;charset=utf8",
                    $username,
                    $password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]
                );
                
                echo "<div class='step success'>✅ Conexión exitosa</div>";
                
                // Eliminar columnas duplicadas
                $columnas_eliminar = [
                    'email_verificado',
                    'codigo_verificacion', 
                    'tiempo_verificacion',
                    'intentos_verificacion'
                ];
                
                foreach ($columnas_eliminar as $columna) {
                    echo "<div class='step'>";
                    echo "<strong>Eliminando:</strong> $columna...";
                    
                    try {
                        $pdo->exec("ALTER TABLE usuarios_aplicaciones DROP COLUMN $columna");
                        echo "<span style='color: green; font-weight: bold;'> ✅ Eliminada</span>";
                    } catch (PDOException $e) {
                        if (strpos($e->getMessage(), "Can't DROP") !== false) {
                            echo "<span style='color: orange;'> ⚠️ Ya no existe</span>";
                        } else {
                            throw $e;
                        }
                    }
                    
                    echo "</div>";
                }
                
                // Eliminar índices duplicados
                echo "<div class='step'>";
                echo "<strong>Eliminando índices duplicados...</strong>";
                
                try {
                    $pdo->exec("ALTER TABLE usuarios_aplicaciones DROP INDEX idx_email_verificado");
                    echo "<br>✅ idx_email_verificado eliminado";
                } catch (PDOException $e) {
                    echo "<br>⚠️ idx_email_verificado ya no existe";
                }
                
                try {
                    $pdo->exec("ALTER TABLE usuarios_aplicaciones DROP INDEX idx_codigo_verificacion");
                    echo "<br>✅ idx_codigo_verificacion eliminado";
                } catch (PDOException $e) {
                    echo "<br>⚠️ idx_codigo_verificacion ya no existe";
                }
                
                echo "</div>";
                
                // Verificar resultado final
                $stmt = $pdo->query("SHOW COLUMNS FROM usuarios_aplicaciones");
                $columnas = $stmt->fetchAll();
                
                echo "<div class='step success'>";
                echo "<h3>✅ LIMPIEZA COMPLETADA</h3>";
                echo "<p><strong>Columnas restantes:</strong> " . count($columnas) . "</p>";
                echo "<div class='code'>";
                foreach ($columnas as $col) {
                    echo "✓ {$col['Field']} ({$col['Type']})\n";
                }
                echo "</div>";
                echo "</div>";
                
                echo "<div class='step warning'>";
                echo "<h3>📝 Siguiente paso:</h3>";
                echo "<p>Ahora actualiza el código PHP para usar las columnas correctas:</p>";
                echo "<ul>";
                echo "<li><code>verification_code</code> (en lugar de codigo_verificacion)</li>";
                echo "<li><code>verification_expiry</code> (en lugar de tiempo_verificacion)</li>";
                echo "<li><code>verified_at</code> (en lugar de email_verificado)</li>";
                echo "</ul>";
                echo "</div>";
                
            } catch (PDOException $e) {
                echo "<div class='step error'>";
                echo "❌ <strong>ERROR:</strong> " . htmlspecialchars($e->getMessage());
                echo "</div>";
            }
            
        } else {
            // Formulario
            echo "<div class='step warning'>";
            echo "<h2>⚠️ ATENCIÓN</h2>";
            echo "<p>Se detectaron columnas duplicadas en la tabla <code>usuarios_aplicaciones</code>:</p>";
            echo "<ul>";
            echo "<li>Sistema ORIGINAL (líneas 12-13, 15):</li>";
            echo "<ul>";
            echo "<li><code>verification_code</code> (varchar 6)</li>";
            echo "<li><code>verification_expiry</code> (datetime)</li>";
            echo "<li><code>verified_at</code> (timestamp)</li>";
            echo "</ul>";
            echo "<li>Sistema DUPLICADO añadido (líneas 18-21):</li>";
            echo "<ul>";
            echo "<li><code>email_verificado</code> (tinyint 1)</li>";
            echo "<li><code>codigo_verificacion</code> (varchar 10)</li>";
            echo "<li><code>tiempo_verificacion</code> (timestamp)</li>";
            echo "<li><code>intentos_verificacion</code> (int 11)</li>";
            echo "</ul>";
            echo "</ul>";
            echo "</div>";
            
            echo "<div class='step'>";
            echo "<h3>🔧 Acción a realizar:</h3>";
            echo "<p>Este script eliminará las 4 columnas <strong>duplicadas</strong> (18-21) y mantendrá las <strong>originales</strong> (12-13, 15).</p>";
            echo "<p><strong>SQL que se ejecutará:</strong></p>";
            echo "<div class='code'>";
            echo "ALTER TABLE usuarios_aplicaciones\n";
            echo "DROP COLUMN email_verificado,\n";
            echo "DROP COLUMN codigo_verificacion,\n";
            echo "DROP COLUMN tiempo_verificacion,\n";
            echo "DROP COLUMN intentos_verificacion;\n\n";
            echo "-- También eliminar índices duplicados\n";
            echo "DROP INDEX idx_email_verificado;\n";
            echo "DROP INDEX idx_codigo_verificacion;";
            echo "</div>";
            echo "</div>";
            
            echo "<div class='step success'>";
            echo "<h3>✅ Seguridad:</h3>";
            echo "<ul>";
            echo "<li>✅ No se eliminarán datos de usuarios</li>";
            echo "<li>✅ No se modificarán las columnas originales</li>";
            echo "<li>✅ Solo se eliminan las 4 columnas añadidas por error</li>";
            echo "</ul>";
            echo "</div>";
            
            echo "<form method='POST'>";
            echo "<button type='submit' name='limpiar' value='1' class='danger-btn' style='font-size: 18px; padding: 15px 40px;'>";
            echo "🗑️ ELIMINAR COLUMNAS DUPLICADAS";
            echo "</button>";
            echo "</form>";
            
            echo "<p style='text-align: center; margin-top: 20px;'>";
            echo "<a href='verificar_tabla_usuarios.php' style='color: #667eea;'>← Volver a verificación</a>";
            echo "</p>";
        }
        ?>
        
        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2024 MemoFlip - Limpieza de Base de Datos</p>
        </div>
    </div>
</body>
</html>

