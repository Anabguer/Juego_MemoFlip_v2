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
echo   SUBIR ARCHIVOS A /memoflip/ (RAIZ)
echo   NO cambiar rutas en HTML/JS
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en: %WINSCP%
  pause & exit /b 1
)

REM Subir solo los archivos modificados
"%WINSCP%" /ini=nul /log:"upload_archivos_correcto.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "put ..\out\index.html" ^
 "put ..\out\_next\static\chunks\pages\index-aa79f057ab033cf8.js" ^
 "put ..\out\_next\static\css\bd13f7f12af3ad40.css" ^
 "put ..\out\_next\static\6MLDr_An6JAYeNVkRSOS7\_buildManifest.js" ^
 "put ..\out\_next\static\6MLDr_An6JAYeNVkRSOS7\_ssgManifest.js" ^
 "ls %REMOTE%" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ✅ Archivos actualizados OK
  echo Abre: https://colisan.com/sistema_apps_upload/memoflip/
) else (
  echo.
  echo ❌ Error subiendo archivos (codigo %ERRORLEVEL%)
  echo Revisa log: upload_archivos_correcto.log
)

echo.
pause