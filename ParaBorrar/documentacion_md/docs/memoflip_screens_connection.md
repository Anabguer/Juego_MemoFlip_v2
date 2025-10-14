# 📱 Especificación – **Pantallas y Conexión de Usuario** (MemoFlip)

## 🎯 Objetivo
Definir la estructura de **pantallas principales** del juego y el flujo de conexión de usuario, para que el desarrollo sea claro y mantenible.  
Este documento complementa los de **niveles** y **puntuación**.

---

## 🖼️ Pantallas principales

### 1. Pantalla de Inicio
- Logo del juego: **MemoFlip**.
- Botones principales:
  - **Entrar como invitado** → genera perfil local en `localStorage` (uuid).  
  - **Iniciar sesión / Registro** → conexión vía API a la tabla de usuarios en MySQL (ya existente en Hostalia).  
- **Botón de sonido**: visible aquí y en todo el juego (toggle ON/OFF).

### 2. Pantalla de Mapa
- Al iniciar sesión o entrar como invitado, el jugador es enviado **directamente al último nivel desbloqueado**.  
  - Ejemplo: si está en el 58, el mapa abre centrado en el 58.  
- Estados de nivel:
  - **Bloqueado** 🔒  
  - **Activo** 🟦 (el siguiente a jugar)  
  - **Completado** ✅  
  - **Boss** 👑  
- Navegación:
  - Flechas ⬆️⬇️ para moverse entre bloques de 50 niveles.  
- Encabezado superior:
  - Logo **MemoFlip**.  
  - **Monedas acumuladas**.  
  - **Ranking (posición)**.  
  - **Botón de sonido** (persistente).  

### 3. Pantalla de Juego
- Grid de cartas dinámico (según `pairs` y mecánicas).  
- Barra de tiempo ⏱️ si el nivel tiene `crono`.  
- Contador de **movimientos** y **fallos** visibles.  
- Botón de pausa con opciones: reanudar / volver al mapa.  

### 4. Pantalla de Victoria / Derrota
- **Victoria**:
  - Monedas ganadas con breakdown (base, tiempo, eficiencia, penalizaciones, multiplicador).  
  - Botones: “Reintentar”, “Mapa”, “Siguiente nivel”.  
- **Derrota**:
  - Mensaje claro + opción reintentar.  

### 5. Pantalla de Perfil / Ranking
- Información del jugador:
  - Monedas totales.  
  - Nivel máximo alcanzado.  
  - Posición en ranking global.  
- Ranking global:
  - Lista de jugadores, ordenada por **nivel alcanzado** y después **monedas acumuladas**.  

---

## 🔗 Conexión de usuario

### Flujo básico
1. **Invitado**:
   - Se genera un `uuid` y se guarda en `localStorage`.  
   - Progreso (niveles, monedas) guardado localmente.  
2. **Usuario registrado**:
   - Login/registro vía API REST → conecta con la tabla de usuarios en MySQL (Hostalia).  
   - Tras login, se sincronizan monedas y progreso local con remoto.  

### APIs recomendadas
- `POST /guest` → crear perfil invitado con `uuid`.  
- `POST /login` → iniciar sesión, devuelve token.  
- `POST /register` → crear usuario registrado.  
- `GET /profile/:id` → devuelve monedas, nivel máximo, ranking.  
- `POST /progress/:id` → actualizar progreso (monedas y nivel).  
- `POST /score/:id/:level` → guardar récord de un nivel.  
- `GET /ranking` → ranking global.  

### Guardado de progreso
- **Invitado**: todo en `localStorage`.  
- **Registrado**: sincronización automática con MySQL vía API.  
- Al terminar un nivel:  
  - Se actualiza progreso local.  
  - Si está logueado: también se manda a servidor.  

---

## ⚙️ Consideraciones de diseño
- **Botón de sonido** debe estar presente en todas las pantallas, idealmente en la cabecera.  
- **Mapa** debe mostrar siempre el nivel actual desbloqueado al abrir.  
- **Encabezado** con logo + monedas + ranking + sonido será un componente compartido.  
- **Pantalla de perfil** opcional al inicio, pero recomendable para mostrar ranking.  

---

## ✅ Checklist para desarrollo
- [ ] Pantalla de inicio con invitado/login/registro.  
- [ ] Sistema de sonido global con botón persistente.  
- [ ] Mapa que carga directamente el último nivel activo.  
- [ ] Encabezado compartido con logo, monedas, ranking y sonido.  
- [ ] Pantalla de juego con grid, barra de tiempo (si aplica), contadores y pausa.  
- [ ] Pantallas de victoria/derrota con monedas ganadas y botones claros.  
- [ ] Ranking global integrado con API.  
