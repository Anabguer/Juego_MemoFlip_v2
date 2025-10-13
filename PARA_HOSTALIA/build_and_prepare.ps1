# Script para preparar MemoFlip para producción
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PREPARANDO MEMOFLIP PARA PRODUCCIÓN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Copiar build de out/ a memoflip_static/
Write-Host "[1/3] Copiando archivos de out/ a memoflip_static/..." -ForegroundColor Yellow
robocopy "..\out" "sistema_apps_upload\memoflip_static" /E /XD "node_modules" ".git" /XF "*.md" "*.txt" /NFL /NDL /NP /R:1 /W:1
Write-Host "✓ Archivos copiados" -ForegroundColor Green
Write-Host ""

# 2. Reemplazar rutas en index.html
Write-Host "[2/3] Actualizando rutas en index.html..." -ForegroundColor Yellow
$indexPath = "sistema_apps_upload\memoflip_static\index.html"
$content = Get-Content $indexPath -Raw

# Reemplazar todas las rutas
$content = $content -replace '/sistema_apps_upload/memoflip_static', '/sistema_apps_upload/memoflip'

# Añadir config y path-shim antes del primer <script
$configScript = @"
<meta http-equiv="Cache-Control" content="no-store"/><base href="/" /><link rel="icon" href="/sistema_apps_upload/memoflip/logo.png" type="image/x-icon"/><link rel="manifest" href="/sistema_apps_upload/memoflip/manifest.json"/><script>window.__MEMOFLIP_CONFIG__={basePath:'/sistema_apps_upload/memoflip',cardsPath:'/sistema_apps_upload/memoflip/cards',soundsPath:'/sistema_apps_upload/memoflip/sounds'};console.log('MEMOFLIP_CONFIG',window.__MEMOFLIP_CONFIG__);</script><script src="/sistema_apps_upload/memoflip/js/path-shim.js"></script>
"@

# Insertar antes del primer <script defer
$content = $content -replace '<link rel="preload"', "$configScript<link rel=`"preload`""

# Guardar
Set-Content $indexPath -Value $content -NoNewline
Write-Host "✓ Rutas actualizadas" -ForegroundColor Green
Write-Host ""

# 3. Actualizar manifest.json
Write-Host "[3/3] Actualizando manifest.json..." -ForegroundColor Yellow
$manifestPath = "sistema_apps_upload\memoflip_static\manifest.json"
if (Test-Path $manifestPath) {
    $manifest = Get-Content $manifestPath -Raw
    $manifest = $manifest -replace '/sistema_apps_upload/memoflip_static', '/sistema_apps_upload/memoflip'
    Set-Content $manifestPath -Value $manifest -NoNewline
    Write-Host "✓ Manifest actualizado" -ForegroundColor Green
} else {
    Write-Host "⚠ manifest.json no encontrado, copiando desde template..." -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "  ✅ PREPARACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Ahora puedes ejecutar:" -ForegroundColor Cyan
Write-Host "  deploy_memoflip_definitivo.bat" -ForegroundColor White
Write-Host ""

