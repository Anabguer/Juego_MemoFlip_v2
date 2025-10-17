@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🔧 Subiendo configuración de base de datos...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_config_hostalia.log" /command ^
"open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
"option batch on" ^
"option confirm off" ^
"lcd %LOCAL%" ^
"put config_hostalia.php %REMOTE%/" ^
"exit"

echo.
echo ✅ Deploy del config_hostalia.php completado
echo 📄 Archivo subido: memoflip/config_hostalia.php
echo 📊 Log: %LOCAL%\deploy_config_hostalia.log
echo.
pause
