@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip\api"
set "REMOTE=/sistema_apps_upload/memoflip/api"

echo 🎯 Subiendo save_progress.php final corregido...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_save_progress_final.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "put save_progress.php api/" "exit"

echo.
echo ✅ Deploy de save_progress.php final completado
echo 📄 Archivo subido: api/save_progress.php (corregido - SIN columna email en memoflip_usuarios)
echo 🌐 URL de prueba: https://colisan.com/sistema_apps_upload/memoflip/api/save_progress.php
echo 📊 Log: %LOCAL%\deploy_save_progress_final.log
echo.
pause
