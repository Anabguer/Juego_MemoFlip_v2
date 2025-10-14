<?php
/**
 * VERIFICAR ESTRUCTURA DE usuarios_aplicaciones
 * Ver qué columnas existen y si hay duplicados
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
    <title>Verificar Tabla usuarios_aplicaciones</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
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
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #667eea;
            color: white;
            font-weight: bold;
        }
        tr:hover {
            background: #f5f5f5;
        }
        .section {
            margin: 30px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .error {
            background: #f8d7da;
            border-left: 4px solid #dc3545;
            color: #721c24;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .success {
            background: #d4edda;
            border-left: 4px solid #28a745;
            color: #155724;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            color: #856404;
            padding: 15px;
            margin: 10px 0;
            border-radius: 5px;
        }
        .code {
            background: #1e1e1e;
            color: #00ff00;
            padding: 15px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            overflow-x: auto;
            margin: 10px 0;
        }
        .duplicate {
            background: #ffc107 !important;
            color: #000;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Verificación de Tabla: usuarios_aplicaciones</h1>
        <p><strong>Base de datos:</strong> <?php echo htmlspecialchars($dbname); ?></p>
        
        <?php
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
            
            echo "<div class='success'>✅ Conexión exitosa a la base de datos</div>";
            
            // ========================================
            // 1. ESTRUCTURA DE LA TABLA
            // ========================================
            echo "<div class='section'>";
            echo "<h2>📋 1. Estructura de la tabla</h2>";
            
            $stmt = $pdo->query("SHOW COLUMNS FROM usuarios_aplicaciones");
            $columnas = $stmt->fetchAll();
            
            echo "<table>";
            echo "<thead><tr>";
            echo "<th>#</th><th>Nombre</th><th>Tipo</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th>";
            echo "</tr></thead>";
            echo "<tbody>";
            
            $numero = 1;
            foreach ($columnas as $col) {
                echo "<tr>";
                echo "<td>{$numero}</td>";
                echo "<td><strong>{$col['Field']}</strong></td>";
                echo "<td>{$col['Type']}</td>";
                echo "<td>{$col['Null']}</td>";
                echo "<td>{$col['Key']}</td>";
                echo "<td>" . ($col['Default'] ?? 'NULL') . "</td>";
                echo "<td>{$col['Extra']}</td>";
                echo "</tr>";
                $numero++;
            }
            
            echo "</tbody></table>";
            echo "<p><strong>Total de columnas:</strong> " . count($columnas) . "</p>";
            echo "</div>";
            
            // ========================================
            // 2. BUSCAR COLUMNAS DUPLICADAS
            // ========================================
            echo "<div class='section'>";
            echo "<h2>🔍 2. Búsqueda de columnas duplicadas</h2>";
            
            $nombres_columnas = array_column($columnas, 'Field');
            $duplicados = array_diff_assoc($nombres_columnas, array_unique($nombres_columnas));
            
            if (empty($duplicados)) {
                echo "<div class='success'>✅ No hay columnas duplicadas</div>";
            } else {
                echo "<div class='error'>❌ ¡COLUMNAS DUPLICADAS ENCONTRADAS!</div>";
                echo "<ul>";
                foreach ($duplicados as $columna) {
                    echo "<li><strong>{$columna}</strong></li>";
                }
                echo "</ul>";
            }
            echo "</div>";
            
            // ========================================
            // 3. COLUMNAS DE VERIFICACIÓN
            // ========================================
            echo "<div class='section'>";
            echo "<h2>📧 3. Columnas de verificación de email</h2>";
            
            $columnas_verificacion = [
                'email_verificado',
                'codigo_verificacion',
                'tiempo_verificacion',
                'intentos_verificacion'
            ];
            
            echo "<table>";
            echo "<thead><tr><th>Columna</th><th>¿Existe?</th><th>Tipo</th><th>Cuántas veces</th></tr></thead>";
            echo "<tbody>";
            
            foreach ($columnas_verificacion as $col_nombre) {
                $count = 0;
                $tipo = 'N/A';
                
                foreach ($columnas as $col) {
                    if ($col['Field'] === $col_nombre) {
                        $count++;
                        $tipo = $col['Type'];
                    }
                }
                
                $clase = '';
                if ($count > 1) {
                    $clase = 'duplicate';
                }
                
                echo "<tr class='$clase'>";
                echo "<td><strong>{$col_nombre}</strong></td>";
                
                if ($count === 0) {
                    echo "<td>❌ NO</td><td>-</td><td>0</td>";
                } else if ($count === 1) {
                    echo "<td>✅ SÍ</td><td>{$tipo}</td><td>1</td>";
                } else {
                    echo "<td>⚠️ DUPLICADA</td><td>{$tipo}</td><td><strong>{$count}</strong></td>";
                }
                
                echo "</tr>";
            }
            
            echo "</tbody></table>";
            echo "</div>";
            
            // ========================================
            // 4. ÍNDICES DE LA TABLA
            // ========================================
            echo "<div class='section'>";
            echo "<h2>🔑 4. Índices de la tabla</h2>";
            
            $stmt = $pdo->query("SHOW INDEX FROM usuarios_aplicaciones");
            $indices = $stmt->fetchAll();
            
            echo "<table>";
            echo "<thead><tr><th>Nombre índice</th><th>Columna</th><th>Único</th><th>Tipo</th></tr></thead>";
            echo "<tbody>";
            
            foreach ($indices as $idx) {
                echo "<tr>";
                echo "<td><strong>{$idx['Key_name']}</strong></td>";
                echo "<td>{$idx['Column_name']}</td>";
                echo "<td>" . ($idx['Non_unique'] ? 'No' : 'Sí') . "</td>";
                echo "<td>{$idx['Index_type']}</td>";
                echo "</tr>";
            }
            
            echo "</tbody></table>";
            echo "</div>";
            
            // ========================================
            // 5. DATOS DE EJEMPLO
            // ========================================
            echo "<div class='section'>";
            echo "<h2>📊 5. Datos de ejemplo (primeros 5 usuarios MemoFlip)</h2>";
            
            $stmt = $pdo->query("
                SELECT 
                    usuario_aplicacion_key,
                    email,
                    nombre,
                    activo,
                    email_verificado,
                    codigo_verificacion,
                    tiempo_verificacion,
                    intentos_verificacion
                FROM usuarios_aplicaciones 
                WHERE app_codigo = 'memoflip'
                LIMIT 5
            ");
            $usuarios = $stmt->fetchAll();
            
            if (empty($usuarios)) {
                echo "<div class='warning'>⚠️ No hay usuarios de MemoFlip aún</div>";
            } else {
                echo "<table>";
                echo "<thead><tr>";
                echo "<th>Email</th><th>Nombre</th><th>Activo</th><th>Verificado</th><th>Código</th><th>Tiempo</th><th>Intentos</th>";
                echo "</tr></thead>";
                echo "<tbody>";
                
                foreach ($usuarios as $user) {
                    echo "<tr>";
                    echo "<td>" . htmlspecialchars($user['email']) . "</td>";
                    echo "<td>" . htmlspecialchars($user['nombre']) . "</td>";
                    echo "<td>" . ($user['activo'] ? '✅' : '❌') . "</td>";
                    echo "<td>" . ($user['email_verificado'] ? '✅' : '❌') . "</td>";
                    echo "<td>" . ($user['codigo_verificacion'] ?? '-') . "</td>";
                    echo "<td>" . ($user['tiempo_verificacion'] ?? '-') . "</td>";
                    echo "<td>" . ($user['intentos_verificacion'] ?? 0) . "</td>";
                    echo "</tr>";
                }
                
                echo "</tbody></table>";
            }
            echo "</div>";
            
            // ========================================
            // RESUMEN
            // ========================================
            echo "<div class='section success'>";
            echo "<h2>📝 Resumen</h2>";
            echo "<ul>";
            echo "<li><strong>Total de columnas:</strong> " . count($columnas) . "</li>";
            echo "<li><strong>Columnas duplicadas:</strong> " . (empty($duplicados) ? '0 ✅' : count($duplicados) . ' ⚠️') . "</li>";
            
            $verificacion_completa = true;
            foreach ($columnas_verificacion as $col_nombre) {
                $existe = false;
                foreach ($columnas as $col) {
                    if ($col['Field'] === $col_nombre) {
                        $existe = true;
                        break;
                    }
                }
                if (!$existe) {
                    $verificacion_completa = false;
                    break;
                }
            }
            
            echo "<li><strong>Sistema de verificación:</strong> " . ($verificacion_completa ? '✅ Completo' : '❌ Incompleto') . "</li>";
            echo "</ul>";
            echo "</div>";
            
        } catch (PDOException $e) {
            echo "<div class='error'>";
            echo "❌ <strong>ERROR DE CONEXIÓN:</strong><br>";
            echo htmlspecialchars($e->getMessage());
            echo "</div>";
        }
        ?>
        
        <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
            <p>© 2024 MemoFlip - Diagnóstico de Base de Datos</p>
        </div>
    </div>
</body>
</html>

