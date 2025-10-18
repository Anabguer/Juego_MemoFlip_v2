@echo off
setlocal
set "HOST=82.194.68.83"
set "USER=sistema_apps_user"
set "PASS=GestionUploadSistemaApps!"
set "WINSCP=C:\Program Files (x86)\WinSCP\WinSCP.com"
set "LOCAL=%~dp0PARA_HOSTALIA\sistema_apps_upload\memoflip"
set "REMOTE=/sistema_apps_upload/memoflip"

echo ========================================
echo    DEPLOY PHPMailer - MEMOFLIP
echo ========================================
echo.

echo 🚀 Subiendo PHPMailer a Hostalia...

"%WINSCP%" /ini=nul /log:"%LOCAL%\deploy_phpmailer.log" /command ^
 "open ftps://%USER%:%PASS%@%HOST%/ -explicit -certificate=*" ^
 "cd %REMOTE%" ^
 "mkdir PHPMailer" ^
 "cd PHPMailer" ^
 "put -transfer=binary %LOCAL%\PHPMailer\DSNConfigurator.php" ^
 "put -transfer=binary %LOCAL%\PHPMailer\Exception.php" ^
 "put -transfer=binary %LOCAL%\PHPMailer\OAuth.php" ^
 "put -transfer=binary %LOCAL%\PHPMailer\OAuthTokenProvider.php" ^
 "put -transfer=binary %LOCAL%\PHPMailer\PHPMailer.php" ^
 "put -transfer=binary %LOCAL%\PHPMailer\POP3.php" ^
 "put -transfer=binary %LOCAL%\PHPMailer\SMTP.php" ^
 "cd .." ^
 "put -transfer=binary %LOCAL%\enviar_email.php" ^
 "put -transfer=binary %LOCAL%\test_phpmailer.php" ^
 "ls PHPMailer" ^
 "exit"

if %errorlevel% neq 0 (
    echo ❌ Error en el deployment
    echo Revisa el log: %LOCAL%\deploy_phpmailer.log
    pause
    exit /b 1
)

echo.
echo ✅ DEPLOY PHPMailer COMPLETADO
echo.
echo 📧 Sistema de correo actualizado con PHPMailer
echo 🔧 Configuración: smtp.colisan.com
echo 📁 Archivos: PHPMailer/ + enviar_email.php
echo 🧪 Test: https://colisan.com/sistema_apps_upload/memoflip/test_phpmailer.php
echo.
pause
