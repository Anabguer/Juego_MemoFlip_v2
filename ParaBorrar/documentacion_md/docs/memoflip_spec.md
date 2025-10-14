# 📄 Documento de Especificación – Sistema de Niveles MemoFlip

## 🎯 Objetivo
Diseñar e implementar la **pantalla de niveles (mapa)** para MemoFlip, capaz de escalar hasta **1000+ niveles**, con mecánicas variadas, bosses cada 50 niveles y un diseño **sencillo de mantener**.

El sistema debe separar **datos (niveles y mecánicas)** de **visualización (mapa, iconos, estilos)**, de forma que:
- Añadir o modificar un nivel no implique tocar lógica de render.
- Cambiar un color, icono o estilo se haga en **un único sitio centralizado**.

---

## 🗂️ Estructura de Niveles

Los niveles estarán definidos en un **JSON** (ej. `levels.json` en `/assets`).  
Cada nivel es un objeto con propiedades claras:

```json
{
  "id": 10,
  "pairs": 12,
  "time_sec": 95,
  "tags": ["crono", "bomba"],
  "note": "nivel pico",
  "chapter": 1
}
```

### Campos
- **id**: número de nivel (único, empieza en 1).
- **pairs**: nº de parejas (ej. 2=4 cartas, 12=24 cartas).  
  - Para triple pareja: añadir `triple` en `tags`.
- **time_sec**: tiempo en segundos (0 = sin cronómetro).
- **tags**: lista de mecánicas activas (`crono`, `niebla`, `barajar`, `triple`, `camaleon`, `trampa`, `bomba`, `comodin`, `fantasma`, `espejo`, `boss`).
- **note**: texto opcional (ej. “respiro”, “pico”, “BOSS”).
- **chapter**: bloque al que pertenece (1 = niveles 1–50, 2 = 51–100, etc.).

---

## 🧩 Mecánicas disponibles

- **crono** ⏱️: el nivel tiene un cronómetro con barra de tiempo.  
- **niebla** 🌫️: las cartas aparecen y desaparecen parcial o totalmente.  
- **barajar** 🔀: mitad de partida, las cartas cambian de sitio.  
- **triple** 🔺: se forman tríos en lugar de parejas.  
- **camaleon** 🎭: carta que cambia de icono al revelarse.  
- **trampa** 🚫: carta que bloquea otra temporalmente.  
- **bomba** 💣: resta segundos del cronómetro.  
- **comodin** 🌟: hace pareja con cualquier carta.  
- **fantasma** 👻: cartas visibles al inicio durante 1s y luego se ocultan.  
- **espejo** 🪞: tablero invertido horizontal/vertical.  
- **boss** 👑: nivel especial (cada 50).

---

## 📊 Lógica de bloques (semillas)

- **1–20**: tutorial + primeras mecánicas básicas.  
  - Pocos pares (2–6).  
  - Algunos niveles con cronómetro suave.  
  - Niebla y barajar se introducen una vez.  

- **21–50**: más variedad.  
  - Pares 4–12.  
  - Aparecen mecánicas especiales (`camaleon`, `trampa`, `bomba`).  
  - Nivel 50 = Boss (combinación de varias mecánicas).  

- **51–100**: mezcla.  
  - Introducir comodín, fantasma y espejo.  
  - Alternar niveles fáciles (2–4 parejas sin crono) con picos de dificultad (12 parejas + crono + mecánica).  

- **100+**: repetir patrones con variaciones (se puede usar el mismo esquema que 1–100 pero mezclado).  
  - Cada 50 niveles hay Boss.  
  - Del 1000 en adelante: mostrar “En construcción”.

---

## 🗺️ Pantalla de niveles (Mapa)

### Disposición
- **Zig-zag vertical**: nodos de nivel alternando izquierda/derecha, conectados con una polilínea.
- **Chapters**: cada bloque de 50 niveles tiene un fondo distinto (tonos de color, ejemplo: azules, verdes, rojos, morados).
- **Navegación**:
  - Flecha ⬆️ arriba → siguiente bloque (51–100, 101–150, …).
  - Flecha ⬇️ abajo → bloque anterior.
  - El jugador puede ver niveles bloqueados (no grises ocultos).

### Estados de un nivel
- **Bloqueado** 🔒: nodo gris.  
- **Activo (jugable)** 🟦: nodo destacado (color configurable).  
- **Completado** ✅: nodo con check o color distinto.  
- **Boss** 👑: nodo grande, color especial, icono extra.

### Indicadores
- **Bolitas de dificultad**:  
  - Calculadas automáticamente (`score` = `pairs` + mecánicas).  
  - 1–2 = ●○○, 3–4 = ●●○, 5+ = ●●●.  
- **Iconos de mecánicas**: máximo 3 visibles en el nodo (si hay más, mostrar “+1”).

---

## 🎨 Configuración de estilos

Centralizar en un archivo único (`styles.js` o similar):

```js
const LEVEL_STYLES = {
  locked: { color: "#999", border: "2px solid #666" },
  active: { color: "#4CAF50", border: "2px solid #2E7D32" },
  completed: { color: "#2196F3", border: "2px solid #1565C0" },
  boss: { color: "#FFD700", border: "3px solid #FF8F00" },
  icons: {
    crono: "⏱️",
    niebla: "🌫️",
    barajar: "🔀",
    triple: "🔺",
    camaleon: "🎭",
    trampa: "🚫",
    bomba: "💣",
    comodin: "🌟",
    fantasma: "👻",
    espejo: "🪞",
    boss: "👑"
  }
};
```

De esta manera, cambiar un color o un icono es inmediato.

---

## 🗄️ Guardado de progreso
- **LocalStorage**: almacenar `max_level_unlocked`.
- El mapa compara `id` ≤ `max_level_unlocked` para mostrar desbloqueados.  
- Opcional: sincronizar con backend en el futuro.

---

## ✅ Requisitos clave para implementación
1. **Sistema de datos separado del diseño** (JSON de niveles).  
2. **Mapa zig-zag vertical** con bloques de 50 niveles y bosses.  
3. **Navegación arriba/abajo** entre bloques.  
4. **Estados de nivel claros**: bloqueado, activo, completado, boss.  
5. **Iconos y bolitas de dificultad automáticos** según `tags` y `pairs`.  
6. **Estilos centralizados** en un único objeto.  
7. **Capacidad de crecer hasta 1000 niveles** sin afectar rendimiento.  
8. **Progreso guardado en LocalStorage**.  
