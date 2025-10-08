@echo off
setlocal

REM ====== CONFIGURACION MEMOFLIP ======
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/httpdocs/sistema_apps_upload/memoflip"
set "LOCAL=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip_static"
set "LOCAL_PHP=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip"

REM Ruta a WinSCP.com (intentar ambas ubicaciones)
if exist "C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com" (
  set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
) else (
  set "WINSCP=C:\Program Files (x86)\WinSCP\WinSCP.com"
)

echo ========================================
echo     DEPLOY MEMOFLIP con WinSCP
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com
  pause & exit /b 1
)

if not exist "%LOCAL%" (
  echo [ERROR] No existe la carpeta local:
  echo        %LOCAL%
  pause & exit /b 1
)

echo [INFO] Subiendo "%LOCAL%" -> "%HOST%:%REMOTE%"
echo [INFO] Usando: %WINSCP%
echo.

REM --- Subir archivos FRONTEND (HTML, JS, CSS) ---
echo [PASO 1/2] Subiendo archivos frontend...
"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_frontend.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "pwd" ^
 "lcd %LOCAL%" ^
 "put index.html" ^
 "put 404.html" ^
 "put logo.png" ^
 "synchronize remote -delete _next _next" ^
 "exit"

set "ERR=%ERRORLEVEL%"

if not "%ERR%"=="0" (
  echo [WARN] FTPS fallo. Probando FTP plano...
  "%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_frontend_ftp.log" /command ^
   "open ftp://%USER%:%PASS%@%HOST%/" ^
   "option batch on" ^
   "option confirm off" ^
   "cd %REMOTE%" ^
   "pwd" ^
   "lcd %LOCAL%" ^
   "put index.html" ^
   "put 404.html" ^
   "put logo.png" ^
   "synchronize remote -delete _next _next" ^
   "exit"
  set "ERR=%ERRORLEVEL%"
)

REM --- Subir archivos PHP ---
if "%ERR%"=="0" (
  echo [PASO 2/2] Subiendo archivos PHP...
  "%WINSCP%" /ini=nul /log:"%LOCAL_PHP%\deploy_php.log" /command ^
   "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
   "option batch on" ^
   "option confirm off" ^
   "cd %REMOTE%" ^
   "lcd %LOCAL_PHP%" ^
   "put auth.php" ^
   "exit"
  
  set "ERR2=%ERRORLEVEL%"
  if not "%ERR2%"=="0" (
    echo [WARN] FTPS fallo. Probando FTP plano para PHP...
    "%WINSCP%" /ini=nul /log:"%LOCAL_PHP%\deploy_php_ftp.log" /command ^
     "open ftp://%USER%:%PASS%@%HOST%/" ^
     "option batch on" ^
     "option confirm off" ^
     "cd %REMOTE%" ^
     "lcd %LOCAL_PHP%" ^
     "put auth.php" ^
     "exit"
    set "ERR=%ERRORLEVEL%"
  )
)

if "%ERR%"=="0" (
  echo.
  echo ========================================
  echo ✅ DEPLOY MEMOFLIP COMPLETADO
  echo ========================================
  echo.
  echo 🌐 Comprueba el juego:
  echo   https://colisan.com/sistema_apps_upload/memoflip/
  echo.
  echo 🔌 APIs:
  echo   https://colisan.com/sistema_apps_upload/memoflip/auth.php?action=check_session
  echo.
  echo 📋 Archivos subidos desde:
  echo   Frontend: %LOCAL%
  echo   Backend:  %LOCAL_PHP%
  echo ========================================
) else (
  echo.
  echo ========================================
  echo ❌ ERROR EN EL DEPLOY (codigo %ERR%)
  echo ========================================
  echo.
  echo 📝 Revisa los logs en las carpetas LOCAL
  echo ========================================
)

echo.
pause
