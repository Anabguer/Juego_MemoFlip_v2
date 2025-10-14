@echo off
echo ========================================
echo   SUBIR save_progress.php A HOSTALIA
echo ========================================
echo.

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en: %WINSCP%
  pause & exit /b 1
)

echo [1/2] Conectando al servidor...
echo.

"%WINSCP%" /command ^
  "open ftp://%USER%:%PASS%@%HOST%" ^
  "cd %REMOTE%" ^
  "put sistema_apps_api\memoflip\save_progress.php save_progress.php" ^
  "exit"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   EXITO: Archivo subido correctamente
    echo ========================================
    echo.
    echo El endpoint save_progress.php esta disponible en:
    echo https://colisan.com/sistema_apps_upload/memoflip/save_progress.php
    echo.
    echo PRUEBALO con curl:
    echo curl -X POST -H "Content-Type: application/json" ^
    echo -d "{\"user_key\":\"test123\",\"level\":5,\"coins\":100,\"lives\":3}" ^
    echo https://colisan.com/sistema_apps_upload/memoflip/save_progress.php
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR: No se pudo subir el archivo
    echo ========================================
    echo.
)

pause

