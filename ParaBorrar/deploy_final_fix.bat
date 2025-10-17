@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🔧 Subiendo fix final (solo tabla principal)...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_final_fix.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "put api\save_progress.php memoflip/api/" "put ranking.php memoflip/" "exit"

echo.
echo ✅ Deploy del fix final completado
echo 📄 Archivos subidos: api/save_progress.php, ranking.php
echo 🌐 URLs: 
echo    - https://colisan.com/sistema_apps_upload/memoflip/api/save_progress.php
echo    - https://colisan.com/sistema_apps_upload/memoflip/ranking.php
echo 📊 Log: %LOCAL%\deploy_final_fix.log
echo.
pause
