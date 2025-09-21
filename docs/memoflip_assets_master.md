# 📄 Documento – Assets y Estructura de Uso para MemoFlip

## 1. Estructura de carpetas
```
/assets/
   ├── themes/
   │    ├── 001_marino/
   │    │     ├── theme.json
   │    │     ├── bg_map.webp
   │    │     ├── back.webp
   │    │     ├── card_001.webp
   │    │     ├── card_002.webp
   │    │     └── ...
   │    ├── 002_isla/
   │    │     ├── theme.json
   │    │     ├── bg_map.webp
   │    │     ├── back.webp
   │    │     ├── card_001.webp
   │    │     └── ...
   │    └── ...
   └── specials/
        ├── bomb.webp
        ├── chameleon.webp
        ├── ghost.webp
        ├── mirror.webp
        ├── trap.webp
        └── wild.webp
```

---

## 2. Assets necesarios por **tema (bloques de 50 niveles)**
Cada tema incluye:

- **1 fondo de mapa** → `bg_map.webp`  
  - Resolución: ~1080×2000 px (vertical).  
  - Peso recomendado: 150–300 KB (WebP).  

- **1 trasera de cartas** → `back.webp`  
  - Resolución: ~256×256 px.  
  - Diseño simple, mismo estilo en todo el bloque.  

- **30 frentes de cartas** → `card_001.webp` … `card_030.webp`  
  - Resolución: ~256×256 px.  
  - Tema del bloque (ej: marino → peces, conchas, medusas).  
  - Se van rotando y reusando a lo largo de los niveles.  

- **1 archivo de configuración** → `theme.json`  

---

## 3. Assets **especiales** (comunes a todos los temas)
Estos se guardan en `/specials/` y se usan según la mecánica del nivel:

- `bomb.webp` → Carta bomba (resta tiempo).  
- `chameleon.webp` → Carta camaleón (cambia de icono).  
- `ghost.webp` → Carta fantasma (se muestra un segundo y desaparece).  
- `mirror.webp` → Carta espejo (modo invertido).  
- `trap.webp` → Carta trampa (bloquea turno).  
- `wild.webp` → Carta comodín (empareja con cualquiera).  

Resolución recomendada: ~256×256 px.  

---

## 4. Ejemplo de **theme.json**
```json
{
  "name": "Marino",
  "chapter": 1,
  "cards": { "count": 30, "prefix": "card_", "ext": ".webp", "digits": 3 },
  "back": "back.webp",
  "ui": { "bg_map": "bg_map.webp" },
  "palette": { "bg1": "#0b132b", "bg2": "#13315c", "accent": "#ffd447" }
}
```

- `cards.count`: número de imágenes de cartas frontales disponibles.  
- `back`: trasera común.  
- `ui.bg_map`: fondo del mapa para este bloque.  
- `palette`: colores de apoyo (para el fondo de la mesa de cartas si no se usa imagen).  

---

## 5. Cómo carga el código (para el dev del curso)
1. El motor detecta en qué **capítulo** estás (`chapter = ceil(level/50)`).  
2. Carga el `theme.json` de ese capítulo desde `/assets/themes/XYZ/`.  
3. Aplica:  
   - **Fondo del mapa** (`ui.bg_map`).  
   - **Trasera** (`back`).  
   - **Frentes de cartas** (`cards`).  
   - **Paleta** (si no hay imagen de fondo en la mesa).  
4. Para mecánicas especiales (bomb, ghost, etc.), se busca la carta en `/specials/`.  

---

## 6. Cantidad total de assets para 1000 niveles
- **20 capítulos** × (1 fondo + 1 trasera + 30 frentes) = **640 archivos**.  
- **6 especiales** (bomb, chameleon, ghost, mirror, trap, wild).  
👉 Total ≈ **646 imágenes**.  

---

## 7. Recomendaciones de formato
- Exportar siempre en **WebP** (salvo iOS viejos, pero en APK no importa).  
- Tamaños:  
  - Fondos: 1080×2000 px.  
  - Cartas: 256×256 px (cuadradas).  
- Peso:  
  - Fondos < 300 KB.  
  - Cartas < 80 KB cada una.  
