@echo off
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "lcd C:\Proyectos\MemoFlip\PARA_HOSTALIA" ^
 "cd /memoflip" ^
 "put verificar_tabla_usuarios.php" ^
 "exit"

echo.
echo ========================================
echo ✅ Archivo subido
echo ========================================
echo.
echo 🌐 Abre esta URL en tu navegador:
echo   https://colisan.com/sistema_apps_upload/memoflip/verificar_tabla_usuarios.php
echo.
pause

