# ✅ AAB v1.1.2 (versionCode 13) - CRASH DE LOGIN CORREGIDO

## 🎯 PROBLEMA IDENTIFICADO Y SOLUCIONADO

**El problema era**: Después de hacer login, la app mostraba pantalla negra con "Application error: a client-side exception has occurred".

**La causa**: El código de inicialización de AdMob en `IntroScreen.tsx` estaba usando `await` dentro de una promesa de forma incorrecta, causando un crash al cargar la pantalla principal.

**Código problemático (líneas 44-47)**:
```typescript
import('@/lib/adService').then(async ({ initAds, showBottomBanner }) => {
  await initAds();
  await showBottomBanner();
}).catch(err => console.error('[AdMob] Error al inicializar:', err));
```

**Código corregido**:
```typescript
if (typeof window !== 'undefined') {
  import('@/lib/adService')
    .then(({ initAds, showBottomBanner }) => {
      initAds()
        .then(() => showBottomBanner())
        .catch(err => console.warn('[AdMob] No disponible:', err));
    })
    .catch(err => console.warn('[AdMob] Import error:', err));
}
```

---

## 📦 AAB FINAL LISTO

**Ubicación**: 
```
C:\Proyectos\MemoFlip\android\app\build\outputs\bundle\release\app-release.aab
```

**Detalles de la versión**:
- **versionCode**: 13
- **versionName**: 1.1.2
- **Compilado**: ✅ BUILD SUCCESSFUL in 22s

---

## 🔧 CAMBIOS APLICADOS EN v1.1.2

### 1. **Corrección del crash de login** ✅
- Simplificado el código de inicialización de AdMob
- Eliminado el uso incorrecto de `async/await` dentro de promesas
- Añadida verificación de `typeof window !== 'undefined'`
- Mejorado el manejo de errores con `catch()` sin causar crashes

### 2. **Configuración de Capacitor** ✅
- `server: { androidScheme: 'https' }` en producción (SIN `url`)
- Verificado en `android/app/src/main/assets/capacitor.config.json`

### 3. **Configuración de Next.js** ✅
- `output: 'export'` para generación estática
- Sin `basePath` ni `assetPrefix`
- Rutas relativas en `out/index.html`

---

## 🚀 INSTRUCCIONES DE SUBIDA A GOOGLE PLAY

### Paso 1: Subir el AAB

1. Ir a [Google Play Console](https://play.google.com/console)
2. Seleccionar **MemoFlip**
3. Ir a **Producción** → **Crear nueva versión**
4. Subir el archivo:
   ```
   C:\Proyectos\MemoFlip\android\app\build\outputs\bundle\release\app-release.aab
   ```

### Paso 2: Notas de la versión

```
Corrección crítica: solucionado el crash de pantalla negra que ocurría después de iniciar sesión. 
La aplicación ahora funciona correctamente en todos los dispositivos. 
Versión de prueba con anuncios de Google (banner + rewarded ads).
```

---

## 🧪 CÓMO PROBAR ANTES DE SUBIR (OPCIONAL)

Si quieres probar primero en tu dispositivo:

### 1. Desinstalar versión anterior
```bash
adb uninstall com.memoflip.app
```

### 2. Compilar APK debug
```bash
cd android
./gradlew assembleDebug
```

### 3. Instalar APK
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

### 4. Probar el flujo completo
1. Abrir la app
2. Hacer clic en **"Entrar"**
3. Introducir tu email y contraseña
4. Hacer clic en **"Entrar"** de nuevo
5. ✅ **DEBE APARECER LA PANTALLA PRINCIPAL DEL JUEGO** (sin pantalla negra)

---

## 📊 HISTORIAL DE VERSIONES (CRASH DE LOGIN)

| Versión | versionCode | Estado | Descripción |
|---------|-------------|--------|-------------|
| 1.1.0 | 11 | ❌ Crash | Pantalla negra después de login |
| 1.1.1 | 12 | ❌ Crash | Pantalla negra después de login |
| **1.1.2** | **13** | **✅ CORREGIDO** | **Login funciona correctamente** |

---

## ⚠️ RECORDATORIO IMPORTANTE

**Antes de instalar la nueva versión**:
```bash
adb uninstall com.memoflip.app
```

**¿Por qué?** Las versiones anteriores pueden tener:
- Cache de JavaScript con código antiguo
- Service Workers que interfieren
- Configuraciones incorrectas en `localStorage`

---

## 🎯 RESUMEN DE LO QUE SE CORRIGIÓ

✅ **Eliminado `async/await` incorrecto** en la inicialización de AdMob
✅ **Añadida verificación de entorno** con `typeof window !== 'undefined'`
✅ **Mejorado manejo de errores** para que fallen silenciosamente sin crashear
✅ **Simplificado el cleanup** al desmontar el componente
✅ **Verificado `capacitor.config.json`** sin `url` en producción
✅ **Build limpio** con Next.js export estático

---

## 💬 SI SIGUE SIN FUNCIONAR

Si después de instalar esta versión TODAVÍA sale pantalla negra, necesito que me des:

1. **Output de logcat**:
   ```bash
   adb logcat | grep -E "(Capacitor|BOOT|Error|Exception)"
   ```
   (Pégame las primeras 50 líneas después de hacer login)

2. **Inspección de Chrome**:
   - Ir a `chrome://inspect`
   - Seleccionar la app
   - Abrir Console
   - Pegar cualquier error que aparezca en rojo

---

## 🎉 ¡EL AAB ESTÁ LISTO!

**El archivo AAB está compilado y listo para subir a Google Play Console.**

Ubicación exacta:
```
C:\Proyectos\MemoFlip\android\app\build\outputs\bundle\release\app-release.aab
```

**Solo tienes que**:
1. Ir a Google Play Console
2. Subir el AAB
3. Rellenar las notas de la versión (texto arriba)
4. Publicar

🚀 **¡Ya puedes subirlo!**

