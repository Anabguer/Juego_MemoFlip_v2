<?php
/**
 * Configuración para MemoFlip en Hostalia
 */

// Configuración de base de datos Hostalia
define('DB_HOST', 'PMYSQL165.dns-servicio.com');
define('DB_USUARIO', 'sistema_apps_user');
define('DB_CONTRA', 'GestionUploadSistemaApps!');
define('DB_NOMBRE', '9606966_sistema_apps_db');

// Configuración de la aplicación MemoFlip
define('APP_CODIGO', 'memoflip');
define('APP_NOMBRE', 'MemoFlip - Juego de Memoria');
define('APP_VERSION', '1.0.0');

// URLs base
define('API_BASE_URL', 'https://colisan.com/sistema_apps_upload/sistema_apps_api/memoflip/');
define('UPLOAD_BASE_URL', 'https://colisan.com/sistema_apps_upload/uploads/');
define('ASSETS_BASE_URL', 'https://colisan.com/sistema_apps_upload/assets/memoflip/');

/**
 * Genera la clave usuario_aplicacion_key para MemoFlip
 */
function generateMemoFlipUserKey($email) {
    return $email . '_' . APP_CODIGO;
}

/**
 * Configuración del juego MemoFlip
 */
class MemoFlipConfig {
    
    // Configuración de vidas
    const MAX_LIVES = 5;
    const LIVES_REGEN_HOURS = 1;
    
    // Configuración de puntuación
    const SCORE_CONFIG = [
        'TIME_MAX' => 50,           // Puntos máximos por tiempo
        'EFF_MAX' => 50,            // Puntos máximos por eficiencia
        'PEN_FAIL' => 2,            // Penalización por fallo
        'PEN_BOMB' => 4,            // Penalización por bomba
        'MECH_MULTS' => [           // Multiplicadores por mecánicas
            'triple' => 0.10,
            'camaleon' => 0.05,
            'barajar' => 0.05,
            'espejo' => 0.05,
            'bomba' => 0.05,
            'trampa' => 0.05,
            'niebla' => 0.05,
            'fantasma' => 0.05,
            'comodin' => 0.05
        ],
        'MECH_MULT_CAP' => 1.30,    // Máximo multiplicador
        'TARGETS' => [              // Tiempos objetivo por número de parejas
            ['minPairs' => 10, 't' => 100],
            ['minPairs' => 8,  't' => 80],
            ['minPairs' => 6,  't' => 65],
            ['minPairs' => 0,  't' => 50]
        ],
        'STAR_THRESHOLDS' => [      // Umbrales para estrellas
            'small'  => ['one' => 80,  'two' => 120, 'three' => 160],   // <= 5 parejas
            'medium' => ['one' => 140, 'two' => 190, 'three' => 240],   // 6-9 parejas
            'large'  => ['one' => 200, 'two' => 260, 'three' => 320]    // >= 10 parejas
        ]
    ];
    
    // Configuración de niveles
    const MAX_LEVELS = 1000;
    const LEVELS_PER_CHAPTER = 50;
    const BOSS_EVERY = 50;
    const GLOBAL_SEED = 12345;
    
    // Mecánicas disponibles
    const MECHANICS = [
        'crono' => '⏱️',      // Cronómetro
        'niebla' => '🌫️',    // Cartas aparecen/desaparecen
        'barajar' => '🔀',    // Cartas cambian de posición
        'triple' => '🔺',     // Tríos en lugar de parejas
        'camaleon' => '🎭',   // Carta cambia de icono
        'trampa' => '🚫',     // Carta bloquea otra temporalmente
        'bomba' => '💣',      // Resta tiempo del cronómetro
        'comodin' => '🌟',    // Hace pareja con cualquier carta
        'fantasma' => '👻',   // Cartas visibles al inicio 1s
        'espejo' => '🪞',     // Tablero invertido
        'boss' => '👑'        // Nivel especial cada 50
    ];
    
    /**
     * Obtiene el capítulo basado en el nivel
     */
    public static function getChapter($level) {
        return ceil($level / self::LEVELS_PER_CHAPTER);
    }
    
    /**
     * Verifica si un nivel es boss
     */
    public static function isBossLevel($level) {
        return $level % self::BOSS_EVERY === 0;
    }
    
