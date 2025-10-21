package com.memoflip.app;

import android.app.Activity;
import android.content.Intent;
import android.util.Log;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.Player;
import com.google.android.gms.games.LeaderboardsClient;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.AuthenticationResult;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.Task;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.JSObject;

public class PlayGamesHelper {
    private static final String TAG = "PlayGamesHelper";
    
    /**
     * Iniciar sesión con Google Play Juegos
     */
    public static void signIn(Activity activity) {
        Log.d(TAG, "🎮 Iniciando login con Google Play Juegos...");
        
        PlayGames.getGamesSignInClient(activity)
            .signIn()
            .addOnCompleteListener(new OnCompleteListener<AuthenticationResult>() {
                @Override
                public void onComplete(Task<AuthenticationResult> task) {
                    if (task.isSuccessful() && task.getResult().isAuthenticated()) {
                        Log.d(TAG, "✅ Login con Play Juegos correcto");
                        
                        // Obtener información del jugador
                        PlayGames.getPlayersClient(activity)
                            .getCurrentPlayer()
                            .addOnSuccessListener(new OnSuccessListener<Player>() {
                                @Override
                                public void onSuccess(Player player) {
                                    Log.d(TAG, "👤 Jugador: " + player.getDisplayName() + " (ID: " + player.getPlayerId() + ")");
                                    
                                    // Notificar a JavaScript del éxito
                                    notifyJavaScript(activity, "{\"success\": true, \"playerName\": \"" + player.getDisplayName() + "\", \"playerId\": \"" + player.getPlayerId() + "\"}");
                                }
                            })
                            .addOnFailureListener(new OnFailureListener() {
                                @Override
                                public void onFailure(Exception e) {
                                    Log.e(TAG, "❌ Error obteniendo jugador: " + e.getMessage());
                                    notifyJavaScript(activity, "{\"success\": true, \"playerName\": \"Jugador Play Games\"}");
                                }
                            });
                    } else {
                        Log.e(TAG, "❌ Error de login con Play Juegos: " + (task.getException() != null ? task.getException().getMessage() : "Desconocido"));
                        notifyJavaScript(activity, "{\"success\": false, \"error\": \"Error en login con Play Juegos\"}");
                    }
                }
            });
    }
    
    /**
     * Verificar si el usuario está autenticado
     */
    public static void isAuthenticated(Activity activity) {
        Log.d(TAG, "🔍 Verificando autenticación...");
        
        PlayGames.getGamesSignInClient(activity)
            .isAuthenticated()
            .addOnCompleteListener(new OnCompleteListener<AuthenticationResult>() {
                @Override
                public void onComplete(Task<AuthenticationResult> task) {
                    boolean isAuth = task.isSuccessful() && task.getResult().isAuthenticated();
                    Log.d(TAG, "🔍 Usuario autenticado: " + isAuth);
                    
                    if (isAuth) {
                        // Obtener información del jugador
                        PlayGames.getPlayersClient(activity)
                            .getCurrentPlayer()
                            .addOnSuccessListener(new OnSuccessListener<Player>() {
                                @Override
                                public void onSuccess(Player player) {
                                    Log.d(TAG, "👤 Jugador autenticado: " + player.getDisplayName());
                                    notifyJavaScript(activity, "{\"authenticated\": true, \"playerName\": \"" + player.getDisplayName() + "\", \"playerId\": \"" + player.getPlayerId() + "\"}");
                                }
                            });
                    } else {
                        notifyJavaScript(activity, "{\"authenticated\": false}");
                    }
                }
            });
    }
    
    /**
     * Obtener jugador actual
     */
    public static void getCurrentPlayer(Activity activity) {
        Log.d(TAG, "👤 Obteniendo jugador actual...");
        
        PlayGames.getPlayersClient(activity)
            .getCurrentPlayer()
            .addOnSuccessListener(new OnSuccessListener<Player>() {
                @Override
                public void onSuccess(Player player) {
                    Log.d(TAG, "✅ Jugador obtenido: " + player.getDisplayName());
                    JSObject user = new JSObject();
                    user.put("id", player.getPlayerId());
                    user.put("displayName", player.getDisplayName());
                    user.put("name", player.getDisplayName());
                    user.put("email", "playgames@google.com");
                    user.put("photoUrl", player.getIconImageUrl());
                    
                    notifyJavaScript(activity, "{\"success\": true, \"user\": " + user.toString() + "}");
                }
            })
            .addOnFailureListener(new OnFailureListener() {
                @Override
                public void onFailure(Exception e) {
                    Log.e(TAG, "❌ Error obteniendo jugador: " + e.getMessage());
                    notifyJavaScript(activity, "{\"success\": false, \"error\": \"" + escapeJson(e.getMessage()) + "\"}");
                }
            });
    }
    
