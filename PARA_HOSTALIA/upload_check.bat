@echo off
"C:\Program Files (x86)\WinSCP\WinSCP.com" /command ^
  "open ftp://colisan.com_10154268:AmLg13!@ftp.colisan.com/" ^
  "cd /httpdocs/sistema_apps_upload/memoflip_static" ^
  "put sistema_apps_upload\memoflip_static\check_version.php" ^
  "exit"
echo.
echo Verifica: https://colisan.com/sistema_apps_upload/memoflip_static/check_version.php
echo.
pause

