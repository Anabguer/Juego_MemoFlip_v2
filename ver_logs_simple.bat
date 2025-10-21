@echo off
echo 📱 VIENDO LOGS SIMPLES
echo.

echo 📤 Mostrando logs de la app...
"C:\Users\agl03\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat -s ReactNativeJS:*

echo.
echo ✅ Logs mostrados
echo.
pause


