<?php
/**
 * Script para verificar manualmente usuarios que fueron creados ANTES del sistema de verificación
 * Ejecutar UNA SOLA VEZ desde: https://colisan.com/sistema_apps_upload/memoflip/verificar_usuario_manual.php
 */

header('Content-Type: text/html; charset=utf-8');

// Configuración de base de datos
$host = 'localhost';
$dbname = 'colisan_webempresa';
$username = 'colisan_webempresa';
$password = 'Anabguer13';

try {
    $conn = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    echo "<h1>🔧 Verificar Usuarios Antiguos - MemoFlip</h1>";
    echo "<hr>";
    
    // Buscar usuarios de MemoFlip sin verificar (verified_at IS NULL)
    $stmt = $conn->prepare("
        SELECT 
            usuario_aplicacion_id,
            email,
            nombre,
            fecha_registro,
            verified_at,
            activo
        FROM usuarios_aplicaciones
        WHERE app_codigo = 'memoflip'
        AND verified_at IS NULL
        ORDER BY fecha_registro ASC
    ");
    $stmt->execute();
    $usuarios = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($usuarios) === 0) {
        echo "<p style='color: green;'>✅ Todos los usuarios de MemoFlip ya están verificados.</p>";
        exit;
    }
    
    echo "<h2>📋 Usuarios sin verificar encontrados: " . count($usuarios) . "</h2>";
    echo "<table border='1' cellpadding='10' style='border-collapse: collapse;'>";
    echo "<tr>
            <th>ID</th>
            <th>Email</th>
            <th>Nombre</th>
            <th>Registro</th>
            <th>Activo</th>
            <th>Acción</th>
          </tr>";
    
    foreach ($usuarios as $user) {
        $color = $user['activo'] ? 'green' : 'red';
        echo "<tr>";
        echo "<td>{$user['usuario_aplicacion_id']}</td>";
        echo "<td><strong>{$user['email']}</strong></td>";
        echo "<td>{$user['nombre']}</td>";
        echo "<td>{$user['fecha_registro']}</td>";
        echo "<td style='color: {$color};'>" . ($user['activo'] ? '✅ Sí' : '❌ No') . "</td>";
        echo "<td>⏳ Pendiente</td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<hr>";
    echo "<h2>🚀 Verificando usuarios...</h2>";
    
    // Actualizar todos los usuarios sin verificar
    $updateStmt = $conn->prepare("
        UPDATE usuarios_aplicaciones
        SET 
            verified_at = NOW(),
            activo = 1,
            verification_code = NULL,
            verification_expiry = NULL
        WHERE app_codigo = 'memoflip'
        AND verified_at IS NULL
    ");
    
    $result = $updateStmt->execute();
    $rowsAffected = $updateStmt->rowCount();
    
    if ($result) {
        echo "<p style='color: green; font-size: 18px;'>";
        echo "✅ <strong>¡ÉXITO!</strong> Se verificaron <strong>{$rowsAffected}</strong> usuarios correctamente.";
        echo "</p>";
        
        echo "<h3>📧 Usuarios verificados:</h3>";
        echo "<ul>";
        foreach ($usuarios as $user) {
            echo "<li><strong>{$user['email']}</strong> ({$user['nombre']})</li>";
        }
        echo "</ul>";
        
        echo "<hr>";
        echo "<p style='color: blue;'>🎮 <strong>Ahora puedes iniciar sesión en la app MemoFlip sin problemas.</strong></p>";
        echo "<p style='color: orange;'>⚠️ <strong>IMPORTANTE:</strong> Elimina este archivo después de usarlo por seguridad.</p>";
    } else {
        echo "<p style='color: red;'>❌ Error al verificar usuarios.</p>";
    }
    
} catch(PDOException $e) {
    echo "<p style='color: red;'>❌ <strong>Error de conexión:</strong> " . $e->getMessage() . "</p>";
}
?>

