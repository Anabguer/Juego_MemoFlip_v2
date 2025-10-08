<?php
header('Content-Type: application/json');

$indexPath = __DIR__ . '/index.html';
$authPath = __DIR__ . '/../memoflip/auth.php';

$result = [
    'index_exists' => file_exists($indexPath),
    'index_modified' => file_exists($indexPath) ? date('Y-m-d H:i:s', filemtime($indexPath)) : null,
    'index_size' => file_exists($indexPath) ? filesize($indexPath) : 0,
    'auth_exists' => file_exists($authPath),
    'auth_modified' => file_exists($authPath) ? date('Y-m-d H:i:s', filemtime($authPath)) : null,
    'has_nick_field' => false
];

// Verificar si auth.php tiene el campo nick
if (file_exists($authPath)) {
    $authContent = file_get_contents($authPath);
    $result['has_nick_field'] = strpos($authContent, 'nick') !== false;
}

// Verificar contenido del index.html
if (file_exists($indexPath)) {
    $indexContent = file_get_contents($indexPath);
    $result['has_ya_tienes_cuenta'] = strpos($indexContent, 'Ya tienes cuenta') !== false || 
                                       strpos($indexContent, '¿Ya tienes cuenta?') !== false;
}

echo json_encode($result, JSON_PRETTY_PRINT);

