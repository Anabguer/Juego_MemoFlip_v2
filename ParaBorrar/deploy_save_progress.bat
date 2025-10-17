@echo off
echo 🔄 Subiendo save_progress.php...
echo 📁 Local: C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip\api
echo 📁 Remote: /sistema_apps_upload/memoflip/api

"C:\Program Files (x86)\WinSCP\WinSCP.exe" /command ^
"open ftp://sistema_apps_user:GestionUploadSistemaApps!@82.194.68.83" ^
"put PARA_HOSTALIA\sistema_apps_upload\memoflip\api\save_progress.php /sistema_apps_upload/memoflip/api/save_progress.php" ^
"close" ^
"exit"

echo.
echo ✅ Deploy de save_progress.php completado
echo 📄 Archivo subido: memoflip/api/save_progress.php
echo 📊 Log: C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip\deploy_save_progress.log
echo.
pause
