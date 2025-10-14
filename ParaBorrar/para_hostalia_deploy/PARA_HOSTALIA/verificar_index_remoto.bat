@echo off
setlocal

set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

echo Descargando index.html del servidor...

"%WINSCP%" /ini=nul /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd %REMOTE%" ^
 "get index.html C:\Proyectos\MemoFlip\PARA_HOSTALIA\index_from_server.html" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ✅ Descargado a: PARA_HOSTALIA\index_from_server.html
  echo Verifica qué buildId tiene
) else (
  echo ❌ Error descargando
)

pause


