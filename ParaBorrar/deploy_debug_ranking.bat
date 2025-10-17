@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🔍 Subiendo debug del ranking...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_debug_ranking.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "mkdir memoflip" "put debug_ranking.php memoflip/" "exit"

echo.
echo ✅ Deploy del debug ranking completado
echo 📄 Archivo subido: memoflip/debug_ranking.php
echo 📊 Log: %LOCAL%\deploy_debug_ranking.log
echo.
pause
