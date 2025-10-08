@echo off
setlocal

REM ====== CONFIGURACION MEMOFLIP ======
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE_BASE=/sistema_apps_upload"
set "REMOTE_MEMOFLIP=/sistema_apps_upload/memoflip"
set "LOCAL=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip_static"
set "LOCAL_PHP=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip"

set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

echo ========================================
echo     DEPLOY MEMOFLIP - Crear directorio
echo ========================================
echo.

REM --- Crear directorio memoflip si no existe ---
echo [PASO 0] Verificando/Creando directorio memoflip...
"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE_BASE%" ^
 "ls" ^
 "mkdir memoflip" ^
 "exit"

echo.
echo [PASO 1/2] Subiendo archivos frontend...
"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_frontend.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE_MEMOFLIP%" ^
 "lcd %LOCAL%" ^
 "put index.html" ^
 "put 404.html" ^
 "put logo.png" ^
 "mkdir _next" ^
 "synchronize remote -delete _next _next" ^
 "exit"

set "ERR=%ERRORLEVEL%"

if "%ERR%"=="0" (
  echo [PASO 2/2] Subiendo auth.php...
  "%WINSCP%" /ini=nul /command ^
   "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
   "cd %REMOTE_MEMOFLIP%" ^
   "lcd %LOCAL_PHP%" ^
   "put auth.php" ^
   "exit"
  set "ERR=%ERRORLEVEL%"
)

if "%ERR%"=="0" (
  echo.
  echo ========================================
  echo ✅ DEPLOY COMPLETADO
  echo ========================================
  echo.
  echo 🌐 https://colisan.com/sistema_apps_upload/memoflip/
  echo ========================================
) else (
  echo.
  echo ========================================
  echo ❌ ERROR (codigo %ERR%)
  echo ========================================
)

pause

