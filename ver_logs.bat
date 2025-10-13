@echo off
echo ========================================
echo   LOGS DE MEMOFLIP EN TIEMPO REAL
echo ========================================
echo.
echo Presiona Ctrl+C para detener
echo.
pause

C:\Users\agl03\AppData\Local\Android\Sdk\platform-tools\adb logcat -c
C:\Users\agl03\AppData\Local\Android\Sdk\platform-tools\adb logcat | findstr /i "chromium console memoflip capacitor"


