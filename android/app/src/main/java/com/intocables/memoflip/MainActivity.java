package com.intocables.memoflip;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebChromeClient;
import android.webkit.JavascriptInterface;
import android.webkit.WebSettings;
import android.view.View;
import android.view.WindowManager;
import android.graphics.Color;
import android.os.Build;
import android.webkit.ConsoleMessage;
import android.webkit.CookieManager;
import android.util.Log;
import android.content.Intent;
import android.widget.Toast;

// Firebase imports
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.auth.GoogleAuthProvider;
import com.google.firebase.auth.AuthCredential;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.SetOptions;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import java.util.HashMap;
import java.util.Map;
import java.util.Iterator;
import org.json.JSONObject;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.tasks.Task;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.TaskCompletionSource;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.initialization.InitializationStatus;
import com.google.android.gms.ads.initialization.OnInitializationCompleteListener;

public class MainActivity extends Activity {
    private static final String TAG = "GameBridge";
    private static final int RC_SIGN_IN = 9001;
    
    private WebView webView;
    private AdView adView;
    private FirebaseAuth mAuth;
    private GoogleSignInClient mGoogleSignInClient;
    private FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Ocultar barras del sistema
        hideSystemUI();
        
        // Inicializar AdMob
        MobileAds.initialize(this, new OnInitializationCompleteListener() {
            @Override
            public void onInitializationComplete(InitializationStatus initializationStatus) {
                Log.d(TAG, "AdMob initialized");
            }
        });
        
        // Configurar AdView
        adView = findViewById(R.id.adView);
        AdRequest adRequest = new AdRequest.Builder().build();
        adView.loadAd(adRequest);
        
        // Inicializar Firebase Auth
        mAuth = FirebaseAuth.getInstance();
        
        // Configurar Google Sign-In
        GoogleSignInOptions gso = new GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
                .requestIdToken(getString(R.string.default_web_client_id))
                .requestEmail()
                .build();
        mGoogleSignInClient = GoogleSignIn.getClient(this, gso);
        
        // Inicializar Firestore
        db = FirebaseFirestore.getInstance();
        
        // Configurar WebView
        webView = findViewById(R.id.webview);
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        
        // Añadir JavaScript interface
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidInterface");
        
