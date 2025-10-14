@echo off
set "WINSCP=C:\Users\agl03\AppData\Local\Programs\WinSCP\WinSCP.com"
"%WINSCP%" /ini=nul /command ^
 "open ftps://sistema_apps_user:GestionUploadSistemaApps!@82.194.68.83/ -explicit -certificate=*" ^
 "option batch on" ^
 "option confirm off" ^
 "cd /memoflip" ^
 "put sistema_apps_upload\memoflip_static\auth.php auth.php" ^
 "exit"
echo auth.php subido
pause

