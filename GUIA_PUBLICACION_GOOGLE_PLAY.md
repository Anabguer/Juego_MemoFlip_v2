# 🚀 GUÍA: PUBLICAR MEMOFLIP EN GOOGLE PLAY

## 📋 **REQUISITOS PREVIOS**

- ✅ APK Debug funcionando correctamente
- ✅ Sistema de verificación por email activo
- ✅ Todas las funcionalidades probadas
- 📝 Cuenta de Google Play Developer (25 USD único pago)
- 🖼️ Assets gráficos (iconos, screenshots, banner)

---

## 🔐 **PASO 1: GENERAR KEYSTORE (CERTIFICADO)**

### **1.1 Crear keystore de firma**

```bash
# Ejecutar en terminal:
cd C:\Proyectos\MemoFlip\android\app

keytool -genkey -v -keystore memoflip-release.keystore -alias memoflip -keyalg RSA -keysize 2048 -validity 10000
```

### **Datos a proporcionar:**
```
- Password del keystore: [GUARDAR EN LUGAR SEGURO]
- Password del alias: [MISMO QUE EL ANTERIOR]
- Nombre y apellidos: Anabel Guerrero
- Unidad organizativa: intocables13
- Organización: intocables13
- Ciudad: [tu ciudad]
- Provincia: [tu provincia]
- Código país: ES
```

⚠️ **IMPORTANTE:** 
- Guarda el archivo `memoflip-release.keystore` en lugar SEGURO
- **NUNCA** lo subas a Git
- Si lo pierdes, NO podrás actualizar la app en Google Play

---

## 📝 **PASO 2: CONFIGURAR GRADLE PARA RELEASE**

### **2.1 Crear archivo de propiedades**

Crear: `android/keystore.properties`

```properties
storePassword=TU_PASSWORD_AQUI
keyPassword=TU_PASSWORD_AQUI
keyAlias=memoflip
storeFile=memoflip-release.keystore
```

### **2.2 Modificar `android/app/build.gradle`**

Añadir después de `android {`:

```gradle
// Cargar keystore
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... configuración existente ...
    
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 🏗️ **PASO 3: COMPILAR APK/AAB DE RELEASE**

### **3.1 Compilar APK Release**

```bash
cd android
.\gradlew.bat assembleRelease
```

**Resultado:** `android/app/build/outputs/apk/release/app-release.apk`

### **3.2 Compilar AAB (App Bundle) - RECOMENDADO**

```bash
cd android
.\gradlew.bat bundleRelease
```

**Resultado:** `android/app/build/outputs/bundle/release/app-release.aab`

⚠️ **Google Play prefiere AAB** (pesa menos, optimización automática)

---

## 📦 **PASO 4: PREPARAR ASSETS GRÁFICOS**

### **4.1 Icono de la app**

Ya tienes: `logo.png` (debe ser 512x512 px mínimo)

### **4.2 Screenshots necesarios:**

- **Mínimo 2** screenshots de diferentes pantallas
- Resolución: 1080x1920 px (o similar)
- Formato: PNG o JPG

**Capturas recomendadas:**
1. Pantalla de inicio (con logo)
2. Pantalla de juego (con cartas)
3. Pantalla de nivel completado
4. Pantalla de ranking

### **4.3 Banner de funciones**

- Tamaño: 1024x500 px
- Imagen promocional destacada

---

## 📱 **PASO 5: CREAR CUENTA EN GOOGLE PLAY CONSOLE**

### **5.1 Registrarse:**
1. Ir a: https://play.google.com/console/signup
2. Pagar 25 USD (único pago, para toda la vida)
3. Completar perfil de desarrollador

### **5.2 Verificar cuenta:**
- Email
- Información fiscal (si aplica)
- Cuenta bancaria (para pagos de anuncios/compras)

---

## 🎮 **PASO 6: CREAR NUEVA APP EN GOOGLE PLAY**

### **6.1 Crear aplicación:**
1. Click "Crear aplicación"
2. Nombre: **MemoFlip**
3. Idioma: Español
4. Tipo: Aplicación / Juego
5. Categoría: Juegos → Puzles
6. Gratis: Sí

### **6.2 Ficha de Play Store:**

#### **Descripción breve (80 caracteres):**
```
Juego de memoria con mecánicas desafiantes. ¡1000 niveles te esperan!
```

#### **Descripción completa (4000 caracteres):**
```
🎮 MemoFlip - El juego de memoria que desafía tu mente

