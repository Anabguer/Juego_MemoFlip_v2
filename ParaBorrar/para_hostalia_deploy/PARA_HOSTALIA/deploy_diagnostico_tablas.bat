@echo off
echo ========================================
echo  SUBIR DIAGNOSTICO DE TABLAS
echo ========================================
echo.

cd /d "%~dp0"

echo Subiendo diagnosticar_tablas_memoflip.php...
"C:\Program Files (x86)\WinSCP\WinSCP.com" ^
  /command ^
  "open ftp://colisan:Anabguer13@ftp.colisan.com/" ^
  "cd /memoflip/" ^
  "put diagnosticar_tablas_memoflip.php" ^
  "exit"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo  SUBIDA COMPLETADA
    echo ========================================
    echo.
    echo Ejecuta el diagnostico desde:
    echo.
    echo  https://colisan.com/sistema_apps_upload/memoflip/diagnosticar_tablas_memoflip.php
    echo.
) else (
    echo.
    echo ERROR: No se pudo subir
    echo.
)

pause

