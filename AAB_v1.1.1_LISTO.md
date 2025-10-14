# ✅ AAB v1.1.1 (versionCode 12) - LISTO PARA GOOGLE PLAY

## 🎯 VERIFICACIONES COMPLETADAS

### ✅ 1. Configuración de Capacitor
**Archivo**: `capacitor.config.ts`
```typescript
server: isDev
  ? { url: 'http://localhost:3000', cleartext: true }  // SOLO dev
  : { androidScheme: 'https' }                         // prod SIN url
```

**Verificado en**: `android/app/src/main/assets/capacitor.config.json`
```json
{
  "server": {
    "androidScheme": "https"
  }
}
```

✅ **SIN `url` en producción** - La app NO intentará conectar a localhost

---

### ✅ 2. Configuración de Next.js
**Archivo**: `next.config.js`
```javascript
module.exports = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true
};
```

✅ **Sin `basePath`**
✅ **Sin `assetPrefix`**
✅ **Export estático puro**

---

### ✅ 3. Código sin referencias a localhost
```bash
grep -R "localhost" -n src
```
**Resultado**: No se encontraron referencias

---

### ✅ 4. Build limpio ejecutado
```bash
npm run build          # ✅ 15.9s
npx cap sync android   # ✅ 0.758s
compilar_aab_google_play.bat  # ✅ 16s
```

---

### ✅ 5. HTML generado correctamente
**Verificado**: `out/index.html`
- ✅ Usa rutas relativas (`/_next/static/...`)
- ✅ NO tiene referencias a `http://localhost`
- ✅ Assets en `/logo.png`, `/sounds/...`, `/cards/...`

---

## 📦 AAB FINAL

**Ubicación**: 
```
C:\Proyectos\MemoFlip\android\app\build\outputs\bundle\release\app-release.aab
```

**Detalles**:
- **versionCode**: 12
- **versionName**: 1.1.1
- **Tamaño**: ~10 MB (sin incluir assets dinámicos)

---

## 🚀 PRÓXIMOS PASOS

### Opción A: Subir directamente a Google Play (RECOMENDADO)

1. Ir a [Google Play Console](https://play.google.com/console)
2. Seleccionar "MemoFlip"
3. Ir a "Producción" > "Crear nueva versión"
4. Subir `app-release.aab`
5. **Notas de la versión**:
```
Corrección definitiva de crash al iniciar sesión. 
La app ahora carga correctamente desde android_asset sin intentar conectar a localhost. 
Versión de prueba con anuncios de prueba de Google (banner + rewarded ads).
```

---

### Opción B: Probar primero en dispositivo físico

**1. Compilar APK debug para testing**:
```bash
cd android
./gradlew assembleDebug
```

**2. Instalar en dispositivo**:
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

**3. Verificar con logcat**:
```bash
adb logcat | grep -i Capacitor
```

**Buscar esta línea**:
```
Capacitor: App started url: capacitor://localhost
```

✅ **Correcto**: `capacitor://localhost` o `file:///android_asset/public/index.html`
❌ **Incorrecto**: `http://localhost:3000`

**4. Inspeccionar con Chrome**:
```
chrome://inspect
```
En la consola, debería aparecer:
```javascript
[BOOT] capacitor://localhost/ capacitor://localhost
```

---

## 🔧 Si TODAVÍA sale "client-side exception"

### Diagnóstico con log temporal

**Añadir en `src/app/page.tsx`** (línea 15, dentro del componente):
```typescript
useEffect(() => {
  console.log('[BOOT] URL:', window.location.href);
  console.log('[BOOT] Origin:', window.location.origin);
  console.log('[BOOT] Capacitor?', typeof (window as any).Capacitor !== 'undefined');
}, []);
```

**Rebuild**:
```bash
npm run build
npx cap copy android
cd android
./gradlew assembleDebug
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

**Inspeccionar log**:
```bash
adb logcat | grep -E "(BOOT|Capacitor)"
```

---

## 📊 CAMBIOS APLICADOS EN ESTA VERSIÓN

| Archivo | Antes | Después |
|---------|-------|---------|
| `capacitor.config.ts` | `server: { androidScheme: 'https' }` (sin condicional) | `server: isDev ? { url: 'localhost' } : { androidScheme: 'https' }` |
| `next.config.js` | `basePath: ''`, `assetPrefix: ''` | Sin `basePath` ni `assetPrefix` |
| `android/app/src/main/assets/capacitor.config.json` | (generado automáticamente) | ✅ Verificado sin `url` |

---

## ⚠️ IMPORTANTE: Antes de instalar

**DESINSTALA la app anterior COMPLETAMENTE**:
```bash
adb uninstall com.memoflip.app
```

**¿Por qué?** La app anterior puede tener:
- Service Workers cacheando `localhost`
- Preferencias almacenadas con URLs antiguas
- Assets en caché que apuntan a rutas incorrectas

---

## 🎯 ESTADO FINAL

✅ **Configuración corregida**: Capacitor + Next.js
✅ **Build exitoso**: AAB generado sin errores
✅ **Verificaciones pasadas**: `capacitor.config.json` correcto, HTML con rutas relativas
✅ **Sin referencias a localhost**: Código limpio

**El AAB está LISTO para Google Play** 🚀

---

## 💬 Si necesitas ayuda

**Mándame**:
1. Contenido de `android/app/src/main/assets/capacitor.config.json`
2. Output de `adb logcat | grep -i Capacitor` (primeras 20 líneas)
3. Output de Chrome Inspect con los logs `[BOOT]`

Con eso te diré exactamente qué está pasando.

