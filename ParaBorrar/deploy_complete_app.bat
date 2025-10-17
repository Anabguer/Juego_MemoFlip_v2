@echo off
echo 🚀 Subiendo aplicación completa de MemoFlip...
echo 📁 Local: C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip
echo 📁 Remote: /sistema_apps_upload/memoflip

"C:\Program Files (x86)\WinSCP\WinSCP.exe" /command ^
"open ftp://sistema_apps_user:GestionUploadSistemaApps!@82.194.68.83" ^
"put PARA_HOSTALIA\sistema_apps_upload\memoflip\index.html /sistema_apps_upload/memoflip/index.html" ^
"put PARA_HOSTALIA\sistema_apps_upload\memoflip\404.html /sistema_apps_upload/memoflip/404.html" ^
"put PARA_HOSTALIA\sistema_apps_upload\memoflip\levels.json /sistema_apps_upload/memoflip/levels.json" ^
"put PARA_HOSTALIA\sistema_apps_upload\memoflip\logo.png /sistema_apps_upload/memoflip/logo.png" ^
"put PARA_HOSTALIA\sistema_apps_upload\memoflip\logo_opt.png /sistema_apps_upload/memoflip/logo_opt.png" ^
"close" ^
"exit"

echo.
echo ✅ Archivos principales subidos
echo 🌐 URL: https://colisan.com/sistema_apps_upload/memoflip/
echo.
pause
