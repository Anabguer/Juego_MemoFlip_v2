# Sistema de 1000 Niveles para Sopa de Letras

## 🎯 Proceso para Crear 1000 Niveles

### 1. GENERADOR DINÁMICO PRIMERO
```
Crea un generador de niveles que genere niveles dinámicamente con:
- Diferentes tamaños de grid (ej: 5x5, 6x6, 7x7)
- Diferentes palabras por nivel
- Diferentes dificultades
- Mecánicas específicas de sopa de letras
- Tiempo límite variable
- Seed para reproducibilidad
```

### 2. GENERAR 1000 NIVELES
```
Usa el generador para crear 1000 niveles y guárdalos en un JSON con estructura:
{
  "id": 1,
  "phase": 1,
  "theme": "animales",
  "gridSize": "6x6",
  "words": ["gato", "perro", "pez"],
  "timeSec": 120,
  "mechanics": ["basic", "hidden_words"],
  "difficulty": "easy",
  "description": "Encuentra animales",
  "isBoss": false,
  "rewards": {
    "coins": 50
  },
  "seed": "animales_001"
}
```

### 3. SISTEMA DE TEMAS
```
Crea temas para las palabras:
- Fase 1 (1-50): Animales
- Fase 2 (51-100): Comida
- Fase 3 (101-150): Deportes
- etc.
```

### 4. MECÁNICAS ESPECÍFICAS
```
Mecánicas para sopa de letras:
- "basic": Palabras normales
- "hidden_words": Palabras ocultas
- "backwards": Palabras al revés
- "diagonal": Palabras en diagonal
- "time_pressure": Menos tiempo
- "bonus_words": Palabras extra
```

## 📝 PROMPT PARA CURSOR

```
"Necesito crear un sistema de 1000 niveles para una sopa de letras como hicimos con el memory game. 

1. Crea un generador de niveles que genere dinámicamente:
   - Grids de diferentes tamaños (5x5, 6x6, 7x7, 8x8)
   - Listas de palabras por tema
   - Tiempo límite variable
   - Mecánicas específicas de sopa de letras
   - Seed para reproducibilidad

2. Genera 1000 niveles y guárdalos en un JSON con esta estructura:
   - id, phase, theme, gridSize, words, timeSec, mechanics, difficulty, description, isBoss, rewards, seed

3. Crea un sistema de temas por fases:
   - Fase 1: Animales
   - Fase 2: Comida  
   - Fase 3: Deportes
   - etc.

4. Implementa mecánicas como: basic, hidden_words, backwards, diagonal, time_pressure, bonus_words

5. Crea funciones para cargar niveles desde el JSON como getLevelFromJson(), getAllLevels(), etc.

¿Puedes hacer esto paso a paso?"
```

## 📁 ESTRUCTURA DE ARCHIVOS
```
src/
  data/
    levels.json (1000 niveles)
    levels.ts (funciones de carga)
  lib/
    levelGenerator.ts (generador dinámico)
  components/
    GameScreen.tsx (usa los niveles del JSON)
```

## 🎮 EJEMPLO DE NIVEL
```json
{
  "id": 1,
  "phase": 1,
  "theme": "animales",
  "gridSize": "6x6",
  "words": ["gato", "perro", "pez", "ave"],
  "timeSec": 120,
  "mechanics": ["basic"],
  "difficulty": "easy",
  "description": "Encuentra los animales en la sopa de letras",
  "isBoss": false,
  "rewards": {
    "coins": 50
  },
  "seed": "animales_001"
}
```

## 🔧 FUNCIONES NECESARIAS
```typescript
// src/data/levels.ts
export function getLevelFromJson(levelId: number): LevelConfig
export function getAllLevels(): LevelConfig[]
export function getLevelsByPhase(phase: number): LevelConfig[]
export function getLevelsByTheme(theme: string): LevelConfig[]
```

## 🎯 RESULTADO FINAL
- 1000 niveles predefinidos en JSON
- Sistema de temas por fases
- Mecánicas específicas de sopa de letras
- Generador dinámico como respaldo
- Funciones de carga optimizadas
- Mismo patrón que el memory game

¡Exactamente el mismo proceso que hicimos con el memory game!

