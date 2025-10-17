@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

echo 🗑️ Borrando carpeta api de la raíz (ubicación incorrecta)...
echo.

"%WINSCP%" /ini=nul /log:"borrar_api_raiz.log" /command "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" "option batch on" "option confirm off" "rmdir api" "exit"

echo.
echo ✅ Carpeta api borrada de la raíz
echo 📊 Log: borrar_api_raiz.log
echo.
pause
