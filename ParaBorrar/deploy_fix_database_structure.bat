@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo 🔧 Subiendo archivos con estructura de BD corregida...
echo 📁 Local: %LOCAL%
echo 📁 Remote: %REMOTE%
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_fix_database_structure.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "lcd %LOCAL%" "put config_hostalia.php memoflip/" "put game.php memoflip/" "put api/save_progress.php memoflip/api/" "exit"

echo.
echo ✅ Deploy de archivos corregidos completado
echo 📄 Archivos subidos:
echo    - config_hostalia.php (con configuración de tablas)
echo    - game.php (con usuario_aplicacion_key)
echo    - api/save_progress.php (con usuario_aplicacion_key)
echo 🌐 URL de prueba: https://colisan.com/sistema_apps_upload/memoflip/test_estructura_tabla.php
echo 📊 Log: %LOCAL%\deploy_fix_database_structure.log
echo.
pause
