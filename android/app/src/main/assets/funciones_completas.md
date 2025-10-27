# 📋 FUNCIONES COMPLETAS DE MEMOFLIP

## 📄 **game.html** (1517 líneas) - SISTEMAS BÁSICOS

### 🔧 **Variables del juego:**
- `currentLevel`, `lives`, `cards`, `currentMode`
- `gameStarted`, `levelsData`, `currentLevelData`
- `gameTimer`, `timeLeft`, `gameCards`, `flippedCards`
- `matchedPairs`, `totalPairs`, `isProcessing`

### 🏗️ **Sistemas:**
- **LifeSystem** - Sistema de vidas por modo
- **LoadingSystem** - Sistema de carga inteligente
- **SyncSystem** - Sistema de sincronización simple
- **CoinSystem** - Sistema de monedas completo
- **TimerSystem** - Sistema de cronómetro completo
- **soundSystem** - Sistema de sonidos
- **backgroundMusic** - Sistema de música de fondo

### 🚀 **Inicialización:**
- **DOMContentLoaded** - Evento de inicialización

---

## 🎯 **game-core.js** (841 líneas) - 20 FUNCIONES

### 📊 **Gestión de datos:**
1. `loadLevelsData()` - Cargar datos de niveles
2. `getCurrentLevelData()` - Obtener datos del nivel actual

### 🎮 **Lógica principal del juego:**
3. `initGame()` - Inicializar juego
4. `handleCardClick(card)` - Manejar clic en carta
5. `generateCards()` - Generar cartas del nivel
6. `checkMatch()` - Verificar si hay match
7. `nextLevel()` - Pasar al siguiente nivel
8. `startLevel()` - Iniciar nivel
9. `pauseGame()` - Pausar juego
10. `goBack()` - Volver al menú principal

### 🎨 **Interfaz y actualización:**
11. `updateUI()` - Actualizar interfaz
12. `updateMechanicInfo()` - Actualizar información de mecánicas
13. `changeGameMode()` - Cambiar modo de juego
14. `changeInitialLevel()` - Cambiar nivel inicial
15. `closeSettings()` - Cerrar configuración

### ⏱️ **Tiempo y cronómetros:**
16. `startTimer()` - Iniciar cronómetro
17. `stopTimer()` - Detener cronómetro
18. `updateTimerDisplay()` - Actualizar display del cronómetro

### 🏆 **Finalización de nivel:**
19. `completeLevel()` - Completar nivel
20. `gameOver()` - Game over

### ✨ **Efectos visuales:**
21. `createParticles(emoji, targetElement)` - Crear partículas
22. `launchFlyingCoins(fromX, fromY, amount)` - Lanzar monedas voladoras

---

## 🔥 **game-firebase.js** (1367 líneas) - 35 FUNCIONES

### 👤 **Gestión de usuarios:**
1. `window.__onUserData(userDataJson)` - Callback de datos de usuario
2. `window.loadUserNick()` - Cargar nick del usuario
3. `updateAccountDisplay()` - Actualizar display de cuenta
4. `loginWithGoogleFromGame()` - Login con Google desde juego

### 📊 **Ranking:**
5. `showRankingSuccess()` - Mostrar éxito del ranking
6. `loadRanking()` - Cargar ranking
7. `loadRealRankingFromFirebase(mode, currentUser)` - Cargar ranking real de Firebase
8. `showRanking()` - Mostrar ranking
9. `window.__onRankingLoaded(rankingData)` - Callback de ranking cargado

### ⚙️ **Configuración:**
10. `showSettings()` - Mostrar configuración
11. `togglePause()` - Alternar pausa
12. `updateModeInSettings()` - Actualizar modo en configuración

### 💾 **Guardado y sincronización:**
13. `window.saveToFirestore()` - Guardar en Firestore
14. `getModeProgress(mode)` - Obtener progreso del modo
15. `saveModeProgress(mode, progress)` - Guardar progreso del modo
16. `getSettings()` - Obtener configuración
17. `saveSettings(settings)` - Guardar configuración
18. `window.saveGameProgress()` - Guardar progreso del juego
19. `executeSaveGameProgress()` - Ejecutar guardado de progreso
20. `window.__onSaveGameProgress(success, error)` - Callback de guardado

### 🌐 **Conexión:**
21. `updateConnectionIndicator()` - Actualizar indicador de conexión
22. `window.addEventListener('online')` - Listener de conexión online
23. `window.addEventListener('offline')` - Listener de conexión offline
24. `syncPendingData()` - Sincronizar datos pendientes

### 🔄 **Carga de datos:**
25. `loadSettings()` - Cargar configuración
26. `updateSettingsUI()` - Actualizar UI de configuración
27. `window.__onUserProgressLoaded(mode, progressData)` - Callback de progreso cargado
28. `loadGameProgress()` - Cargar progreso del juego

### 🔍 **Validación y diagnóstico:**
29. `validateDataIntegrity()` - Validar integridad de datos
30. `diagnoseSyncIssues()` - Diagnosticar problemas de sincronización

