# 🚀 PUBLICAR MEMOFLIP EN GOOGLE PLAY - GUÍA FINAL

## ✅ ESTADO ACTUAL

### Lo que ya está listo:
- ✅ AAB v1.0.3 (versionCode 4) compilado
- ✅ Icono 512x512px (`iconoapp.png`)
- ✅ Capturas de pantalla en `capturas_google_play_finales/`
- ✅ Política de privacidad publicada
- ✅ Fixes críticos aplicados (vidas, progreso, AdMob)
- ✅ Base de datos limpiada

---

## 📦 PASO 1: UBICACIÓN DEL AAB

El AAB firmado está en:
```
android\app\build\outputs\bundle\release\app-release.aab
```

**Características:**
- `versionCode`: **4**
- `versionName`: **1.0.3**
- Tamaño: ~20-30 MB (optimizado)

---

## 🔗 PASO 2: URL DE LA POLÍTICA DE PRIVACIDAD

**URL para Google Play Console:**
```
https://colisan.com/sistema_apps_upload/memoflip/politica_privacidad_memoflip.html
```

✅ **Ya está subida y accesible**. Copia esta URL exacta para pegarla en Google Play Console.

---

## 📝 PASO 3: NOTAS DE VERSIÓN

Copia y pega estas notas en **TODOS los idiomas** (ES, EN):

### 🇪🇸 Español:
```
Primera versión pública de MemoFlip.
Mecánicas especiales (bomba, camaleón), progreso online y anuncios recompensados para vidas.
Correcciones de estabilidad y rendimiento.
```

### 🇬🇧 Inglés (opcional):
```
First public release of MemoFlip.
Special mechanics (bomb, chameleon), online progress and rewarded ads for lives.
Stability and performance fixes.
```

---

## ⚠️ PASO 4: DECISIÓN SOBRE ADMOB

### 🔴 OPCIÓN A: Publicar CON IDs de prueba (RECOMENDADO AHORA)

**Ventajas:**
- ✅ Puedes publicar YA
- ✅ Los anuncios de prueba funcionan
- ✅ Después subes v1.0.4 con IDs reales

**Desventajas:**
- ❌ No ganarás dinero con los anuncios (son de prueba)
- ❌ Necesitarás subir otra versión después

**Acción:** NO CAMBIAR NADA. Publicar el AAB actual.

---

### 🟢 OPCIÓN B: Publicar con IDs reales de AdMob

**Requisitos:**
1. Tener cuenta de AdMob creada
2. Haber creado la app "MemoFlip" en AdMob
3. Tener los 3 Unit IDs (Banner, Rewarded, Interstitial)

**Pasos:**

#### 1. Obtener IDs de AdMob:
- Ve a: https://apps.admob.com/
- Crea la app **MemoFlip**
- Crea 3 unidades de anuncios:
  - **Banner** (320x50) → `ca-app-pub-XXXXX/BANNER`
  - **Recompensado** (Video) → `ca-app-pub-XXXXX/REWARDED`
  - **Intersticial** (opcional) → `ca-app-pub-XXXXX/INTERSTITIAL`

#### 2. Modificar `src/lib/adService.ts`:
```typescript
// Línea 25: Cambiar a false
const isTesting = false;

// Líneas 36-40: Reemplazar con tus IDs reales
production: {
  banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/BANNER_ID',
  interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/INTERSTITIAL_ID',
  rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/REWARDED_ID'
}
```

#### 3. Modificar `android/app/src/main/AndroidManifest.xml`:
```xml
<!-- Buscar esta línea y reemplazar el ID -->
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~YYYYYYYYYY"/>
<!-- ⚠️ El App ID termina en ~YYYY (no en /XXXX) -->
```

#### 4. Actualizar versionCode en `android/app/build.gradle`:
```gradle
versionCode 5  // Era 4, ahora 5
versionName "1.0.4"  // Era 1.0.3, ahora 1.0.4
```

#### 5. Recompilar:
```bash
npm run build
.\compilar_aab_google_play.bat
```

---

## 📋 PASO 5: SUBIR A GOOGLE PLAY CONSOLE

### 1. Ve a Google Play Console:
https://play.google.com/console

### 2. Selecciona tu app "MemoFlip"

### 3. Ve a **Producción** (en el menú lateral):
- Producción → **Crear nueva versión**

### 4. Sube el AAB:
- **Arrastra** `app-release.aab` al área de subida
- O haz clic en "Examinar archivos"
- Espera a que se procese (1-2 minutos)

### 5. Rellena las Notas de versión:
- Pega las notas del **PASO 3**
- Puedes añadir solo español o varios idiomas

### 6. Guarda como borrador:
- **NO** pulses "Revisar versión" todavía
- Primero revisa que todo esté completo

---

## ✅ PASO 6: CHECKLIST ANTES DE PUBLICAR

Verifica que TODOS estos items estén completados en Google Play Console:

