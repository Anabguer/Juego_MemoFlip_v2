@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "LOCAL_PHP=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

echo ========================================
echo     Subiendo auth.php a /memoflip/
echo ========================================
echo.

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "cd %REMOTE%" ^
 "lcd %LOCAL_PHP%" ^
 "put auth.php" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ✅ auth.php subido correctamente
) else (
  echo.
  echo ⚠️ Error al subir auth.php
)

pause

