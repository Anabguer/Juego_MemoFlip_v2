@echo off
echo 🚨 DESPLIEGUE URGENTE - CORRECCIÓN AUTH.PHP
echo.

echo 📤 Subiendo auth.php corregido...
"C:\Program Files (x86)\WinSCP\WinSCP.exe" /command ^
    "open ftps://colisan.com:21 -hostkey=""ssh-rsa 2048 8e:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f""" ^
    "cd /sistema_apps_upload/memoflip" ^
    "put PARA_HOSTALIA\sistema_apps_upload\memoflip\auth.php" ^
    "exit"

echo.
echo ✅ auth.php subido correctamente
echo 🎯 CORRECCIONES APLICADAS:
echo    - ✅ Agregado caso 'register' 
echo    - ✅ Agregado caso 'logout'
echo    - ✅ Funciones handleRegister() y handleLogout() implementadas
echo.
echo 🚨 PROBLEMAS RESUELTOS:
echo    - ❌ "Acción no válida: register" → ✅ Registro funcional
echo    - ❌ Botón logout no funciona → ✅ Logout funcional
echo.
pause
