@echo off
echo ========================================
echo  SUBIR SCRIPT DE VERIFICACION MANUAL
echo ========================================
echo.

REM Cambiar al directorio correcto
cd /d "%~dp0"

REM Subir el script PHP
echo Subiendo verificar_usuario_manual.php...
"C:\Program Files (x86)\WinSCP\WinSCP.com" ^
  /command ^
  "open ftp://colisan:Anabguer13@ftp.colisan.com/" ^
  "cd /memoflip/" ^
  "put verificar_usuario_manual.php" ^
  "exit"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUBIDA COMPLETADA
    echo ========================================
    echo.
    echo Ahora ejecuta este script desde tu navegador:
    echo.
    echo  https://colisan.com/sistema_apps_upload/memoflip/verificar_usuario_manual.php
    echo.
    echo Esto verificara tu cuenta y podras iniciar sesion.
    echo.
    echo IMPORTANTE: Despues de ejecutarlo, borra el archivo por seguridad.
    echo.
) else (
    echo.
    echo ERROR: No se pudo subir el archivo
    echo.
)

pause

