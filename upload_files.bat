@echo off
echo Subiendo archivos de autenticacion...

"C:\Program Files\WinSCP\WinSCP.com" /command ^
    "open ftp://9606966:Colisan2024!@colisan.com" ^
    "cd /sistema_apps_upload/memoflip" ^
    "put PARA_HOSTALIA\sistema_apps_upload\memoflip\auth.php" ^
    "put PARA_HOSTALIA\sistema_apps_upload\memoflip\setup_usuarios_aplicaciones.php" ^
    "put PARA_HOSTALIA\sistema_apps_upload\memoflip\ranking.php" ^
    "exit"

echo Archivos subidos!
pause
