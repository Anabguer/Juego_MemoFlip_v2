@echo off
setlocal

REM ====== DEPLOY MEMOFLIP_STATIC (PRUEBA) ======
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/sistema_apps_upload/memoflip_static"
set "LOCAL=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip_static"

set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo ========================================
echo  DEPLOY MEMOFLIP_STATIC (PRUEBA)
echo ========================================
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\..\deploy_static.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd /sistema_apps_upload" ^
 "mkdir memoflip_static" ^
 "cd %REMOTE%" ^
 "pwd" ^
 "lcd %LOCAL%" ^
 "synchronize remote -mirror -criteria=size -filemask=""|*.txt;*.md;*.log""" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ========================================
  echo ✅ MEMOFLIP_STATIC SUBIDO
  echo ========================================
  echo.
  echo 🧪 PRUEBA AHORA:
  echo   https://colisan.com/sistema_apps_upload/memoflip_static/
  echo.
  echo 🔍 Verifica:
  echo   1. Que carga sin "Connection closed"
  echo   2. Network: todos los _next/static/ → 200 OK
  echo   3. Diseño intacto
  echo.
  echo Si todo funciona, ejecuta:
  echo   switch_to_production.bat
  echo.
) else (
  echo.
  echo ❌ ERROR - Revisa deploy_static.log
)

pause

