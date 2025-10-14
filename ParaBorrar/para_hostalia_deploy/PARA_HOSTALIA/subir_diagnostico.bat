@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

cd /d "%~dp0"

echo ========================================
echo  SUBIR DIAGNOSTICO DE TABLAS
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo ERROR: No encuentro WinSCP.com
  pause & exit /b 1
)

echo Subiendo diagnosticar_tablas_memoflip.php...
echo.

"%WINSCP%" /command ^
  "open ftp://%USER%:%PASS%@%HOST%/" ^
  "cd %REMOTE%" ^
  "put diagnosticar_tablas_memoflip.php" ^
  "exit"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUBIDA COMPLETADA
    echo ========================================
    echo.
    echo Abre esta URL en tu navegador:
    echo.
    echo  https://colisan.com/sistema_apps_upload/memoflip/diagnosticar_tablas_memoflip.php
    echo.
    echo Copia y pega TODA la salida aqui.
    echo.
) else (
    echo.
    echo ERROR: No se pudo subir
    echo.
)

pause

