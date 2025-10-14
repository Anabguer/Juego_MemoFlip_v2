@echo off
echo ========================================
echo   GENERAR KEYSTORE PARA MEMOFLIP
echo   (Firma digital de Google Play)
echo ========================================
echo.
echo IMPORTANTE: Apunta bien la contraseña que pongas.
echo La necesitarás para cada actualización de la app.
echo.
echo Te pedirá:
echo   1. Contraseña del keystore (min 6 caracteres)
echo   2. Tu nombre completo
echo   3. Organización (ej: Intocables13)
echo   4. Ciudad
echo   5. Provincia/Estado
echo   6. Código país (ES para España)
echo.
pause

keytool -genkey -v -keystore memoflip-release.keystore -alias memoflip -keyalg RSA -keysize 2048 -validity 10000

echo.
echo ========================================
if exist memoflip-release.keystore (
    echo   KEYSTORE CREADO CORRECTAMENTE
    echo   Ubicación: %cd%\memoflip-release.keystore
    echo.
    echo   GUARDA ESTE ARCHIVO EN LUGAR SEGURO
    echo   y APUNTA LA CONTRASEÑA
) else (
    echo   ERROR: No se pudo crear el keystore
)
echo ========================================
pause