### 📱 **Ficha de la tienda:**
- [ ] **Icono de la app** (512x512px) → `iconoapp.png`
- [ ] **Gráfico destacado** (1024x500px) - ⚠️ ¿LO TIENES?
- [ ] **Capturas de pantalla** (mínimo 2) → `capturas_google_play_finales/`
- [ ] **Título corto** (máx 30 caracteres): "MemoFlip - Juego de Memoria"
- [ ] **Descripción corta** (máx 80 caracteres)
- [ ] **Descripción completa** (máx 4000 caracteres)

### 🔐 **Contenido de la app:**
- [ ] **Anuncios:** ✅ Sí (Marcar "Contiene anuncios")
- [ ] **Audiencia:** No específicamente para niños
- [ ] **Clasificación de contenido:** Completar formulario
- [ ] **Política de privacidad:** 
  ```
  https://colisan.com/sistema_apps_upload/memoflip/politica_privacidad_memoflip.html
  ```

### 📊 **Seguridad de los datos:**
- [ ] **Recopila datos:** Sí
- [ ] **Tipos de datos:**
  - ✅ Actividad en la aplicación (progreso de niveles)
  - ✅ Diagnósticos (registros de fallos)
  - ✅ IDs del dispositivo (ID publicitario para AdMob)
- [ ] **Finalidades:**
  - ✅ Funcionalidad de la aplicación
  - ✅ Análisis
  - ✅ Publicidad o marketing
- [ ] **Seguridad:**
  - ✅ Datos cifrados en tránsito (HTTPS)
  - ❌ NO se pide eliminar datos (aunque tienes opción en la app)

---

## 🚀 PASO 7: PUBLICAR

### Opción A: Despliegue Gradual (RECOMENDADO)

1. **Revisar y publicar** → Seleccionar "Producción"
2. **Despliegue gradual:** 20% de usuarios
3. **Monitorear 24-48h:**
   - Revisar crashes en Play Console
   - Leer reseñas de usuarios
   - Verificar que AdMob funciona
4. **Si todo OK:** Aumentar a 50% → 100%

### Opción B: Despliegue Completo

1. **Revisar y publicar** → Seleccionar "Producción"
2. **Despliegue completo:** 100% de usuarios
3. **Esperar revisión de Google** (24-72 horas)

---

## ⏰ PASO 8: DESPUÉS DE PUBLICAR

### En las primeras 24 horas:

1. **Monitorear Play Console:**
   - Estadísticas de instalaciones
   - Crashes / ANRs
   - Reseñas de usuarios

2. **Probar en producción:**
   - Descargar desde Play Store
   - Verificar login/registro
   - Probar anuncios
   - Verificar progreso

3. **Responder reseñas:**
   - Agradecer feedback positivo
   - Resolver dudas de usuarios

### Si encuentras un bug crítico:

1. **Retirar versión:**
   - Play Console → Producción → Detener despliegue
2. **Corregir código**
3. **Incrementar versionCode** (5, 6, etc.)
4. **Subir nuevo AAB**

---

## 📊 PASO 9: MONETIZACIÓN CON ADMOB

### Una vez publicado:

1. **Verificar que los anuncios se muestran**
2. **Esperar 24-48h para primeras estadísticas**
3. **Revisar AdMob Dashboard:**
   - Impresiones
   - Clics
   - eCPM
   - Ingresos estimados

### Si usas IDs de prueba:

- ⚠️ **NO verás ingresos reales**
- Los anuncios son de Google para pruebas
- **Planifica subir v1.0.4 con IDs reales pronto**

---

## 🎯 RECOMENDACIÓN FINAL

### **PUBLICAR AHORA CON IDs DE PRUEBA:**

**¿Por qué?**
1. ✅ Puedes publicar HOY
2. ✅ Los usuarios pueden empezar a jugar
3. ✅ Obtienes feedback real
4. ✅ Verificas que todo funciona en producción
5. ✅ Después subes v1.0.4 con IDs reales (1-2 días)

**Siguiente paso después de publicar:**
1. Crear cuenta AdMob
2. Obtener IDs reales
3. Compilar v1.0.4
4. Subir actualización

---

## 📞 CONTACTO Y SOPORTE

**Si tienes dudas durante la publicación:**
- Google Play Help: https://support.google.com/googleplay/android-developer
- AdMob Help: https://support.google.com/admob

**Errores comunes:**
- "Necesitas un gráfico destacado" → Crear imagen 1024x500px
- "Falta política de privacidad" → Pegar URL de arriba
- "Clasificación incompleta" → Completar formulario de contenido

---

## ✅ CHECKLIST FINAL (MARCAR ANTES DE PUBLICAR)

- [ ] AAB subido a Google Play Console
- [ ] Notas de versión rellenadas
- [ ] Icono 512x512px subido
- [ ] Capturas de pantalla subidas (mínimo 2)
- [ ] Gráfico destacado 1024x500px subido
- [ ] Descripción de la app escrita
- [ ] Política de privacidad URL añadida
- [ ] Contenido de la app configurado (anuncios = Sí)
- [ ] Clasificación de contenido completada
- [ ] Seguridad de datos rellenada
- [ ] Revisado TODO en "Vista previa de la ficha"
- [ ] **Listo para pulsar "Revisar y publicar"**

---

**🎉 ¡ESTÁS LISTO PARA PUBLICAR!**

**¿Alguna duda antes de proceder? ¡Pregunta!** 🚀

