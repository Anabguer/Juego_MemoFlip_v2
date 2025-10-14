# MemoFlip v1.0.5 - Resumen de Cambios

## 📦 Archivos Generados

### AAB para Google Play
- **Archivo:** `MemoFlip_v1.0.5_BANNER_Y_SAVE_CORREGIDO.aab`
- **Versión Code:** 6
- **Versión Name:** 1.0.5
- **Ubicación:** Raíz del proyecto

### Archivos PHP para Hostalia
- `PARA_HOSTALIA/sistema_apps_api/memoflip/save_progress.php` - Nuevo endpoint para guardar progreso

---

## ✅ Cambios Implementados

### 1. AdMob Simplificado (Banner Inferior)

#### Archivos Modificados:
- `src/lib/adService.ts` - Simplificado, sin UMP
- `src/components/IntroScreen.tsx` - Llamadas a `initAds()` y `showBottomBanner()`
- `src/components/GameScreen.tsx` - Uso de `showRewardedAd()` para vidas
- `src/app_original/globals.css` - `padding-bottom: 60px` en body

#### Funcionalidades:
- ✅ Banner de prueba en la parte inferior (siempre visible)
- ✅ Anuncios recompensados para obtener vidas
- ✅ Sin consentimiento UMP (versión básica)
- ✅ IDs de prueba de Google activados (`isTesting = true`)

