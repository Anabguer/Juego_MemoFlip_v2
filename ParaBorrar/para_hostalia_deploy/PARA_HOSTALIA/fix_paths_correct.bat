@echo off
echo Actualizando rutas en HTML...
powershell -Command "$content = Get-Content 'PARA_HOSTALIA\sistema_apps_upload\memoflip_static\index.html' -Raw; $content = $content -replace '/sistema_apps_upload/memoflip_static', '/sistema_apps_upload/memoflip'; $content | Set-Content 'PARA_HOSTALIA\sistema_apps_upload\memoflip_static\index.html'"
echo HTML actualizado correctamente


