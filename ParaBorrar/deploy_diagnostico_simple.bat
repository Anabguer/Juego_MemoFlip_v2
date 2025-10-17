@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🔍 Subiendo diagnóstico simple...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_diagnostico_simple.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "put diagnostico_simple.php memoflip/" "exit"

echo.
echo ✅ Deploy del diagnóstico simple completado
echo 📄 Archivo subido: memoflip/diagnostico_simple.php
echo 🌐 URL: https://colisan.com/sistema_apps_upload/memoflip/diagnostico_simple.php
echo 📊 Log: %LOCAL%\deploy_diagnostico_simple.log
echo.
pause
