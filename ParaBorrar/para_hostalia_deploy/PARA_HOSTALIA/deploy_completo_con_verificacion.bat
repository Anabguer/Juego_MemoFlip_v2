@echo off
setlocal

REM ====== CONFIG ====== 
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "REMOTE_API=/sistema_apps_api/memoflip"
set "LOCAL_BUILD=C:\Proyectos\MemoFlip\out"
set "LOCAL_API=C:\Proyectos\MemoFlip\api"
set "LOCAL_SETUP=C:\Proyectos\MemoFlip\PARA_HOSTALIA"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

echo ========================================
echo   DEPLOY COMPLETO MEMOFLIP
echo   Con sistema de verificacion de email
echo ========================================
echo.

REM Verificar que existe el build
if not exist "%LOCAL_BUILD%" (
  echo [ERROR] No existe la carpeta de build: %LOCAL_BUILD%
  echo [INFO] Ejecuta primero: npm run build
  pause & exit /b 1
)

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en: %WINSCP%
  pause & exit /b 1
)

echo [1/3] Subiendo BUILD de React...
echo.

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "lcd %LOCAL_BUILD%" ^
 "mkdir %REMOTE%" ^
 "cd %REMOTE%" ^
 "synchronize remote -mirror -criteria=size" ^
 "exit"

set "ERR=%ERRORLEVEL%"

if not "%ERR%"=="0" (
  echo [WARN] FTPS fallo. Probando FTP plano...
  "%WINSCP%" /ini=nul /command ^
   "open ftp://%USER%:%PASS%@%HOST%/" ^
   "option batch on" ^
   "option confirm off" ^
   "lcd %LOCAL_BUILD%" ^
   "mkdir %REMOTE%" ^
   "cd %REMOTE%" ^
   "synchronize remote -mirror -criteria=size" ^
   "exit"
  set "ERR=%ERRORLEVEL%"
)

if not "%ERR%"=="0" (
  echo [ERROR] Fallo al subir build de React
  pause & exit /b 1
)

echo ✅ Build de React subido
echo.

REM ====== SUBIR ARCHIVOS PHP DE API ======
echo [2/3] Subiendo archivos PHP de API...
echo.

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "lcd %LOCAL_API%" ^
 "cd %REMOTE_API%" ^
 "put memoflip-auth-verificacion.php auth.php" ^
 "put enviar_email.php" ^
 "exit"

if not "%ERRORLEVEL%"=="0" (
  echo [WARN] FTPS fallo. Probando FTP plano...
  "%WINSCP%" /ini=nul /command ^
   "open ftp://%USER%:%PASS%@%HOST%/" ^
   "option batch on" ^
   "option confirm off" ^
   "lcd %LOCAL_API%" ^
   "cd %REMOTE_API%" ^
   "put memoflip-auth-verificacion.php auth.php" ^
   "put enviar_email.php" ^
   "exit"
)

echo ✅ Archivos PHP subidos
echo.

REM ====== SUBIR SCRIPT DE SETUP ======
echo [3/3] Subiendo script de setup SQL...
echo.

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "lcd %LOCAL_SETUP%" ^
 "cd %REMOTE%" ^
 "put setup_verificacion_email.php" ^
 "exit"

if not "%ERRORLEVEL%"=="0" (
  echo [WARN] FTPS fallo. Probando FTP plano...
  "%WINSCP%" /ini=nul /command ^
   "open ftp://%USER%:%PASS%@%HOST%/" ^
   "option batch on" ^
   "option confirm off" ^
   "lcd %LOCAL_SETUP%" ^
   "cd %REMOTE%" ^
   "put setup_verificacion_email.php" ^
   "exit"
)

echo ✅ Script de setup subido
echo.

echo ========================================
echo ✅ DEPLOY COMPLETADO
echo ========================================
echo.
echo 🌐 URLs importantes:
echo.
echo   📱 App:
echo   https://colisan.com/sistema_apps_upload/memoflip/
echo.
echo   🔧 Setup (EJECUTAR UNA VEZ):
echo   https://colisan.com/sistema_apps_upload/memoflip/setup_verificacion_email.php
echo.
echo   🧪 Tests rapidos:
echo   https://colisan.com/sistema_apps_upload/memoflip/cards/card_001.png
echo   https://colisan.com/sistema_apps_upload/memoflip/sounds/acierto.mp3
echo.
echo ========================================
echo 📋 PROXIMOS PASOS:
echo ========================================
echo.
echo 1. Abre en tu navegador:
echo    https://colisan.com/sistema_apps_upload/memoflip/setup_verificacion_email.php
echo.
echo 2. Click en "EJECUTAR INSTALACION"
echo.
echo 3. Verifica que aparezca: "INSTALACION COMPLETADA EXITOSAMENTE"
echo.
echo 4. Prueba registrando un nuevo usuario
echo.
echo ========================================
echo.
pause

