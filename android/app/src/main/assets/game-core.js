// Variables del juego
let currentLevel = 1;
let lives = 3;
let cards = 0;
let currentMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
let gameStarted = false;
let levelsData = null;
let currentLevelData = null;
let gameTimer = null;
let timeLeft = 0;
let gameCards = [];
let flippedCards = [];
let matchedPairs = 0;
let totalPairs = 0;
let isProcessing = false; // 🚫 BLOQUEO MIENTRAS SE PROCESA MATCH

let currentGameMode = 'normal'; // 'beginner', 'normal', 'extreme'
let flipCount = 0;
let startTime = 0;

const availableCards = [];
for (let i = 1; i <= 210; i++) {
    availableCards.push(`card_${i.toString().padStart(3, '0')}`);
}




        // Función para lanzar monedas voladoras
        function launchFlyingCoins(fromX, fromY, amount) {
            const targetX = window.innerWidth - 100;
            const targetY = 100;
            
            for (let i = 0; i < amount; i++) {
                const coin = document.createElement('div');
                coin.className = 'flying-coin';
                coin.innerHTML = '🪙';
                coin.style.left = fromX + 'px';
                coin.style.top = fromY + 'px';
                coin.style.setProperty('--target-x', `${targetX - fromX}px`);
                coin.style.setProperty('--target-y', `${targetY - fromY}px`);
                coin.style.animationDelay = `${i * 0.1}s`;
                
                document.body.appendChild(coin);
                setTimeout(() => coin.remove(), 1000 + (i * 100));
            }
        }
        
        // Cartas reales disponibles (210 cartas)    
        
        // Inicializar el juego
        // Cargar niveles según modo
        function loadLevelsData() {
            return new Promise((resolve, reject) => {
                const selectedMode = getSelectedMode();
                let fileName = '';
                
                // Mapear modo a archivo
                switch(selectedMode) {
                    case 'beginner':
                    case 'relax':
                        fileName = 'levels_principiante.js';
                        break;
                    case 'normal':
                        fileName = 'levels_normal.js';
                        break;
                    case 'extreme':
                        fileName = 'levels_extremo.js';
                        break;
                    default:
                        fileName = 'levels_normal.js';
                }
                
                console.log(`📁 Cargando niveles para modo ${selectedMode} desde ${fileName}`);
                
                // Cargar archivo JavaScript dinámicamente
                const script = document.createElement('script');
                script.src = fileName;
                script.onload = () => {
                    if (window.levels && window.levels.levels) {
                        levelsData = window.levels.levels;
                        console.log(`✅ Cargados ${levelsData.length} niveles desde ${fileName}`);
                        resolve(true);
                    } else {
                        console.error(`❌ Datos de niveles no encontrados en ${fileName}`);
                        reject(false);
                    }
                };
                script.onerror = () => {
                    console.error(`❌ Error cargando ${fileName}`);
                    reject(false);
                };
                
                document.head.appendChild(script);
            });
        }

        // Obtener datos del nivel actual
        function getCurrentLevelData() {
            if (!levelsData || currentLevel > levelsData.length) {
                console.warn('⚠️ Nivel no encontrado, usando datos por defecto');
                return {
                    pairs: 4,
                    timeSec: 0,
                    mechanics: ['basic'],
                    theme: 'ocean'
                };
            }
            
            currentLevelData = levelsData[currentLevel - 1];
            // console.log(`📊 Nivel ${currentLevel}:`, currentLevelData); // Log reducido
            return currentLevelData;
        }
        

