@echo off
echo ========================================
echo   SUBIR config_db.php A HOSTALIA
echo ========================================
echo.
echo IMPORTANTE: Este archivo contiene las credenciales de la base de datos
echo.

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

REM Crear config_db.php temporal con las credenciales correctas
echo ^<?php > config_db_temp.php
echo // Configuracion de Base de Datos para MemoFlip >> config_db_temp.php
echo define('DB_HOST', 'PMYSQL165.dns-servicio.com'); >> config_db_temp.php
echo define('DB_USER', 'sistema_apps_user'); >> config_db_temp.php
echo define('DB_PASS', 'GestionUploadSistemaApps!'); >> config_db_temp.php
echo define('DB_NAME', '9606966_sistema_apps_db'); >> config_db_temp.php

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en: %WINSCP%
  pause & exit /b 1
)

echo [1/2] Conectando al servidor...
echo.

"%WINSCP%" /command ^
  "open ftp://%USER%:%PASS%@%HOST%" ^
  "cd %REMOTE%" ^
  "put config_db_temp.php config_db.php" ^
  "exit"

REM Eliminar archivo temporal
del config_db_temp.php

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   EXITO: config_db.php subido
    echo ========================================
    echo.
) else (
    echo.
    echo ========================================
    echo   ERROR: No se pudo subir el archivo
    echo ========================================
    echo.
)

pause

