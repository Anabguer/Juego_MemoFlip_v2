@echo off
echo 🔍 DESPLIEGUE CON LOGS DE DIAGNÓSTICO
echo.

echo 📤 Subiendo archivos con logs de diagnóstico...
"C:\Program Files (x86)\WinSCP\WinSCP.exe" /command ^
    "open ftps://colisan.com:21 -hostkey=""ssh-rsa 2048 8e:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f:8a:4f""" ^
    "cd /sistema_apps_upload/memoflip" ^
    "put out\*.html" ^
    "put out\_next\static\**" ^
    "exit"

echo.
echo ✅ Archivos subidos con logs de diagnóstico
echo 🎯 LOGS AGREGADOS:
echo    - 🔴 BOTÓN LOGOUT: Click detectado
echo    - 🔴 LOGOUT: Iniciando proceso de logout...
echo    - 🔴 LOGOUT: Llamando al backend...
echo    - 🔴 LOGOUT: Respuesta del backend: [data]
echo    - 🔴 LOGOUT: Error al cerrar sesión: [error]
echo.
echo 🧪 INSTRUCCIONES PARA TESTING:
echo    1. Abrir la app en el navegador
echo    2. Hacer login
echo    3. Abrir DevTools (F12) → Console
echo    4. Hacer click en "Salir"
echo    5. Verificar qué logs aparecen
echo.
pause
