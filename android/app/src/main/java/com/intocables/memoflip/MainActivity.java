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
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.OnUserEarnedRewardListener;

public class MainActivity extends Activity {
    private static final String TAG = "GameBridge";
    private static final int RC_SIGN_IN = 9001;
    
    // AdMob IDs de producción
    private static final String INTERSTITIAL_AD_ID = "ca-app-pub-1338301235950360/4053951805";
    private static final String REWARDED_AD_ID = "ca-app-pub-1338301235950360/3008850481";
    
    private WebView webView;
    private AdView adView;
    private InterstitialAd interstitialAd;
    private RewardedAd rewardedAd;
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
                // Cargar anuncios después de la inicialización
                loadInterstitialAd();
                loadRewardedAd();
            }
        });
        
        // Configurar AdView
        adView = findViewById(R.id.adView);
        if (adView != null) {
            Log.d(TAG, "✅ AdView encontrado, cargando anuncio...");
            
            // Crear request con información de depuración
            AdRequest adRequest = new AdRequest.Builder()
                    .build();
            
            // OBTENER ID DE DISPOSITIVO PARA REGISTRAR EN ADMOB
            // Copia este ID en: AdMob > Settings > Test devices
            Log.d(TAG, "📱 DEVICE ID PARA TEST: " + android.provider.Settings.Secure.getString(getContentResolver(), android.provider.Settings.Secure.ANDROID_ID));
            
            adView.loadAd(adRequest);
            
            // Listener para debug
            adView.setAdListener(new com.google.android.gms.ads.AdListener() {
                @Override
                public void onAdLoaded() {
                    Log.d(TAG, "✅ ===== BANNER AD CARGADO EXITOSAMENTE =====");
                    Log.d(TAG, "✅ AdView visibility: " + adView.getVisibility());
                    Log.d(TAG, "✅ AdView width: " + adView.getWidth());
                    Log.d(TAG, "✅ AdView height: " + adView.getHeight());
                }
                
                @Override
                public void onAdFailedToLoad(com.google.android.gms.ads.LoadAdError adError) {
                    Log.e(TAG, "❌ ===== BANNER AD FALLÓ AL CARGAR =====");
                    Log.e(TAG, "❌ Error code: " + adError.getCode());
                    Log.e(TAG, "❌ Error message: " + adError.getMessage());
                    Log.e(TAG, "❌ Error domain: " + adError.getDomain());
                    if (adError.getCause() != null) {
                        Log.e(TAG, "❌ Cause: " + adError.getCause().toString());
                    }
                }
                
                @Override
                public void onAdOpened() {
                    Log.d(TAG, "📱 Banner ad opened");
                }
                
                @Override
                public void onAdClicked() {
                    Log.d(TAG, "👆 Banner ad clicked");
                }
                
                @Override
                public void onAdClosed() {
                    Log.d(TAG, "❌ Banner ad closed");
                }
            });
        } else {
            Log.e(TAG, "❌ AdView no encontrado en el layout");
        }
        
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
        // Usamos fullscreen con layout para que el banner sea visible
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
            
            // Verificar visibilidad del AdView después de que la app esté visible
            if (adView != null) {
                adView.post(() -> {
                    Log.d(TAG, "🔍 Verificando AdView después de focus:");
                    Log.d(TAG, "🔍 Visibility: " + adView.getVisibility());
                    Log.d(TAG, "🔍 Width: " + adView.getWidth());
                    Log.d(TAG, "🔍 Height: " + adView.getHeight());
                    Log.d(TAG, "🔍 Layout params: " + adView.getLayoutParams());
                    if (adView.getParent() != null) {
                        Log.d(TAG, "🔍 Parent: " + adView.getParent().getClass().getSimpleName());
                    }
                });
            }
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
        public void showInterstitialAd() {
            Log.d(TAG, "📺 showInterstitialAd() llamado desde JavaScript");
            runOnUiThread(() -> showInterstitialAdNative(false));
        }
        
        @JavascriptInterface
        public void showInterstitialAdForLife() {
            Log.d(TAG, "📺 showInterstitialAdForLife() llamado desde JavaScript");
            runOnUiThread(() -> showInterstitialAdNative(true));
        }
        
        @JavascriptInterface
        public void showRewardedAd() {
            Log.d(TAG, "🎁 showRewardedAd() llamado desde JavaScript");
            runOnUiThread(() -> showRewardedAdNative());
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
                
                // Guardar datos de vidas por modo si existen
                if (progressData.has("livesData")) {
                    JSONObject livesData = progressData.getJSONObject("livesData");
                    Map<String, Object> livesDataMap = new HashMap<>();
                    if (livesData.has("beginner")) {
                        livesDataMap.put("beginner", convertJsonToMap(livesData.getJSONObject("beginner")));
                    }
                    if (livesData.has("normal")) {
                        livesDataMap.put("normal", convertJsonToMap(livesData.getJSONObject("normal")));
                    }
                    if (livesData.has("extreme")) {
                        livesDataMap.put("extreme", convertJsonToMap(livesData.getJSONObject("extreme")));
                    }
                    data.put("livesData", livesDataMap);
                    Log.d(TAG, "✅ Datos de vidas por modo extraídos");
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
                    if (settings.has("musicEnabled")) {
                        settingsMap.put("musicEnabled", settings.getBoolean("musicEnabled"));
                    }
                    if (settings.has("musicVolume")) {
                        settingsMap.put("musicVolume", settings.getDouble("musicVolume"));
                    }
                    if (settings.has("soundVolume")) {
                        settingsMap.put("soundVolume", settings.getDouble("soundVolume"));
                    }
                    if (settings.has("vibrationEnabled")) {
                        settingsMap.put("vibrationEnabled", settings.getBoolean("vibrationEnabled"));
                    }
                    data.put("settings", settingsMap);
                    Log.d(TAG, "✅ Configuraciones completas extraídas: " + settingsMap.toString());
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
        
        @JavascriptInterface
        public void getRanking(String mode) {
            Log.d(TAG, "🏆 getRanking() llamado desde JavaScript para modo: " + mode);
            runOnUiThread(() -> getRankingNative(mode));
        }
        
        @JavascriptInterface
        public void getUserProgress(String uid, String mode) {
            Log.d(TAG, "📊 getUserProgress() llamado desde JavaScript para UID: " + uid + ", modo: " + mode);
            runOnUiThread(() -> getUserProgressNative(uid, mode));
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
    
    // ---------- RANKING ----------
    private void getRankingNative(String mode) {
        Log.d(TAG, "🏆 Obteniendo ranking para modo: " + mode);
        
        // Los datos están en progress.{mode}, no en memoflip_progress_{mode}
        String progressPath = "progress." + mode;
        Log.d(TAG, "🏆 Progress path: " + progressPath);
        
        // Consulta menos restrictiva: obtener todos los usuarios y filtrar en código
        db.collection("apps").document("memoflip").collection("users")
            .limit(100)
            .get()
            .addOnSuccessListener(queryDocumentSnapshots -> {
                Log.d(TAG, "🏆 Ranking obtenido: " + queryDocumentSnapshots.size() + " usuarios");
                
                try {
                    org.json.JSONArray rankingArray = new org.json.JSONArray();
                    
                    for (com.google.firebase.firestore.DocumentSnapshot doc : queryDocumentSnapshots) {
                        Map<String, Object> userData = doc.getData();
                        if (userData != null) {
                            org.json.JSONObject player = new org.json.JSONObject();
                            player.put("uid", doc.getId());
                            player.put("nick", userData.get("nick"));
                            player.put("displayName", userData.get("displayName"));
                            
                            // Los datos están en progress.{mode}
                            Map<String, Object> progressData = (Map<String, Object>) userData.get("progress");
                            if (progressData != null) {
                                Map<String, Object> modeProgress = (Map<String, Object>) progressData.get(mode);
                                if (modeProgress != null) {
                                    // Usuario tiene progreso en este modo
                                    player.put("level", modeProgress.get("level"));
                                    player.put("coins", modeProgress.get("coins"));
                                    Log.d(TAG, "🏆 Jugador con progreso añadido: " + player.toString());
                                } else {
                                    // Usuario no tiene progreso en este modo, usar valores por defecto
                                    player.put("level", 1);
                                    player.put("coins", 0);
                                    Log.d(TAG, "🏆 Jugador sin progreso añadido: " + player.toString());
                                }
                            } else {
                                // Usuario no tiene datos de progress, usar valores por defecto
                                player.put("level", 1);
                                player.put("coins", 0);
                                Log.d(TAG, "🏆 Jugador sin datos de progress añadido: " + player.toString());
                            }
                            
                            rankingArray.put(player);
                        }
                    }
                    
                    // Ordenar el ranking por nivel descendente y luego por monedas descendente
                    java.util.List<org.json.JSONObject> rankingList = new java.util.ArrayList<>();
                    for (int i = 0; i < rankingArray.length(); i++) {
                        rankingList.add(rankingArray.getJSONObject(i));
                    }
                    
                    rankingList.sort((a, b) -> {
                        try {
                            int levelA = a.getInt("level");
                            int levelB = b.getInt("level");
                            if (levelA != levelB) {
                                return Integer.compare(levelB, levelA); // Descendente
                            }
                            int coinsA = a.getInt("coins");
                            int coinsB = b.getInt("coins");
                            return Integer.compare(coinsB, coinsA); // Descendente
                        } catch (Exception e) {
                            return 0;
                        }
                    });
                    
                    // Reconstruir el array ordenado
                    org.json.JSONArray sortedRankingArray = new org.json.JSONArray();
                    for (org.json.JSONObject player : rankingList) {
                        sortedRankingArray.put(player);
                    }
                    
                    String rankingJson = sortedRankingArray.toString();
                    Log.d(TAG, "🏆 Ranking JSON final ordenado: " + rankingJson);
                    
                    // Enviar ranking a JavaScript
                    evalJS("window.__onRankingLoaded && window.__onRankingLoaded(" + rankingJson + ")");
                    
                } catch (Exception e) {
                    Log.e(TAG, "❌ Error procesando ranking: " + e.getMessage());
                    e.printStackTrace();
                    evalJS("window.__onRankingLoaded && window.__onRankingLoaded([])");
                }
            })
            .addOnFailureListener(e -> {
                Log.e(TAG, "❌ Error en consulta de ranking: " + e.getMessage());
                e.printStackTrace();
                evalJS("window.__onRankingLoaded && window.__onRankingLoaded([])");
            });
    }
    
    // ---------- OBTENER PROGRESO DE USUARIO ----------
    private void getUserProgressNative(String uid, String mode) {
        Log.d(TAG, "📊 Obteniendo progreso para UID: " + uid + ", modo: " + mode);
        
        db.collection("apps").document("memoflip").collection("users").document(uid)
            .get()
            .addOnSuccessListener(documentSnapshot -> {
                if (documentSnapshot.exists()) {
                    Log.d(TAG, "📊 Usuario encontrado en Firebase");
                    
                    try {
                        Map<String, Object> userData = documentSnapshot.getData();
                        if (userData != null) {
                            // Los datos están en progress.{mode}, no en memoflip_progress_{mode}
                            Map<String, Object> progressData = (Map<String, Object>) userData.get("progress");
                            if (progressData != null) {
                                Map<String, Object> progress = (Map<String, Object>) progressData.get(mode);
                            
                            if (progress != null) {
                                // Convertir progreso a JSON
                                org.json.JSONObject progressJson = new org.json.JSONObject();
                                progressJson.put("level", progress.get("level"));
                                progressJson.put("coins", progress.get("coins"));
                                progressJson.put("bestTime", progress.get("bestTime"));
                                progressJson.put("bestFlips", progress.get("bestFlips"));
                                progressJson.put("totalGames", progress.get("totalGames"));
                                progressJson.put("totalWins", progress.get("totalWins"));
                                progressJson.put("lastPlayed", progress.get("lastPlayed"));
                                
                                String progressJsonString = progressJson.toString();
                                Log.d(TAG, "📊 Progreso encontrado: " + progressJsonString);
                                
                                // Enviar a JavaScript
                                evalJS("window.__onUserProgressLoaded && window.__onUserProgressLoaded('" + mode + "', " + progressJsonString + ")");
                            } else {
                                Log.d(TAG, "📊 No hay progreso para modo " + mode + ", enviando valores por defecto");
                                // Enviar valores por defecto
                                org.json.JSONObject defaultProgress = new org.json.JSONObject();
                                defaultProgress.put("level", 1);
                                defaultProgress.put("coins", 0);
                                defaultProgress.put("bestTime", null);
                                defaultProgress.put("bestFlips", null);
                                defaultProgress.put("totalGames", 0);
                                defaultProgress.put("totalWins", 0);
                                defaultProgress.put("lastPlayed", java.time.Instant.now().toString());
                                
                                evalJS("window.__onUserProgressLoaded && window.__onUserProgressLoaded('" + mode + "', " + defaultProgress.toString() + ")");
                            }
                            } else {
                                Log.d(TAG, "📊 No hay datos de progress en Firebase");
                                // Enviar valores por defecto
                                org.json.JSONObject defaultProgress = new org.json.JSONObject();
                                defaultProgress.put("level", 1);
                                defaultProgress.put("coins", 0);
                                defaultProgress.put("bestTime", null);
                                defaultProgress.put("bestFlips", null);
                                defaultProgress.put("totalGames", 0);
                                defaultProgress.put("totalWins", 0);
                                defaultProgress.put("lastPlayed", java.time.Instant.now().toString());
                                evalJS("window.__onUserProgressLoaded && window.__onUserProgressLoaded('" + mode + "', " + defaultProgress.toString() + ")");
                            }
                        } else {
                            Log.d(TAG, "📊 Datos de usuario vacíos");
                            evalJS("window.__onUserProgressLoaded && window.__onUserProgressLoaded('" + mode + "', null)");
                        }
                    } catch (Exception e) {
                        Log.e(TAG, "❌ Error procesando progreso: " + e.getMessage());
                        e.printStackTrace();
                        evalJS("window.__onUserProgressLoaded && window.__onUserProgressLoaded('" + mode + "', null)");
                    }
                } else {
                    Log.d(TAG, "📊 Usuario no encontrado en Firebase");
                    evalJS("window.__onUserProgressLoaded && window.__onUserProgressLoaded('" + mode + "', null)");
                }
            })
            .addOnFailureListener(e -> {
                Log.e(TAG, "❌ Error obteniendo progreso: " + e.getMessage());
                e.printStackTrace();
                evalJS("window.__onUserProgressLoaded && window.__onUserProgressLoaded('" + mode + "', null)");
            });
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
    
    // ---------- ADMOB METHODS ----------
    private void loadInterstitialAd() {
        AdRequest adRequest = new AdRequest.Builder().build();
        
        InterstitialAdLoadCallback adLoadCallback = new InterstitialAdLoadCallback() {
            @Override
            public void onAdLoaded(InterstitialAd ad) {
                Log.d(TAG, "✅ Interstitial ad loaded");
                interstitialAd = ad;
                
                // Configurar listener para cuando se cierre
                interstitialAd.setFullScreenContentCallback(new com.google.android.gms.ads.FullScreenContentCallback() {
                    @Override
                    public void onAdDismissedFullScreenContent() {
                        Log.d(TAG, "📺 Interstitial ad closed");
                        interstitialAd = null;
                        // Recargar el anuncio para la próxima vez
                        loadInterstitialAd();
                        // Notificar a JavaScript que el anuncio se cerró
                        // Por defecto, asumimos que es para recuperar vida
                        evalJS("window.onAdWatched && window.onAdWatched()");
                    }
                    
                    @Override
                    public void onAdFailedToShowFullScreenContent(AdError adError) {
                        Log.e(TAG, "❌ Interstitial ad failed to show: " + adError.getMessage());
                        interstitialAd = null;
                        evalJS("window.onAdWatched && window.onAdWatched()");
                    }
                });
            }
            
            @Override
            public void onAdFailedToLoad(LoadAdError adError) {
                Log.e(TAG, "❌ Interstitial ad failed to load: " + adError.getMessage());
                interstitialAd = null;
            }
        };
        
        InterstitialAd.load(this, INTERSTITIAL_AD_ID, adRequest, adLoadCallback);
    }
    
    private void loadRewardedAd() {
        AdRequest adRequest = new AdRequest.Builder().build();
        
        RewardedAdLoadCallback adLoadCallback = new RewardedAdLoadCallback() {
            @Override
            public void onAdLoaded(RewardedAd ad) {
                Log.d(TAG, "✅ Rewarded ad loaded");
                rewardedAd = ad;
            }
            
            @Override
            public void onAdFailedToLoad(LoadAdError adError) {
                Log.e(TAG, "❌ Rewarded ad failed to load: " + adError.getMessage());
                rewardedAd = null;
            }
        };
        
        RewardedAd.load(this, REWARDED_AD_ID, adRequest, adLoadCallback);
    }
    
    private void showInterstitialAdNative(boolean isForLife) {
        if (interstitialAd != null) {
            Log.d(TAG, "📺 Mostrando interstitial ad (forLife: " + isForLife + ")");
            interstitialAd.show(this);
        } else {
            Log.w(TAG, "⚠️ Interstitial ad not loaded, notifying JS");
            if (isForLife) {
                evalJS("window.onAdWatched && window.onAdWatched()");
            } else {
                evalJS("window.onInterstitialAdClosed && window.onInterstitialAdClosed()");
            }
        }
    }
    
    private void showRewardedAdNative() {
        if (rewardedAd != null) {
            Log.d(TAG, "🎁 Mostrando rewarded ad");
            
            OnUserEarnedRewardListener rewardListener = new OnUserEarnedRewardListener() {
                @Override
                public void onUserEarnedReward(RewardItem reward) {
                    Log.d(TAG, "🎁 User earned reward: " + reward.getAmount() + " " + reward.getType());
                    // Notificar a JavaScript que el usuario ganó la recompensa
                    evalJS("window.onAdWatched && window.onAdWatched()");
                }
            };
            
            rewardedAd.show(this, rewardListener);
            
            // Configurar callback para cuando se cierre
            rewardedAd.setFullScreenContentCallback(new com.google.android.gms.ads.FullScreenContentCallback() {
                @Override
                public void onAdDismissedFullScreenContent() {
                    Log.d(TAG, "🎁 Rewarded ad closed");
                    rewardedAd = null;
                    // Recargar el anuncio para la próxima vez
                    loadRewardedAd();
                }
                
                @Override
                public void onAdFailedToShowFullScreenContent(AdError adError) {
                    Log.e(TAG, "❌ Rewarded ad failed to show: " + adError.getMessage());
                    rewardedAd = null;
                    evalJS("window.onAdWatched && window.onAdWatched()");
                }
            });
        } else {
            Log.w(TAG, "⚠️ Rewarded ad not loaded, notifying JS");
            evalJS("window.onAdWatched && window.onAdWatched()");
        }
    }
    
    // ===== MANEJO DEL BOTÓN DE ATRÁS =====
    @Override
    public void onBackPressed() {
        Log.d(TAG, "🔙 Botón de atrás presionado");
        
        // Verificar si hay modales abiertos en JavaScript
        webView.evaluateJavascript(
            "(function() {" +
            "  try {" +
            "    const modals = document.querySelectorAll('.modal-overlay:not(.hidden)');" +
            "    if (modals.length > 0) {" +
            "      const lastModal = modals[modals.length - 1];" +
            "      if (lastModal.id === 'settings-modal') {" +
            "        if (window.closeSettingsModal) window.closeSettingsModal();" +
            "        return 'modal_closed';" +
            "      } else if (lastModal.id === 'ranking-modal') {" +
            "        if (window.closeRankingModal) window.closeRankingModal();" +
            "        return 'modal_closed';" +
            "      } else if (lastModal.id === 'mechanic-intro') {" +
            "        if (window.closeMechanicIntro) window.closeMechanicIntro();" +
            "        return 'modal_closed';" +
            "      } else {" +
            "        lastModal.classList.add('hidden');" +
            "        return 'modal_closed';" +
            "      }" +
            "    }" +
            "    return 'no_modals';" +
            "  } catch (e) {" +
            "    return 'error';" +
            "  }" +
            "})()",
            result -> {
                Log.d(TAG, "🔙 Resultado verificación modales: " + result);
                if ("\"no_modals\"".equals(result) || "\"error\"".equals(result)) {
                    // No hay modales abiertos o error, cerrar la app
                    Log.d(TAG, "🔙 No hay modales o error, cerrando app");
                    super.onBackPressed();
                } else {
                    Log.d(TAG, "🔙 Modal cerrado, manteniendo app abierta");
                }
            }
        );
    }
}
