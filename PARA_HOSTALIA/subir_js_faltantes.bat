@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=memoflip/_next/static"
set "LOCAL=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip\_next\static"
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo ========================================
echo  SUBIENDO ARCHIVOS JS FALTANTES
echo ========================================
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\..\..\subida_js.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd memoflip/_next/static" ^
 "lcd %LOCAL%" ^
 "synchronize remote -mirror -criteria=size" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ========================================
  echo ✅ ARCHIVOS JS SINCRONIZADOS
  echo ========================================
  echo.
  echo Ahora vuelve a abrir:
  echo   https://colisan.com/sistema_apps_upload/memoflip/diagnostico.php
  echo.
  echo Deberia mostrar 28 archivos JS
  echo.
  echo Luego prueba:
  echo   https://colisan.com/sistema_apps_upload/memoflip/
  echo.
) else (
  echo ❌ ERROR - Revisa subida_js.log
)

pause

