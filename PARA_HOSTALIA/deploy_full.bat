@echo off
echo ========================================
echo  DEPLOY COMPLETO - MemoFlip Auth
echo ========================================
echo.
echo Subiendo frontend y backend...
echo.

"C:\Program Files (x86)\WinSCP\WinSCP.com" /script=deploy_full_winscp.txt

echo.
echo ========================================
echo  DEPLOY COMPLETADO
echo ========================================
echo.
echo Verifica en: https://colisan.com/sistema_apps_upload/memoflip_static/
echo.
pause

