@echo off
echo 🔍 SUBIENDO VERIFICADOR DE ARCHIVOS
echo.

echo 📤 Subiendo verificador...
"C:\Program Files (x86)\WinSCP\WinSCP.exe" /command ^
    "open ftps://colisan.com:21 -hostkey=""ssh-rsa 2048 8e:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f""" ^
    "cd /sistema_apps_upload/memoflip" ^
    "put verificar_archivos_servidor.php" ^
    "exit"

echo.
echo ✅ Verificador subido
echo 🌐 Abrir: https://colisan.com/sistema_apps_upload/memoflip/verificar_archivos_servidor.php
echo.
pause
