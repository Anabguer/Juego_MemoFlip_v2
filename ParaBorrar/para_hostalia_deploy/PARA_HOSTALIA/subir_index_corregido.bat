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
echo   SUBIR INDEX.HTML CORREGIDO
echo   Rutas cambiadas a /sistema_apps_upload/memoflip/
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en: %WINSCP%
  pause & exit /b 1
)

REM Subir solo el index.html corregido
"%WINSCP%" /ini=nul /log:"subir_index_corregido.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "put ..\out\index.html" ^
 "ls %REMOTE%\index.html" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ✅ Index.html corregido subido OK
  echo Abre: https://colisan.com/sistema_apps_upload/memoflip/
) else (
  echo.
  echo ❌ Error subiendo index.html (codigo %ERRORLEVEL%)
  echo Revisa log: subir_index_corregido.log
)

echo.
pause

