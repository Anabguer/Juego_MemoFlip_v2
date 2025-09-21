# 🖼️ Especificación de **Assets por Temas** (Mapa, Cartas y Nodos) – MemoFlip

> Documento para ti y para CursorIA. Define **estructura de carpetas**, **nombres de archivos**, **cuántas imágenes necesitas por bloque de 50 niveles**, cómo cargarlas por **tema**, y cómo optimizarlas para que no pese una tonelada.

---

## 🎯 Objetivo
- Soportar **1000 niveles**, divididos en **bloques de 50** (capítulos/chapters).
- Cada bloque usa un **tema visual** (ej.: marino, isla, volcán, selva, ártico, coches, etc.).
- Mantener **variedad percibida** sin necesitar miles de imágenes distintas.
- **Cargas deterministas** (lo mismo para todos los jugadores), no aleatorio por usuario.

---

## 🗂️ Estructura de carpetas (propuesta)
```
/assets/
  /themes/
    /001_marino/
      /cards/               # caras de las cartas
        card_001.webp
        card_002.webp
        ...
        card_036.webp
        back.webp           # reverso común del bloque
      /nodes/               # opcional (nodos de mapa)
        node_default.webp   # si no hay, se usa estilo por CSS
        node_boss.webp      # arte del boss, opcional
      /ui/                  # opcional (decorativos del fondo de mapa, badges…)
        bg_map.webp
        badge_boss.webp
      theme.json            # manifiesto del bloque (ver abajo)
    /002_isla/
      (misma estructura)
    /003_volcan/
      (misma estructura)
  /special/                 # cartas especiales (mecánicas)
    bomb.webp               # 💣
    chameleon.webp          # 🎭
    trap.webp               # 🚫
    wild.webp               # 🌟
    ghost.webp              # 👻
    mirror.webp             # 🪞
  /map/                     # estilos globales del mapa si quieres imágenes
    boss_crown.webp         # 👑 si prefieres imagen a emoji
```

> Si **no** quieres imágenes para nodos de mapa, omite `/nodes/` y se renderiza todo por CSS (círculos, borde, color).

---

## 📦 Manifiesto por tema (`theme.json`)
Archivo simple para que el código **no dependa de contar archivos**. Ejemplo:

```json
{
  "name": "Marino",
  "chapter": 1,
  "cards": {
    "count": 36,
    "prefix": "card_",
    "ext": ".webp",
    "digits": 3
  },
  "back": "back.webp",
  "nodes": {
    "default": "node_default.webp",
    "boss": "node_boss.webp"
  },
  "ui": {
    "bg_map": "bg_map.webp",
    "badge_boss": "badge_boss.webp"
  },
  "recolor": false
}
```

- `cards.count`: cuántas caras de carta trae el tema.
- `recolor`: si vas a aplicar recolores por código (HSL/CSS/SVG), marca `true`.

> Ventaja: cambiar número o nombres de cartas no obliga a tocar JS; basta actualizar el JSON.

---

## 🔢 ¿Cuántas imágenes necesitas por bloque de 50 niveles?
### Recomendación realista
- **36 cartas base** por bloque (tema).  
  - Máximo del juego por nivel: 12 parejas (24 cartas).  
  - Con 36 base puedes formar **muchas combinaciones** sin repetición aburrida.
- **1 reverso** de carta (`back.webp`) por bloque.
- **Nodos de mapa** (opcionales): `node_default.webp`, `node_boss.webp` (o CSS).
- **UI** opcional: `bg_map.webp`, `badge_boss.webp` (solo si quieres más “pinta”).

**Resumen por bloque:**  
- Mínimos: **37 imágenes** (36 caras + 1 reverso).  
- Con nodos y UI opcionales: **+1 a +3** más.

> Con 20 bloques (1000 niveles) ≈ **740–800 assets** si pones nodos/UI. Por eso conviene optimizar formato y tamaño (ver sección Optimización).

---

## 🃏 Cartas especiales (mecánicas)
Estas **NO** necesitan sets por tema (son universales). Ponlas una vez en `/special/`:

- `bomb.webp` **bomba** 💣: carta que al fallar te resta tiempo.
- `chameleon.webp` **camaleón** 🎭: su icono puede cambiar al voltear.
- `trap.webp` **trampa** 🚫: bloquea el siguiente toque un instante.
- `wild.webp` **comodín** 🌟: empareja con cualquiera.
- `ghost.webp` **fantasma** 👻: al inicio se muestran 1–2 s y se ocultan.
- `mirror.webp` **espejo** 🪞: durante un rato los iconos “bailan”/se invierten.

> Si prefieres que **camaleón** cambie entre imágenes reales del tema, basta con que el código escoja otro `card_xxx.webp` del set actual al aplicar el efecto (no requiere arte nuevo).

---

## 🗺️ Nodos de mapa (opciones)
1) **Solo CSS** (recomendado): círculos con borde y colores por estado (locked/active/completed/boss).  
2) **Con imágenes**: usa `/nodes/node_default.webp` y `/nodes/node_boss.webp` si quieres un look más “ilustrado”.

**Estados (definidos por clase CSS):**
- `.node.locked` → gris
- `.node.current` → resaltado
- `.node.done` → color completado
- `.node.boss` → grande + corona (emoji o `boss_crown.webp`)

> Decisión rápida: empieza con **CSS** (más ligero). Si luego quieres ilustración, añades los PNG/WebP y cambias la clase para usar `background-image`.

---

