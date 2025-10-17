<?php
// Test para diagnosticar el error del ranking
header('Access-Control-Allow-Origin: *');
header('Content-Type: text/html; charset=utf-8');

echo "<h1>🔍 DIAGNÓSTICO DEL RANKING</h1>";

try {
    echo "<h2>1. Probando conexión a base de datos...</h2>";
    require_once 'config_hostalia.php';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "<p style='color: green;'>✅ Conexión a BD exitosa</p>";
    
    echo "<h2>2. Verificando tabla memoflip_usuarios...</h2>";
    $sql = "SELECT COUNT(*) as count FROM memoflip_usuarios";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    echo "<p style='color: green;'>✅ memoflip_usuarios: {$result['count']} registros</p>";
    
    echo "<h2>3. Verificando tabla usuarios_aplicaciones...</h2>";
    try {
        $sql = "SELECT COUNT(*) as count FROM usuarios_aplicaciones";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo "<p style='color: green;'>✅ usuarios_aplicaciones: {$result['count']} registros</p>";
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ usuarios_aplicaciones: " . $e->getMessage() . "</p>";
    }
    
    echo "<h2>4. Probando consulta del ranking SIN JOIN...</h2>";
    $sql = "SELECT 
                usuario_aplicacion_key, 
                SUBSTRING_INDEX(usuario_aplicacion_key, '@', 1) as nombre,
                max_level_unlocked, 
                coins_total, 
                total_score
            FROM 
                memoflip_usuarios 
            ORDER BY 
                total_score DESC 
            LIMIT 5";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "<p style='color: green;'>✅ Ranking sin JOIN funciona: " . count($ranking) . " registros</p>";
    
    echo "<h2>5. Probando consulta del ranking CON JOIN...</h2>";
    try {
        $sql = "SELECT 
                    mu.usuario_aplicacion_key, 
                    COALESCE(ua.nick, SUBSTRING_INDEX(mu.usuario_aplicacion_key, '@', 1)) as nombre,
                    mu.max_level_unlocked, 
                    mu.coins_total, 
                    mu.total_score
                FROM 
                    memoflip_usuarios mu
                LEFT JOIN usuarios_aplicaciones ua ON mu.usuario_aplicacion_key = ua.usuario_aplicacion_key
                ORDER BY 
                    mu.total_score DESC 
                LIMIT 5";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $ranking = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "<p style='color: green;'>✅ Ranking con JOIN funciona: " . count($ranking) . " registros</p>";
        
        echo "<h3>Datos del ranking:</h3>";
        echo "<pre>" . json_encode($ranking, JSON_PRETTY_PRINT) . "</pre>";
        
    } catch (Exception $e) {
        echo "<p style='color: red;'>❌ Ranking con JOIN falla: " . $e->getMessage() . "</p>";
    }
    
} catch (Exception $e) {
    echo "<h2>❌ ERROR GENERAL:</h2>";
    echo "<p style='color: red;'>" . $e->getMessage() . "</p>";
}
?>
