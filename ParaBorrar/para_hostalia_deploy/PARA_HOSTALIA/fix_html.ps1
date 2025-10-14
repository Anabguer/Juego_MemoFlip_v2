# Fix HTML para producción
$indexPath = "sistema_apps_upload\memoflip_static\index.html"
$content = Get-Content $indexPath -Raw

# Reemplazar rutas
$content = $content -replace '/sistema_apps_upload/memoflip_static', '/sistema_apps_upload/memoflip'

# Guardar
Set-Content $indexPath -Value $content -NoNewline
Write-Host "HTML actualizado correctamente"


