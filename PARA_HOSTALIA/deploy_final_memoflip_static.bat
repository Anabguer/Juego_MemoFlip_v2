@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "LOCAL=C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip_static"
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo ========================================
echo  DEPLOY FINAL MEMOFLIP_STATIC (SIN RSC)
echo ========================================
echo.
echo Subiendo version SPA estatica pura...
echo.

"%WINSCP%" /ini=nul /log:"%LOCAL%\..\deploy_final.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "rmdir memoflip_static" ^
 "mkdir memoflip_static" ^
 "cd memoflip_static" ^
 "lcd %LOCAL%" ^
 "put -transfer=binary index.html" ^
 "put -transfer=binary manifest.json" ^
 "put -transfer=binary .htaccess" ^
 "put -transfer=binary favicon.ico" ^
 "put -transfer=binary logo.png" ^
 "put -transfer=binary *.php" ^
 "put -transfer=binary *.html" ^
 "synchronize remote -mirror -criteria=size -filemask=""|*.txt;*.md;*.log""" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ========================================
  echo DEPLOY COMPLETADO
  echo ========================================
  echo.
  echo Juego en:
  echo   https://colisan.com/sistema_apps_upload/memoflip_static/
  echo.
  echo Diagnostico:
  echo   https://colisan.com/sistema_apps_upload/memoflip_static/diagnostico_completo.php
  echo.
  echo IMPORTANTE: Abre la consola (F12) y verifica:
  echo   - NO debe aparecer "Connection closed"
  echo   - Todos los _next/static/ deben dar 200 OK
  echo   - NO debe haber trafico a ?__rsc
  echo.
)

pause