#### Configuración AndroidManifest.xml:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-3940256099942544~3347511713"/>
```

---

### 2. Guardado de Progreso Robusto

#### Archivos Nuevos:
- `src/lib/progressService.ts` - Servicio dedicado para guardar progreso
- `PARA_HOSTALIA/sistema_apps_api/memoflip/save_progress.php` - Endpoint PHP

#### Archivos Modificados:
- `src/store/gameStore.ts` - Usa `saveProgressToServer()` de `progressService.ts`
- `src/MemoFlipApp.tsx` - Llama a `saveProgressToServer()` tras completar nivel

#### Funcionalidades:
- ✅ Endpoint dedicado `/memoflip/save_progress.php`
- ✅ Usa `INSERT ... ON DUPLICATE KEY UPDATE` para sincronización segura
- ✅ Logs detallados en consola (payload y respuesta)
- ✅ Guarda nivel, monedas y vidas inmediatamente tras completar nivel

#### Contrato API:
**Request POST:**
```json
{
  "user_key": "abc123",
  "level": 12,
  "coins": 340,
  "lives": 3
}
```

**Response:**
```json
{
  "ok": true,
  "saved_level": 12,
  "user_key": "abc123",
  "affected_rows": 1,
  "message": "Progreso guardado correctamente"
}
```

---

## 🚀 Pasos para Despliegue

### 1. Subir Archivo PHP al Servidor

**Opción A - Script Automático:**
```bash
cd PARA_HOSTALIA
subir_save_progress.bat
```

**Opción B - Manual (FTP):**
1. Conectar a `colisan.com` con FileZilla
2. Usuario: `colisan` / Contraseña: `Lugati67`
3. Ir a `/memoflip/`
4. Subir `PARA_HOSTALIA/sistema_apps_api/memoflip/save_progress.php` → `save_progress.php`

### 2. Verificar `config_db.php` en el Servidor

Asegúrate de que existe `/memoflip/config_db.php` con:
```php
<?php
define('DB_HOST', 'localhost');
define('DB_USER', 'TU_USUARIO');
define('DB_PASS', 'TU_CONTRASEÑA');
define('DB_NAME', 'TU_BASE_DE_DATOS');
```

### 3. Probar el Endpoint

```bash
curl -X POST -H "Content-Type: application/json" \
-d '{"user_key":"test123","level":5,"coins":100,"lives":3}' \
https://colisan.com/sistema_apps_upload/memoflip/save_progress.php
```

**Respuesta Esperada:**
```json
{"ok":true,"saved_level":5,"user_key":"test123","affected_rows":1,"message":"Progreso guardado correctamente"}
```

### 4. Subir AAB a Google Play Console

1. Ir a [Google Play Console](https://play.google.com/console)
2. Seleccionar **MemoFlip**
3. **Producción** → **Crear nueva versión**
4. Subir `MemoFlip_v1.0.5_BANNER_Y_SAVE_CORREGIDO.aab`
5. **Notas de la versión:**
   ```
   v1.0.5 - Mejoras de rendimiento y estabilidad
   • Banner publicitario en la parte inferior
   • Sistema de anuncios recompensados para obtener vidas
   • Guardado de progreso mejorado y más confiable
   • Correcciones de errores menores
   ```
6. **Revisar** → **Implementar en producción**

---

## 📊 Estructura de Base de Datos

### Tabla `memoflip_usuarios`

Si no existe, créala con:
```sql
CREATE TABLE IF NOT EXISTS memoflip_usuarios (
  user_key VARCHAR(64) PRIMARY KEY,
  nivel INT NOT NULL DEFAULT 0,
  monedas INT NOT NULL DEFAULT 0,
  vidas INT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Nota:** Si ya tienes esta tabla con nombres de columnas diferentes (ej. `max_level_unlocked`, `coins_total`), ajusta el SQL en `save_progress.php`.

---

## 🧪 Testing Checklist

### Banner AdMob
- [ ] Al abrir la app, aparece un banner gris en la parte inferior con "Test Ad"
- [ ] El banner no tapa los botones de juego
- [ ] El banner persiste durante toda la sesión

### Anuncios Recompensados
- [ ] Al quedarse sin vidas, aparece el modal "Sin Vidas"
- [ ] Al hacer clic en "Ver anuncio", se muestra un anuncio de prueba
- [ ] Al completar el anuncio, se otorga 1 vida
- [ ] Si se cierra el anuncio antes de tiempo, NO se otorga la vida

### Guardado de Progreso
- [ ] Al completar un nivel, se ve en consola: `💾 [SAVE] payload => {user_key, level, coins, lives}`
- [ ] Inmediatamente después: `💾 [SAVE] response <= {ok:true, saved_level:...}`
- [ ] Al cerrar y reabrir la app, el progreso se mantiene
- [ ] Al verificar en la base de datos, el nivel coincide con el del juego

---

## 🔧 Troubleshooting

### Banner no aparece
1. **Verifica el App ID en AndroidManifest.xml:**
   - Debe estar `ca-app-pub-3940256099942544~3347511713` (test ID)
2. **Revisa la consola de Chrome DevTools:**
   - Busca logs `[AdMob] initialized` y `[Banner] MOSTRADO`
3. **Asegura espacio CSS:**
   - En `globals.css` debe estar `body { padding-bottom: 60px; }`

### Progreso no se guarda
1. **Verifica que `save_progress.php` esté en el servidor:**
   - URL: `https://colisan.com/sistema_apps_upload/memoflip/save_progress.php`
2. **Revisa logs en consola:**
   - Busca `💾 [SAVE] payload =>` y `💾 [SAVE] response <=`
   - Si hay error, verifica credenciales en `config_db.php`
3. **Verifica la tabla `memoflip_usuarios`:**
   - Ejecuta `SELECT * FROM memoflip_usuarios WHERE user_key = 'TU_EMAIL';`

---

## 📝 Próximos Pasos (Opcional)

### Integrar IDs Reales de AdMob
1. Crear cuenta en [AdMob](https://admob.google.com/)
2. Obtener **App ID** y **Ad Unit IDs** (Banner y Rewarded)
3. En `src/lib/adService.ts`, cambiar:
   ```typescript
   const isTesting = false; // ← cambiar a false
   const TEST_BANNER = 'ca-app-pub-XXXXXXXX/YYYYYYYYYY'; // ← tu ID real
   const TEST_REWARDED = 'ca-app-pub-XXXXXXXX/ZZZZZZZZZZ'; // ← tu ID real
   ```
4. Actualizar `AndroidManifest.xml` con tu App ID real
5. Recompilar y subir nueva versión

---

## ✅ Estado Final

- ✅ **AAB compilado:** v1.0.5 (versionCode 6)
- ✅ **AdMob integrado:** Banner + Rewarded (IDs de prueba)
- ✅ **Guardado robusto:** Endpoint dedicado con logs
- ✅ **Listo para subir a Google Play**

---

**Fecha:** 14 de octubre de 2025  
**Versión:** 1.0.5  
**Build:** 6

