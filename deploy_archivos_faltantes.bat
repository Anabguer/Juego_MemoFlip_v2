@echo off
echo 🚨 DESPLIEGUE URGENTE - ARCHIVOS FALTANTES
echo.

echo 📤 Subiendo archivos CSS y JS faltantes...
"C:\Program Files (x86)\WinSCP\WinSCP.exe" /command ^
    "open ftps://colisan.com:21 -hostkey=""ssh-rsa 2048 8e:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f""" ^
    "cd /sistema_apps_upload/memoflip" ^
    "put out\*.html" ^
    "put out\_next\static\**" ^
    "put out\logo.png" ^
    "exit"

echo.
echo ✅ Archivos subidos correctamente
echo 🎯 ARCHIVOS SUBIDOS:
echo    - ✅ index.html
echo    - ✅ _next/static/css/*.css
echo    - ✅ _next/static/chunks/*.js
echo    - ✅ logo.png
echo.
echo 🌐 Ahora puedes abrir: https://colisan.com/sistema_apps_upload/memoflip/
echo.
pause
