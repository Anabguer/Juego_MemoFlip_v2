@echo off
echo ========================================
echo  DEPLOY MEMOFLIP - TODO A /memoflip/
echo ========================================
echo.

"C:\Program Files (x86)\WinSCP\WinSCP.com" /script=deploy_correcto.txt

echo.
echo ========================================
echo  DEPLOY COMPLETADO
echo ========================================
echo.
echo Verifica en: https://colisan.com/sistema_apps_upload/memoflip/
echo.
pause

