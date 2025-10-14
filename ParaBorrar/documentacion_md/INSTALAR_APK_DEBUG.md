# 📱 INSTALAR APK DEBUG - MemoFlip v1.1.2

## ✅ APK COMPILADO

**Ubicación del APK**:
```
C:\Proyectos\MemoFlip\android\app\build\outputs\apk\debug\app-debug.apk
```

**Versión**: 1.1.2 (versionCode 13)

---

## 🔧 MÉTODO 1: TRANSFERIR POR USB (MÁS RÁPIDO)

### Paso 1: Habilitar instalación de APKs en tu móvil
1. Ve a **Ajustes** → **Seguridad**
2. Activa **"Orígenes desconocidos"** o **"Instalar apps desconocidas"**
   - En Android 8+: Dar permiso a **"Mis archivos"** o **"Chrome"**

### Paso 2: Conectar el móvil al PC por USB
1. Conecta el cable USB
2. En el móvil, selecciona **"Transferencia de archivos"** (MTP)

### Paso 3: Copiar el APK al móvil
1. Abre el **Explorador de archivos de Windows**
2. Ve a: `C:\Proyectos\MemoFlip\android\app\build\outputs\apk\debug\`
3. Copia `app-debug.apk`
4. Pega en la carpeta **Descargas** de tu móvil

### Paso 4: Instalar en el móvil
1. En el móvil, abre **Mis archivos** o **Archivos**
2. Ve a **Descargas**
3. Toca `app-debug.apk`
4. **Si tienes la versión anterior instalada**: 
   - Te preguntará si quieres actualizar
   - Toca **"Actualizar"** o **"Instalar"**
5. Espera a que se instale
6. Toca **"Abrir"**

---

## 🔧 MÉTODO 2: ENVIAR POR EMAIL/WHATSAPP

### Opción A: Email
1. Adjunta el archivo `app-debug.apk` a un email
2. Envíatelo a ti mismo
3. Abre el email en tu móvil
4. Descarga el APK
5. Ábrelo para instalar

### Opción B: WhatsApp Web
1. Abre **WhatsApp Web** en el PC
2. Envíate el APK a ti mismo (crea un grupo contigo solo si es necesario)
3. En el móvil, descarga el archivo
4. Ábrelo para instalar

---

## 🔧 MÉTODO 3: USAR ADB (SI TIENES ANDROID STUDIO)

Si tienes Android Studio instalado:

```bash
# En PowerShell, desde la raíz del proyecto:
cd C:\Proyectos\MemoFlip

# Desinstalar versión anterior (IMPORTANTE)
adb uninstall com.memoflip.app

# Instalar nueva versión
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

---

## ⚠️ MUY IMPORTANTE: DESINSTALAR VERSIÓN ANTERIOR

**ANTES de instalar la nueva versión**, desinstala completamente la anterior:

1. Ve a **Ajustes** → **Aplicaciones**
2. Busca **MemoFlip**
3. Toca **"Desinstalar"**
4. Confirma

**¿Por qué es importante?**
- La versión anterior tiene código con el bug
- Puede tener datos en caché que causen conflictos
- Queremos probar completamente limpio

---

## 🧪 QUÉ PROBAR

### Test 1: Login sin crash ✅
1. Abre la app
2. Toca **"Entrar"**
3. Introduce tu email y contraseña
4. Toca **"Entrar"**
5. ✅ **DEBE APARECER LA PANTALLA PRINCIPAL** (no pantalla negra)

### Test 2: Guardado de progreso ✅
1. Juega un nivel
2. Complétalo
3. Cierra la app completamente
4. Vuelve a abrir
5. ✅ **EL PROGRESO DEBE MANTENERSE** (nivel correcto, monedas guardadas)

### Test 3: Modo invitado ✅
1. Si tienes sesión iniciada, cierra sesión desde Ajustes (⚙️)
2. Toca **"JUGAR"** (sin hacer login)
3. ✅ **DEBE FUNCIONAR SIN PROBLEMAS**

### Test 4: AdMob (anuncios de prueba) ✅
1. ✅ **Banner en la parte inferior** de la pantalla principal
2. Cuando te quedes sin vidas:
   - Toca **"Ver anuncio para obtener vida"**
   - ✅ **DEBE MOSTRARSE UN ANUNCIO DE PRUEBA**
   - Al completarlo, **DEBE DAR 1 VIDA**

---

## 📊 REPORTAR RESULTADOS

**Si todo funciona bien**, dime:
✅ "Todo OK, listo para subir a Google Play"

**Si hay algún problema**, dime:
1. ¿En qué paso falló? (Test 1, 2, 3 o 4)
2. ¿Qué error viste?
3. Si es pantalla negra, ¿en qué momento exacto apareció?

---

## 🔍 LOGS DE DEBUG (SI HAY ERRORES)

Si hay algún problema y tienes Android Studio:

```bash
# Conecta el móvil por USB
# Abre la app
# En PowerShell, ejecuta:
adb logcat | Select-String -Pattern "Capacitor|Error|Exception|SAVE|BOOT"
```

Pégame las primeras 50 líneas que aparezcan.

---

## 📂 UBICACIÓN DEL APK

**Ruta completa**:
```
C:\Proyectos\MemoFlip\android\app\build\outputs\apk\debug\app-debug.apk
```

**Tamaño aproximado**: ~10-15 MB

---

## ✅ CHECKLIST ANTES DE INSTALAR

- [ ] He desinstalado la versión anterior de MemoFlip
- [ ] He habilitado "Instalar apps desconocidas"
- [ ] He copiado el APK a mi móvil
- [ ] Estoy listo para probar

---

## 🎯 ¡LISTO PARA INSTALAR!

Elige el método que prefieras (recomiendo USB) y prueba la app.

**Avísame cuando esté instalada y probada** 📱

