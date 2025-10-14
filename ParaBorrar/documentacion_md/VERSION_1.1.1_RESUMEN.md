# 📦 MemoFlip v1.1.1 (versionCode 12) - RESUMEN COMPLETO

## ✅ CORRECCIONES APLICADAS

### 1. Configuración de Capacitor (capacitor.config.ts)
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const isDev = process.env.CAP_DEV === 'true';

const config: CapacitorConfig = {
  appId: 'com.memoflip.app',
  appName: 'MemoFlip',
  webDir: 'out',
  server: isDev
    ? { url: 'http://localhost:3000', cleartext: true }  // SOLO dev
    : { androidScheme: 'https' },                        // prod SIN url
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      showSpinner: false
    }
  }
};

export default config;
```

**✅ Producción**: `{ androidScheme: 'https' }` - SIN `url`
**✅ Desarrollo**: `{ url: 'http://localhost:3000', cleartext: true }` - Solo si `CAP_DEV=true`

---

### 2. Configuración de Next.js (next.config.js)
```javascript
/** @type {import('next').NextConfig} */
module.exports = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true
  // NO uses basePath ni assetPrefix raros
};
```

**✅ Sin `basePath`**: Eliminado
**✅ Sin `assetPrefix`**: Eliminado
**✅ Export estático**: `output: 'export'`

---

### 3. Verificación de referencias a localhost

```bash
grep -R "localhost" -n src
grep -R "http://127.0.0.1" -n src
grep -R "http://10.0.2.2" -n src
grep -R "/api/" -n src
```

**✅ Resultado**: No se encontraron referencias a `localhost` en el código fuente.

---

### 4. Build limpio ejecutado

```bash
npm run build          # ✅ Compilado exitosamente en 15.9s
npx cap sync android   # ✅ Sync finished in 0.758s
compilar_aab_google_play.bat  # ✅ BUILD SUCCESSFUL in 16s
```

**✅ AAB generado**: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🔍 VERIFICACIONES PENDIENTES

### Paso 5: Verificar capacitor.config.json en el AAB

**Acción requerida**: Abrir el AAB con Android Studio > Analyze APK y confirmar:
- Ruta: `assets/capacitor.config.json`
- **Debe contener**: `{"server":{"androidScheme":"https"}}`
- **NO debe contener**: `"url":"http://localhost:3000"`

---

### Paso 6: Verificar qué intenta abrir el WebView

**Con la app instalada, ejecutar**:
```bash
adb logcat | grep -i Capacitor
```

**Buscar una línea tipo**:
```
Capacitor: App started url: capacitor://localhost
```

**✅ Correcto**: `capacitor://localhost` o `file:///android_asset/public/index.html`
**❌ Incorrecto**: `http://localhost:3000` → aún hay un `server.url` o código que redirige.

---

### Paso 7: Log de depuración temporal

**Añadir temporalmente en `src/app/page.tsx`** (primer componente que se monta):
```typescript
useEffect(() => {
  console.log('[BOOT]', window.location.href, window.location.origin);
}, []);
```

**Inspeccionar con Chrome Remote Debugging**:
```bash
chrome://inspect
```

**Si ves `http://localhost:3000`** → es el origen del problema.

---

## 📝 NOTAS DE LA VERSIÓN (para Google Play)

```
Corrección definitiva de crash al iniciar sesión. 
La app ahora carga correctamente desde android_asset sin intentar conectar a localhost. 
Versión de prueba con anuncios de prueba de Google (banner + rewarded ads).
```

---

## 🚀 SIGUIENTE PASO

1. **Instalar la app en un dispositivo físico**:
   ```bash
   adb install android/app/build/outputs/bundle/release/app-release.aab
   ```
   (Nota: Necesitas desempaquetar el AAB o compilar un APK debug)

2. **O compilar APK debug para testing**:
   ```bash
   cd android
   ./gradlew assembleDebug
   adb install app/build/outputs/apk/debug/app-debug.apk
   ```

3. **Ejecutar logcat para verificar**:
   ```bash
   adb logcat | grep -i Capacitor
   ```

4. **Si todo funciona correctamente**: Subir AAB a Google Play Console

---

## 📂 UBICACIÓN DEL AAB FINAL

```
C:\Proyectos\MemoFlip\android\app\build\outputs\bundle\release\app-release.aab
```

**versionCode**: 12
**versionName**: 1.1.1

---

## ⚠️ TROUBLESHOOTING

Si sigue apareciendo "client-side exception while loading localhost":

1. **Desinstalar completamente la app anterior**:
   ```bash
   adb uninstall com.memoflip.app
   ```

2. **Limpiar completamente Android**:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

3. **Eliminar carpetas de build**:
   ```bash
   rm -rf .next out android/app/src/main/assets/public
   ```

4. **Rebuild completo**:
   ```bash
   npm run build
   npx cap sync android
   cd android
   ./gradlew bundleRelease
   ```

5. **Verificar que el archivo `out/index.html` se puede abrir en el navegador** (doble click) sin errores.

---

## 🎯 ESTADO ACTUAL

✅ Configuración corregida
✅ Build exitoso
✅ AAB generado
⏳ **Pendiente**: Verificación en dispositivo real con `adb logcat`

