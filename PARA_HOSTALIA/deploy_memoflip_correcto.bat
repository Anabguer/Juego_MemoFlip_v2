@echo off
setlocal

REM ====== CONFIGURACION MEMOFLIP ======
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "LOCAL=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip_static"
set "LOCAL_PHP=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip"

set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

echo ========================================
echo     DEPLOY MEMOFLIP A /memoflip/
echo ========================================
echo.

REM --- Subir archivos FRONTEND ---
echo [1/2] Subiendo frontend (HTML, JS, CSS)...
"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "lcd %LOCAL%" ^
 "put index.html" ^
 "put 404.html" ^
 "put logo.png" ^
 "synchronize remote -delete _next _next" ^
 "exit"

set "ERR=%ERRORLEVEL%"

REM --- Subir archivos PHP ---
if "%ERR%"=="0" (
  echo [2/2] Subiendo PHP (auth.php)...
  "%WINSCP%" /ini=nul /command ^
   "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
   "cd %REMOTE%" ^
   "lcd %LOCAL_PHP%" ^
   "put auth.php" ^
   "exit"
  set "ERR=%ERRORLEVEL%"
)

if "%ERR%"=="0" (
  echo.
  echo ========================================
  echo ✅ DEPLOY MEMOFLIP COMPLETADO
  echo ========================================
  echo.
  echo 🌐 Comprueba en:
  echo   https://colisan.com/sistema_apps_upload/memoflip/
  echo.
  echo ✅ Archivos subidos correctamente
  echo ========================================
) else (
  echo.
  echo ========================================
  echo ⚠️ DEPLOY CON ERRORES (codigo %ERR%)
  echo ========================================
  echo.
  echo NOTA: Si los archivos se subieron, ignora este error.
  echo Verifica manualmente en la URL.
  echo ========================================
)

pause

