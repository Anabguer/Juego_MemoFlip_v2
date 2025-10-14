@echo off
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "REMOTE=/memoflip"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

"%WINSCP%" /command ^
  "open ftp://%USER%:%PASS%@%HOST%" ^
  "cd %REMOTE%" ^
  "put verificar_tabla_memoflip_usuarios.php" ^
  "exit"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Archivo subido. Abre en navegador:
    echo https://colisan.com/sistema_apps_upload/memoflip/verificar_tabla_memoflip_usuarios.php
    echo.
)

pause
