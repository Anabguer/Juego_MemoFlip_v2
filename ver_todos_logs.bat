@echo off
echo 📱 VIENDO TODOS LOS LOGS
echo.

echo 📤 Mostrando todos los logs de la app...
"C:\Users\agl03\AppData\Local\Android\Sdk\platform-tools\adb.exe" logcat -s ReactNativeJS:* -s System.out:* -s MemoFlip:* | head -100

echo.
echo ✅ Logs mostrados
echo.
pause


