@echo off
setlocal

REM ====== CONFIGURACION MEMOFLIP ======
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/sistema_apps_upload/memoflip"
set "LOCAL=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip"

REM Ruta a WinSCP.com (tu instalación)
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo ========================================
echo     DEPLOY MEMOFLIP con WinSCP
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
echo [INFO] Esto puede tardar varios minutos...
echo        - 117 cartas PNG (~167 MB)
echo        - 6 sonidos MP3 (~4 MB)
echo        - 28 archivos JavaScript (~1.7 MB)
echo        - Total: ~175 MB
echo.

REM --- Primero intentamos FTPS (TLS explicito). Si falla, caemos a FTP plano ---
"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_winscp.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd /sistema_apps_upload" ^
 "mkdir memoflip" ^
 "cd %REMOTE%" ^
 "pwd" ^
 "lcd %LOCAL%" ^
 "ls" ^
 "synchronize remote -mirror -criteria=size -filemask=""|*.md;*.git*;*.backup;*.bak;*.example;*.txt""" ^
 "exit"

set "ERR=%ERRORLEVEL%"
if not "%ERR%"=="0" (
  echo [WARN] FTPS falló (codigo %ERR%). Probando FTP plano...
  "%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_ftp.log" /command ^
   "open ftp://%USER%:%PASS%@%HOST%/" ^
   "option batch on" ^
   "option confirm off" ^
   "cd /sistema_apps_upload" ^
   "mkdir memoflip" ^
   "cd %REMOTE%" ^
   "pwd" ^
   "lcd %LOCAL%" ^
   "ls" ^
   "synchronize remote -mirror -criteria=size -filemask=""|*.md;*.git*;*.backup;*.bak;*.example;*.txt""" ^
   "exit"
  set "ERR=%ERRORLEVEL%"
)

if "%ERR%"=="0" (
  echo.
  echo ========================================
  echo ✅ DEPLOY MEMOFLIP COMPLETADO
  echo ========================================
  echo.
  echo 🎮 Comprueba el juego:
  echo   https://colisan.com/sistema_apps_upload/memoflip/
  echo.
  echo 🧪 Tests de verificación:
  echo   https://colisan.com/sistema_apps_upload/memoflip/test_assets.html
  echo   https://colisan.com/sistema_apps_upload/memoflip/test_auth.html
  echo.
  echo 🔌 Endpoints API:
  echo   https://colisan.com/sistema_apps_upload/memoflip/auth.php?action=check_session
  echo   https://colisan.com/sistema_apps_upload/memoflip/ranking.php?action=global^&limit=10
  echo.
  echo 📊 Archivos subidos:
  echo   - 159 archivos (~175 MB)
  echo   - 117 cartas PNG
  echo   - 6 sonidos MP3
  echo   - 28 JavaScript bundles
  echo   - 3 endpoints PHP (auth, game, ranking)
  echo.
  echo 📋 Desde carpeta local:
  echo   %LOCAL%
  echo.
  echo ========================================
  echo 🔐 SIGUIENTE PASO: Verificar sesiones
  echo ========================================
  echo.
  echo 1. Abre: https://colisan.com/sistema_apps_upload/memoflip/test_auth.html
  echo 2. Registra un usuario de prueba
  echo 3. Verifica que aparezca la cookie PHPSESSID
  echo 4. Prueba login y sesión
  echo 5. Juega nivel 1 completo en: https://colisan.com/sistema_apps_upload/memoflip/
  echo.
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
  echo   - Espacio insuficiente (se necesitan ~175 MB)
  echo.
  echo ========================================
)

echo.
pause

