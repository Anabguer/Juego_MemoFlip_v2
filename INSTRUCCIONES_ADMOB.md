# 📢 Instrucciones para Configurar AdMob en MemoFlip

## ✅ **YA ESTÁ INTEGRADO**

La integración técnica de AdMob ya está **completa y funcionando** con IDs de prueba de Google.

---

## 🎯 **LO QUE FALTA: Obtener IDs Reales de AdMob**

Para usar anuncios reales (y ganar dinero), necesitas:

### **1️⃣ Crear Cuenta en AdMob**

1. Ve a: https://admob.google.com/
2. Inicia sesión con tu Gmail
3. Haz clic en **"Empezar"**
4. Acepta los términos y condiciones

### **2️⃣ Crear Aplicación en AdMob**

1. En AdMob, haz clic en **"Apps" → "Add App"**
2. Selecciona **"Android"**
3. Nombre de la app: **"MemoFlip"**
4. Paquete: **`com.intocables13.memoflip`**

Esto te dará un **App ID** con formato:
```
ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX
```

### **3️⃣ Crear Unidades de Anuncios**

Necesitas crear **3 tipos** de anuncios:

#### **a) Banner (Pantalla de Inicio)**
- Tipo: **Banner**
- Nombre: **"MemoFlip Banner Inicio"**
- Formato: **Banner estándar** (320x50)

Te dará un ID:
```
ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```

#### **b) Intersticial (Después de Completar Nivel)**
- Tipo: **Intersticial**
- Nombre: **"MemoFlip Intersticial Nivel"**

Te dará un ID:
```
ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```

#### **c) Recompensa (Ver Anuncio para Ganar Vida)**
- Tipo: **Recompensado**
- Nombre: **"MemoFlip Vida Extra"**
- Recompensa: **1 vida**

Te dará un ID:
```
ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX
```

---

## 🔧 **PASO 4: Actualizar el Código**

### **A) Actualizar `src/lib/adService.ts`**

**Línea 16:** Cambiar `isTesting` a `false`
```typescript
const isTesting = false; // ⚠️ CAMBIAR A false PARA PRODUCCIÓN
```

**Líneas 26-30:** Reemplazar los IDs de producción:
```typescript
production: {
  banner: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // 🔴 TU ID DE BANNER
  interstitial: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX', // 🔴 TU ID DE INTERSTICIAL
  rewarded: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX' // 🔴 TU ID DE RECOMPENSA
}
```

### **B) Actualizar `android/app/src/main/AndroidManifest.xml`**

**Línea 40:** Reemplazar con tu App ID:
```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX"/>
```

---

## 🎮 **CÓMO FUNCIONAN LOS ANUNCIOS EN MEMOFLIP**

### **1. Anuncio de Recompensa (Vida Extra)**
- **Dónde:** Cuando el jugador se queda sin vidas
- **Botón:** "Ver anuncio para ganar vida"
- **Recompensa:** +1 vida
- **Código:** Ya está implementado en `GameScreen.tsx`

### **2. Intersticial (Pantalla Completa)**
- **Dónde:** Después de completar un nivel
- **Frecuencia:** Cada 3-5 niveles (ajustable)
- **Código:** Listo para usar con `adService.showInterstitial()`

### **3. Banner (Pantalla de Inicio)**
- **Dónde:** En la parte inferior de la pantalla de inicio
- **Código:** Listo para usar con `adService.showBanner()`

---

## 📊 **CONFIGURACIÓN RECOMENDADA**

### **Frecuencia de Anuncios (para no molestar al jugador)**

- **Recompensa:** Siempre disponible cuando se queda sin vidas ✅
- **Intersticial:** Solo cada 5 niveles completados ⚠️
- **Banner:** Solo en pantalla de inicio (no durante el juego) ✅

---

## 🧪 **MODO DE PRUEBA (ACTUAL)**

Actualmente la app está en **modo de prueba** (`isTesting = true`):

✅ Muestra anuncios de Google (de prueba)
✅ No genera ingresos reales
✅ Puedes probar la funcionalidad completa
✅ No necesitas esperar aprobación de Google

---

## 💰 **MODO DE PRODUCCIÓN**

Cuando cambies `isTesting = false` y uses tus IDs reales:

✅ Mostrará anuncios reales
✅ Generará ingresos cuando los usuarios vean/completen anuncios
⚠️ Debes cumplir las políticas de AdMob
⚠️ Google revisará tu app (puede tardar 1-2 días)

---

## 🚀 **PRÓXIMOS PASOS**

1. ✅ La integración técnica ya está lista
2. 🔲 Crea tu cuenta en AdMob
3. 🔲 Obtén los 4 IDs (App ID + 3 unidades de anuncios)
4. 🔲 Actualiza `adService.ts` y `AndroidManifest.xml`
5. 🔲 Cambia `isTesting = false`
6. 🔲 Compila APK de producción
7. 🔲 Sube a Google Play

---

## ⚠️ **IMPORTANTE**

- **NO publiques la app** con IDs de prueba (rechazarán tu app)
- **SÍ puedes probar** con IDs de prueba antes de publicar
- Los anuncios de prueba se ven **diferentes** a los reales
- Google tarda **1-2 días** en aprobar tu primera app con AdMob

---

## 📞 **¿Necesitas Ayuda?**

Si tienes problemas:
1. Verifica que los IDs están correctos (sin espacios extra)
2. Asegúrate de que `isTesting = false` en producción
3. Revisa la consola del navegador/logcat de Android para errores
4. Los anuncios pueden tardar unos minutos en cargar la primera vez

---

**¡Todo listo para monetizar MemoFlip!** 🎉

