@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=memoflip"
set "LOCAL=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo Subiendo diagnostico.php...

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "cd %REMOTE%" ^
 "lcd %LOCAL%" ^
 "put diagnostico.php" ^
 "exit"

echo.
echo ========================================
echo Diagnostico.php subido
echo ========================================
echo.
echo Abre esta URL en tu navegador:
echo   https://colisan.com/sistema_apps_upload/memoflip/diagnostico.php
echo.
echo Te mostrara que archivos existen y donde estan.
echo.
pause

