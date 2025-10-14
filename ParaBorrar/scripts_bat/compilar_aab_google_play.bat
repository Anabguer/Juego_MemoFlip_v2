@echo off
echo ========================================
echo   COMPILAR AAB FIRMADO PARA GOOGLE PLAY
echo ========================================
echo.

echo [1/4] Verificando keystore...
if not exist memoflip-release.keystore (
    echo ERROR: No se encuentra memoflip-release.keystore
    echo Ejecuta primero generar_keystore.bat
    pause
    exit /b 1
)

echo [2/4] Verificando configuracion de firma...
if not exist android\app\key.properties (
    echo ERROR: No se encuentra android\app\key.properties
    echo Configura tu contraseña en ese archivo
    pause
    exit /b 1
)

echo [3/4] Compilando AAB firmado...
cd android
gradlew.bat bundleRelease
cd ..

echo.
echo [4/4] Verificando AAB...
if exist android\app\build\outputs\bundle\release\app-release.aab (
    echo ========================================
    echo   AAB CREADO CORRECTAMENTE
    echo   Ubicacion: android\app\build\outputs\bundle\release\app-release.aab
    echo.
    echo   Este archivo lo subiras a Google Play Console
    echo ========================================
    explorer android\app\build\outputs\bundle\release\
) else (
    echo ERROR: No se pudo crear el AAB
    echo Revisa los errores anteriores
)
pause