### 👥 **Gestión de invitados:**
31. `checkForGuestData()` - Verificar datos de invitado
32. `collectGuestData()` - Recopilar datos de invitado
33. `getUserDataFromFirebase(uid)` - Obtener datos de usuario de Firebase
34. `mergeGuestAndUserData(guestData, firebaseData)` - Fusionar datos de invitado y usuario
35. `saveMergedData(mergedData)` - Guardar datos fusionados
36. `saveMergedDataToFirebase(uid, mergedData)` - Guardar datos fusionados en Firebase
37. `handleGuestToLogin(userData)` - Manejar invitado a login
38. `clearAllLocalStorage()` - Limpiar todo el localStorage
39. `saveUserDataToLocalStorage(firebaseData)` - Guardar datos de usuario en localStorage
40. `initializeNewUserData()` - Inicializar datos de nuevo usuario
41. `handleUserSwitch(userData)` - Manejar cambio de usuario
42. `collectCurrentUserData()` - Recopilar datos del usuario actual
43. `resolveDataConflicts(localData, firebaseData)` - Resolver conflictos de datos
44. `saveUserDataToFirebase(uid, userData)` - Guardar datos de usuario en Firebase
45. `handleSameUserUpdate(userData)` - Manejar actualización del mismo usuario

---

## 🎨 **game-ui.js** (1735 líneas) - 41 FUNCIONES

### 🎮 **Ayuda de mecánicas:**
1. `showMechanicHelp()` - Mostrar ayuda de mecánicas
2. `closeMechanicHelp()` - Cerrar ayuda de mecánicas
3. `showMechanicIntro(levelMechanics)` - Mostrar introducción de mecánicas

### 🏆 **Modales de resultado:**
4. `preloadVictoryAnimation()` - Precargar animación de victoria
5. `showVictoryModal()` - Mostrar modal de victoria
6. `showDefeatModal()` - Mostrar modal de derrota
7. `showNoLivesModal()` - Mostrar modal sin vidas

### 📺 **Anuncios:**
8. `onAdWatched()` - Callback cuando se ve anuncio
9. `showInterstitialAdAfterLevel()` - Mostrar anuncio intersticial después de nivel
10. `window.onInterstitialAdClosed()` - Callback cuando se cierra anuncio intersticial
11. `window.onInterstitialAdForLifeClosed()` - Callback cuando se cierra anuncio para vida

### ⚙️ **Configuración:**
12. `openSettingsModal()` - Abrir modal de configuración
13. `closeSettingsModal()` - Cerrar modal de configuración
14. `toggleSound()` - Alternar sonido
15. `toggleVibration()` - Alternar vibración
16. `changeGameMode(mode)` - Cambiar modo de juego

### 🔐 **Autenticación:**
17. `loginWithGoogle()` - Login con Google
18. `window.__onNativeLogout()` - Callback de logout nativo
19. `logout()` - Cerrar sesión
20. `deleteAccount()` - Eliminar cuenta

### 🕒 **Utilidades:**
21. `formatTime(seconds)` - Formatear tiempo
22. `startLifeRegenTimer()` - Iniciar timer de regeneración de vidas
23. `goToMainMenu()` - Ir al menú principal
24. `updateAccountDisplay()` - Actualizar display de cuenta
25. `loginWithGoogleFromGame()` - Login con Google desde juego

### ❓ **Ayuda:**
26. `showModeHelp()` - Mostrar ayuda de modos
27. `closeHelpModal()` - Cerrar modal de ayuda

### ✅ **Modales de confirmación:**
28. `showConfirmModal(title, message, confirmText, cancelText, onConfirm)` - Mostrar modal de confirmación
29. `closeConfirmModal()` - Cerrar modal de confirmación
30. `showAlertModal(title, message)` - Mostrar modal de alerta
31. `closeAlertModal()` - Cerrar modal de alerta

### ⚙️ **Configuración avanzada:**
32. `showSettings()` - Mostrar configuración

### 🏆 **Ranking:**
33. `openRankingModal()` - Abrir modal de ranking
34. `closeRankingModal()` - Cerrar modal de ranking
35. `renderRankingTable(data, currentUser)` - Renderizar tabla de ranking
36. `openNativeRanking()` - Abrir ranking nativo

### 🎯 **Modos de juego:**
37. `getSelectedMode()` - Obtener modo seleccionado
38. `toggleModeSelector()` - Alternar selector de modo
39. `changeMode(newMode)` - Cambiar modo

### 💬 **Mensajes:**
40. `showModeMotivationalMessage(mode)` - Mostrar mensaje motivacional del modo
41. `showTemporaryMessage(title, message, mode)` - Mostrar mensaje temporal

---

## 📊 **RESUMEN TOTAL:**

- **game.html**: Sistemas básicos + inicialización
- **game-core.js**: 22 funciones (lógica principal del juego)
- **game-firebase.js**: 45 funciones (Firebase y sincronización)
- **game-ui.js**: 41 funciones (interfaz de usuario)

**TOTAL: 108 funciones distribuidas en 4 archivos modulares**

---

*Documento generado automáticamente - MemoFlip v1.0*

