@echo off
echo Arreglando rutas en index.html...
powershell -Command "$html = Get-Content 'PARA_HOSTALIA\sistema_apps_upload\memoflip_static\index.html' -Raw; $html = $html -replace '/sistema_apps_upload/memoflip_static', '/sistema_apps_upload/memoflip'; $html | Set-Content 'PARA_HOSTALIA\sistema_apps_upload\memoflip_static\index.html'"
echo ✅ Rutas corregidas
pause

