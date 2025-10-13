@echo off
echo Arreglando TODAS las rutas del logo (href y src)...
powershell -Command "$html = Get-Content 'PARA_HOSTALIA\sistema_apps_upload\memoflip_static\index.html' -Raw; $html = $html -replace '\"\/logo\.png\"', '\"/sistema_apps_upload/memoflip/logo.png\"'; $html = $html -replace \"'\/logo\.png'\", \"'/sistema_apps_upload/memoflip/logo.png'\"; $html | Set-Content 'PARA_HOSTALIA\sistema_apps_upload\memoflip_static\index.html'"
echo Logo URLs arregladas (todas)


