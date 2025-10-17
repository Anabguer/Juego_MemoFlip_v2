@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🚀 Subiendo assets (cards y sounds)...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_assets.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "put -transfer=binary cards memoflip/" "put -transfer=binary sounds memoflip/" "put levels.json memoflip/" "put logo.png memoflip/" "put logo_opt.png memoflip/" "exit"

echo.
echo ✅ Deploy de assets completado
echo 📄 Archivos subidos: cards/, sounds/, levels.json, logos
echo 📊 Log: %LOCAL%\deploy_assets.log
echo.
pause