async function initGame() {
    console.log('🎮 Inicializando juego...');
    
    // Limpiar monedas ganadas del nivel anterior
    window.levelCoinsEarned = 0;
    
    // Cargar modo seleccionado desde localStorage
    const savedMode = localStorage.getItem('memoflip_selected_mode');
    if (savedMode) {
        currentMode = savedMode;
        console.log('🎯 Modo cargado desde localStorage:', currentMode);
    } else {
        console.log('⚠️ No hay modo guardado, usando normal por defecto');
    }
    
    // VERIFICAR VIDAS ANTES DE INICIAR EL JUEGO
    const currentLives = window.LifeSystem ? window.LifeSystem.getCurrentLives(currentMode) : 0;
    console.log(`💚 Verificando vidas para modo ${currentMode}: ${currentLives}`);
    
    if (currentLives <= 0) {
        console.log('🚨 Sin vidas - mostrando modal y bloqueando juego');
        showNoLivesModal();
        return; // NO iniciar el juego
    }
    
    // Intentar cargar modo desde Firestore si hay usuario logueado
    const user = localStorage.getItem('user');
    if (user && window.AndroidInterface && window.AndroidInterface.getUserData) {
        try {
            const userData = JSON.parse(user);
            window.AndroidInterface.getUserData(userData.uid);
            console.log('🔄 Solicitando datos de usuario desde Firestore...');
        } catch (error) {
            console.error('❌ Error solicitando datos de usuario:', error);
        }
    }
    
    try {
        // Cargar datos del modo actual
        await loadLevelsData();
        console.log('✅ Niveles cargados correctamente');
    } catch (error) {
        console.error('❌ Error cargando niveles:', error);
        alert('Error cargando niveles. Usando modo por defecto.');
    }
    
    updateUI();
    generateCards();
    
    // Inicializar cronómetro si el nivel tiene tiempo límite
    startTimer();
    
    // Marcar que el juego ha empezado
    gameStarted = true;
    
    // Iniciar música de fondo
    console.log('🎵 Reanudando música de fondo para nuevo nivel...');
    console.log('🎵 Estado de música antes de play():', {
        paused: backgroundMusic.paused,
        currentTime: backgroundMusic.currentTime,
        readyState: backgroundMusic.readyState
    });
    backgroundMusic.play();
    
    // NO iniciar automáticamente - esperar primer clic
    console.log('🎮 Juego listo. Esperando primer clic...');
}

        // Función para crear partículas
        function createParticles(emoji, targetElement = null) {
            const container = document.createElement('div');
            container.style.cssText = 'position: fixed; inset: 0; pointer-events: none; z-index: 150;';
            document.body.appendChild(container);
            
            const rect = targetElement ? targetElement.getBoundingClientRect() : 
                { left: window.innerWidth / 2, top: window.innerHeight / 2 };
            
            for (let i = 0; i < 6; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.style.left = (rect.left + (rect.width || 0) / 2) + 'px';
                particle.style.top = (rect.top + (rect.height || 0) / 2) + 'px';
                particle.textContent = emoji;
                
                const angle = (Math.PI * 2 * i) / 6;
                const distance = 50 + Math.random() * 50;
                particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
                particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
                
                container.appendChild(particle);
            }
            
            setTimeout(() => container.remove(), 1000);
        }

            // ===== SISTEMA DE BLOQUEO ANTI-TRAMPAS =====
            function handleCardClick(card) {
                // ========================================
                // BLOQUEO 1: Ya está procesando un match
                // ========================================
                if (isProcessing) {
                    console.log('🚫 Bloqueado: Procesando match...');
                    return; // ← NO permitir más clics
                }
                
                // ========================================
                // BLOQUEO 2: Ya está volteada o emparejada
                // ========================================
                if (card.isFlipped || card.matched) {
                    console.log('🚫 Bloqueado: Carta ya volteada o emparejada');
                    return;
                }
                
                // ========================================
                // BLOQUEO 3: Ya hay máximo de cartas volteadas
                // ========================================
                const levelData = getCurrentLevelData();
                const isTrioMode = levelData.mechanics && levelData.mechanics.includes('trio');
                const maxCards = isTrioMode ? 3 : 2;
                
                if (flippedCards.length >= maxCards) {
                    console.log(`🚫 Bloqueado: Ya hay ${maxCards} cartas volteadas`);
                    return; // ← BLOQUEO ESTRICTO
                }
                
                // ========================================
                // PERMITIR CLICK
                // ========================================
                console.log('✅ Click permitido');
                
                // Voltear carta
                card.isFlipped = true;
                flippedCards.push(card);
                
                // Actualizar UI
                const cardElement = document.querySelector(`[data-card-id="${card.id}"]`);
                if (cardElement) {
                    cardElement.classList.add('flipped');
                }
                
                // Incrementar giros
                TimerSystem.incrementFlips();
                
                // Sonido
                soundSystem.play('cartavolteada');
                
                // ========================================
                // VERIFICAR SI HAY SUFICIENTES CARTAS PARA MATCH
                // ========================================
                if (flippedCards.length === maxCards) {
                    // ⚠️ IMPORTANTE: Marcar como procesando INMEDIATAMENTE
                    isProcessing = true; // ← BLOQUEA MÁS CLICS
                    
                    console.log('🔍 Verificando match...');
                    
                    // Esperar 300ms para que se vea la animación
                    setTimeout(() => {
                        checkMatch();
                        
                        // Resetear después de procesar
                        flippedCards = [];
                        isProcessing = false; // ← DESBLOQUEA
                    }, 300);
                }
            }
            
            // Función para generar cartas del nivel
            function generateCards() {
                const grid = document.getElementById('cardsGrid');
                grid.innerHTML = '';
                
                // Limpiar timers anteriores
                MechanicEngine.clearAll();
                
                // Obtener datos del nivel actual desde JSON
                const levelData = getCurrentLevelData();
                const pairs = levelData.pairs || 4; // Número de pares/tríos según mecánica
                const mechanics = levelData.mechanics || ['basic'];
                const isTrioMode = mechanics.includes('trio');
                totalPairs = pairs; // Mantener compatibilidad con el resto del código
                matchedPairs = 0;
                
                console.log(`🎯 Generando ${pairs} ${isTrioMode ? 'tríos' : 'pares'} para nivel ${currentLevel} con mecánicas:`, mechanics);
                
                // Crear cartas ALEATORIAS y posicionarlas ALEATORIAMENTE
                gameCards = [];
                const totalSlots = 24;
                
                // 1️⃣ SELECCIONAR CARTAS ALEATORIAS
                const shuffledCards = [...availableCards].sort(() => Math.random() - 0.5);
                const selectedCards = shuffledCards.slice(0, pairs);
                
                // 2️⃣ CREAR CARTAS (2 para pares, 3 para tríos)
                const cardsPerGroup = isTrioMode ? 3 : 2;
                for (let i = 0; i < pairs; i++) {
                    const cardName = selectedCards[i];
                    // Crear cartas idénticas para cada grupo
                    for (let j = 0; j < cardsPerGroup; j++) {
                        gameCards.push({ 
                            id: i * cardsPerGroup + j, 
                            cardName: cardName, 
                            matched: false, 
                            isFlipped: false,
                            groupId: i // Identificador del grupo (par o trío)
                        });
                    }
                }
                
                // 3️⃣ ALEATORIZAR POSICIONES EN EL GRID
                const availableSlots = [];
                const totalCards = pairs * cardsPerGroup;
                const startSlot = Math.floor((totalSlots - totalCards) / 2);
                for (let i = 0; i < totalCards; i++) {
                    availableSlots.push(startSlot + i);
                }
                availableSlots.sort(() => Math.random() - 0.5);
                
                // 4️⃣ ASIGNAR POSICIONES ALEATORIAS
                gameCards.forEach((card, index) => {
                    card.slot = availableSlots[index];
                });
                
                // Mezclar cartas
                gameCards = gameCards.sort(() => Math.random() - 0.5);
                
                // 5️⃣ CREAR ELEMENTOS DOM Y POSICIONAR EN GRID
                for (let slotIndex = 0; slotIndex < 24; slotIndex++) {
                    const card = gameCards.find(c => c.slot === slotIndex);
                    
                    if (card) {
                        const cardElement = document.createElement('button');
                        cardElement.className = 'card';
                        cardElement.dataset.cardId = card.id;
                        cardElement.onclick = () => {
                            handleCardClick(card);
                        };
                        
                        const cardInner = document.createElement('div');
                        cardInner.className = 'card-inner';
                        
                        // Cara trasera (reverso) - Logo/Portada
                        const cardBack = document.createElement('div');
                        cardBack.className = 'card-back';
                        const backImg = document.createElement('img');
                        backImg.src = 'logo.png';
                        backImg.alt = 'MemoFlip';
                        cardBack.appendChild(backImg);
                        
                        // Cara frontal (anverso) - Imagen de la carta
                        const cardFront = document.createElement('div');
                        cardFront.className = 'card-front';
                        const frontImg = document.createElement('img');
                        frontImg.src = `cards/${card.cardName}.png`;
                        frontImg.alt = `Carta ${card.cardName}`;
                        cardFront.appendChild(frontImg);
                        
                        cardInner.appendChild(cardBack);
                        cardInner.appendChild(cardFront);
                        cardElement.appendChild(cardInner);
                        
                        // Asignar el objeto carta al elemento
                        card.element = cardElement;
                        card.matched = false;
                        card.isFrozen = false;
                        card.mechanic = null;
                        card.mechanicData = {};
                        grid.appendChild(cardElement);
                    } else {
                        // Slot vacío
                        const emptySlot = document.createElement('div');
                        emptySlot.className = 'empty-slot';
                        // Tamaño responsive
                        const isMobile = window.innerWidth <= 480;
                        const cardSize = isMobile ? '70px' : '80px';
                        
                        emptySlot.style.cssText = `
                            width: ${cardSize} !important;
                            height: ${cardSize} !important;
                            border: 1px solid rgba(255,255,255,0.1);
                            border-radius: 14px;
                            background: rgba(255,255,255,0.05);
                        `;
                        grid.appendChild(emptySlot);
                    }
                }
                
                // 6️⃣ INICIAR MECÁNICAS DEL NIVEL
                MechanicEngine.initLevel(levelData, gameCards);
                
                // 7️⃣ MOSTRAR MODAL DE MECÁNICAS SOLO SI HAY MECÁNICAS ESPECIALES
                if (mechanics && mechanics.length > 0) {
                    // Filtrar solo mecánicas especiales (sin 'basic')
                    const specialMechanics = mechanics.filter(m => m !== 'basic');
                    console.log('🎯 Mecánicas especiales encontradas:', specialMechanics);
                    
                    // Solo mostrar modal si hay mecánicas especiales reales
                    if (specialMechanics.length > 0) {
                        showMechanicIntro(specialMechanics);
                    } else {
                        console.log('🎯 Solo mecánicas básicas - no mostrando modal');
                    }
                } else {
                    console.log('🎯 No hay mecánicas - no mostrando modal');
                }
            }
            
        // Verificar si las cartas coinciden
        function checkMatch() {
            const levelData = getCurrentLevelData();
            const isTrioMode = levelData.mechanics && levelData.mechanics.includes('trio');
            const requiredCards = isTrioMode ? 3 : 2;
            
            if (flippedCards.length < requiredCards) return;
            
            if (isTrioMode) {
                // MODO TRÍO: 3 cartas
                const [card1, card2, card3] = flippedCards;
                
                const cardElement1 = document.querySelector(`[data-card-id="${card1.id}"]`);
                const cardElement2 = document.querySelector(`[data-card-id="${card2.id}"]`);
                const cardElement3 = document.querySelector(`[data-card-id="${card3.id}"]`);
                
                // Verificar si las 3 cartas son iguales
                if (card1.cardName === card2.cardName && card2.cardName === card3.cardName) {
                    // ✅ TRÍO EXITOSO
                    card1.matched = true;
                    card2.matched = true;
                    card3.matched = true;
                    matchedPairs++;
                    isProcessing = false; // 🚫 Desactivar bloqueo de procesamiento
                    
                    cardElement1.classList.add('matched');
                    cardElement2.classList.add('matched');
                    cardElement3.classList.add('matched');
                    
                    // Aplicar efectos de mecánicas al match
                    MechanicEngine.onMatch(card1);
                    MechanicEngine.onMatch(card2);
                    MechanicEngine.onMatch(card3);
                    
                    // 🔊 SONIDOS DE MATCH
                    soundSystem.play('matchexitoso');
                    
                    // ✨ PARTÍCULAS DE MATCH
                    createParticles('✨', cardElement1);
                    
                    // 🪙 MONEDAS VOLADORAS
                    const rect = cardElement1.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    launchFlyingCoins(centerX, centerY, 3);
                    
                    // 💰 AGREGAR MONEDAS AL SISTEMA
                    CoinSystem.addCoins(15); // 15 monedas por trío
                    
                    // Ganar cartas
                    const earnedCards = Math.max(10, 20 - currentLevel);
                    cards += earnedCards;
                    
                    if (matchedPairs === totalPairs) {
                        setTimeout(completeLevel, 500);
                    }
                } else {
                    // ❌ NO MATCH - Voltear las 3 cartas
                    cardElement1.classList.add('wrong');
                    cardElement2.classList.add('wrong');
                    cardElement3.classList.add('wrong');
                    
                    // Aplicar mecánicas de error
                    MechanicEngine.onMismatch([card1, card2, card3]);
                    
                    // Voltear cartas de vuelta
                    setTimeout(() => {
                        cardElement1.classList.remove('flipped', 'wrong');
                        cardElement2.classList.remove('flipped', 'wrong');
                        cardElement3.classList.remove('flipped', 'wrong');
                        card1.isFlipped = false;
                        card2.isFlipped = false;
                        card3.isFlipped = false;
                    }, 500);
                }
            } else {
                // MODO PARES: 2 cartas
                const [card1, card2] = flippedCards;
                
                const cardElement1 = document.querySelector(`[data-card-id="${card1.id}"]`);
                const cardElement2 = document.querySelector(`[data-card-id="${card2.id}"]`);
                
                // Verificar si las 2 cartas son iguales
                if (card1.cardName === card2.cardName) {
                    // ✅ PAR EXITOSO
                    card1.matched = true;
                    card2.matched = true;
                    matchedPairs++;
                    
                    cardElement1.classList.add('matched');
                    cardElement2.classList.add('matched');
                    
                    // Aplicar efectos de mecánicas al match
                    MechanicEngine.onMatch(card1);
                    MechanicEngine.onMatch(card2);
                    
                    // 🔊 SONIDOS DE MATCH
                    soundSystem.play('matchexitoso');
                    
                    // ✨ PARTÍCULAS DE MATCH
                    createParticles('✨', cardElement1);
                    
                    // 🪙 MONEDAS VOLADORAS
                    const rect = cardElement1.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    launchFlyingCoins(centerX, centerY, 3);
                    
                    // 💰 AGREGAR MONEDAS AL SISTEMA
                    CoinSystem.addCoins(10); // 10 monedas por par
                    
                    // Ganar cartas
                    const earnedCards = Math.max(10, 20 - currentLevel);
                    cards += earnedCards;
                    
                    if (matchedPairs === totalPairs) {
                        setTimeout(completeLevel, 500);
                    }
                } else {
                    // ❌ NO MATCH - Voltear las 2 cartas
                    cardElement1.classList.add('wrong');
                    cardElement2.classList.add('wrong');
                    
                    // Aplicar mecánicas de error
                    MechanicEngine.onMismatch([card1, card2]);
                    
                    // Voltear cartas de vuelta
                    setTimeout(() => {
                        cardElement1.classList.remove('flipped', 'wrong');
                        cardElement2.classList.remove('flipped', 'wrong');
                        card1.isFlipped = false;
                        card2.isFlipped = false;
                    }, 500);
                }
            }
            
            flippedCards = [];
            isProcessing = false; // 🚫 Desactivar bloqueo de procesamiento
            updateUI();
        }

        // Completar nivel
        
        // Siguiente nivel
        function nextLevel() {
            currentLevel++;
            
            // 🔄 RESETEAR TIEMPO Y GIROS AL CAMBIAR NIVEL
            TimerSystem.stop();
            TimerSystem.totalFlips = 0;
            TimerSystem.actualGameTime = 0;
            TimerSystem.timeElapsed = 0;
            TimerSystem.hasStarted = false;
            TimerSystem.isPaused = false;
            
            // Actualizar displays a 0
            TimerSystem.updateTimeDisplay();
            TimerSystem.updateFlipsDisplay();
            TimerSystem.updateDisplay();
            
            // Resetear variables del juego (flipCount se resetea después del modal)
            flippedCards = [];
            matchedPairs = 0;
            isProcessing = false; // 🚫 Desactivar bloqueo de procesamiento
            
            generateCards();
            updateUI();
            
            // NO guardar automáticamente al cambiar de nivel
            // Solo se guarda cuando hay cambios importantes
            
            console.log('🎮 Nivel', currentLevel, 'iniciado. Tiempo y giros reseteados.');
        }
        
        // Iniciar nivel automáticamente
        function startLevel() {
            // NO iniciar automáticamente - esperar primer clic
            console.log('🎮 Nivel listo. Esperando primer clic...');
        }
        
        // Pausar juego
        function pauseGame() {
            gameStarted = !gameStarted;
            console.log('⏸️ Juego pausado:', !gameStarted);
        }
        
        // Volver atrás
        function goBack() {
            if (confirm('¿Estás seguro de que quieres salir del juego?')) {
                window.location.href = 'index.html';
            }
        }
        
        // Actualizar UI
        function updateUI() {
            document.getElementById('currentLevel').textContent = currentLevel;
            // Usar LifeSystem para obtener las vidas correctas
            const currentLives = window.LifeSystem ? window.LifeSystem.getCurrentLives() : 0;
            document.getElementById('lives').textContent = currentLives;
            // Las monedas se actualizan automáticamente por CoinSystem.updateDisplay()
            
            // Actualizar indicador de modo (ya no existe, se maneja en el pill)
            // const modeNames = {
            //     'beginner': 'Tranquilo',
            //     'normal': 'Normal',
            //     'extreme': 'Extremo'
            // };
            // document.getElementById('modeIndicator').textContent = modeNames[currentMode];
            
            // Actualizar información de mecánica
            updateMechanicInfo();
        }
        
        // Actualizar información de mecánica del nivel actual
        function updateMechanicInfo() {
            const levelData = getCurrentLevelData();
            const mechanics = levelData.mechanics || ['basic'];
            
            // Filtrar solo mecánicas especiales (sin 'basic')
            const specialMechanics = mechanics.filter(m => m !== 'basic');
            
            // Actualizar el icono
            const mechanicIcon = document.querySelector('.mechanic-icon');
            if (mechanicIcon) {
                if (specialMechanics.length > 0) {
                    // Si hay mecánicas especiales, mostrar el icono de la primera
                    const firstMechanic = specialMechanics[0];
                    const mechanicInfo = MECHANIC_INFO[firstMechanic] || MECHANIC_INFO.basic;
                    mechanicIcon.src = mechanicInfo.icon;
                    mechanicIcon.alt = mechanicInfo.name;
                } else {
                    // Si solo hay basic, mostrar icono básico
                    mechanicIcon.src = MECHANIC_INFO.basic.icon;
                    mechanicIcon.alt = MECHANIC_INFO.basic.name;
                }
            }
            
            // Actualizar el texto
            const mechanicTitle = document.querySelector('.mechanic-text h3');
            const mechanicDescription = document.querySelector('.mechanic-text p');
            
            if (mechanicTitle) {
                // Siempre mostrar "Mecánica del nivel:"
                mechanicTitle.textContent = 'Mecánica del nivel:';
            }
            
            if (mechanicDescription) {
                if (specialMechanics.length > 0) {
                    // Mostrar nombres de todas las mecánicas especiales
                    const mechanicNames = specialMechanics.map(m => {
                        const info = MECHANIC_INFO[m];
                        return info ? info.name : m;
                    });
                    mechanicDescription.textContent = mechanicNames.join(' + ');
                } else {
                    mechanicDescription.textContent = 'Básica';
                }
            }
            
            // console.log(`🎯 Mecánicas actualizadas: ${specialMechanics.length > 0 ? specialMechanics.join(', ') : 'basic'}`); // Log reducido
        }
        
        // Cambiar modo de juego
        function changeGameMode() {
            const select = document.getElementById('gameModeSelect');
            currentMode = select.value;
            updateUI();
            console.log('Modo cambiado a:', currentMode);
            
            // Recargar niveles del nuevo modo
            loadLevelsData().then(() => {
                console.log('✅ Niveles recargados para nuevo modo');
            }).catch((error) => {
                console.error('❌ Error recargando niveles:', error);
            });
        }
        
        // Cambiar nivel inicial
        function changeInitialLevel() {
            const select = document.getElementById('levelSelect');
            currentLevel = parseInt(select.value);
            updateUI();
            console.log('Nivel inicial cambiado a:', currentLevel);
        }
        
        // Cerrar configuración
        function closeSettings() {
            document.getElementById('settingsModal').classList.remove('show');
        }
        
       

        // Sistema de cronómetro
        
        function stopTimer() {
            if (gameTimer) {
                clearInterval(gameTimer);
                gameTimer = null;
            }
        }
    
        function updateTimerDisplay() {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            document.getElementById('timer').textContent = timeString;
        }

        // ===== FUNCIONES DE JUEGO =====

        function completeLevel() {
            console.log('🎉 Nivel completado!');
            
            // Pausar música de fondo
            backgroundMusic.pause();
            
            // Detener cronómetros
            TimerSystem.stop();
            
            // 🔄 RESETEAR VARIABLES DEL JUEGO
            flippedCards = [];
            matchedPairs = 0;
            isProcessing = false; // 🚫 Desactivar bloqueo de procesamiento
            
            // 🎯 SISTEMA DE MONEDAS MEJORADO
            
            // 1. BASE POR NIVEL (más difícil = más monedas)
            let totalCoins = 10 + (currentLevel * 2); // Nivel 1: 12, Nivel 5: 20, Nivel 10: 30
            console.log(`🪙 Monedas base por nivel ${currentLevel}: ${totalCoins}`);
            
            // 2. BONIFICACIÓN POR TIEMPO (usando tiempo límite real del nivel)
            const levelData = getCurrentLevelData();
            const levelTimeLimit = levelData.timeSec || 60; // Tiempo límite real del nivel
            
            if (TimerSystem.actualGameTime > 0 && levelTimeLimit > 0) {
                const timeBonus = Math.max(0, levelTimeLimit - TimerSystem.actualGameTime);
                const timeBonusCoins = Math.floor(timeBonus / 3); // Más generoso
                totalCoins += timeBonusCoins;
                console.log(`⏱️ Bonificación por tiempo: +${timeBonusCoins} (${TimerSystem.actualGameTime}s de ${levelTimeLimit}s)`);
            }
            
            // 3. BONIFICACIÓN POR EFICIENCIA (corregida - menos giros = más monedas)
            const minFlips = currentLevel * 2; // Mínimo teórico
            if (TimerSystem.totalFlips <= minFlips) {
                const efficiencyBonus = (minFlips - TimerSystem.totalFlips) * 3;
                totalCoins += efficiencyBonus;
                console.log(`🔄 Bonificación por eficiencia: +${efficiencyBonus} (${TimerSystem.totalFlips} giros, mínimo: ${minFlips})`);
            } else {
                console.log(`🔄 Sin bonificación por eficiencia: ${TimerSystem.totalFlips} giros (mínimo: ${minFlips})`);
            }
            
            // 4. BONIFICACIÓN POR NIVEL ALTO (motivar progresión)
            if (currentLevel > 10) {
                const levelBonus = Math.floor(currentLevel / 5);
                totalCoins += levelBonus;
                console.log(`🏆 Bonificación por nivel alto: +${levelBonus} (nivel ${currentLevel})`);
            }
            
            totalCoins = Math.max(1, totalCoins);
            
            console.log(`💰 TOTAL DE MONEDAS CALCULADAS: ${totalCoins}`);
            
            // Guardar monedas ganadas para mostrar en modal de victoria
            window.levelCoinsEarned = totalCoins;
            
            CoinSystem.addCoins(totalCoins);
            
            // Actualizar estadísticas del modo
            const modeProgress = getModeProgress(currentMode);
            
            // Calcular mejores tiempos y giros
            const currentTime = TimerSystem.actualGameTime;
            const currentFlips = TimerSystem.totalFlips;
            
            const updatedProgress = {
                ...modeProgress,
                level: Math.max(modeProgress.level, currentLevel + 1),
                coins: CoinSystem.totalCoins, // Monedas del modo actual
                totalGames: modeProgress.totalGames + 1,
                totalWins: modeProgress.totalWins + 1,
                lastPlayed: new Date().toISOString(),
                // Guardar mejores tiempos y giros
                bestTime: modeProgress.bestTime ? Math.min(modeProgress.bestTime, currentTime) : currentTime,
                bestFlips: modeProgress.bestFlips ? Math.min(modeProgress.bestFlips, currentFlips) : currentFlips
            };
            saveModeProgress(currentMode, updatedProgress);
            
            // ===== LOGS DETALLADOS DE SINCRONIZACIÓN =====
            console.log('🔍 ===== VERIFICACIÓN DE DATOS AL COMPLETAR NIVEL =====');
            console.log('🎯 Nivel completado:', currentLevel);
            console.log('🎯 Nuevo nivel:', updatedProgress.level);
            console.log('🪙 Monedas ganadas en este nivel:', totalCoins);
            console.log('🪙 Total de monedas CoinSystem:', CoinSystem.totalCoins);
            console.log('🪙 Monedas en progreso del modo:', updatedProgress.coins);
            console.log('⏱️ Tiempo actual:', currentTime, 'segundos');
            console.log('🔄 Giros actuales:', currentFlips);
            console.log('🏆 Mejor tiempo guardado:', updatedProgress.bestTime);
            console.log('🏆 Mejor giros guardados:', updatedProgress.bestFlips);
            
            // Verificar localStorage
            const localProgress = JSON.parse(localStorage.getItem(`memoflip_progress_${currentMode}`) || '{}');
            console.log('💾 localStorage - Progreso del modo:', localProgress);
            
            // Verificar consistencia
            const coinsMatch = CoinSystem.totalCoins === updatedProgress.coins;
            const levelMatch = updatedProgress.level === (currentLevel + 1);
            console.log('✅ Monedas coinciden (CoinSystem vs Progreso):', coinsMatch);
            console.log('✅ Nivel actualizado correctamente:', levelMatch);
            console.log('🔍 ===== FIN VERIFICACIÓN =====');
            
            // Guardar progreso completo en Firestore (incluyendo vidas)
            if (window.saveGameProgress) {
                setTimeout(() => {
                    console.log('🔥 Enviando datos a Firestore...');
                    window.saveGameProgress();
                }, 1000); // Esperar 1 segundo para que se actualicen las monedas
            }
            
            // Verificar si debe mostrar anuncio intersticial (cada 10 niveles)
            const newLevel = updatedProgress.level;
            if (newLevel % 10 === 0) {
                console.log(`📺 Nivel ${newLevel} completado - Mostrando anuncio intersticial`);
                showInterstitialAdAfterLevel();
            } else {
                // Mostrar modal de victoria directamente
            showVictoryModal();
            }
        }


        function gameOver() {
            console.log('💀 Game Over!');
            
            // Pausar música de fondo
            backgroundMusic.pause();
            
            // Detener cronómetros
            TimerSystem.stop();
            
            // Verificar vidas antes de perder una
            const currentMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
            const currentLives = LifeSystem.getCurrentLives(currentMode);
            
            if (currentLives > 0) {
                // Perder vida usando el sistema (ya maneja los modales internamente)
                LifeSystem.loseLife();
            } else {
                // Ya no hay vidas, mostrar modal sin vidas
                console.log('🚨 No hay vidas, mostrando modal sin vidas');
                showNoLivesModal();
            }
        }

        function startTimer() {
            const levelData = getCurrentLevelData();
            const timeLimit = levelData.timeSec || 0;
            
            // Usar el sistema de cronómetro completo
            TimerSystem.startLevel(timeLimit);
        }