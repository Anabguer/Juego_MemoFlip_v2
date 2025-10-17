@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🔧 Subiendo fix final de save_progress...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_save_progress_final_fix.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "put api\save_progress.php memoflip/api/" "exit"

echo.
echo ✅ Deploy del fix final de save_progress completado
echo 📄 Archivo subido: api/save_progress.php
echo 🌐 URL: https://colisan.com/sistema_apps_upload/memoflip/api/save_progress.php
echo 📊 Log: %LOCAL%\deploy_save_progress_final_fix.log
echo.
pause
