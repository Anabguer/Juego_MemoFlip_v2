# 🧮 Especificación – **Sistema de Puntuación y Ranking** (MemoFlip)

## 🎯 Objetivo
Definir un sistema de **monedas** (puntuación) y **ranking** que:
- Recompense **progreso** (nivel alcanzado) y **habilidad** (eficiencia).
- Sea **predecible y fácil de ajustar** por diseño.
- Funcione igual con 4–24 cartas y con mecánicas extra (crono, triple, etc.).

---

## 🪙 Monedas: visión general
Cada partida entrega **monedas** según una fórmula con 3 pilares:
1) **Base por tamaño del nivel** (más parejas, más base).  
2) **Rapidez** (si hay cronómetro o tiempo objetivo).  
3) **Eficiencia** (pocos movimientos vs óptimo teórico).  

> Las monedas se acumulan en el perfil. El **ranking mixto** usa primero el **nivel máximo alcanzado** y luego las **monedas acumuladas**.

---

## 📐 Parámetros por nivel
Para cada nivel `L` con `pairs` y `tags`:

- `match_size` = `3` si incluye `triple`, si no `2`.
- **Cartas** = `pairs * match_size` (solo informativo).
- **Movimientos_optimos** (teórico mínimo):
  - Para parejas (`match_size=2`): `moves_opt = 2 * pairs`  *(cada par: 2 toques correctos)*
  - Para tríos (`match_size=3`): `moves_opt = 3 * pairs`
- **Tiempo_objetivo** (`t_target`):
  - Si el nivel declara `time_sec > 0`: `t_target = time_sec`
  - Si no hay crono: asignar objetivo suave en función de tamaño (editable):
    - `pairs >= 10` → `t_target = 100s`
    - `pairs in [8,9]` → `t_target = 80s`
    - `pairs in [6,7]` → `t_target = 65s`
    - `pairs <= 5` → `t_target = 50s`

> Estos objetivos sirven **solo** para calcular bonus de tiempo; el nivel puede no tener barra real.

---

## 🧾 Fórmula de monedas
Dado un resultado del jugador con:
- `moves_used` (toques totales que destapan carta)
- `time_used` (segundos totales, incluso si no había crono real)
- `fails` (pares fallidos/mismatches contados a tu criterio)

Se calcula:

```
BASE = 100 * pairs

# Bonus de tiempo (0..TIME_MAX)
time_ratio = clamp(t_target / max(time_used, 1), 0, 1.5)
TIME_MAX  = 50
TIME_BONUS = round(TIME_MAX * min(time_ratio, 1.0))    # bonus lleno si time_used <= t_target
# (opcional) bonus extra por muy rápido: +ceil((time_ratio-1)*10) si time_ratio>1 (cap en +10)

# Bonus de eficiencia (0..EFF_MAX)
eff_ratio = clamp(moves_opt / max(moves_used, 1), 0, 1)
EFF_MAX   = 50
EFF_BONUS = round(EFF_MAX * eff_ratio)

# Penalizaciones (opcionales, ajustables)
PEN_FAIL   = 2   # -2 por fallo evidente (mismatch)
PEN_BOMBA  = 4   # -4 por cada bomba
penalties = PEN_FAIL * fails + PEN_BOMBA * bombas_activadas   # bombas_activadas si aplica

# Multiplicadores por mecánicas/dificultad
mult = 1.0
if 'triple' in tags:    mult += 0.10
if 'camaleon' in tags:  mult += 0.05
if 'barajar' in tags:   mult += 0.05
if 'espejo' in tags:    mult += 0.05
if 'bomba' in tags:     mult += 0.05
if 'trampa' in tags:    mult += 0.05
# (no acumular más de +30%)
mult = min(mult, 1.30)

# Cálculo final
coins_raw = (BASE + TIME_BONUS + EFF_BONUS - penalties) * mult
coins = max(0, round(coins_raw))
```

**Notas de tuning rápido:**
- Subir o bajar `TIME_MAX` y `EFF_MAX` cambia cuánto pesan rapidez vs eficiencia.
- `BASE` da estabilidad: niveles grandes siempre pagan más.
- Los multiplicadores dan “sabor” cuando hay mecánicas extra sin romper el balance.

---

## ⭐ Estrellas (opcional, derivadas de monedas)
Si quieres mostrar 0–3 estrellas en la pantalla de victoria sin añadir otro sistema:
- Define `star_thresholds` por tamaño (editable en config):
  - `pairs <= 5`:  ☆: 80, ★★: 120, ★★★: 160  
  - `pairs 6–9`:   ☆: 140,★★: 190, ★★★: 240  
  - `pairs >=10`:  ☆: 200,★★: 260, ★★★: 320  
- Asigna estrellas según `coins` alcanzadas.

---

