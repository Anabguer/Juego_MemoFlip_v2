# 📱 CONFIGURACIÓN ESTÁNDAR PARA APKs ANDROID CON FIREBASE

## 🎯 **MENSAJE PARA CURSOR (cópialo tal cual):**

```
⚠️ PROYECTO ANDROID NATIVO CON FIREBASE

OBJETIVO: APK Android nativo que se conecta a Google y Firebase para:
- ✅ Login con Google (Android nativo, NO Web SDK)
- ✅ Guardar progreso en Firestore
- ✅ Funcionar offline con localStorage
- ✅ Ranking online con Firebase

🔧 CONFIGURACIÓN REQUERIDA:

1. ANDROID NATIVO (NO Firebase Web SDK):
   - MainActivity.java con FirebaseAuth nativo
   - GoogleSignInClient para login
   - Comunicación WebView ↔ Android via AndroidInterface
   - Usar google-services.json existente

2. NO USAR:
   - ❌ firebase-app-compat.js
   - ❌ firebase-auth-compat.js
   - ❌ signInWithPopup()
   - ❌ Firebase Web SDK

3. SÍ USAR:
   - ✅ Firebase Auth nativo en Java
   - ✅ Google Sign-In nativo
   - ✅ WebView con JavaScriptInterface
   - ✅ localStorage para offline
   - ✅ Firestore para ranking online

4. ESTRUCTURA:
   - WebView carga HTML/CSS/JS local
   - Android maneja Firebase Auth
   - JavaScript se comunica con Android
   - Modo demo como fallback

5. FUNCIONALIDADES:
   - Login Google nativo
   - Progreso guardado local + Firestore
   - Ranking online
   - Funciona offline
   - Modo inmersivo (sin barras móvil)

🚀 RESULTADO: APK que funciona como app nativa con Firebase.
```

## 📋 **CHECKLIST PARA FUTUROS PROYECTOS:**

- [ ] **Android nativo** (NO Web SDK)
- [ ] **MainActivity.java** con FirebaseAuth
- [ ] **GoogleSignInClient** configurado
- [ ] **AndroidInterface** para WebView
- [ ] **google-services.json** en app/
- [ ] **Modo demo** como fallback
- [ ] **localStorage** para offline
- [ ] **Firestore** para ranking
- [ ] **Modo inmersivo** habilitado

## 🎮 **EJEMPLO DE USO:**

```java
// MainActivity.java
public class MainActivity extends Activity {
    private FirebaseAuth mAuth;
    private GoogleSignInClient mGoogleSignInClient;
    
    // Firebase Auth nativo
    // Google Sign-In nativo
    // WebView con JavaScriptInterface
}
```

```javascript
// index.html
// Llamar a Android nativo
window.AndroidInterface.loginWithGoogle();
// Modo demo como fallback
```

## 🔥 **VENTAJAS:**

- ✅ **Más rápido** (nativo vs Web SDK)
- ✅ **Más estable** (no depende de WebView)
- ✅ **Mejor UX** (login nativo de Android)
- ✅ **Offline** (localStorage + sync)
- ✅ **Ranking** (Firestore online)

---

**💡 RECUERDA: Android nativo + Firebase = APK profesional**


