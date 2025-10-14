<?php
/**
 * Configuración específica para MemoFlip
 * Integración con sistema multi-aplicación
 */

// Configuración de la aplicación
define('APP_CODIGO', 'memoflip');
define('APP_NOMBRE', 'MemoFlip - Juego de Memoria');
define('APP_VERSION', '1.0.0');

// URLs para producción (Hostalia)
define('API_BASE_URL', 'https://colisan.com/sistema_apps_upload/sistema_apps_api/');
define('UPLOAD_BASE_URL', 'https://colisan.com/sistema_apps_upload/uploads/');
define('ASSETS_BASE_URL', 'https://colisan.com/sistema_apps_upload/assets/memoflip/');

// URLs para desarrollo local
if (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') !== false) {
    define('API_BASE_URL_LOCAL', 'http://localhost/mis_recetas/api/');
    define('UPLOAD_BASE_URL_LOCAL', 'http://localhost/mis_recetas/uploads/');
    define('ASSETS_BASE_URL_LOCAL', 'http://localhost/mis_recetas/assets/memoflip/');
}

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
    
    // Temas por capítulos
    const THEMES = [
        1 => ['name' => 'Océano', 'color' => '#0b132b'],
        2 => ['name' => 'Isla', 'color' => '#1b2a17'],
        3 => ['name' => 'Volcán', 'color' => '#2b0b0b'],
        4 => ['name' => 'Cielo', 'color' => '#0b162b'],
        5 => ['name' => 'Noche', 'color' => '#221b2b'],
        // Se pueden agregar más temas...
    ];
    
    /**
     * Obtiene el capítulo basado en el nivel
     */
    public static function getChapter($level) {
        return ceil($level / self::LEVELS_PER_CHAPTER);
    }
    
    /**
     * Obtiene el tema del capítulo
     */
    public static function getTheme($chapter) {
        return self::THEMES[$chapter] ?? self::THEMES[1];
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

/**
 * Configuración de desarrollo/producción
 */
$isProduction = !isset($_SERVER['HTTP_HOST']) || strpos($_SERVER['HTTP_HOST'], 'localhost') === false;

define('IS_PRODUCTION', $isProduction);
define('DEBUG_MODE', !$isProduction);

// Headers para desarrollo
if (DEBUG_MODE) {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        exit(0);
    }
}
?>
