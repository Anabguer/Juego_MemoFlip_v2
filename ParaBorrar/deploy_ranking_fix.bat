@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🚀 Subiendo fix del ranking a Hostalia...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_ranking_fix.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "mkdir memoflip" "mkdir memoflip/api" "synchronize remote -mirror -criteria=size" "exit"

echo.
echo ✅ Deploy del ranking fix completado
echo 📄 Archivo subido: api/save_progress.php
echo 📊 Log: %LOCAL%\deploy_ranking_fix.log
echo.
pause