    /**
     * Calcula el tiempo objetivo para un nivel
     */
    public static function getTimeTarget($pairs) {
        foreach (self::SCORE_CONFIG['TARGETS'] as $target) {
            if ($pairs >= $target['minPairs']) {
                return $target['t'];
            }
        }
        return 50; // Por defecto
    }
    
    /**
     * Calcula movimientos óptimos
     */
    public static function getOptimalMoves($pairs, $isTriple = false) {
        return $isTriple ? ($pairs * 3) : ($pairs * 2);
    }
    
    /**
     * Calcula las monedas ganadas en una partida
     */
    public static function calculateCoins($pairs, $timeUsed, $movesUsed, $fails, $mechanics = [], $bombasActivadas = 0) {
        $config = self::SCORE_CONFIG;
        
        // Base por tamaño
        $base = 100 * $pairs;
        
        // Bonus de tiempo
        $isTriple = in_array('triple', $mechanics);
        $timeTarget = self::getTimeTarget($pairs);
        $timeRatio = min($timeTarget / max($timeUsed, 1), 1.5);
        $timeBonus = round($config['TIME_MAX'] * min($timeRatio, 1.0));
        
        // Bonus extra por ser muy rápido
        if ($timeRatio > 1) {
            $timeBonus += min(ceil(($timeRatio - 1) * 10), 10);
        }
        
        // Bonus de eficiencia
        $movesOpt = self::getOptimalMoves($pairs, $isTriple);
        $effRatio = min($movesOpt / max($movesUsed, 1), 1);
        $effBonus = round($config['EFF_MAX'] * $effRatio);
        
        // Penalizaciones
        $penalties = ($config['PEN_FAIL'] * $fails) + ($config['PEN_BOMB'] * $bombasActivadas);
        
        // Multiplicadores por mecánicas
        $mult = 1.0;
        foreach ($mechanics as $mech) {
            if (isset($config['MECH_MULTS'][$mech])) {
                $mult += $config['MECH_MULTS'][$mech];
            }
        }
        $mult = min($mult, $config['MECH_MULT_CAP']);
        
        // Cálculo final
        $coinsRaw = ($base + $timeBonus + $effBonus - $penalties) * $mult;
        return max(0, round($coinsRaw));
    }
    
    /**
     * Calcula las estrellas obtenidas
     */
    public static function calculateStars($coins, $pairs) {
        $thresholds = self::SCORE_CONFIG['STAR_THRESHOLDS'];
        
        if ($pairs <= 5) {
            $t = $thresholds['small'];
        } elseif ($pairs <= 9) {
            $t = $thresholds['medium'];
        } else {
            $t = $thresholds['large'];
        }
        
        if ($coins >= $t['three']) return 3;
        if ($coins >= $t['two']) return 2;
        if ($coins >= $t['one']) return 1;
        return 0;
    }
}

// Headers para CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Conexión a la base de datos
try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NOMBRE . ";charset=utf8",
        DB_USUARIO,
        DB_CONTRA,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error de conexión a la base de datos: ' . $e->getMessage()]);
    exit;
}

/**
 * Función para crear usuario MemoFlip
 */
function createMemoFlipUser($pdo, $usuario_aplicacion_key) {
    try {
        $stmt = $pdo->prepare("CALL CreateMemoFlipUser(?)");
        $stmt->execute([$usuario_aplicacion_key]);
        return true;
    } catch (PDOException $e) {
        error_log("Error creando usuario MemoFlip: " . $e->getMessage());
        return false;
    }
}

/**
 * Función para regenerar vidas
 */
function regenerateLives($pdo, $usuario_aplicacion_key) {
    try {
        $stmt = $pdo->prepare("CALL RegenerateLives(?)");
        $stmt->execute([$usuario_aplicacion_key]);
        return true;
    } catch (PDOException $e) {
        error_log("Error regenerando vidas: " . $e->getMessage());
        return false;
    }
}

/**
 * Función para validar user_key
 */
function validateUserKey($user_key) {
    if (empty($user_key)) {
        throw new Exception('user_key requerido');
    }
    
    // Validar formato
    if (strpos($user_key, '_memoflip') === false && strpos($user_key, 'guest_') !== 0) {
        throw new Exception('user_key inválido');
    }
    
    return true;
}
?>
