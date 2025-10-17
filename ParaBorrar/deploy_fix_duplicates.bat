@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🔧 Subiendo fix de duplicados...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_fix_duplicates.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "put fix_ranking_duplicates.php memoflip/" "exit"

echo.
echo ✅ Deploy del fix de duplicados completado
echo 📄 Archivo subido: fix_ranking_duplicates.php
echo 🌐 URL: https://colisan.com/sistema_apps_upload/memoflip/fix_ranking_duplicates.php
echo 📊 Log: %LOCAL%\deploy_fix_duplicates.log
echo.
pause
