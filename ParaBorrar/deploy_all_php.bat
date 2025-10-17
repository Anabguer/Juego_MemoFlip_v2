@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🔧 Subiendo todos los archivos PHP corregidos...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_all_php.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "mkdir memoflip" "put ranking.php memoflip/" "put game.php memoflip/" "put api/save_progress.php memoflip/api/" "exit"

echo.
echo ✅ Deploy de archivos PHP completado
echo 📄 Archivos subidos:
echo    - ranking.php (corregido)
echo    - game.php (corregido)
echo    - api/save_progress.php (corregido)
echo.
echo 🌐 PRUEBA AHORA: https://colisan.com/sistema_apps_upload/memoflip/ranking.php?limit=5
echo 📊 Log: %LOCAL%\deploy_all_php.log
echo.
pause
