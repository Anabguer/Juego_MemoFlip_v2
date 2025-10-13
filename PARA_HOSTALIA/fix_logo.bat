@echo off
echo Arreglando rutas del logo...
powershell -Command "$html = Get-Content 'PARA_HOSTALIA\sistema_apps_upload\memoflip_static\index.html' -Raw; $html = $html -replace 'href=\"/logo.png\"', 'href=\"/sistema_apps_upload/memoflip/logo.png\"'; $html = $html -replace 'src=\"/logo.png\"', 'src=\"/sistema_apps_upload/memoflip/logo.png\"'; $html | Set-Content 'PARA_HOSTALIA\sistema_apps_upload\memoflip_static\index.html'"
echo Logo URLs arregladas