## 🧠 Carga por tema (cómo debería ser el código)
- El **chapter** actual se calcula como `chapter = ceil(level_id / 50)`.
- Se resuelve carpeta: `/assets/themes/${chapter_padded}/`.  
  - `chapter_padded`: `001`, `002`, `003`...
- Cargas `theme.json` y de ahí:
  - Generas lista de cartas disponibles: `card_001.webp`…`card_036.webp`.
  - Reverso: `back.webp`.
  - Nodos/UI si existen, sino CSS.
- **Selección determinista de cartas por nivel**:
  - Usa `seed_global + level_id` para barajar y elegir las `pairs` necesarias.
  - Así **todos** ven la misma combinación por nivel (justo para ranking).

**Pseudocódigo:**
```js
const path = `/assets/themes/${pad3(chapter)}/theme.json`;
const theme = await fetchJSON(path);
const faces = Array.from({length: theme.cards.count}, (_,i)=> 
  `${base}/cards/${theme.cards.prefix}${String(i+1).padStart(theme.cards.digits,'0')}${theme.cards.ext}`);

const rng = seededRandom(GLOBAL_SEED + level_id);
const chosen = pickPairsDeterministically(faces, pairs, rng);
```

---

## 🧪 Fallbacks (por si faltan imágenes)
- Si falta `theme.json` o alguna carta → **fallback a emojis** (como ahora) o al **tema 001**.
- Si falta `back.webp` → usa un color sólido con patrón CSS.
- Si faltan nodos/UI → usar sólo CSS para el mapa.

> Evita bloqueos: el juego **siempre** debe poder jugarse aunque falte un asset.

---

## 📐 Tamaño y formato de imágenes
- **Formato recomendado**: **WebP** (o **AVIF** si el bundle es app/APK y controlas compatibilidad).
- **Resolución** sugerida de cartas (caras y reverso): **256 × 256 px** (máximo 320 px si el estilo lo pide).  
  - En móvil se verán más pequeñas; 256 es suficiente y ligero.
- **Peso objetivo**: **≤ 20–30 KB** por carta (WebP con compresión “photo” de 75–85).  
  - 36 cartas ≈ 0.8–1.2 MB por bloque.
- **Spritesheet** (opcional): empacar 36 caras en una sola imagen + `CSS background-position`. Ahorra peticiones, complica un poco el código. Solo si lo necesitáis.

---

## 🚀 Optimización de carga
- **Preload** del reverso y 12–18 primeras caras del bloque actual:
  ```html
  <link rel="preload" as="image" href="/assets/themes/001_marino/cards/card_001.webp">
  ```
- **Lazy loading** para el resto (cargar bajo demanda cuando entras al nivel).
- **Cache**: activar Service Worker o usar `CacheStorage` simple (si vais a APK, es inmediato).

---

## 🛠️ Pipeline de assets (para ti)
Dos vías, elige la que prefieras:

### A) Manual + web (rápido)
1. Diseñas/descargas SVG/PNG grandes.
2. Pasas por **Squoosh** o **TinyPNG** → exportas **WebP** 256×256.
3. Nombras como `card_001.webp`…`card_036.webp`, `back.webp`.
4. Rellenas `theme.json`.
5. Copias a `/assets/themes/00X_tema/`.

### B) Script en Node (automatizado)
- Usar `sharp` para convertir y renombrar en lote:
  ```bash
  sharp src/*.png -resize 256 256 -quality 82 -o assets/themes/001_marino/cards/card_%03d.webp
  ```
- Generar `theme.json` automáticamente contando archivos.
- (Si te interesa, luego te paso script listo).

---

## 📋 Checklist por bloque de 50
- [ ] `assets/themes/00X_Tema/`
- [ ] `cards/card_001.webp … card_036.webp`
- [ ] `cards/back.webp`
- [ ] `nodes/node_default.webp` (opcional)
- [ ] `nodes/node_boss.webp` (opcional)
- [ ] `ui/bg_map.webp` (opcional)
- [ ] `theme.json` completo

**Global (una sola vez):**
- [ ] `/special/bomb.webp`, `/special/chameleon.webp`, `/special/trap.webp`, `/special/wild.webp`, `/special/ghost.webp`, `/special/mirror.webp`
- [ ] `/map/boss_crown.webp` (si no usas emoji)

---

## ❓FAQ rápida
- **¿Cuántas cartas por bloque?** → **36** es el punto dulce (variedad vs peso).  
- **¿Puedo usar menos?** → Sí, 24 funciona; 30–36 se siente mejor.  
- **¿Y si quiero más variedad sin peso?** → Activa `recolor: true` y aplica filtros HSL por código a 8–12 cartas en cada nivel (parecerán “nuevas”).  
- **¿Y los bosses?** → No requieren nuevas cartas; solo un **nodo** distinto en el mapa y, si quieres, un arte especial en `/ui/badge_boss.webp`.

---

## 🧷 Ejemplo de `theme.json` completo
```json
{
  "name": "Marino",
  "chapter": 1,
  "cards": { "count": 36, "prefix": "card_", "ext": ".webp", "digits": 3 },
  "back": "back.webp",
  "nodes": { "default": "node_default.webp", "boss": "node_boss.webp" },
  "ui": { "bg_map": "bg_map.webp", "badge_boss": "badge_boss.webp" },
  "recolor": true
}
```

---

Con esto, tú solo tienes que **llenar carpetas** por bloque con 36 cartas + 1 reverso (y opcionales). El resto lo hace el código: selecciona determinista por nivel, aplica recolores si procede, y pinta mapa con nodos CSS o con tus imágenes si las añades.
