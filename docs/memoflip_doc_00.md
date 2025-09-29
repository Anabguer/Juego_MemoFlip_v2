# 📄 Documento 00 – Flujo Completo y Consideraciones Generales (MemoFlip)

Este documento sirve como **punto de partida** para el desarrollo del juego. Resume el flujo de usuario y las condiciones generales que debe cumplir el proyecto.

---

## 1. Flujo completo del jugador
1. **Pantalla de inicio**
   - Entrar como invitado o con usuario registrado.
   - Botón de sonido (mute/unmute).
   - Al entrar como invitado, los datos se guardan en `localStorage`.

2. **Mapa**
   - El jugador empieza en el **último nivel desbloqueado**.
   - Estados de cada nivel:
     - Bloqueado.
     - Activo (siguiente a jugar).
     - Completado.
     - Boss (cada 50).
   - Navegación con flechas arriba/abajo (subir/bajar de bloque).
   - Cabecera: logo MemoFlip + monedas acumuladas + botón sonido.

3. **Nivel**
   - Grid de cartas.
   - Barra de tiempo (si tiene cronómetro).
   - Contador de movimientos/fallos.
   - Al terminar:
     - **Victoria** → pasa al siguiente nivel.
     - **Derrota** → opción de:
       - Reintentar.
       - Volver al mapa.

---

## 2. Sistema de vidas
- El jugador empieza con **5 vidas**.
- Cada derrota resta **1 vida**.
- Las vidas se regeneran automáticamente:
  - **+1 vida cada hora**.
  - Máximo 5 vidas acumuladas.
- Si el jugador se queda sin vidas:
  - Puede esperar a que se recarguen.
  - O volver al mapa y revisar niveles pasados (pero no jugar niveles nuevos).

---

## 3. Recompensas
- **No se implementan recompensas diarias** en esta primera versión.
- Se deja como mejora futura si se añaden power-ups o boosters.

---

## 4. Sonido y feedback
- Deben añadirse sonidos básicos:
  - Flip de carta.
  - Acierto.
  - Error.
  - Tiempo agotado.
  - Subida de nivel.
- Música de fondo en el mapa (loop corto, con mute opcional).
- Todos los sonidos deben tener un botón global de mute/unmute.

---

## 5. Rendimiento y carga
- Objetivo de APK: **<150 MB**.
- Estrategias:
  - **Formato WebP** para imágenes.
  - Cartas: 256×256 px, <80 KB por archivo.
  - Fondos: 1080×2000 px, <300 KB por archivo.
  - Precarga de assets:
    - Solo cargar cartas/fondo del capítulo actual y el siguiente.
  - Evitar cargar todos los 1000 niveles de golpe.
- Debe ser **responsive** en todos los móviles (diferentes tamaños de pantalla).
  - La **cabecera** debe adaptarse correctamente en cualquier resolución.

---

## 6. Analítica
- **No se implementa en esta fase**.
- Queda como mejora futura.

---

## 7. Publicación
- Preparar para **Google Play Store**:
  - APK firmado y optimizado.
  - Icono 512×512.
  - Capturas de pantalla 1080×1920.
  - Pantalla promocional (feature graphic).
  - Política de privacidad básica.
- Validar que todos los assets y pantallas cumplen los requisitos de publicación.

---

## Resumen
Este documento es la **guía base**.  
Define:
- Flujo de pantallas.
- Sistema de vidas.
- Uso de sonidos.
- Estrategia de carga.
- Publicación.  

Todo el trabajo posterior (niveles, puntuación, assets) debe respetar estas reglas globales.
