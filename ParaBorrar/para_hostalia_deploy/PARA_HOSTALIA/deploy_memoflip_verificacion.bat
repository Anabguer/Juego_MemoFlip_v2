@echo off
setlocal

REM ====== CONFIGURACION MEMOFLIP VERIFICACION ======
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/sistema_apps_upload/memoflip"
set "LOCAL=C:\Proyectos\MemoFlip\ParaBorrar\para_hostalia_deploy\PARA_HOSTALIA\sistema_apps_upload\memoflip"

REM Ruta a WinSCP.com (tu instalación)
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo ========================================
echo   DEPLOY MEMOFLIP VERIFICACION EMAIL
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en:
  echo        %WINSCP%
  echo Instala WinSCP o corrige la ruta WINSCP_DIR.
  pause & exit /b 1
)

if not exist "%LOCAL%" (
  echo [ERROR] No existe la carpeta local:
  echo        %LOCAL%
  pause & exit /b 1
)

echo [INFO] Subiendo "%LOCAL%" -> "%HOST%:%REMOTE%"
echo [INFO] Usando: %WINSCP%
echo.

REM --- Primero intentamos FTPS (TLS explicito). Si falla, caemos a FTP plano ---
"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_winscp.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "pwd" ^
 "lcd %LOCAL%" ^
 "ls" ^
 "put auth.php" ^
 "put enviar_email.php" ^
 "put descargar_phpmailer.php" ^
 "put setup_verificacion.sql" ^
 "ls" ^
 "exit"

set "ERR=%ERRORLEVEL%"
if not "%ERR%"=="0" (
  echo [WARN] FTPS falló (codigo %ERR%). Probando FTP plano...
  "%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_ftp.log" /command ^
   "open ftp://%USER%:%PASS%@%HOST%/" ^
   "option batch on" ^
   "option confirm off" ^
   "cd %REMOTE%" ^
   "pwd" ^
   "lcd %LOCAL%" ^
   "ls" ^
   "put auth.php" ^
   "put enviar_email.php" ^
   "put descargar_phpmailer.php" ^
   "put setup_verificacion.sql" ^
   "ls" ^
   "exit"
  set "ERR=%ERRORLEVEL%"
)

if "%ERR%"=="0" (
  echo.
  echo ========================================
  echo ✅ DEPLOY MEMOFLIP COMPLETADO
  echo ========================================
  echo.
  echo 🌐 Próximos pasos:
  echo   1. Instalar PHPMailer:
  echo      https://colisan.com/sistema_apps_upload/memoflip/descargar_phpmailer.php
  echo.
  echo   2. Ejecutar SQL en phpMyAdmin:
  echo      Contenido de setup_verificacion.sql
  echo.
  echo   3. Probar registro:
  echo      https://colisan.com/sistema_apps_upload/memoflip/
  echo.
  echo 📋 Archivos subidos:
  echo   - auth.php (REEMPLAZADO)
  echo   - enviar_email.php (NUEVO - con SMTP)
  echo   - descargar_phpmailer.php (NUEVO)
  echo   - setup_verificacion.sql (para phpMyAdmin)
  echo ========================================
) else (
  echo.
  echo ========================================
  echo ❌ ERROR EN EL DEPLOY (codigo %ERR%)
  echo ========================================
  echo.
  echo 📝 Revisa los logs:
  echo   %LOCAL%\deploy_winscp.log
  echo   %LOCAL%\deploy_ftp.log
  echo.
  echo Posibles causas:
  echo   - Credenciales incorrectas
  echo   - Firewall bloqueando FTP
  echo   - Servidor no disponible
  echo   - WinSCP no instalado correctamente
  echo.
  echo ========================================
)

echo.
pause
