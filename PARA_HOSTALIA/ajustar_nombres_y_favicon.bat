@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=memoflip"
set "LOCAL=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo ========================================
echo  AJUSTANDO NOMBRES Y SUBIENDO FAVICON
echo ========================================
echo.

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "mv index_memoflip.html index.html" ^
 "mv logo_memoflip.png logo.png" ^
 "lcd %LOCAL%" ^
 "put favicon.ico" ^
 "ls" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ========================================
  echo ✅ NOMBRES CORREGIDOS Y FAVICON SUBIDO
  echo ========================================
  echo.
  echo Ahora TODO está en su sitio:
  echo   /sistema_apps_upload/memoflip/
  echo.
  echo 🎮 PRUEBA EL JUEGO:
  echo   https://colisan.com/sistema_apps_upload/memoflip/
  echo.
  echo 🧪 TESTS:
  echo   https://colisan.com/sistema_apps_upload/memoflip/test_assets.html
  echo   https://colisan.com/sistema_apps_upload/memoflip/test_auth.html
  echo.
)

pause

