@echo off
echo ========================================
echo   SUBIR save_progress.php A /memoflip/api/
echo ========================================
echo.

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip/api"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en: %WINSCP%
  pause & exit /b 1
)

echo [1/3] Conectando al servidor...
echo.

"%WINSCP%" /command ^
  "open ftp://%USER%:%PASS%@%HOST%" ^
  "cd /memoflip" ^
  "mkdir api" ^
  "cd api" ^
  "put sistema_apps_api\memoflip\save_progress.php save_progress.php" ^
  "put config_db_temp.php config_db.php" ^
  "exit"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   EXITO: Archivos subidos a /memoflip/api/
    echo ========================================
    echo.
    echo El endpoint save_progress.php esta disponible en:
    echo https://colisan.com/sistema_apps_upload/memoflip/api/save_progress.php
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR: No se pudo subir el archivo
    echo ========================================
    echo.
)

pause

