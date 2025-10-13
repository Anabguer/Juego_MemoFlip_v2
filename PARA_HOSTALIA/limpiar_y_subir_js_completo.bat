@echo off
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
echo ========================================
echo   LIMPIANDO Y SUBIENDO JS COMPLETO
echo ========================================
echo.
"%WINSCP%" /ini=nul /command ^
 "open ftps://sistema_apps_user:GestionUploadSistemaApps!@82.194.68.83/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd /memoflip" ^
 "rm _nextstatic*" ^
 "mkdir _next\static\css" ^
 "mkdir _next\static\chunks" ^
 "mkdir _next\static\chunks\pages" ^
 "lcd sistema_apps_upload\memoflip_static" ^
 "put -transfer=binary _next\static\css\*.css _next\static\css\" ^
 "put -transfer=binary _next\static\chunks\*.js _next\static\chunks\" ^
 "put -transfer=binary _next\static\chunks\pages\*.js _next\static\chunks\pages\" ^
 "exit"
echo.
echo ✅ JS COMPLETO SUBIDO
pause

