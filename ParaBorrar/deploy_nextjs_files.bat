@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🚀 Subiendo archivos de Next.js...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_nextjs_files.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "put -transfer=binary _next memoflip/" "exit"

echo.
echo ✅ Deploy de archivos Next.js completado
echo 📄 Archivos subidos: _next/ (todos los JS y CSS)
echo 📊 Log: %LOCAL%\deploy_nextjs_files.log
echo.
pause
