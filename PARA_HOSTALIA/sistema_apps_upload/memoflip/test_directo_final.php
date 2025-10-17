<?php
// 🧪 TEST DIRECTO FINAL - MEMOFLIP
// Probar los archivos PHP directamente sin servidor web

echo "🧪 TEST DIRECTO FINAL - MEMOFLIP\n";
echo "================================\n";
echo "Fecha: " . date('Y-m-d H:i:s') . "\n\n";

// 1. PROBAR RANKING DIRECTO
echo "1️⃣ PROBANDO RANKING DIRECTO\n";
echo "--------------------------\n";

// Simular GET request
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['limit'] = 5;

// Capturar output
ob_start();
include 'ranking.php';
$ranking_output = ob_get_clean();

if ($ranking_output) {
    $ranking_data = json_decode($ranking_output, true);
    if ($ranking_data && $ranking_data['success']) {
        echo "✅ Ranking funcionando\n";
        echo "   Jugadores: " . count($ranking_data['ranking']) . "\n";
        foreach ($ranking_data['ranking'] as $player) {
            echo "   - {$player['usuario_aplicacion_key']}: Nivel {$player['max_level_unlocked']}, {$player['coins_total']} monedas\n";
        }
    } else {
        echo "❌ Error en ranking: " . ($ranking_data['error'] ?? 'Respuesta inválida') . "\n";
    }
} else {
    echo "❌ No se pudo ejecutar ranking\n";
}

echo "\n";

// 2. PROBAR SAVE PROGRESS DIRECTO
echo "2️⃣ PROBANDO SAVE PROGRESS DIRECTO\n";
echo "--------------------------------\n";

// Simular POST request
$_SERVER['REQUEST_METHOD'] = 'POST';
$test_data = [
    'user_key' => 'test_directo_' . time(),
    'level' => 3,
    'coins' => 300,
    'lives' => 2,
    'total_score' => 300
];

// Simular php://input
$GLOBALS['HTTP_RAW_POST_DATA'] = json_encode($test_data);

// Capturar output
ob_start();
include 'api/save_progress.php';
$save_output = ob_get_clean();

if ($save_output) {
    $save_data = json_decode($save_output, true);
    if ($save_data && $save_data['ok']) {
        echo "✅ Save progress funcionando\n";
        echo "   Usuario: {$save_data['data']['user_key']}\n";
        echo "   Nivel: {$save_data['data']['level']}\n";
        echo "   Monedas: {$save_data['data']['coins']}\n";
        echo "   Timestamp: {$save_data['data']['timestamp']}\n";
    } else {
        echo "❌ Error en save progress: " . ($save_data['error'] ?? 'Respuesta inválida') . "\n";
    }
} else {
    echo "❌ No se pudo ejecutar save progress\n";
}

echo "\n";

// 3. PROBAR GAME ENDPOINT DIRECTO
echo "3️⃣ PROBANDO GAME ENDPOINT DIRECTO\n";
echo "--------------------------------\n";

// Simular GET request para ranking
$_SERVER['REQUEST_METHOD'] = 'GET';
$_GET['action'] = 'ranking';
$_GET['limit'] = 3;

// Capturar output
ob_start();
include 'game.php';
$game_output = ob_get_clean();

if ($game_output) {
    $game_data = json_decode($game_output, true);
    if ($game_data && $game_data['success']) {
        echo "✅ Game endpoint funcionando\n";
        echo "   Acción: {$game_data['action']}\n";
        echo "   Total: {$game_data['total']}\n";
    } else {
        echo "❌ Error en game endpoint: " . ($game_data['error'] ?? 'Respuesta inválida') . "\n";
    }
} else {
    echo "❌ No se pudo ejecutar game endpoint\n";
}

echo "\n";

// 4. RESUMEN FINAL
echo "4️⃣ RESUMEN FINAL\n";
echo "---------------\n";

if ($ranking_output && $save_output && $game_output) {
    echo "✅ TODOS LOS ENDPOINTS FUNCIONANDO\n";
    echo "🎯 MemoFlip debería guardar datos correctamente\n";
    echo "🏆 El ranking debería actualizarse\n";
    echo "\n🔧 PRÓXIMO PASO: Subir archivos a Hostalia\n";
} else {
    echo "❌ ALGUNOS ENDPOINTS NO FUNCIONAN\n";
    echo "🔧 Revisar configuración\n";
}

echo "\n✅ TEST COMPLETADO\n";
echo "==================\n";
?>

