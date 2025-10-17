@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🎯 Subiendo archivos finales corregidos...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_final_corregido.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "put game.php memoflip/" "put test_final_corregido.php memoflip/" "exit"

echo.
echo ✅ Deploy de archivos finales corregidos completado
echo 📄 Archivos subidos:
echo    - game.php (corregido - SIN columna email en memoflip_usuarios)
echo    - test_final_corregido.php (test con estructura correcta)
echo 🌐 URL de prueba: https://colisan.com/sistema_apps_upload/memoflip/test_final_corregido.php
echo 📊 Log: %LOCAL%\deploy_final_corregido.log
echo.
pause
