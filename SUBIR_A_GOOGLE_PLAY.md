# 📤 GUÍA PARA SUBIR MEMOFLIP A GOOGLE PLAY

## ✅ **ARCHIVO LISTO PARA SUBIR**

**📦 Archivo:** `MemoFlip-GooglePlay.aab`
**📊 Tamaño:** 81.1 MB
**🔐 Estado:** Firmado y listo para producción

---

## 🚀 **PASO 1: SUBIR EL AAB**

1. Ve a: https://play.google.com/console
2. Selecciona tu aplicación **"MemoFlip"**
3. En el menú lateral, ve a **"Versión" → "Producción"**
4. Haz clic en **"Crear nueva versión"**
5. **Sube el AAB:**
   - Arrastra `MemoFlip-GooglePlay.aab` al cuadro de carga
   - O haz clic en "Examinar archivos" y selecciona el AAB

---

## 📋 **PASO 2: INFORMACIÓN REQUERIDA**

### **A) NOMBRE Y DESCRIPCIÓN**

**Título de la aplicación (30 caracteres máximo):**
```
MemoFlip - Juego de Memoria
```

**Descripción corta (80 caracteres):**
```
Juego de memoria con niveles progresivos, mecánicas especiales y 151 cartas
```

**Descripción completa (4000 caracteres):**
```
MemoFlip es un emocionante juego de memoria que te desafiará con más de 1000 niveles progresivos llenos de mecánicas especiales y sorpresas.

🎮 CARACTERÍSTICAS:

• 1000 niveles únicos con dificultad progresiva
• 151 cartas diferentes para descubrir
• Mecánicas especiales: niebla, rotación, bombas y más
• Sistema de monedas y vidas
• Ranking global para competir con otros jugadores
• Sincronización en la nube
• Modo offline disponible

🎯 MECÁNICAS DEL JUEGO:

- Basic: Modo clásico de memoria
- Timer: Juega contra el tiempo
- Fog: Cartas parcialmente ocultas
- Rotation: Las cartas rotan mientras juegas
- Bomb: ¡Cuidado con las bombas!

💰 SISTEMA DE RECOMPENSAS:

- Gana monedas al completar niveles
- Consigue vidas extra viendo anuncios
- Desbloquea niveles cada vez más difíciles

🏆 COMPITE CON OTROS:

- Ranking global actualizado en tiempo real
- Compite por el mejor puntaje
- Sincroniza tu progreso en diferentes dispositivos

¡Descarga MemoFlip ahora y pon a prueba tu memoria!
```

---

### **B) CATEGORÍA Y ETIQUETAS**

**Categoría:** Juegos > Puzzle
**Etiquetas:** memoria, puzzle, cartas, educativo, cerebro

---

### **C) CLASIFICACIÓN DE CONTENIDO**

**Público objetivo:** Para todos
**Contiene anuncios:** Sí
**Compras dentro de la app:** No
**Contenido generado por usuarios:** No

---

### **D) DATOS DE LA APP**

**Correo electrónico de contacto:**
```
info@intocables13.com
```

**Sitio web (opcional):**
```
(Deja en blanco o pon tu sitio web si tienes)
```

**Política de privacidad (REQUERIDO):**
```
(Necesitas crear una URL pública con tu política de privacidad)
```

**⚠️ IMPORTANTE:** Google requiere una política de privacidad porque la app usa AdMob.

---

### **E) ASSETS REQUERIDOS**

Ya los tienes listos:

✅ **Icono de la aplicación:** `iconoapp.png` (512x512px)
✅ **Capturas de pantalla:** Carpeta `capturas_google_play_finales/`
   - Mínimo: 2 capturas
   - Formato: PNG o JPG
   - Tamaño: 320x3840px (9:16) o 1080x1920px

---

### **F) VERSIÓN DE LA APP**

**Código de versión (Version Code):** 1
**Nombre de versión (Version Name):** 1.0.0

---

## 📝 **PASO 3: COMPLETAR CUESTIONARIO DE CONTENIDO**

Google te hará preguntas sobre:

1. **¿La app es para niños?** → No
2. **¿Tiene anuncios?** → Sí
3. **¿Recopila datos de usuarios?** → Sí (email para login)
4. **¿Tiene compras dentro de la app?** → No
5. **¿Usa permisos sensibles?** → No

---

## 🔒 **PASO 4: POLÍTICA DE PRIVACIDAD**

**⚠️ OBLIGATORIO:** Necesitas crear una página web con tu política de privacidad.

**Opción rápida:** Usa un generador gratuito:
- https://www.privacypolicygenerator.info/
- https://www.freeprivacypolicy.com/

**Información para el generador:**
- Nombre de la app: MemoFlip
- Tipo de app: Juego móvil
- Datos recopilados: Email, progreso del juego
- Servicios de terceros: Google AdMob
- Contacto: info@intocables13.com

---

## ⏱️ **PASO 5: REVISIÓN DE GOOGLE**

Una vez subida la app:

1. Google la revisará automáticamente
2. **Tiempo de revisión:** 1-7 días (normalmente 2-3 días)
3. Te enviarán un email cuando esté aprobada o si hay problemas
4. Una vez aprobada, estará **disponible en Google Play** 🎉

---

## ⚠️ **POSIBLES RECHAZOS Y SOLUCIONES**

### **1. Falta política de privacidad**
**Solución:** Crea una política y añade la URL

### **2. Icono o capturas no válidas**
**Solución:** Usa las que ya preparamos (`iconoapp.png` y `capturas_google_play_finales/`)

### **3. Descripción muy corta o genérica**
**Solución:** Usa la descripción completa que te proporcioné arriba

### **4. Problemas con AdMob**
**Solución:** Asegúrate de declarar que la app tiene anuncios en el cuestionario

---

## 🎯 **CHECKLIST ANTES DE SUBIR**

- ✅ AAB firmado (`MemoFlip-GooglePlay.aab`)
- ✅ Icono 512x512 (`iconoapp.png`)
- ✅ Capturas de pantalla (`capturas_google_play_finales/`)
- ⏳ Política de privacidad (URL pública)
- ⏳ Descripción completa
- ⏳ Cuestionario de contenido

---

## 💰 **DESPUÉS DE LA APROBACIÓN**

### **Para monetizar con AdMob:**

1. Espera a que la app esté publicada
2. Crea tu cuenta en AdMob: https://admob.google.com
3. Obtén tus IDs reales (App ID, Banner, Intersticial, Recompensa)
4. Actualiza `src/lib/adService.ts` con tus IDs
5. Cambia `isTesting = false`
6. Recompila el AAB
7. Sube una nueva versión (versión 1.0.1)

---

## 📞 **¿NECESITAS AYUDA?**

Si tienes problemas:
1. Revisa el email de Google (te dirán exactamente qué falta)
2. Consulta la documentación: https://support.google.com/googleplay/android-developer
3. Asegúrate de que todos los campos están completos

---

**¡TODO LISTO PARA SUBIR A GOOGLE PLAY!** 🚀🎉

