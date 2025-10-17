@echo off
echo 🔍 Subiendo diagnóstico web completo...
echo 📁 Local: C:\Proyectos\MemoFlip\PARA_HOSTALIA\sistema_apps_upload\memoflip
echo 📁 Remote: /sistema_apps_upload/memoflip

echo.
echo Conectando con 82.194.68.83...
sftp -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL -o LogLevel=ERROR -b - sistema_apps_user@82.194.68.83 << EOF
cd /sistema_apps_upload/memoflip
put diagnostico_web.php
put diagnostico_urgente.php
put test_final_simple.php
put test_endpoints_final.php
put test_directo_final.php
quit
EOF

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ Deploy del diagnóstico web completado
    echo 📄 Archivos subidos:
    echo    - diagnostico_web.php
    echo    - diagnostico_urgente.php
    echo    - test_final_simple.php
    echo    - test_endpoints_final.php
    echo    - test_directo_final.php
    echo.
    echo 🌐 URL PRINCIPAL: https://colisan.com/sistema_apps_upload/memoflip/diagnostico_web.php
    echo 🔧 URL DIAGNÓSTICO: https://colisan.com/sistema_apps_upload/memoflip/diagnostico_urgente.php
    echo.
) else (
    echo ❌ Error en el deploy
)

pause
