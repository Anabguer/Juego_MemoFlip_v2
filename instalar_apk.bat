@echo off
echo ========================================
echo   INSTALAR MEMOFLIP EN TU MOVIL
echo ========================================
echo.
echo Asegurate de que tu movil este:
echo - Conectado por USB
echo - Depuracion USB activada
echo.
pause

echo.
echo Instalando APK...
adb install -r android\app\build\outputs\apk\debug\app-debug.apk

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   APK INSTALADA CON EXITO!
    echo ========================================
    echo.
    echo Abre MemoFlip en tu movil
) else (
    echo.
    echo ========================================
    echo   ERROR AL INSTALAR
    echo ========================================
    echo.
    echo Verifica:
    echo 1. El movil esta conectado: adb devices
    echo 2. Depuracion USB esta activa
    echo 3. Has aceptado el dialogo de confianza
    echo.
    echo Si sigue fallando, desinstala la version anterior:
    echo    adb uninstall com.memoflip.app
)

echo.
pause


