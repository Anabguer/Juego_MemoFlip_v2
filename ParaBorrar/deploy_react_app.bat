@echo off
echo 🚀 Subiendo aplicación React/Next.js actualizada...
echo 📁 Local: C:\Proyectos\MemoFlip\out
echo 📁 Remote: /sistema_apps_upload/memoflip

"C:\Program Files (x86)\WinSCP\WinSCP.exe" /command ^
"open ftp://sistema_apps_user:GestionUploadSistemaApps!@82.194.68.83" ^
"put -transfer=binary out\* /sistema_apps_upload/memoflip/" ^
"close" ^
"exit"

echo.
echo ✅ Deploy de aplicación React completado
echo 📄 Archivos subidos: index.html, _next/, cards/, sounds/, etc.
echo 🌐 URL: https://colisan.com/sistema_apps_upload/memoflip/
echo.
pause
