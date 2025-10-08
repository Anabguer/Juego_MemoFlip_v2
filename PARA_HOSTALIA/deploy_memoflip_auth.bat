@echo off
echo ========================================
echo  DEPLOY MEMOFLIP - Sistema de Usuario
echo ========================================
echo.

"C:\Program Files (x86)\WinSCP\WinSCP.com" /script=deploy_memoflip_auth_winscp.txt

echo.
echo ========================================
echo  DEPLOY COMPLETADO
echo ========================================
echo.
echo Verifica en: https://colisan.com/sistema_apps_upload/memoflip_static/
echo.
pause

