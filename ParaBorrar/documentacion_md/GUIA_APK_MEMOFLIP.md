# 📱 GUÍA COMPLETA - APK DE MEMOFLIP

## ✅ **APK COMPILADA CON ÉXITO**

**Ubicación:** `android\app\build\outputs\apk\debug\app-debug.apk`

---

## 🚀 **3 FORMAS DE INSTALAR EN TU MÓVIL:**

### **OPCIÓN 1: ADB (MÁS RÁPIDA)** ✅ Recomendada
```bash
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

**Requisitos previos:**
- Móvil conectado por USB
- Depuración USB activada (ver abajo)

---

### **OPCIÓN 2: TRANSFERIR APK**
1. Copia `app-debug.apk` a tu móvil (USB/Bluetooth/Drive)
2. Abre el archivo en el móvil
3. Permitir "Instalar apps desconocidas" si pregunta
4. Instalar

---

### **OPCIÓN 3: DESARROLLO AUTOMÁTICO** (recomendada para desarrollo)
```bash
npx cap run android
```
- Compila, instala y abre automáticamente
- Ideal para desarrollo iterativo
- **IMPORTANTE:** Conecta tu móvil físico (no emulador)

---

## 📲 **ACTIVAR DEPURACIÓN USB:**

1. **Ajustes** → **Información del teléfono**
2. Toca **7 veces** en "Número de compilación"
3. **Ajustes** → **Opciones de desarrollador**
4. Activa **"Depuración USB"**
5. Conecta por USB y acepta el diálogo de confianza

---

## 🔍 **DEBUGGEAR LA APK (Chrome DevTools):**

1. Móvil conectado por USB
2. En Chrome PC: `chrome://inspect`
3. Click en **"inspect"** bajo "MemoFlip"
4. Pestaña **Console** → Ver todos los logs

---

## 🔄 **WORKFLOW DE DESARROLLO:**

### **Cambios en el código:**
```bash
# Ejecuta el script de compilación
.\compilar_apk.bat

# Instala en el móvil
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

### **O en un solo comando:**
```bash
npx cap run android
```

---

## 📦 **LO QUE INCLUYE LA APK:**

✅ **Wrapper API** - CapacitorHttp para bypass CORS  
✅ **Asset paths correctos** - Funciona en APK y WEB  
✅ **Audio pause/resume** - Al minimizar/restaurar app  
✅ **Offline/Online sync** - Guarda progreso local y servidor  
✅ **Ranking real** - Conectado a `memoflip_ranking_cache`  
✅ **Auto-login** - Sesión persistente con localStorage  

---

## 🎯 **CARACTERÍSTICAS IMPLEMENTADAS:**

### **1. API Wrapper (`src/lib/capacitorApi.ts`):**
- Detecta si es APK o WEB
- En APK: usa `CapacitorHttp` (bypass CORS)
- En WEB: usa `fetch` normal
- Base URL: `https://colisan.com/sistema_apps_upload/memoflip`

### **2. Asset Path (`getAssetPath()`):**
- En APK: quita prefijo `/sistema_apps_upload/memoflip`
- En WEB: mantiene path completo
- Funciona para: sonidos, imágenes, cartas, logo

### **3. Audio Management (`useAppState` hook):**
- Pausa audio al minimizar app
- Reanuda al volver
- Usa `@capacitor/app` plugin

### **4. Offline/Online:**
- Guarda siempre en `localStorage`
- Sincroniza con servidor si está online
- Merge inteligente (usa progreso más avanzado)

---

## ⚙️ **ARCHIVOS CLAVE:**

- `capacitor.config.ts` - Configuración de Capacitor
- `src/lib/capacitorApi.ts` - Wrapper API
- `src/hooks/useAppState.ts` - Manejo de audio
- `android/` - Proyecto Android nativo
- `compilar_apk.bat` - Script de compilación

---

## 🐛 **SOLUCIÓN DE PROBLEMAS:**

### **Error: "App not installed"**
```bash
# Desinstalar versión anterior primero
adb uninstall com.memoflip.app

# Reinstalar
adb install -r android\app\build\outputs\apk\debug\app-debug.apk
```

### **Error: "device not found"**
```bash
# Verificar que el móvil esté conectado
adb devices

# Si no aparece, revisa que Depuración USB esté activa
```

### **Audio no funciona:**
- Verifica permisos de audio en Ajustes de la app
- Revisa logs con Chrome DevTools (`chrome://inspect`)

### **Assets no cargan (404):**
- Verifica que `npx cap sync` se ejecutó correctamente
- Los assets deben estar en `android/app/src/main/assets/public/`

---

## 📝 **PRÓXIMOS PASOS (PUBLICACIÓN):**

### **Para Play Store:**
1. Crear keystore de firma
2. Configurar `build.gradle` con keystore
3. Compilar release: `gradlew assembleRelease`
4. Generar bundle: `gradlew bundleRelease`
5. Subir a Play Console

### **Para distribución directa:**
1. Firmar APK con jarsigner
2. Alinear con zipalign
3. Compartir APK firmada

---

## 🎉 **¡LISTO!**

**Tu APK de MemoFlip está compilada y lista para probar.**

**Cualquier problema, revisa los logs con:**
```bash
adb logcat | grep -i memoflip
```

**O usa Chrome DevTools para debugging visual.**

---

**Fecha de compilación:** Octubre 2025  
**Versión APK:** Debug (no firmada)  
**App ID:** `com.memoflip.app`


