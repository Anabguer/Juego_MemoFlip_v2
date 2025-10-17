@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"

echo 🗑️ Borrando game.php que causó problemas...
echo.

"%WINSCP%" /ini=nul /log:"borrar_game_php.log" /command ^
"open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
"option batch on" ^
"option confirm off" ^
"cd /sistema_apps_upload/memoflip" ^
"rm game.php" ^
"exit"

echo.
echo ✅ game.php borrado del servidor
echo 📊 Log: borrar_game_php.log
echo.
pause

