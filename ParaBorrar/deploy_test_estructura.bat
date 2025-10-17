@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🔍 Subiendo test de estructura de tablas...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_test_estructura.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "put test_estructura_tabla.php memoflip/" "exit"

echo.
echo ✅ Deploy del test de estructura completado
echo 📄 Archivo subido: memoflip/test_estructura_tabla.php
echo 🌐 URL: https://colisan.com/sistema_apps_upload/memoflip/test_estructura_tabla.php
echo 📊 Log: %LOCAL%\deploy_test_estructura.log
echo.
pause
