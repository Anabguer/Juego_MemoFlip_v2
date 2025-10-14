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
echo   SUBIR MANIFESTS FALTANTES
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en: %WINSCP%
  pause & exit /b 1
)

REM Subir manifests directamente a la raíz
"%WINSCP%" /ini=nul /log:"manifests.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "put ..\out\_next\static\h3B7Y811AoX1xJp_N-YfS\_buildManifest.js" ^
 "put ..\out\_next\static\h3B7Y811AoX1xJp_N-YfS\_ssgManifest.js" ^
 "ls %REMOTE%\_buildManifest.js" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ✅ Manifests subidos OK
  echo Abre: https://colisan.com/sistema_apps_upload/memoflip/
) else (
  echo.
  echo ❌ Error subiendo manifests (codigo %ERRORLEVEL%)
  echo Revisa log: manifests.log
)

echo.
pause

