# Script de verificacion de URLs para MemoFlip en Hostalia

$baseUrl = "https://colisan.com/sistema_apps_upload/memoflip_static"

$urls = @(
    "$baseUrl/",
    "$baseUrl/index.html",
    "$baseUrl/manifest.json",
    "$baseUrl/logo.png",
    "$baseUrl/favicon.ico",
    "$baseUrl/_next/static/css/f3a8852661bf4dc5.css",
    "$baseUrl/_next/static/chunks/webpack-1a4fe80cfb4762a9.js",
    "$baseUrl/_next/static/chunks/framework-acd67e14855de5a2.js",
    "$baseUrl/_next/static/chunks/main-bf10cb7ff2c410ef.js",
    "$baseUrl/_next/static/chunks/main-app-07d63cda7795b0de.js",
    "$baseUrl/_next/static/chunks/255-fdd27039139b7db0.js",
    "$baseUrl/_next/static/chunks/615-775cd8d3f7de53a4.js",
    "$baseUrl/_next/static/chunks/app/page-2f133f8ea78ebb01.js",
    "$baseUrl/cards/card_001.png",
    "$baseUrl/sounds/acierto.mp3",
    "$baseUrl/auth.php",
    "$baseUrl/game.php",
    "$baseUrl/ranking.php",
    "$baseUrl/diagnostico_completo.php"
)

Write-Host "========================================"
Write-Host " VERIFICACION DE URLs - MemoFlip"
Write-Host "========================================"
Write-Host ""

$ok = 0
$error = 0

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $status = $response.StatusCode
        
        if ($status -eq 200) {
            Write-Host "[OK] [$status] $url" -ForegroundColor Green
            $ok++
        } else {
            Write-Host "[WARN] [$status] $url" -ForegroundColor Yellow
            $error++
        }
    } catch {
        Write-Host "[ERROR] $url" -ForegroundColor Red
        Write-Host "  $($_.Exception.Message)" -ForegroundColor DarkRed
        $error++
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host " RESUMEN"
Write-Host "========================================"
Write-Host "OK: $ok" -ForegroundColor Green
Write-Host "Errores: $error" -ForegroundColor Red
Write-Host ""

if ($error -eq 0) {
    Write-Host "TODO CORRECTO - MemoFlip deberia funcionar" -ForegroundColor Green
    Write-Host ""
    Write-Host "Abre en tu navegador:"
    Write-Host "  $baseUrl/"
    Write-Host ""
    Write-Host "Y verifica en consola (F12) que no hay errores."
} else {
    Write-Host "HAY ERRORES - Revisa los archivos faltantes arriba" -ForegroundColor Yellow
}

Write-Host ""
