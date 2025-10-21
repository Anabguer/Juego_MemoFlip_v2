@echo off
echo 📱 VIENDO LOGS DE LA APP
echo.

echo 📤 Mostrando logs de ReactNativeJS...
"C:\Users\agl03\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat -s ReactNativeJS:*

echo.
echo ✅ Logs mostrados
echo.
pause