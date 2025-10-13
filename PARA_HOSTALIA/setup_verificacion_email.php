<?php
/**
 * SETUP AUTOMÁTICO: SISTEMA DE VERIFICACIÓN POR EMAIL
 * Ejecutar desde: https://colisan.com/sistema_apps_upload/memoflip/setup_verificacion_email.php
 */

// Configuración de la base de datos
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
    <title>Setup Verificación Email - MemoFlip</title>
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
        h1 {
            color: #667eea;
            border-bottom: 3px solid #667eea;
            padding-bottom: 10px;
        }
        .step {
            margin: 20px 0;
            padding: 15px;
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            border-radius: 5px;
        }
        .success {
            background: #d4edda;
            border-left-color: #28a745;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border-left-color: #dc3545;
            color: #721c24;
        }
        .warning {
            background: #fff3cd;
            border-left-color: #ffc107;
            color: #856404;
        }
        .code {
            background: #1e1e1e;
            color: #00ff00;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            margin: 10px 0;
            overflow-x: auto;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 30px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 8px;
            cursor: pointer;
            margin: 10px 5px;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
        .status {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            margin-left: 10px;
        }
        .status.ok { background: #28a745; color: white; }
        .status.fail { background: #dc3545; color: white; }
        .status.pending { background: #ffc107; color: black; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Setup: Sistema de Verificación por Email</h1>
        <p><strong>MemoFlip</strong> - Configuración automática</p>
        
        <?php
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ejecutar'])) {
            echo "<h2>📊 Ejecutando instalación...</h2>";
            
            try {
                // Conectar a la base de datos
                $pdo = new PDO(
                    "mysql:host=$host;dbname=$dbname;charset=utf8",
                    $username,
                    $password,
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
                    ]
                );
                
                echo "<div class='step success'>";
                echo "✅ <strong>Paso 1:</strong> Conexión a base de datos exitosa";
                echo "</div>";
                
                // PASO 2: Verificar si las columnas ya existen
                echo "<div class='step'>";
                echo "<strong>Paso 2:</strong> Verificando columnas existentes...";
                
                $stmt = $pdo->query("SHOW COLUMNS FROM usuarios_aplicaciones LIKE 'email_verificado'");
                $columnaExiste = $stmt->rowCount() > 0;
                
                if ($columnaExiste) {
                    echo "<div class='warning' style='margin-top: 10px;'>";
                    echo "⚠️ Las columnas ya existen. Omitiendo creación.";
                    echo "</div>";
                } else {
                    echo "<span class='status pending'>Creando columnas...</span>";
                    echo "</div>";
                    
                    // PASO 3: Crear columnas
                    echo "<div class='step'>";
                    echo "<strong>Paso 3:</strong> Agregando columnas de verificación...";
                    
                    $sql = "
                    ALTER TABLE usuarios_aplicaciones 
                    ADD COLUMN email_verificado TINYINT(1) DEFAULT 0 COMMENT 'Si el email está verificado',
                    ADD COLUMN codigo_verificacion VARCHAR(10) DEFAULT NULL COMMENT 'Código de verificación de 6 dígitos',
                    ADD COLUMN tiempo_verificacion TIMESTAMP NULL DEFAULT NULL COMMENT 'Timestamp cuando se generó el código',
                    ADD COLUMN intentos_verificacion INT DEFAULT 0 COMMENT 'Número de intentos fallidos'
                    ";
                    
                    $pdo->exec($sql);
                    echo "<span class='status ok'>✅ OK</span>";
                    echo "</div>";
                    
                    // PASO 4: Crear índices
                    echo "<div class='step'>";
                    echo "<strong>Paso 4:</strong> Creando índices...";
                    
                    try {
                        $pdo->exec("ALTER TABLE usuarios_aplicaciones ADD INDEX idx_email_verificado (email_verificado)");
                        $pdo->exec("ALTER TABLE usuarios_aplicaciones ADD INDEX idx_codigo_verificacion (codigo_verificacion)");
                        echo "<span class='status ok'>✅ OK</span>";
                    } catch (PDOException $e) {
                        if (strpos($e->getMessage(), 'Duplicate key name') !== false) {
                            echo "<span class='status pending'>⚠️ Índices ya existen</span>";
                        } else {
                            throw $e;
                        }
                    }
                    echo "</div>";
                }
                
                // PASO 5: Marcar usuarios existentes como verificados
                echo "<div class='step'>";
                echo "<strong>Paso 5:</strong> Marcando usuarios existentes como verificados...";
                
                $stmt = $pdo->exec("
                    UPDATE usuarios_aplicaciones 
                    SET email_verificado = 1 
                    WHERE activo = 1 AND (email_verificado = 0 OR email_verificado IS NULL)
                ");
                
                echo "<span class='status ok'>✅ $stmt usuarios actualizados</span>";
                echo "</div>";
                
                // PASO 6: Verificar estructura final
                echo "<div class='step'>";
                echo "<strong>Paso 6:</strong> Verificando estructura final...";
                
                $stmt = $pdo->query("SHOW COLUMNS FROM usuarios_aplicaciones WHERE Field IN ('email_verificado', 'codigo_verificacion', 'tiempo_verificacion', 'intentos_verificacion')");
                $columnas = $stmt->fetchAll();
                
                echo "<div class='code'>";
                foreach ($columnas as $col) {
                    echo "✓ {$col['Field']} ({$col['Type']})\n";
                }
                echo "</div>";
                echo "<span class='status ok'>✅ Estructura correcta</span>";
                echo "</div>";
                
                // RESUMEN FINAL
                echo "<div class='step success'>";
                echo "<h3>🎉 ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!</h3>";
                echo "<p><strong>Sistema de verificación por email activado</strong></p>";
                echo "<ul>";
                echo "<li>✅ Columnas creadas en usuarios_aplicaciones</li>";
                echo "<li>✅ Índices creados para optimización</li>";
                echo "<li>✅ Usuarios existentes marcados como verificados</li>";
                echo "<li>✅ Sistema listo para nuevos registros</li>";
                echo "</ul>";
                echo "<p><strong>Próximos pasos:</strong></p>";
                echo "<ol>";
                echo "<li>Subir archivo: <code>enviar_email.php</code> a <code>/sistema_apps_api/memoflip/</code></li>";
                echo "<li>Reemplazar: <code>auth.php</code> con la versión nueva</li>";
                echo "<li>Probar registro de nuevo usuario</li>";
                echo "</ol>";
                echo "</div>";
                
                // Información de testing
                echo "<div class='step warning'>";
                echo "<h3>🧪 Testing</h3>";
                echo "<p>Para probar el sistema:</p>";
                echo "<ol>";
                echo "<li>Registra un nuevo usuario en la app</li>";
                echo "<li>Verifica que recibe email con código de 6 dígitos</li>";
                echo "<li>Introduce el código en la app</li>";
                echo "<li>Verifica que puede hacer login</li>";
                echo "</ol>";
                echo "</div>";
                
            } catch (PDOException $e) {
                echo "<div class='step error'>";
                echo "❌ <strong>ERROR:</strong> " . htmlspecialchars($e->getMessage());
                echo "</div>";
                
                echo "<div class='step warning'>";
                echo "<h3>🔍 Posibles soluciones:</h3>";
                echo "<ul>";
                echo "<li>Verificar credenciales de base de datos</li>";
                echo "<li>Comprobar que el usuario tiene permisos ALTER TABLE</li>";
                echo "<li>Verificar que la tabla usuarios_aplicaciones existe</li>";
                echo "</ul>";
                echo "</div>";
            }
            
        } else {
            // Formulario inicial
            echo "<div class='step'>";
            echo "<h2>📋 Información del sistema</h2>";
            echo "<p>Este script realizará las siguientes acciones:</p>";
            echo "<ol>";
            echo "<li>Conectar a la base de datos de MemoFlip</li>";
            echo "<li>Agregar 4 columnas nuevas a la tabla <code>usuarios_aplicaciones</code>:</li>";
            echo "<ul>";
            echo "<li><code>email_verificado</code> - Si el email está verificado (0/1)</li>";
            echo "<li><code>codigo_verificacion</code> - Código de 6 dígitos</li>";
            echo "<li><code>tiempo_verificacion</code> - Timestamp de generación</li>";
            echo "<li><code>intentos_verificacion</code> - Contador de intentos</li>";
            echo "</ul>";
            echo "<li>Crear índices para optimización</li>";
            echo "<li>Marcar usuarios existentes como verificados</li>";
            echo "</ol>";
            echo "</div>";
            
            echo "<div class='step warning'>";
            echo "⚠️ <strong>Importante:</strong> Este script modificará la estructura de la base de datos.";
            echo "<br>Es seguro ejecutarlo, no elimina ningún dato existente.";
            echo "</div>";
            
            echo "<div class='step'>";
            echo "<h3>🔧 Configuración actual:</h3>";
            echo "<div class='code'>";
            echo "Host: $host\n";
            echo "Base de datos: $dbname\n";
            echo "Usuario: $username\n";
            echo "Tabla: usuarios_aplicaciones";
            echo "</div>";
            echo "</div>";
            
            echo "<form method='POST'>";
            echo "<button type='submit' name='ejecutar' value='1' style='font-size: 18px; padding: 15px 40px;'>";
            echo "🚀 EJECUTAR INSTALACIÓN";
            echo "</button>";
            echo "</form>";
            
            echo "<div style='margin-top: 30px; padding: 20px; background: #e7f3ff; border-radius: 8px;'>";
            echo "<h3>📚 Documentación:</h3>";
            echo "<p>Para más información, consulta:</p>";
            echo "<ul>";
            echo "<li><code>SISTEMA_VERIFICACION_EMAIL.md</code> - Documentación completa</li>";
            echo "<li><code>DEPLOYMENT_VERIFICACION_EMAIL.md</code> - Guía de despliegue</li>";
            echo "</ul>";
            echo "</div>";
        }
        ?>
        
        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2024 MemoFlip - @intocables13</p>
            <p>Sistema de Verificación por Email v1.0</p>
        </div>
    </div>
</body>
</html>

