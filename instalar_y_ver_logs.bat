@echo off
echo ========================================
echo   INSTALAR APK Y VER LOGS
echo ========================================
echo.

set ADB=C:\Users\agl03\AppData\Local\Android\Sdk\platform-tools\adb

echo Esperando dispositivo...
%ADB% wait-for-device

echo.
echo Instalando APK...
%ADB% install -r android\app\build\outputs\apk\debug\app-debug.apk

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ APK instalada!
    echo.
    echo Abriendo MemoFlip en el movil...
    %ADB% shell am start -n com.memoflip.app/.MainActivity
    
    echo.
    echo ========================================
    echo   LOGS EN TIEMPO REAL
    echo   Presiona Ctrl+C para detener
    echo ========================================
    echo.
    
    %ADB% logcat -c
    %ADB% logcat | findstr /i "chromium console memoflip"
) else (
    echo.
    echo ❌ Error instalando APK
)


