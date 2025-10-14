@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

cd /d "%~dp0"

echo ========================================
echo  SUBIR SCRIPT DE LIMPIEZA DE TABLAS
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo ERROR: No encuentro WinSCP.com
  pause & exit /b 1
)

echo Subiendo limpiar_tablas_vacias.php...
echo.

"%WINSCP%" /command ^
  "open ftp://%USER%:%PASS%@%HOST%/" ^
  "cd %REMOTE%" ^
  "put limpiar_tablas_vacias.php" ^
  "exit"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUBIDA COMPLETADA
    echo ========================================
    echo.
    echo Abre esta URL en tu navegador:
    echo.
    echo  https://colisan.com/sistema_apps_upload/memoflip/limpiar_tablas_vacias.php
    echo.
    echo ⚠️  IMPORTANTE: Despues de ejecutarlo, ELIMINA el archivo del servidor.
    echo.
) else (
    echo.
    echo ERROR: No se pudo subir
    echo.
)

pause

