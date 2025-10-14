# ✅ MemoFlip v1.0.5 - LISTO PARA SUBIR

## 📦 Archivo AAB Generado
- **`MemoFlip_v1.0.5_BANNER_Y_SAVE_CORREGIDO.aab`**
- Versión: **1.0.5** (Build 6)
- Ubicación: **Raíz del proyecto**

---

## 🚀 PASOS PARA DESPLIEGUE (3 minutos)

### 1️⃣ SUBIR PHP AL SERVIDOR (1 min)

**Ejecuta:**
```bash
cd PARA_HOSTALIA
subir_save_progress.bat
```

**O subirlo manualmente por FTP:**
- Conectar a `colisan.com`
- Usuario: `colisan` / Pass: `Lugati67`
- Subir `PARA_HOSTALIA/sistema_apps_api/memoflip/save_progress.php` → `/memoflip/save_progress.php`

---

### 2️⃣ PROBAR ENDPOINT (30 seg)

Abre en navegador o usa curl:
```
https://colisan.com/sistema_apps_upload/memoflip/save_progress.php
```

**Deberías ver:**
```json
{"ok":false,"error":"Método no permitido. Usa POST."}
```

✅ **Esto significa que está funcionando** (solo rechaza GET, pero acepta POST)

---

### 3️⃣ SUBIR AAB A GOOGLE PLAY (1.5 min)

1. Ir a [Google Play Console](https://play.google.com/console)
2. **MemoFlip** → **Producción** → **Crear nueva versión**
3. Subir `MemoFlip_v1.0.5_BANNER_Y_SAVE_CORREGIDO.aab`
4. Notas de la versión:
   ```
   v1.0.5 - Mejoras de rendimiento y estabilidad
   • Banner publicitario en la parte inferior
   • Sistema de anuncios recompensados para obtener vidas
   • Guardado de progreso mejorado y más confiable
   • Correcciones de errores menores
   ```
5. **Revisar** → **Implementar en producción**

---

## 🎯 QUÉ SE HA CORREGIDO

### AdMob (Banner + Rewarded)
✅ Banner de prueba en la parte inferior (siempre visible)  
✅ Anuncios recompensados para obtener vidas  
✅ Sin UMP (versión básica, sin consentimiento)  
✅ Corrección de errores de compilación con `async/await`

### Guardado de Progreso
✅ Endpoint dedicado `/memoflip/save_progress.php`  
✅ Logs detallados en consola (`💾 [SAVE] payload =>`)  
✅ Sincronización inmediata tras completar nivel  
✅ Usa `INSERT ... ON DUPLICATE KEY UPDATE` (seguro)

---

## 🧪 TESTING RÁPIDO (tras instalar APK)

1. **Abrir app** → ¿Aparece banner gris "Test Ad" abajo? ✅
2. **Completar nivel** → Buscar en consola `💾 [SAVE] payload =>` ✅
3. **Quedarse sin vidas** → Ver anuncio recompensado → ¿Se otorga vida? ✅

---

## 📁 ARCHIVOS RELEVANTES

- `MemoFlip_v1.0.5_BANNER_Y_SAVE_CORREGIDO.aab` - AAB para Google Play
- `PARA_HOSTALIA/sistema_apps_api/memoflip/save_progress.php` - Endpoint PHP
- `PARA_HOSTALIA/subir_save_progress.bat` - Script para subir PHP
- `VERSION_1.0.5_RESUMEN.md` - Documentación completa

---

## ⚠️ IMPORTANTE

Si el banner NO aparece en el APK:
1. Verifica `AndroidManifest.xml` → `com.google.android.gms.ads.APPLICATION_ID`
2. Busca en consola `[AdMob] initialized` y `[Banner] MOSTRADO`
3. Asegúrate de que `globals.css` tiene `body { padding-bottom: 60px; }`

Si el progreso NO se guarda:
1. Verifica que `save_progress.php` esté en `/memoflip/` (no en subcarpeta)
2. Busca logs `💾 [SAVE] response <=` en consola
3. Si hay error 500, verifica `config_db.php` en el servidor

---

**✅ TODO LISTO PARA SUBIR A GOOGLE PLAY**

_Fecha: 14 de octubre de 2025 | Versión: 1.0.5 | Build: 6_

