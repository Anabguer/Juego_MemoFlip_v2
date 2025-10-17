@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip\api"
set "REMOTE=/sistema_apps_upload/memoflip/api"

echo 🚀 Subiendo fix del ranking CORRECTAMENTE a Hostalia...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_ranking_fix_correcto.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "mkdir memoflip" "mkdir memoflip/api" "put save_progress.php memoflip/api/" "exit"

echo.
echo ✅ Deploy del ranking fix CORRECTO completado
echo 📄 Archivo subido: memoflip/api/save_progress.php
echo 📊 Log: %LOCAL%\deploy_ranking_fix_correcto.log
echo.
pause
