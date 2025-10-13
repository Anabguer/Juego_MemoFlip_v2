@echo off
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"

echo ========================================
echo   SUBIR AUTH.PHP A RUTA CORRECTA
echo   Destino: /sistema_apps_upload/memoflip/
echo ========================================
echo.

REM Subir a la ruta correcta con sistema_apps_upload
"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "lcd C:\Proyectos\MemoFlip\PARA_HOSTALIA" ^
 "cd /sistema_apps_upload/memoflip" ^
 "put auth_standalone.php auth.php" ^
 "put enviar_email.php" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ========================================
  echo ✅ ARCHIVOS SUBIDOS CORRECTAMENTE
  echo ========================================
  echo.
  echo 📁 Ruta: /sistema_apps_upload/memoflip/
  echo    - auth.php
  echo    - enviar_email.php
  echo.
  echo 🧪 Probar:
  echo    https://colisan.com/sistema_apps_upload/memoflip/test_auth_simple.php
  echo.
) else (
  echo.
  echo ❌ ERROR al subir archivos
  echo.
)

pause