¿Cansado de los juegos de memoria simples? MemoFlip lleva el género a un nuevo nivel con mecánicas innovadoras que pondrán a prueba tu memoria y estrategia.

✨ CARACTERÍSTICAS PRINCIPALES:

🎴 1000 NIVELES ÚNICOS
Progresa a través de cientos de niveles con dificultad creciente. Cada nivel presenta nuevos desafíos y mecánicas sorprendentes.

🧩 MECÁNICAS DESAFIANTES
- Cartas Rotatorias: Cartas que giran constantemente
- Cartas Congeladas: Que debes liberar primero
- Bombas: Elimina parejas incorrectas
- Camaleón: Cartas que cambian de imagen
- ¡Y muchas más sorpresas!

💰 SISTEMA DE MONEDAS Y VIDAS
- Gana monedas completando niveles
- Sistema de vidas con regeneración automática
- Compite en el ranking global

🎨 117 CARTAS DIFERENTES
Variedad infinita de diseños para que nunca te aburras

🏆 RANKING GLOBAL
Compite con jugadores de todo el mundo

🔊 AUDIO INMERSIVO
Música de fondo y efectos de sonido que mejoran la experiencia

☁️ SINCRONIZACIÓN EN LA NUBE
Tu progreso se guarda automáticamente. Juega desde cualquier dispositivo.

🎯 ¿POR QUÉ MEMOFLIP?

- Gratis para jugar
- Sin límites de tiempo
- Actualizaciones constantes
- Diseño moderno y atractivo
- Optimizado para todos los dispositivos

