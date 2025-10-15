@echo off
setlocal

REM ====== SUBIR ARCHIVOS A /memoflip/ (carpeta existente) ======
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "LOCAL=C:\Proyectos\MemoFlip\ParaBorrar\para_hostalia_deploy\PARA_HOSTALIA\sistema_apps_upload\memoflip"

REM Ruta a WinSCP.com
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo ========================================
echo   SUBIR A /memoflip/ (carpeta existente)
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo [ERROR] WinSCP no encontrado
  pause & exit /b 1
)

echo [INFO] Subiendo archivos a %HOST%:%REMOTE%

REM Subir archivos específicos
"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "put auth.php" ^
 "put enviar_email.php" ^
 "put descargar_phpmailer.php" ^
 "put setup_verificacion.sql" ^
 "ls" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ✅ ARCHIVOS SUBIDOS CORRECTAMENTE
  echo.
  echo 🌐 URLs para probar:
  echo   https://colisan.com/memoflip/descargar_phpmailer.php
  echo   https://colisan.com/memoflip/
  echo.
) else (
  echo.
  echo ❌ ERROR EN LA SUBIDA
  echo.
)

pause
