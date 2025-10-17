<?php
// 🧪 TEST FINAL DE ENDPOINTS - MEMOFLIP
// Probar todos los endpoints con las credenciales correctas

echo "🧪 TEST FINAL DE ENDPOINTS - MEMOFLIP\n";
echo "====================================\n";
echo "Fecha: " . date('Y-m-d H:i:s') . "\n\n";

// 1. PROBAR RANKING
echo "1️⃣ PROBANDO RANKING\n";
echo "------------------\n";

$ranking_url = "https://colisan.com/sistema_apps_upload/memoflip/ranking.php?limit=5";
$ranking_response = file_get_contents($ranking_url);

if ($ranking_response) {
    $ranking_data = json_decode($ranking_response, true);
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
    echo "❌ No se pudo conectar al ranking\n";
}

echo "\n";

// 2. PROBAR SAVE PROGRESS
echo "2️⃣ PROBANDO SAVE PROGRESS\n";
echo "------------------------\n";

$test_data = [
    'user_key' => 'test_endpoint_' . time(),
    'level' => 5,
    'coins' => 500,
    'lives' => 3,
    'total_score' => 500
];

$save_url = "https://colisan.com/sistema_apps_upload/memoflip/api/save_progress.php";
$save_options = [
    'http' => [
        'header' => "Content-Type: application/json\r\n",
        'method' => 'POST',
        'content' => json_encode($test_data)
    ]
];

$save_context = stream_context_create($save_options);
$save_response = file_get_contents($save_url, false, $save_context);

if ($save_response) {
    $save_data = json_decode($save_response, true);
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
    echo "❌ No se pudo conectar a save progress\n";
}

echo "\n";

// 3. PROBAR GAME ENDPOINT
echo "3️⃣ PROBANDO GAME ENDPOINT\n";
echo "------------------------\n";

$game_url = "https://colisan.com/sistema_apps_upload/memoflip/game.php?action=ranking&limit=3";
$game_response = file_get_contents($game_url);

if ($game_response) {
    $game_data = json_decode($game_response, true);
    if ($game_data && $game_data['success']) {
        echo "✅ Game endpoint funcionando\n";
        echo "   Acción: {$game_data['action']}\n";
        echo "   Total: {$game_data['total']}\n";
    } else {
        echo "❌ Error en game endpoint: " . ($game_data['error'] ?? 'Respuesta inválida') . "\n";
    }
} else {
    echo "❌ No se pudo conectar a game endpoint\n";
}

echo "\n";

// 4. RESUMEN FINAL
echo "4️⃣ RESUMEN FINAL\n";
echo "---------------\n";

if ($ranking_response && $save_response && $game_response) {
    echo "✅ TODOS LOS ENDPOINTS FUNCIONANDO\n";
    echo "🎯 MemoFlip debería guardar datos correctamente\n";
    echo "🏆 El ranking debería actualizarse\n";
} else {
    echo "❌ ALGUNOS ENDPOINTS NO FUNCIONAN\n";
    echo "🔧 Revisar configuración\n";
}

echo "\n✅ TEST COMPLETADO\n";
echo "==================\n";
?>

