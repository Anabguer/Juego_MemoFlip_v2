@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=memoflip"
set "LOCAL=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR\WinSCP.com"

echo ========================================
echo  REEMPLAZANDO INDEX.HTML
echo ========================================
echo.

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "cd %REMOTE%" ^
 "mv index.html index_nextjs_original.html" ^
 "lcd %LOCAL%" ^
 "put index_estatico.html" ^
 "mv index_estatico.html index.html" ^
 "ls" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ========================================
  echo ✅ INDEX.HTML REEMPLAZADO
  echo ========================================
  echo.
  echo El index.html original se respaldo como:
  echo   index_nextjs_original.html
  echo.
  echo El nuevo index.html estatico esta activo.
  echo.
  echo 🎮 PRUEBA AHORA:
  echo   https://colisan.com/sistema_apps_upload/memoflip/
  echo.
)

pause

