@echo off
echo ========================================
echo   COMPILAR APK DE MEMOFLIP
echo ========================================
echo.

echo [1/3] Build de Next.js...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR en npm run build
    pause
    exit /b 1
)

echo.
echo [2/3] Sync con Capacitor...
call npx cap sync
if %ERRORLEVEL% NEQ 0 (
    echo ERROR en cap sync
    pause
    exit /b 1
)

echo.
echo [3/3] Compilando APK con Gradle...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo ERROR compilando APK
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo   APK COMPILADA EXITOSAMENTE!
echo ========================================
echo.
echo Ubicacion: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo Para instalar en el movil:
echo 1. Conecta el movil por USB
echo 2. Ejecuta: adb install -r android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo O arrastra el archivo APK directamente al movil
echo.
pause


