@echo off
setlocal

REM ====== CONFIG ====== 
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"

REM WinSCP path
set "WINSCP_DIR=C:\Users\agl03\AppData\Local\Programs\WinSCP"
set "WINSCP=%WINSCP_DIR%\WinSCP.com"

echo ========================================
echo   SUBIR TODO CON ESTRUCTURA CORRECTA
echo ========================================
echo.

if not exist "%WINSCP%" (
  echo [ERROR] No encuentro WinSCP.com en: %WINSCP%
  pause & exit /b 1
)

REM Subir todo con estructura correcta
"%WINSCP%" /ini=nul /log:"todo_estructura.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "lcd ..\out" ^
 "cd %REMOTE%" ^
 "synchronize remote -mirror -criteria=size -filemask=""|*.md;*.git*;*.backup;*.bak;node_modules/""" ^
 "ls %REMOTE%\_next\static\chunks" ^
 "exit"

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ✅ TODO SUBIDO CON ESTRUCTURA CORRECTA
  echo Abre: https://colisan.com/sistema_apps_upload/memoflip/
) else (
  echo.
  echo ❌ Error subiendo todo (codigo %ERRORLEVEL%)
  echo Revisa log: todo_estructura.log
)

echo.
pause

