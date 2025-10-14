@echo off
echo ========================================
echo  SUBIENDO MEMOFLIP A HOSTALIA
echo ========================================
echo.

"C:\Program Files (x86)\WinSCP\WinSCP.com" ^
  /command ^
  "open ftp://colisan.com_10154268:AmLg13!@ftp.colisan.com/" ^
  "cd /httpdocs/sistema_apps_upload/memoflip_static" ^
  "lcd PARA_HOSTALIA\sistema_apps_upload\memoflip_static" ^
  "put index.html" ^
  "put 404.html" ^
  "put logo.png" ^
  "synchronize remote -delete _next _next" ^
  "cd /httpdocs/sistema_apps_upload/memoflip" ^
  "lcd ..\memoflip" ^
  "put auth.php" ^
  "exit"

echo.
echo ========================================
echo  SUBIDA COMPLETADA
echo ========================================
echo.
echo Verifica: https://colisan.com/sistema_apps_upload/memoflip_static/
echo.
pause

