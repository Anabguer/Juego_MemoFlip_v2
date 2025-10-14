@echo off
echo ========================================
echo   COPIAR APK AL ESCRITORIO
echo ========================================
echo.

copy "android\app\build\outputs\apk\debug\app-debug.apk" "%USERPROFILE%\Desktop\MemoFlip.apk"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ APK copiada al escritorio: MemoFlip.apk
    echo.
    echo Ahora puedes:
    echo 1. Enviarla a tu movil por WhatsApp/Telegram
    echo 2. Copiarla por USB
    echo 3. Subirla a Google Drive
    echo.
    echo Luego instalala en tu movil
) else (
    echo.
    echo ❌ Error copiando APK
)

pause

