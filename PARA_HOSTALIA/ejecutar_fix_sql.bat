@echo off
echo ========================================
echo   EJECUTANDO AJUSTES EN MEMOFLIP_USUARIOS
echo ========================================
echo.
echo Esto va a:
echo   1. Cambiar vidas de 5 a 3 por defecto
echo   2. Añadir campo total_score
echo   3. Actualizar usuarios existentes
echo.
pause

echo Ejecutando SQL...
mysql -h 82.194.68.83 -u sistema_apps_user -p'GestionUploadSistemaApps!' sistema_apps < fix_memoflip_usuarios.sql

if "%ERRORLEVEL%"=="0" (
  echo.
  echo ✅ AJUSTES COMPLETADOS
  echo Ahora prueba el registro de nuevo
) else (
  echo.
  echo ❌ ERROR EN SQL
  echo Revisa la conexión
)

echo.
pause