        // Configurar WebViewClient
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                return false;
            }
        });
        
        // Configurar WebChromeClient para logs
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                Log.d(TAG, "JS: " + consoleMessage.message() + " -- From line " + consoleMessage.lineNumber() + " of " + consoleMessage.sourceId());
                return true;
            }
        });

        // Cargar la página principal
        webView.loadUrl("file:///android_asset/index.html");
        
        // Si ya hay sesión, informa al JS al arrancar
        FirebaseUser u = mAuth.getCurrentUser();
        if (u != null) {
            sendUserToJS(u);
        }
    }
    
    private void hideSystemUI() {
        View decorView = getWindow().getDecorView();
        int uiOptions = View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_FULLSCREEN
                | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY;
        decorView.setSystemUiVisibility(uiOptions);
        
        // Mantener pantalla encendida
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }
    
            @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        if (adView != null) {
            adView.resume();
        }
    }
    
    @Override
    protected void onPause() {
        super.onPause();
        if (adView != null) {
            adView.pause();
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (adView != null) {
            adView.destroy();
        }
    }
    
    // ---------- BRIDGE ----------
    public class AndroidBridge {
        @JavascriptInterface
        public void login() {
            Log.d(TAG, "🔐 login() llamado desde JavaScript");
            runOnUiThread(() -> doNativeLogin());
        }
        
        @JavascriptInterface
        public void logout() {
            Log.d(TAG, "🚪 logout() llamado desde JavaScript");
            runOnUiThread(() -> doNativeLogout());
        }

        @JavascriptInterface
        public void getUser() {
            Log.d(TAG, "👤 getUser() llamado desde JavaScript");
            FirebaseUser u = mAuth.getCurrentUser();
            if (u != null) {
                sendUserToJS(u);
            } else {
                evalJS("window.__onNativeLogout && __onNativeLogout()");
            }
        }

        @JavascriptInterface
        public void saveNick(String nick) {
            Log.d(TAG, "💾 saveNick() llamado desde JavaScript: " + nick);
            runOnUiThread(() -> saveNickNative(nick));
        }

        @JavascriptInterface
        public void saveGameProgress(String progressJson) {
            Log.d(TAG, "🎮 Guardando progreso del juego: " + progressJson);
            
            FirebaseUser user = mAuth.getCurrentUser();
            if (user == null) {
                Log.e(TAG, "❌ No hay usuario logueado para guardar progreso");
                evalJS("window.__onSaveGameProgress && __onSaveGameProgress(false, 'not_logged_in')");
                return;
            }
            
            try {
                Log.d(TAG, "🔍 JSON recibido: " + progressJson);
                
                // Parsear JSON del progreso
                JSONObject progressData = new JSONObject(progressJson);
                Log.d(TAG, "✅ JSON parseado correctamente");
                
                // Convertir a Map para Firestore (SIN DUPLICACIÓN)
                Map<String, Object> data = new HashMap<>();
                data.put("uid", progressData.getString("uid"));
                data.put("nick", progressData.getString("nick"));
                data.put("email", progressData.getString("email"));
                data.put("displayName", progressData.getString("displayName"));
                data.put("lastUpdated", java.time.Instant.now().toString());
                Log.d(TAG, "✅ Datos básicos extraídos");
                
                // Guardar modo seleccionado si existe
                if (progressData.has("selectedMode")) {
                    data.put("selectedMode", progressData.getString("selectedMode"));
                    Log.d(TAG, "✅ Modo seleccionado guardado: " + progressData.getString("selectedMode"));
                }
                
                // Guardar vidas si existen
                if (progressData.has("currentLives")) {
                    data.put("currentLives", progressData.getInt("currentLives"));
                }
                if (progressData.has("lastLifeRegen")) {
                    data.put("lastLifeRegen", progressData.getString("lastLifeRegen"));
                }
                
                // Guardar progreso del usuario si existe
                if (progressData.has("progress")) {
                    JSONObject progress = progressData.getJSONObject("progress");
                    Map<String, Object> progressMap = new HashMap<>();
                    if (progress.has("beginner")) {
                        progressMap.put("beginner", convertJsonToMap(progress.getJSONObject("beginner")));
                    }
                    if (progress.has("normal")) {
                        progressMap.put("normal", convertJsonToMap(progress.getJSONObject("normal")));
                    }
                    if (progress.has("extreme")) {
                        progressMap.put("extreme", convertJsonToMap(progress.getJSONObject("extreme")));
                    }
                    data.put("progress", progressMap);
                    Log.d(TAG, "✅ Progreso por modo extraído");
                }
                
                // Guardar configuraciones si existen
                if (progressData.has("settings")) {
                    JSONObject settings = progressData.getJSONObject("settings");
                    Map<String, Object> settingsMap = new HashMap<>();
                    if (settings.has("soundEnabled")) {
                        settingsMap.put("soundEnabled", settings.getBoolean("soundEnabled"));
                    }
                    if (settings.has("vibrationEnabled")) {
                        settingsMap.put("vibrationEnabled", settings.getBoolean("vibrationEnabled"));
                    }
                    data.put("settings", settingsMap);
                    Log.d(TAG, "✅ Configuraciones extraídas");
                }
                
                // Guardar en Firestore
                FirebaseFirestore.getInstance().collection("apps").document("memoflip").collection("users").document(user.getUid())
                        .set(data, SetOptions.merge())
                        .addOnSuccessListener(v -> {
                            Log.d(TAG, "✅ Progreso del juego guardado en Firestore");
                            evalJS("window.__onSaveGameProgress && __onSaveGameProgress(true)");
                        })
                        .addOnFailureListener(e -> {
                            Log.e(TAG, "❌ Error guardando progreso del juego: " + e.getMessage());
                            evalJS("window.__onSaveGameProgress && __onSaveGameProgress(false, '" + e.getMessage() + "')");
                        });
                        
            } catch (Exception e) {
                Log.e(TAG, "❌ Error parseando progreso del juego: " + e.getMessage());
                evalJS("window.__onSaveGameProgress && __onSaveGameProgress(false, 'parse_error')");
            }
        }
    }
    
    // ---------- LOGIN ----------
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == RC_SIGN_IN) {
            Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
            try {
                GoogleSignInAccount account = task.getResult(ApiException.class);
                AuthCredential credential = GoogleAuthProvider.getCredential(account.getIdToken(), null);
                mAuth.signInWithCredential(credential).addOnCompleteListener(this, authTask -> {
                    if (authTask.isSuccessful()) {
                        FirebaseUser user = mAuth.getCurrentUser();
                        if (user != null) {
                            sendUserToJS(user);
                        }
                    } else {
                        Log.e(TAG, "signInWithCredential failed", authTask.getException());
                        evalJS("window.__onNativeLoginError && __onNativeLoginError('auth_failed')");
                    }
                });
            } catch (ApiException e) {
                Log.e(TAG, "GoogleSignIn failed", e);
                evalJS("window.__onNativeLoginError && __onNativeLoginError('gsi_failed')");
            }
        }
    }
    
    private void doNativeLogin() {
        Log.d(TAG, "🚀 Starting Google Sign-In...");
        Intent signInIntent = mGoogleSignInClient.getSignInIntent();
        startActivityForResult(signInIntent, RC_SIGN_IN);
    }
    
    // ---------- LOGOUT ----------
    private void doNativeLogout() {
        Log.d(TAG, "🚪 logout() called");
        // 1) Firebase
        mAuth.signOut();
        Log.d(TAG, "🔥 Firebase signOut() ejecutado");
        
        // 2) Google
        mGoogleSignInClient.signOut().addOnCompleteListener(this, t -> {
            Log.d(TAG, "✅ Google signOut done");
            // 3) WebView: cookies + callback JS
            CookieManager cm = CookieManager.getInstance();
            cm.removeAllCookies(null);
            cm.flush();
            Log.d(TAG, "🍪 Cookies limpiadas");
            
            // Llamar callback JS
            String jsCode = "localStorage.removeItem('user'); localStorage.removeItem('memoflip_user'); window.__onNativeLogout && __onNativeLogout()";
            Log.d(TAG, "📱 Ejecutando JS: " + jsCode);
            evalJS(jsCode);
        });
        
        // También revocar acceso para logout completo
        mGoogleSignInClient.revokeAccess().addOnCompleteListener(this, t -> {
            Log.d(TAG, "🔒 Acceso revocado: " + t.isSuccessful());
        });
    }
    
    // ---------- PERFIL A JS + COMPROBAR NICK ----------
    private void sendUserToJS(FirebaseUser u) {
        String uid = u.getUid();
        String email = u.getEmail() == null ? "" : u.getEmail();
        String name = u.getDisplayName() == null ? "" : u.getDisplayName();
        
        FirebaseFirestore.getInstance().collection("apps").document("memoflip").collection("users").document(uid).get()
                .addOnSuccessListener(doc -> {
                    Log.d(TAG, "🔍 Documento encontrado: " + doc.exists());
                    if (doc.exists()) {
                        Log.d(TAG, "📄 Datos del documento: " + doc.getData());
                        String nickFromDoc = doc.getString("nick");
                        Log.d(TAG, "👤 Nick desde Firestore: '" + nickFromDoc + "'");
                    }
                    
                    boolean hasNick = doc.exists() && doc.getString("nick") != null && !doc.getString("nick").isEmpty();
                    String nick = hasNick ? doc.getString("nick") : "";
                    
                    Log.d(TAG, "✅ hasNick: " + hasNick + ", nick: '" + nick + "'");
                    
                    try {
                        JSONObject payload = new JSONObject();
                        payload.put("uid", uid);
                        payload.put("email", email);
                        payload.put("displayName", name);
                        payload.put("hasNick", hasNick);
                        payload.put("nick", nick);
                        evalJS("window.__onNativeLogin && __onNativeLogin(" + JSONObject.quote(payload.toString()) + ")");
                    } catch (Exception e) {
                        Log.e(TAG, "JSON error", e);
                    }
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "Firestore get user failed", e);
                    evalJS("window.__onNativeLogin && __onNativeLogin('{\"uid\":\"" + uid + "\",\"email\":\"" + email + "\",\"displayName\":\"" + name + "\",\"hasNick\":false}')");
                });
    }
    
    private void saveNickNative(String nick) {
        FirebaseUser u = mAuth.getCurrentUser();
        if (u == null) {
            Log.e(TAG, "❌ No hay usuario logueado para guardar nick");
            evalJS("window.__onSaveNick && __onSaveNick(false, 'not_logged_in')");
            return;
        }
        
        Log.d(TAG, "💾 Validando nick '" + nick + "' para usuario: " + u.getUid());
        
        // 1. Verificar si el nick ya existe
        FirebaseFirestore.getInstance().collection("apps").document("memoflip").collection("nicks").document(nick).get()
                .addOnSuccessListener(nickDoc -> {
                    if (nickDoc.exists()) {
                        // El nick ya existe
                        String existingUid = nickDoc.getString("uid");
                        if (!u.getUid().equals(existingUid)) {
                            Log.e(TAG, "❌ Nick '" + nick + "' ya está ocupado por otro usuario");
                            evalJS("window.__onSaveNick && __onSaveNick(false, 'nick_taken')");
                            return;
                        }
                    }
                    
                    // 2. El nick está disponible, guardar en ambas colecciones
                    saveNickToBothCollections(nick, u);
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "❌ Error verificando nick: " + e.getMessage());
                    evalJS("window.__onSaveNick && __onSaveNick(false, 'check_failed')");
                });
    }
    
    private void saveNickToBothCollections(String nick, FirebaseUser u) {
        Log.d(TAG, "💾 Guardando nick '" + nick + "' en ambas colecciones");
        
        // Datos para la colección users
        Map<String, Object> userData = new HashMap<>();
        userData.put("nick", nick);
        userData.put("email", u.getEmail());
        userData.put("displayName", u.getDisplayName());
        userData.put("createdAt", java.time.Instant.now().toString());
        
        // Datos para la colección nicks
        Map<String, Object> nickData = new HashMap<>();
        nickData.put("uid", u.getUid());
        nickData.put("email", u.getEmail());
        nickData.put("displayName", u.getDisplayName());
        nickData.put("createdAt", java.time.Instant.now().toString());
        
        // Guardar en users
        FirebaseFirestore.getInstance().collection("apps").document("memoflip").collection("users").document(u.getUid())
                .set(userData, SetOptions.merge())
                .addOnSuccessListener(v -> {
                    Log.d(TAG, "✅ Usuario guardado en colección users");
                    
                    // Guardar en nicks
                    FirebaseFirestore.getInstance().collection("apps").document("memoflip").collection("nicks").document(nick)
                            .set(nickData, SetOptions.merge())
                            .addOnSuccessListener(v2 -> {
                                Log.d(TAG, "✅ Nick guardado en colección nicks");
                                evalJS("window.__onSaveNick && __onSaveNick(true)");
                            })
                            .addOnFailureListener(e -> {
                                Log.e(TAG, "❌ Error guardando en nicks: " + e.getMessage());
                                evalJS("window.__onSaveNick && __onSaveNick(false, 'nicks_save_failed')");
                            });
                })
                .addOnFailureListener(e -> {
                    Log.e(TAG, "❌ Error guardando en users: " + e.getMessage());
                    evalJS("window.__onSaveNick && __onSaveNick(false, 'users_save_failed')");
                });
    }
    
    private void evalJS(String js) {
        runOnUiThread(() -> webView.evaluateJavascript(js, null));
    }
    
    // Función auxiliar para convertir JSONObject a Map
    private Map<String, Object> convertJsonToMap(JSONObject json) {
        Map<String, Object> map = new HashMap<>();
        try {
            if (json == null) {
                Log.w(TAG, "⚠️ JSONObject es null en convertJsonToMap");
                return map;
            }
            
            Iterator<String> keys = json.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                Object value = json.get(key);
                if (value instanceof JSONObject) {
                    map.put(key, convertJsonToMap((JSONObject) value));
                } else if (value == JSONObject.NULL) {
                    map.put(key, null);
                } else {
                    map.put(key, value);
                }
            }
            Log.d(TAG, "✅ JSONObject convertido a Map: " + map.size() + " campos");
        } catch (Exception e) {
            Log.e(TAG, "❌ Error convirtiendo JSON a Map: " + e.getMessage());
            e.printStackTrace();
        }
        return map;
    }
}
