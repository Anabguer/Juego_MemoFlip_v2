@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip\api"
set "REMOTE=/sistema_apps_upload/memoflip/api"

echo 🔍 Subiendo script para verificar tablas de BD...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_check_tables.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "mkdir memoflip" "mkdir memoflip/api" "put check_tables.php memoflip/api/" "exit"

echo.
echo ✅ Deploy del verificador de tablas completado
echo 📄 Archivo subido: memoflip/api/check_tables.php
echo 📊 Log: %LOCAL%\deploy_check_tables.log
echo.
pause
