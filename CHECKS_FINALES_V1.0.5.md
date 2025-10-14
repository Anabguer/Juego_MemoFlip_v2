# ✅ CHECKS FINALES - MemoFlip v1.0.5

## 0️⃣ CHECKS PREVIOS

### ✅ versionCode distinto al anterior
- **versionCode:** 6 (anterior: 5)
- **versionName:** 1.0.5
- **Archivo:** `android/app/build.gradle`

### ✅ Ruta API coherente
- **Endpoint:** `https://colisan.com/sistema_apps_upload/memoflip/api/save_progress.php`
- **Test realizado:** ✅ Status 200 - `{"ok":true,"saved_level":5}`
- **Archivo corregido:** `src/lib/progressService.ts` → `api/save_progress.php`

---

## A️⃣ BANNER ADMOB (Test Ads)

### ✅ AndroidManifest.xml
**Ubicación:** `android/app/src/main/AndroidManifest.xml`

```xml
<meta-data
  android:name="com.google.android.gms.ads.APPLICATION_ID"
  android:value="ca-app-pub-3940256099942544~3347511713"/>
```

### ✅ Inicialización en IntroScreen
**Archivo:** `src/components/IntroScreen.tsx`
- `await initAds()`
- `await showBottomBanner()`

### ✅ Espacio visual (CSS)
**Archivo:** `src/app_original/globals.css`
```css
body {
  padding-bottom: 60px;
}
```

### 🔍 Prueba real (tras instalación):
1. Abrir app en Android
2. Ver franja inferior → "Test Ad" (banner gris)
3. Si NO aparece:
   - Buscar en logs: `[AdMob] initialized` y `[Banner] MOSTRADO`
   - Verificar `APPLICATION_ID` en Manifest
   - Verificar `padding-bottom: 60px` en CSS

---

## B️⃣ GUARDADO DE PROGRESO

### ✅ Endpoint subido y probado
- **URL:** `https://colisan.com/sistema_apps_upload/memoflip/api/save_progress.php`
- **Test:** ✅ `{"ok":true,"saved_level":5,"user_key":"test123"}`

### ✅ Tabla `memoflip_usuarios`
**Columnas verificadas:**
- `usuario_aplicacion_key` (PRIMARY KEY/UNIQUE) ✅
- `max_level_unlocked` ✅
- `coins_total` ✅
- `lives_current` ✅
- `total_score` ✅

### ✅ Código cliente actualizado
- `src/lib/progressService.ts` → usa `api/save_progress.php`
- `src/store/gameStore.ts` → llama a `saveProgressToServer()`
- `src/MemoFlipApp.tsx` → guarda tras completar nivel

---

## C️⃣ SUBIDA A GOOGLE PLAY

### Pasos:
1. **Google Play Console** → [play.google.com/console](https://play.google.com/console)
2. **MemoFlip** → **Producción** → **Crear nueva versión**
3. **Subir AAB:** `MemoFlip_v1.0.5_BANNER_Y_SAVE_CORREGIDO.aab`
4. **Notas de la versión:**
   ```
   v1.0.5 - Mejoras de rendimiento y estabilidad
   • Banner publicitario en la parte inferior
   • Sistema de anuncios recompensados para obtener vidas
   • Guardado de progreso mejorado y más confiable
   • Correcciones de errores menores
   ```
5. **Revisar** → **Implementar en producción** (o prueba interna 20%)

---

## D️⃣ NOTA SOBRE UMP (User Messaging Platform)

### Estado actual:
- ✅ **Sin UMP** (versión simplificada para testing)
- ✅ Anuncios funcionan con IDs de prueba de Google
- ⚠️ **Para producción EU:** Implementar UMP en v1.0.6

### Próxima versión (v1.0.6):
1. Integrar flujo de consentimiento UMP
2. Pedir consentimiento antes de cargar anuncios
3. Cargar anuncios no personalizados si el usuario no responde
4. Cambiar IDs de prueba por IDs reales de AdMob

---

## ✅ ESTADO FINAL

- ✅ versionCode 6
- ✅ Endpoint `/api/save_progress.php` funcionando
- ✅ AdMob configurado (test IDs)
- ✅ AAB compilado y listo
- ✅ Documentación completa

**🚀 LISTO PARA SUBIR A GOOGLE PLAY**

---

_Fecha: 14 de octubre de 2025 | Versión: 1.0.5 | Build: 6_

