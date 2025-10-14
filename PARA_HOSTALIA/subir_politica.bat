@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

cd /d "%~dp0"

echo ========================================
echo  SUBIR POLITICA DE PRIVACIDAD
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo ERROR: No encuentro WinSCP.com
  pause & exit /b 1
)

echo Subiendo politica_privacidad_memoflip.html...
echo.

"%WINSCP%" /command ^
  "open ftp://%USER%:%PASS%@%HOST%/" ^
  "cd %REMOTE%" ^
  "put politica_privacidad_memoflip.html" ^
  "exit"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUBIDA COMPLETADA
    echo ========================================
    echo.
    echo La politica esta disponible en:
    echo.
    echo  https://colisan.com/sistema_apps_upload/memoflip/politica_privacidad_memoflip.html
    echo.
    echo COPIA ESTA URL para Google Play Console.
    echo.
) else (
    echo.
    echo ERROR: No se pudo subir
    echo.
)

pause

