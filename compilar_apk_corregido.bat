@echo off
echo ========================================
echo   COMPILAR APK DE MEMOFLIP (CORREGIDO)
echo   Con rutas relativas para APK
echo ========================================
echo.

echo [1/4] Backup de next.config.ts...
copy next.config.ts next.config.backup.ts

echo [2/4] Usar config para APK...
copy next.config.apk.js next.config.js

echo [3/4] Build de Next.js con rutas relativas...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR en npm run build
    copy next.config.backup.ts next.config.ts
    del next.config.backup.ts
    pause
    exit /b 1
)

echo.
echo [4/4] Restaurar config original...
copy next.config.backup.ts next.config.ts
del next.config.backup.ts

echo.
echo [5/5] Sync con Capacitor...
call npx cap sync
if %ERRORLEVEL% NEQ 0 (
    echo ERROR en cap sync
    pause
    exit /b 1
)

echo.
echo [6/6] Compilando APK con Gradle...
cd android
call gradlew.bat assembleDebug
if %ERRORLEVEL% NEQ 0 (
    echo ERROR compilando APK
    cd ..
    pause
    exit /b 1
)

echo.
echo [7/7] Instalando en movil...
call gradlew.bat installDebug
if %ERRORLEVEL% NEQ 0 (
    echo ERROR instalando APK
    cd ..
    pause
    exit /b 1
)

cd ..

echo.
echo ========================================
echo   APK INSTALADA CON EXITO!
echo   Con rutas relativas corregidas
echo ========================================
echo.
pause


