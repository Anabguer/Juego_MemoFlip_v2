package com.memoflip.app;

import android.content.Intent;
import android.os.Bundle;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;

import com.getcapacitor.BridgeActivity;
import com.google.android.gms.auth.api.signin.GoogleSignIn;
import com.google.android.gms.auth.api.signin.GoogleSignInAccount;
import com.google.android.gms.auth.api.signin.GoogleSignInClient;
import com.google.android.gms.auth.api.signin.GoogleSignInOptions;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.Scope;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayersClient;
import com.google.android.gms.games.Player;
import com.google.android.gms.tasks.Task;

import org.json.JSONObject;

public class MainActivity extends BridgeActivity {
    
    private ActivityResultLauncher<Intent> signInLauncher;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Registrar el bridge de JavaScript
        bridge.getWebView().addJavascriptInterface(new JSBridge(), "Android");

        // Launcher que recibe el resultado del sign-in
        signInLauncher = registerForActivityResult(
            new ActivityResultContracts.StartActivityForResult(),
            result -> {
                Intent data = result.getData();
                Task<GoogleSignInAccount> task = GoogleSignIn.getSignedInAccountFromIntent(data);
                try {
                    GoogleSignInAccount acc = task.getResult(ApiException.class);

                    // Con esta cuenta ya tenemos permisos de GAMES + EMAIL
                    PlayersClient playersClient = PlayGames.getPlayersClient(this);
                    playersClient.getCurrentPlayer().addOnCompleteListener(pTask -> {
                        try {
                            Player player = pTask.getResult();
                            String playerId = player.getPlayerId();
                            String displayName = player.getDisplayName();
                            String email = acc != null ? acc.getEmail() : null;

                            JSONObject ok = new JSONObject();
                            ok.put("success", true);
                            ok.put("playerId", playerId);
                            ok.put("displayName", displayName);
                            ok.put("email", email != null ? email : JSONObject.NULL);

                            sendToJS(ok);
                        } catch (Exception ex) {
                            sendError("PLAYER_READ_FAIL", ex.getMessage());
                        }
                    });

                } catch (Exception e) {
                    sendError("SIGN_IN_FAIL", e.getMessage());
                }
            }
        );
    }

    // Bridge para JavaScript
    private class JSBridge {
        @android.webkit.JavascriptInterface
        public void pgsSignIn() {
            runOnUiThread(() -> {
                Log.d("MainActivity", "🎮 Iniciando login con Play Games desde JavaScript...");
                startGamesSignInWithEmail();
            });
        }
    }

    // Llamable desde JS (Capacitor)
    @android.webkit.JavascriptInterface
    public void pgsSignIn() {
        runOnUiThread(this::startGamesSignInWithEmail);
    }

    // Método para el bridge de Capacitor
    @android.webkit.JavascriptInterface
    public void pgsSignIn(String data) {
        runOnUiThread(this::startGamesSignInWithEmail);
    }

    // Flujo único: PGS + EMAIL (sin idToken)
    private void startGamesSignInWithEmail() {
        GoogleSignInOptions gso = new GoogleSignInOptions
                .Builder(GoogleSignInOptions.DEFAULT_GAMES_SIGN_IN)
                .requestEmail() // ← esto es lo que añade el correo
                .build();

        GoogleSignInClient client = GoogleSignIn.getClient(this, gso);

        // Si ya tenemos permisos de email, podemos reutilizar cuenta; aun así lanzamos intent para refrescar sesión de Games
        GoogleSignInAccount last = GoogleSignIn.getLastSignedInAccount(this);
        if (last != null && GoogleSignIn.hasPermissions(last, new Scope("email"))) {
            signInLauncher.launch(client.getSignInIntent());
                return;
            }
            
        // Pedirá cuenta/permiso si hace falta
        signInLauncher.launch(client.getSignInIntent());
    }

    private void sendToJS(JSONObject data) {
            runOnUiThread(() -> {
            try {
                bridge.getWebView().evaluateJavascript(
                    "window.__pgsLoginCallback(" + data.toString() + ");",
                    null
                );
            } catch (Exception ignored) {}
        });
    }

    private void sendError(String code, String msg) {
        try {
            JSONObject err = new JSONObject();
            err.put("success", false);
            err.put("error", code);
            err.put("message", msg != null ? msg : "");
            sendToJS(err);
        } catch (Exception ignored) {}
    }

    // Método para compatibilidad con otros helpers
    public void notifyJavaScript(String result) {
        try {
            bridge.getWebView().evaluateJavascript(
                "window.__pgsLoginCallback(" + result + ");",
                null
            );
        } catch (Exception ignored) {}
    }
}