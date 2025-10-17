@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🔍 Subiendo herramienta de diagnóstico...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_diagnostico.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "mkdir memoflip" "put diagnostico_web.php memoflip/" "put diagnostico_urgente.php memoflip/" "put test_final_simple.php memoflip/" "exit"

echo.
echo ✅ Deploy del diagnóstico completado
echo 📄 Archivos subidos:
echo    - diagnostico_web.php
echo    - diagnostico_urgente.php
echo    - test_final_simple.php
echo 🌐 URL PRINCIPAL: https://colisan.com/sistema_apps_upload/memoflip/diagnostico_web.php
echo 📊 Log: %LOCAL%\deploy_diagnostico.log
echo.
pause
