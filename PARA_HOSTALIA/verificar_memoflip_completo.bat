@echo off
setlocal

REM ====== CONFIG ======
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

echo ========================================
echo   VERIFICACION COMPLETA - MEMOFLIP
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com
  pause & exit /b 1
)

echo [INFO] Listando estructura del servidor /memoflip...
echo.

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "ls" ^
 "ls _next" ^
 "ls _next/static" ^
 "ls _next/static/chunks" ^
 "ls js" ^
 "ls cards" ^
 "ls sounds" ^
 "exit"

echo.
echo ========================================
echo AHORA VERIFICA ESTAS URLS EN EL NAVEGADOR:
echo ========================================
echo.
echo 1. https://colisan.com/memoflip/
echo 2. https://colisan.com/memoflip/_next/static/chunks/webpack-4639a870ec8273e6.js
echo 3. https://colisan.com/memoflip/js/path-shim.js
echo 4. https://colisan.com/memoflip/logo.png
echo 5. https://colisan.com/memoflip/cards/card_001.png
echo 6. https://colisan.com/memoflip/sounds/acierto.mp3
echo.
echo ========================================
echo EN LA CONSOLA DEL NAVEGADOR (F12) DEBES VER:
echo ========================================
echo.
echo MEMOFLIP_CONFIG { basePath: '/memoflip', cardsPath: '/memoflip/cards', soundsPath: '/memoflip/sounds' }
echo [path-shim] PRO activo ...
echo.
echo Y CERO 404 de /cards o /sounds
echo.
echo ========================================
pause