## 🏆 Ranking mixto
Orden global con dos claves:
1) **Nivel máximo alcanzado** (`max_level_reached`) – descendente.
2) **Monedas acumuladas** (`coins_total`) – descendente.

Empates: el que tenga **menos tiempo total** en los últimos 100 niveles (o mayor % de 3★) gana.

> Ventaja: quien avanza más aparece arriba; si igualan en progreso, gana el más eficiente.

---

## 🔎 Ejemplos numéricos

### Ejemplo A (nivel fácil sin crono real)
- pairs = 4 (8 cartas), tags = []
- moves_opt = 8; t_target = 50s
- Jugador: moves_used=12, time_used=46s, fails=2, bombas_activadas=0

```
BASE = 100*4 = 400
time_ratio = 50/46 = 1.087 → TIME_BONUS ≈ 50
eff_ratio  = 8/12  = 0.667 → EFF_BONUS ≈ 33
penalties  = 2*2 + 4*0 = 4
mult = 1.0

coins = round((400 + 50 + 33 - 4) * 1.0) = 479
```

### Ejemplo B (nivel grande con crono y camaleón)
- pairs=12 (24 cartas), tags=[crono, camaleon]
- moves_opt=24; t_target=90s (definido por el nivel)
- Jugador: moves_used=31, time_used=88s, fails=5, bombas_activadas=0

```
BASE = 1200
TIME_BONUS = 50 (completo al ir <= t_target)
EFF_BONUS  = round(50 * (24/31)) = 39
penalties  = 2*5 = 10
mult = 1.0 + 0.05 (camaleon) = 1.05
coins = round((1200 + 50 + 39 - 10) * 1.05) = round(1279 * 1.05) = 1343
```

### Ejemplo C (triple + barajar, sin crono, muy eficiente)
- pairs=6, tags=[triple, barajar], match_size=3 (18 cartas)
- moves_opt=18; t_target=65s
- Jugador: moves_used=18, time_used=40s, fails=0

```
BASE = 600
TIME_BONUS = 50
EFF_BONUS  = 50
penalties  = 0
mult = 1.0 + 0.10 (triple) + 0.05 (barajar) = 1.15
coins = round((600 + 50 + 50) * 1.15) = round(700 * 1.15) = 805
```

---

## 🧩 Señales visuales en UI (resumen para implementación)
- **Pantalla de victoria**: mostrar `coins` ganadas + breakdown (base / tiempo / eficiencia / penalizaciones / multiplicador).
- **Mapa**: en cada nivel completado, enseñar un pequeño **historial**: mejor tiempo, mejor eficiencia, mejor monedas.
- **Perfil/jugador**: `coins_total`, `max_level_reached`, últimos 10 niveles (tiempo/promedios).

---

## 🛡️ Anti‑cheat básico
- Calcular `coins` **también** del lado servidor cuando tengas backend.
- Guardar “hash” del resultado por nivel (id, moves_used, time_used, seed) y validar valores plausibles (por ejemplo, `moves_used >= moves_opt` siempre).
- Limitar mejoras por nivel: solo **mejora** si superas tu mejor marca de `coins` (evitas spam de farmeo con run malos).

---

## ⚙️ Parámetros editables en un único archivo (config)
```js
export const SCORE_CONFIG = {
  TIME_MAX: 50,
  EFF_MAX: 50,
  PEN_FAIL: 2,
  PEN_BOMBA: 4,
  MECH_MULTS: { triple:0.10, camaleon:0.05, barajar:0.05, espejo:0.05, bomba:0.05, trampa:0.05 },
  MECH_MULT_CAP: 1.30,
  TARGETS: [
    { minPairs:10, t:100 },
    { minPairs:8,  t:80  },
    { minPairs:6,  t:65  },
    { minPairs:0,  t:50  }
  ],
  STAR_THRESHOLDS: {
    small:  { one:80,  two:120, three:160 },
    medium: { one:140, two:190, three:240 },
    large:  { one:200, two:260, three:320 }
  }
};
```

---

## 🧭 Integración con ranking
- Al cerrar partida: sumar `coins` al `coins_total` **solo si** supera el récord personal del nivel.
- Ranking “mixto” (servidor o local mientras tanto):
  - Orden por `max_level_reached` desc.
  - Si empatan: por `coins_total` desc.
  - Tiebreak: mejor `avg_time` últimos 100 niveles (menor es mejor).

---

## ✅ Checklist para el dev
- [ ] Calcular `moves_opt` y `t_target` por nivel (según reglas arriba).
- [ ] Implementar fórmula de monedas con parámetros de `SCORE_CONFIG`.
- [ ] Emitir breakdown en UI de victoria.
- [ ] Persistir mejor `coins` por nivel y total acumulado.
- [ ] Actualizar ranking mixto tras cada mejora.
- [ ] Exponer parámetros editables en un único archivo.