¡Descarga ahora y demuestra tu habilidad mental! 🧠✨
```

#### **Screenshots:**
- Subir mínimo 2, máximo 8
- 1080x1920 px

#### **Icono:**
- 512x512 px
- Usar: `logo.png`

---

## 🎯 **PASO 7: CONFIGURAR VERSIÓN INICIAL**

### **7.1 Datos de la versión:**

- **Nombre de la versión:** 1.0.0
- **Código de versión:** 1

### **7.2 En `android/app/build.gradle`:**

```gradle
android {
    defaultConfig {
        applicationId "com.memoflip.app"
        minSdk 22
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
}
```

---

## 📤 **PASO 8: SUBIR A GOOGLE PLAY**

### **8.1 Producción → Versiones:**
1. Click "Crear nueva versión"
2. Subir `app-release.aab`
3. Completar notas de la versión:

```
Versión 1.0.0 - Lanzamiento inicial

✨ Características:
- 1000 niveles únicos
- 117 cartas diferentes
- Mecánicas desafiantes
- Sistema de verificación por email
- Sincronización en la nube
- Ranking global
- Audio inmersivo

¡Disfruta de MemoFlip! 🎮
```

### **8.2 Revisar y publicar:**
1. Google Play revisará la app (1-7 días)
2. Recibirás email cuando esté aprobada
3. ¡App publicada! 🎉

---

## 💰 **PASO 9: INTEGRAR ANUNCIOS (ADMOB)**

### **9.1 Crear cuenta en AdMob:**
1. Ir a: https://admob.google.com/
2. Registrarse con tu cuenta Google
3. Crear nueva app: **MemoFlip**

### **9.2 Crear bloques de anuncios:**

#### **Tipos recomendados para MemoFlip:**

**A. Banner inferior** (siempre visible)
- Tipo: Banner
- Ubicación: Parte inferior de la pantalla de juego

**B. Intersticial** (entre niveles)
- Tipo: Intersticial
- Ubicación: Al completar nivel (cada 3-5 niveles)

**C. Recompensado** (para vidas extra)
- Tipo: Recompensado
- Ubicación: Modal "Sin vidas" → Ver anuncio = +1 vida

### **9.3 Obtener IDs de AdMob:**

Después de crear los bloques, obtendrás:
```
App ID: ca-app-pub-XXXXXXXX~XXXXXXXXXX
Banner ID: ca-app-pub-XXXXXXXX/XXXXXXXXXX
Intersticial ID: ca-app-pub-XXXXXXXX/XXXXXXXXXX
Recompensado ID: ca-app-pub-XXXXXXXX/XXXXXXXXXX
```

---

## 📲 **PASO 10: INTEGRAR ADMOB EN CAPACITOR**

### **10.1 Instalar plugin:**

```bash
npm install @capacitor-community/admob
npx cap sync
```

### **10.2 Configurar en `capacitor.config.ts`:**

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.memoflip.app',
  appName: 'MemoFlip',
  webDir: 'out',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#667eea"
    },
    AdMob: {
      appId: 'ca-app-pub-XXXXXXXX~XXXXXXXXXX',
      testingDevices: ['DEVICE_ID_AQUI'], // Para testing
    }
  }
};

export default config;
```

### **10.3 Configurar en `android/app/src/main/AndroidManifest.xml`:**

Añadir dentro de `<application>`:

```xml
<meta-data
    android:name="com.google.android.gms.ads.APPLICATION_ID"
    android:value="ca-app-pub-XXXXXXXX~XXXXXXXXXX"/>
```

---

## 💻 **PASO 11: CÓDIGO DE ANUNCIOS**

### **11.1 Crear servicio de anuncios:**

Ya tienes creado: `src/lib/adService.ts` ✅

Actualizarlo con IDs reales de AdMob.

### **11.2 Mostrar anuncios:**

#### **Banner inferior (GameScreen.tsx):**
```typescript
import { AdMob, BannerAdSize, BannerAdPosition } from '@capacitor-community/admob';

// Al iniciar el juego
useEffect(() => {
  AdMob.showBanner({
    adId: 'ca-app-pub-XXXXXXXX/XXXXXXXXXX',
    adSize: BannerAdSize.BANNER,
    position: BannerAdPosition.BOTTOM_CENTER,
  });
}, []);
```

#### **Intersticial (cada 3 niveles):**
```typescript
// En handleNextLevel de GameScreen.tsx
if (currentLevel % 3 === 0) {
  await AdMob.prepareInterstitial({
    adId: 'ca-app-pub-XXXXXXXX/XXXXXXXXXX'
  });
  await AdMob.showInterstitial();
}
```

#### **Recompensado (para vidas):**
```typescript
// En NoLivesModal.tsx
const handleWatchAd = async () => {
  await AdMob.prepareRewardVideoAd({
    adId: 'ca-app-pub-XXXXXXXX/XXXXXXXXXX'
  });
  
  const result = await AdMob.showRewardVideoAd();
  
  if (result.rewarded) {
    // Dar +1 vida
    gainLife();
  }
};
```

---

## 🎨 **PASO 12: ASSETS GRÁFICOS PARA GOOGLE PLAY**

### **Necesitas crear:**

#### **1. Icono de app (ya tienes logo.png)**
- 512x512 px
- PNG con transparencia
- ✅ Ya tienes: `logo.png`

#### **2. Banner de funciones:**
- 1024x500 px
- Imagen promocional

#### **3. Screenshots (mínimo 2):**
- Resolución: 1080x1920 px o superior
- Capturas de diferentes pantallas

#### **4. Video promocional (opcional):**
- YouTube
- 30 segundos - 2 minutos
- Gameplay + características

---

## 📝 **PASO 13: CHECKLIST ANTES DE PUBLICAR**

### **Configuración:**
- [ ] Keystore creado y guardado de forma segura
- [ ] `build.gradle` configurado con firma
- [ ] AAB de release compilado
- [ ] Versión: 1.0.0, Código: 1

### **Pruebas:**
- [ ] APK de release probada en móvil real
- [ ] Todas las funcionalidades funcionan
- [ ] Sistema de verificación operativo
- [ ] Sincronización offline funciona
- [ ] Audio funciona correctamente
- [ ] No hay crashes

### **Assets:**
- [ ] Icono 512x512 preparado
- [ ] Mínimo 2 screenshots preparados
- [ ] Banner de funciones preparado (opcional)
- [ ] Descripción escrita
- [ ] Descripción corta escrita

### **Legal:**
- [ ] Política de privacidad (requerido si recoges emails)
- [ ] Términos de servicio
- [ ] Categoría de edad: PEGI 3 / Everyone

---

## 📋 **PASO 14: POLÍTICA DE PRIVACIDAD (OBLIGATORIO)**

Google Play requiere política de privacidad si:
- ✅ Recoges emails (sí, para registro)
- ✅ Guardas progreso en servidor

### **Crear archivo:** `politica_privacidad_memoflip.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Política de Privacidad - MemoFlip</title>
</head>
<body>
    <h1>Política de Privacidad de MemoFlip</h1>
    <p><strong>Última actualización:</strong> Octubre 2024</p>
    
    <h2>1. Información que recopilamos</h2>
    <p>MemoFlip recopila la siguiente información:</p>
    <ul>
        <li>Email (para crear cuenta)</li>
        <li>Nombre de usuario</li>
        <li>Progreso del juego (niveles, monedas, vidas)</li>
    </ul>
    
    <h2>2. Uso de la información</h2>
    <p>Usamos tu información para:</p>
    <ul>
        <li>Autenticación de usuario</li>
        <li>Sincronización de progreso entre dispositivos</li>
        <li>Ranking global</li>
        <li>Recuperación de cuenta</li>
    </ul>
    
    <h2>3. Compartir información</h2>
    <p>NO compartimos tu información con terceros, excepto:</p>
    <ul>
        <li>Google Analytics (estadísticas anónimas)</li>
        <li>AdMob (para mostrar anuncios)</li>
    </ul>
    
    <h2>4. Seguridad</h2>
    <p>Tu contraseña se almacena hasheada (encriptada). Nadie puede verla.</p>
    
    <h2>5. Tus derechos</h2>
    <p>Puedes:</p>
    <ul>
        <li>Solicitar eliminación de cuenta (desde la app)</li>
        <li>Acceder a tus datos</li>
        <li>Modificar tu información</li>
    </ul>
    
    <h2>6. Contacto</h2>
    <p>Email: info@intocables13.com</p>
    
    <h2>7. Cambios en esta política</h2>
    <p>Podemos actualizar esta política. Te notificaremos de cambios importantes.</p>
</body>
</html>
```

**Subir a:** https://colisan.com/memoflip/politica_privacidad.html

---

## 🎯 **PASO 15: PROCESO DE PUBLICACIÓN**

### **15.1 En Google Play Console:**

1. **Crear nueva versión de producción**
2. **Subir AAB** (`app-release.aab`)
3. **Completar información:**
   - Descripción
   - Screenshots
   - Icono
   - Banner de funciones
4. **Clasificación de contenido:**
   - Cuestionario simple
   - Responder sobre violencia, lenguaje, etc.
   - MemoFlip: PEGI 3 / Everyone
5. **Precios y distribución:**
   - Gratis
   - Todos los países
6. **Política de privacidad:**
   - URL: https://colisan.com/memoflip/politica_privacidad.html

### **15.2 Enviar para revisión:**
1. Click "Enviar para revisión"
2. Esperar 1-7 días
3. Google revisará:
   - Funcionalidad
   - Contenido
   - Cumplimiento de políticas

### **15.3 Aprobación:**
- Recibirás email cuando esté aprobada
- La app aparecerá en Google Play
- ¡Disponible para todos! 🎉

---

## 💡 **PASO 16: DESPUÉS DE PUBLICAR**

### **Monetización:**
- Activar anuncios AdMob
- Configurar frecuencia de intersticiales
- Implementar anuncios recompensados

### **Actualizaciones:**
```bash
# Incrementar versión en build.gradle
versionCode 2
versionName "1.1.0"

# Compilar nueva AAB
.\gradlew.bat bundleRelease

# Subir a Google Play Console
```

### **Marketing:**
- Compartir en redes sociales
- Crear video promocional
- Pedir reseñas a usuarios

---

## 🚀 **SCRIPT AUTOMATIZADO**

¿Quieres que cree scripts para:
1. ✅ Generar keystore automáticamente
2. ✅ Compilar AAB de release
3. ✅ Copiar AAB a carpeta de distribución
4. ✅ Crear política de privacidad HTML

---

## 📞 **RECURSOS ÚTILES**

- Google Play Console: https://play.google.com/console
- AdMob: https://admob.google.com/
- Documentación Capacitor AdMob: https://github.com/capacitor-community/admob
- Generador de screenshots: https://mockuphone.com/

---

**¿Quieres que empiece creando los scripts de compilación Release y la política de privacidad?** 🚀

