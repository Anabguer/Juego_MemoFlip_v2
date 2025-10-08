@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo ========================================
echo  CORRIGIENDO ESTRUCTURA DE MEMOFLIP
echo ========================================
echo.
echo Moviendo archivos a memoflip/...
echo.

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "mv _common.php memoflip/" ^
 "mv auth.php memoflip/" ^
 "mv game.php memoflip/" ^
 "mv ranking.php memoflip/" ^
 "mv .htaccess memoflip/" ^
 "mv index.html memoflip/index_memoflip.html" ^
 "mv test_assets.html memoflip/" ^
 "mv test_auth.html memoflip/" ^
 "mv logo.png memoflip/logo_memoflip.png" ^
 "mv cards memoflip/" ^
 "mv sounds memoflip/" ^
 "mv _next memoflip/" ^
 "cd memoflip" ^
 "ls" ^
 "exit"

set "ERR=%ERRORLEVEL%"
if "%ERR%"=="0" (
  echo.
  echo ========================================
  echo ✅ ESTRUCTURA CORREGIDA
  echo ========================================
  echo.
  echo Todos los archivos movidos a:
  echo   /sistema_apps_upload/memoflip/
  echo.
  echo Ahora prueba:
  echo   https://colisan.com/sistema_apps_upload/memoflip/test_assets.html
  echo   https://colisan.com/sistema_apps_upload/memoflip/test_auth.html
  echo   https://colisan.com/sistema_apps_upload/memoflip/index_memoflip.html
  echo.
) else (
  echo.
  echo ========================================
  echo ❌ ERROR AL MOVER ARCHIVOS
  echo ========================================
)

pause

