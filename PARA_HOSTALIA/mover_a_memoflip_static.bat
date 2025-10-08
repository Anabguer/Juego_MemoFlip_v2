@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo ========================================
echo  MOVIENDO ARCHIVOS A memoflip_static/
echo ========================================
echo.

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "mkdir memoflip_static" ^
 "mv _common.php memoflip_static/" ^
 "mv auth.php memoflip_static/" ^
 "mv game.php memoflip_static/" ^
 "mv ranking.php memoflip_static/" ^
 "mv .htaccess memoflip_static/" ^
 "mv test_assets.html memoflip_static/" ^
 "mv test_auth.html memoflip_static/" ^
 "mv diagnostico_completo.php memoflip_static/" ^
 "mv index.html memoflip_static/" ^
 "mv favicon.ico memoflip_static/" ^
 "mv logo.png memoflip_static/" ^
 "mv 404.html memoflip_static/" ^
 "mkdir memoflip_static/404" ^
 "mv 404/index.html memoflip_static/404/" ^
 "rmdir 404" ^
 "mv cards memoflip_static/" ^
 "mv sounds memoflip_static/" ^
 "mv _next memoflip_static/" ^
 "mv sonidos memoflip_static/" ^
 "mv test memoflip_static/" ^
 "mv test-effects memoflip_static/" ^
 "cd memoflip_static" ^
 "ls" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ========================================
  echo ✅ ARCHIVOS MOVIDOS A memoflip_static/
  echo ========================================
  echo.
  echo 🧪 PRUEBA AHORA:
  echo   https://colisan.com/sistema_apps_upload/memoflip_static/
  echo.
  echo   https://colisan.com/sistema_apps_upload/memoflip_static/diagnostico_completo.php
  echo.
)

pause