    /**
     * Mostrar leaderboard
     */
    public static void showLeaderboard(Activity activity, String leaderboardId) {
        Log.d(TAG, "🏆 Mostrando leaderboard: " + leaderboardId);
        
        PlayGames.getLeaderboardsClient(activity)
            .getLeaderboardIntent(leaderboardId)
            .addOnSuccessListener(new OnSuccessListener<Intent>() {
                @Override
                public void onSuccess(Intent intent) {
                    activity.startActivityForResult(intent, 9004);
                    Log.d(TAG, "✅ Leaderboard mostrado");
                }
            })
            .addOnFailureListener(new OnFailureListener() {
                @Override
                public void onFailure(Exception e) {
                    Log.e(TAG, "❌ Error mostrando leaderboard: " + e.getMessage());
                }
            });
    }
    
    /**
     * Enviar puntuación al leaderboard
     */
    public static void submitScore(Activity activity, String leaderboardId, long score) {
        Log.d(TAG, "📊 Enviando puntuación: " + score + " al leaderboard: " + leaderboardId);
        
        try {
            PlayGames.getLeaderboardsClient(activity).submitScore(leaderboardId, score);
            Log.d(TAG, "✅ Puntuación enviada correctamente");
        } catch (Exception e) {
            Log.e(TAG, "❌ Error enviando puntuación: " + e.getMessage());
        }
    }
    
    /**
     * Cerrar sesión (Play Games v2 no tiene signOut, solo se puede revocar en configuración)
     */
    public static void signOut(Activity activity) {
        Log.d(TAG, "🚪 Play Games v2 no soporta signOut directo");
        Log.d(TAG, "ℹ️ Para cerrar sesión, el usuario debe ir a Configuración > Google > Juegos");
        
        // Notificar que no se puede cerrar sesión directamente
        notifyJavaScript(activity, "{\"success\": true, \"message\": \"Para cerrar sesión, ve a Configuración > Google > Juegos\"}");
    }
    
    // ===== MÉTODOS DE GUARDADO EN LA NUBE =====
    
    /**
     * Guardar progreso en la nube
     */
    public static void saveProgress(Activity activity, String progressData) {
        Log.d(TAG, "💾 Guardando progreso en la nube desde PlayGamesHelper...");
        CloudSaveHelper.saveProgress(activity, progressData);
    }
    
    /**
     * Cargar progreso desde la nube
     */
    public static void loadProgress(Activity activity) {
        Log.d(TAG, "📂 Cargando progreso desde la nube desde PlayGamesHelper...");
        CloudSaveHelper.loadProgress(activity);
    }
    
    /**
     * Verificar si hay datos en la nube
     */
    public static void hasCloudData(Activity activity) {
        Log.d(TAG, "🔍 Verificando datos en la nube desde PlayGamesHelper...");
        CloudSaveHelper.hasCloudData(activity);
    }
    
    /**
     * Resolver conflicto entre datos locales y de la nube
     */
    public static void resolveConflict(Activity activity, String localData, long localTimestamp) {
        Log.d(TAG, "⚖️ Resolviendo conflicto desde PlayGamesHelper...");
        CloudSaveHelper.resolveConflict(activity, localData, localTimestamp);
    }
    
    /**
     * Notificar a JavaScript (usando Capacitor bridge)
     */
    private static void notifyJavaScript(Activity activity, String result) {
        Log.d(TAG, "📡 Notificando a JavaScript: " + result);
        
        // Si la actividad es MainActivity, usar el bridge de Capacitor
        if (activity instanceof MainActivity) {
            MainActivity mainActivity = (MainActivity) activity;
            mainActivity.notifyJavaScript(result);
        }
    }
    
    /**
     * Escapa caracteres especiales para JSON.
     */
    private static String escapeJson(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}
