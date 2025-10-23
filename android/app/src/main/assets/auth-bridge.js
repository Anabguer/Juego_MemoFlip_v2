/* ============================================================
   auth-bridge.js — Login de Google + Firebase Web (Android Simple)
   Requisitos:
   - Firebase Web SDK cargado
   - Google Sign-In Web SDK cargado
   - window.FIREBASE_CONFIG configurado
   ============================================================ */

(function () {
    const LOG_PREFIX = "🔐 [auth-bridge]";

    function log(...a){ try{ console.log(LOG_PREFIX, ...a);}catch(_){} }
    function warn(...a){ try{ console.warn(LOG_PREFIX, ...a);}catch(_){} }

    // --- Asegura Firebase inicializado ---
    function ensureFirebase() {
        if (!window.firebase) {
            throw new Error("Firebase no está cargado. Incluye firebase-app y firebase-auth.");
        }
        if (!window.FIREBASE_CONFIG) {
            throw new Error("Falta window.FIREBASE_CONFIG.");
        }
        if (window.firebase.apps?.length) return window.firebase.app();
        return window.firebase.initializeApp(window.FIREBASE_CONFIG);
    }

    // --- Login con Google Web ---
    async function tryFirebaseLogin() {
        log("Inicio login con Google Web...");

        // Verificar que Google Sign-In esté cargado
        if (!window.google) {
            throw new Error("Google Sign-In SDK no está cargado.");
        }

        const app = ensureFirebase();
        const auth = window.firebase.auth(app);
        const provider = new window.firebase.auth.GoogleAuthProvider();

        try {
            // Login con popup
            const result = await auth.signInWithPopup(provider);
            log("Login OK:", result.user?.uid || "(sin uid)");
            return result.user;
        } catch (error) {
            // Si falla popup, intentar redirect
            if (error.code === 'auth/popup-blocked') {
                log("Popup bloqueado, intentando redirect...");
                await auth.signInWithRedirect(provider);
                return null; // El redirect manejará el resultado
            }
            throw error;
        }
    }

    // --- Helpers opcionales ---
    async function signOutFirebase() {
        try {
            const app = ensureFirebase();
            await window.firebase.auth(app).signOut();
            log("SignOut OK");
        } catch (e) { warn("SignOut error:", e); }
    }

    function getCurrentUser() {
        try {
            const app = window.firebase?.apps?.length ? window.firebase.app() : null;
            return app ? window.firebase.auth(app).currentUser : null;
        } catch (_) { return null; }
    }

    // Exponer global
    window.tryFirebaseLogin = tryFirebaseLogin;
    window.signOutFirebase = signOutFirebase;
    window.getCurrentUser = getCurrentUser;

    log("Auth bridge cargado. Firebase Web + Google Sign-In listo.");
})();
