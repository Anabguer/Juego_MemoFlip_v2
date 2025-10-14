@echo off
setlocal

REM ====== CONFIG ====== 
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "LOCAL=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip_static"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

echo ========================================
echo   DEPLOY MEMOFLIP A LA RAIZ - DEFINITIVO
echo   Origen: %LOCAL%
echo   Destino: %HOST%:%REMOTE%
echo ========================================
echo.

if not exist "%LOCAL%" (
  echo [ERROR] No existe la carpeta local: %LOCAL%
  pause & exit /b 1
)

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en: %WINSCP%
  pause & exit /b 1
)

echo [INFO] Subiendo MemoFlip a la raiz del servidor...

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "lcd %LOCAL%" ^
 "mkdir %REMOTE%" ^
 "cd %REMOTE%" ^
 "synchronize remote -mirror -criteria=size" ^
 "exit"

set "ERR=%ERRORLEVEL%"

if not "%ERR%"=="0" (
  echo [WARN] FTPS fallo. Probando FTP plano...
  "%WINSCP%" /ini=nul /command ^
   "open ftp://%USER%:%PASS%@%HOST%/" ^
   "option batch on" ^
   "option confirm off" ^
   "lcd %LOCAL%" ^
   "mkdir %REMOTE%" ^
   "cd %REMOTE%" ^
   "synchronize remote -mirror -criteria=size" ^
   "exit"
  set "ERR=%ERRORLEVEL%"
)

if "%ERR%"=="0" (
  echo.
  echo ========================================
  echo ✅ DEPLOY COMPLETADO
  echo ========================================
  echo 🌐 MemoFlip disponible en:
  echo   https://colisan.com/sistema_apps_upload/memoflip/
  echo.
  echo 🔎 Tests rapidos:
  echo   https://colisan.com/sistema_apps_upload/memoflip/cards/card_001.png
  echo   https://colisan.com/sistema_apps_upload/memoflip/sounds/acierto.mp3
  echo ========================================
) else (
  echo.
  echo ========================================
  echo ❌ ERROR EN EL DEPLOY (codigo %ERR%)
  echo ========================================
)

echo.
pause
