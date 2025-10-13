@echo off
setlocal

REM ====== CONFIG ====== 
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"

REM WinSCP path
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo ========================================
echo   BUILD DEFINITIVO - RUTAS CORRECTAS
echo   NO MAS memoflip_static NUNCA MAS
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en: %WINSCP%
  pause & exit /b 1
)

REM Subir archivos del nuevo build
"%WINSCP%" /ini=nul /log:"build_definitivo.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "put ..\out\index.html" ^
 "put ..\out\_next\static\chunks\pages\index-aa79f057ab033cf8.js" ^
 "put ..\out\_next\static\css\bd13f7f12af3ad40.css" ^
 "put ..\out\_next\static\h3B7Y811AoX1xJp_N-YfS\_buildManifest.js" ^
 "put ..\out\_next\static\h3B7Y811AoX1xJp_N-YfS\_ssgManifest.js" ^
 "ls %REMOTE%\index.html" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ✅ BUILD DEFINITIVO SUBIDO
  echo ✅ NO MAS memoflip_static NUNCA MAS
  echo Abre: https://colisan.com/sistema_apps_upload/memoflip/
) else (
  echo.
  echo ❌ Error subiendo build definitivo (codigo %ERRORLEVEL%)
  echo Revisa log: build_definitivo.log
)

echo.
pause

