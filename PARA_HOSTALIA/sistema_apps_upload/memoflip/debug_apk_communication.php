<?php
// 🚨 DEBUG APK COMMUNICATION - VER QUÉ DATOS LLEGAN DE LA APK
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Log de debug
$log_file = 'debug_apk.log';
$timestamp = date('Y-m-d H:i:s');

$debug_info = [
    'timestamp' => $timestamp,
    'method' => $_SERVER['REQUEST_METHOD'],
    'content_type' => $_SERVER['CONTENT_TYPE'] ?? 'No definido',
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'No definido',
    'raw_input' => file_get_contents('php://input'),
    'post_data' => $_POST,
    'get_data' => $_GET,
    'headers' => getallheaders()
];

// Escribir log
file_put_contents($log_file, json_encode($debug_info, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);

// Respuesta para la APK
$response = [
    'success' => true,
    'message' => 'Debug data received',
    'timestamp' => $timestamp,
    'received_data' => $debug_info
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>

