@echo off
echo ========================================
echo   SUBIR save_progress.php A HOSTALIA
echo ========================================
echo.
echo Este script sube el archivo save_progress.php al servidor
echo.

set FTP_HOST=colisan.com
set FTP_USER=colisan
set FTP_PASS=Lugati67
set REMOTE_DIR=/memoflip/

echo [1/2] Conectando al servidor...
echo.

(
echo open %FTP_HOST%
echo %FTP_USER%
echo %FTP_PASS%
echo cd %REMOTE_DIR%
echo binary
echo put PARA_HOSTALIA\sistema_apps_api\memoflip\save_progress.php save_progress.php
echo bye
) | ftp -n -s:-

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

