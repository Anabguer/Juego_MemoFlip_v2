@echo off
echo ========================================
echo    DEPLOY PHPMailer - MEMOFLIP
echo ========================================
echo.

echo [1/4] Creando directorio PHPMailer...
echo open ftp://sistema_apps_user:GestionUploadSistemaApps!@82.194.68.83 > ftp_commands.txt
echo cd /sistema_apps_upload/memoflip >> ftp_commands.txt
echo mkdir PHPMailer >> ftp_commands.txt
echo quit >> ftp_commands.txt

ftp -s:ftp_commands.txt
del ftp_commands.txt

echo [2/4] Subiendo archivos PHPMailer...
echo open ftp://sistema_apps_user:GestionUploadSistemaApps!@82.194.68.83 > ftp_commands.txt
echo cd /sistema_apps_upload/memoflip/PHPMailer >> ftp_commands.txt
echo binary >> ftp_commands.txt
echo put "PARA_HOSTALIA\sistema_apps_upload\memoflip\PHPMailer\DSNConfigurator.php" >> ftp_commands.txt
echo put "PARA_HOSTALIA\sistema_apps_upload\memoflip\PHPMailer\Exception.php" >> ftp_commands.txt
echo put "PARA_HOSTALIA\sistema_apps_upload\memoflip\PHPMailer\OAuth.php" >> ftp_commands.txt
echo put "PARA_HOSTALIA\sistema_apps_upload\memoflip\PHPMailer\OAuthTokenProvider.php" >> ftp_commands.txt
echo put "PARA_HOSTALIA\sistema_apps_upload\memoflip\PHPMailer\PHPMailer.php" >> ftp_commands.txt
echo put "PARA_HOSTALIA\sistema_apps_upload\memoflip\PHPMailer\POP3.php" >> ftp_commands.txt
echo put "PARA_HOSTALIA\sistema_apps_upload\memoflip\PHPMailer\SMTP.php" >> ftp_commands.txt
echo quit >> ftp_commands.txt

ftp -s:ftp_commands.txt
del ftp_commands.txt

echo [3/4] Subiendo enviar_email.php...
echo open ftp://sistema_apps_user:GestionUploadSistemaApps!@82.194.68.83 > ftp_commands.txt
echo cd /sistema_apps_upload/memoflip >> ftp_commands.txt
echo binary >> ftp_commands.txt
echo put "PARA_HOSTALIA\sistema_apps_upload\memoflip\enviar_email.php" >> ftp_commands.txt
echo quit >> ftp_commands.txt

ftp -s:ftp_commands.txt
del ftp_commands.txt

echo [4/4] Subiendo test_phpmailer.php...
echo open ftp://sistema_apps_user:GestionUploadSistemaApps!@82.194.68.83 > ftp_commands.txt
echo cd /sistema_apps_upload/memoflip >> ftp_commands.txt
echo binary >> ftp_commands.txt
echo put "PARA_HOSTALIA\sistema_apps_upload\memoflip\test_phpmailer.php" >> ftp_commands.txt
echo quit >> ftp_commands.txt

ftp -s:ftp_commands.txt
del ftp_commands.txt

echo.
echo ✅ DEPLOY PHPMailer COMPLETADO
echo.
echo 📧 Sistema de correo actualizado con PHPMailer
echo 🔧 Configuración: smtp.colisan.com
echo 📁 Archivos: PHPMailer/ + enviar_email.php
echo 🧪 Test: https://colisan.com/sistema_apps_upload/memoflip/test_phpmailer.php
echo.
pause




