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
echo   SUBIR ARCHIVOS JS/CSS FALTANTES
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en: %WINSCP%
  pause & exit /b 1
)

REM Subir archivos faltantes
"%WINSCP%" /ini=nul /log:"archivos_faltantes.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "put ..\out\_next\static\chunks\webpack-cc6ecc8481f73787.js" ^
 "put ..\out\_next\static\chunks\main-d9a1838d30d4686b.js" ^
 "put ..\out\_next\static\chunks\framework-acd67e14855de5a2.js" ^
 "put ..\out\_next\static\chunks\pages\_app-8e34be7045eef37d.js" ^
 "put ..\out\_next\static\chunks\8e095c31-dfb7401daa368a17.js" ^
 "put ..\out\_next\static\chunks\4-947af0a8f9920a56.js" ^
 "put ..\out\_next\static\chunks\polyfills-42372ed130431b0a.js" ^
 "mkdir %REMOTE%\_next\static\h3B7Y811AoX1xJp_N-YfS" ^
 "cd %REMOTE%\_next\static\h3B7Y811AoX1xJp_N-YfS" ^
 "put ..\..\..\out\_next\static\h3B7Y811AoX1xJp_N-YfS\_buildManifest.js" ^
 "put ..\..\..\out\_next\static\h3B7Y811AoX1xJp_N-YfS\_ssgManifest.js" ^
 "ls %REMOTE%\_next\static\chunks" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ✅ Archivos faltantes subidos OK
  echo Abre: https://colisan.com/sistema_apps_upload/memoflip/
) else (
  echo.
  echo ❌ Error subiendo archivos faltantes (codigo %ERRORLEVEL%)
  echo Revisa log: archivos_faltantes.log
)

echo.
pause

