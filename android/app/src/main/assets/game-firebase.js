        // Callback para cuando se reciben datos del usuario desde Firestore (desde index.html)
        window.__onNativeLogin = function(payloadStr) {
            console.log('🎯 __onNativeLogin llamado con:', payloadStr);
            try {
                const userData = JSON.parse(payloadStr);
                console.log('📥 Datos de usuario recibidos desde Firebase:', userData);
                
                // Guardar usuario en localStorage
                localStorage.setItem('user', JSON.stringify(userData));
                console.log('💾 Usuario guardado en localStorage');
                
                // Cerrar modal de invitados si está abierta
                const guestModal = document.getElementById('guest-ranking-modal');
                if (guestModal) {
                    console.log('🚪 Cerrando modal de invitados después del login exitoso');
                    guestModal.remove();
                }
                
                // Recargar la página para aplicar los cambios
                console.log('🔄 Recargando página para aplicar login...');
                window.location.reload();
                
            } catch (error) {
                console.error('❌ Error procesando datos de usuario:', error);
            }
        };

        // Callback para cuando se reciben datos del usuario desde Firestore
        window.__onUserData = async function(userDataJson) {
            console.log('🚨🚨🚨 __onUserData LLAMADO con:', userDataJson);
            console.log('🚨🚨🚨 CALLBACK EJECUTÁNDOSE - LOGIN EXITOSO');
            try {
                const userData = JSON.parse(userDataJson);
                console.log('📥 Datos de usuario recibidos desde Firestore:', userData);
                
                // Verificar si es un usuario diferente al actual
                const currentUser = localStorage.getItem('user');
                console.log('🔍 Usuario actual en localStorage:', currentUser);
                console.log('🔍 Usuario nuevo recibido:', userData.uid);
                
                let isDifferentUser = false;
                let isGuestToLogin = false;
                
                if (currentUser) {
                    try {
                        const currentUserData = JSON.parse(currentUser);
                        console.log('🔍 Usuario actual parseado:', currentUserData.uid);
                        
                        if (currentUserData.uid !== userData.uid) {
                            isDifferentUser = true;
                            console.log('🔄 Usuario diferente detectado');
                            console.log('👤 Usuario anterior:', currentUserData.uid);
                            console.log('👤 Usuario nuevo:', userData.uid);
                        } else {
                            console.log('✅ Mismo usuario detectado');
                        }
                    } catch (error) {
                        console.error('❌ Error parseando usuario actual:', error);
                        isDifferentUser = true;
                    }
                } else {
                    console.log('🔍 No hay usuario actual en localStorage');
                    // No hay usuario actual - verificar si hay datos de invitado
                    const hasGuestData = checkForGuestData();
                    console.log('🔍 Datos de invitado encontrados:', hasGuestData);
                    
                    if (hasGuestData) {
                        isGuestToLogin = true;
                        console.log('🔄 Invitado detectado con datos, preparando fusión...');
                    } else {
                        isDifferentUser = true;
                        console.log('🔄 No hay usuario actual ni datos de invitado, inicializando...');
                    }
                }
                
                // Manejar diferentes escenarios
                if (isGuestToLogin) {
                    console.log('🎯 ESCENARIO: Invitado → Login');
                    await handleGuestToLogin(userData);
                } else if (isDifferentUser) {
                    console.log('🎯 ESCENARIO: Usuario → Usuario diferente');
                    await handleUserSwitch(userData);
                } else {
                    console.log('🎯 ESCENARIO: Mismo usuario, actualizando datos');
                    await handleSameUserUpdate(userData);
                }
                
                // Cargar todos los datos de Firebase para todos los modos
                console.log('🔄 Cargando datos de Firebase para todos los modos...');
                const modes = ['normal', 'beginner', 'extreme'];
                modes.forEach(mode => {
                    if (window.AndroidInterface && window.AndroidInterface.getUserProgress) {
                        window.AndroidInterface.getUserProgress(userData.uid, mode);
                    }
                });
                
                // Actualizar modo si está disponible en Firestore
                if (userData.selectedMode && userData.selectedMode !== currentMode) {
                    console.log('🔄 Actualizando modo desde Firestore:', userData.selectedMode);
                    currentMode = userData.selectedMode;
                    localStorage.setItem('memoflip_selected_mode', userData.selectedMode);
                    
                    // Recargar niveles del modo correcto
                    loadLevelsData().then(() => {
                        console.log('✅ Niveles recargados para modo desde Firestore');
                        updateUI();
                        generateCards();
                    }).catch((error) => {
                        console.error('❌ Error recargando niveles:', error);
                    });
                }
                
                // Actualizar configuraciones si están disponibles
                if (userData.settings) {
                    // Cargar todas las configuraciones desde Firebase
                    const currentSettings = getSettings();
                    
                    if (userData.settings.soundEnabled !== undefined) {
                        currentSettings.soundEnabled = userData.settings.soundEnabled;
                    }
                    if (userData.settings.musicEnabled !== undefined) {
                        currentSettings.musicEnabled = userData.settings.musicEnabled;
                    }
                    if (userData.settings.musicVolume !== undefined) {
                        currentSettings.musicVolume = userData.settings.musicVolume;
                    }
                    if (userData.settings.soundVolume !== undefined) {
                        currentSettings.soundVolume = userData.settings.soundVolume;
                    }
                    if (userData.settings.vibrationEnabled !== undefined) {
                        currentSettings.vibrationEnabled = userData.settings.vibrationEnabled;
                    }
                    
                    // Guardar configuraciones actualizadas en localStorage
                    saveSettings(currentSettings);
                    
                    updateSettingsUI();
                    console.log('⚙️ Configuraciones actualizadas desde Firestore:', currentSettings);
                }
                
                // Cerrar modal de invitados si está abierta
                const guestModal = document.getElementById('guest-ranking-modal');
                if (guestModal) {
                    console.log('🚪 Cerrando modal de invitados después del login exitoso');
                    guestModal.remove();
                }
                
                console.log('🚨🚨🚨 CALLBACK COMPLETADO - USUARIO LOGUEADO');
                
            } catch (error) {
                console.error('❌ Error procesando datos de usuario:', error);
            }
        };

        // Cargar nick del usuario
        window.loadUserNick = function() {
            try {
                console.log('🔍 Buscando datos de usuario...');
                
                // Debug: mostrar todo el localStorage
                console.log('🔍 Todo el localStorage:');
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    console.log(`  ${key}:`, localStorage.getItem(key));
                }
                
                // Buscar en localStorage
                const userData = localStorage.getItem('user');
                const memoflipUser = localStorage.getItem('memoflip_user');
                
                console.log('📱 localStorage.user:', userData);
                console.log('📱 localStorage.memoflip_user:', memoflipUser);
                
                // Priorizar memoflip_user sobre user
                if (memoflipUser) {
                    const user = JSON.parse(memoflipUser);
                    console.log('👤 Datos de memoflip_user parseados:', user);
                    const nick = user.nick || 'Invitado';
                    document.getElementById('userNick').textContent = nick;
                    console.log('👤 Nick cargado desde memoflip_user:', nick);
                } else if (userData) {
                    const user = JSON.parse(userData);
                    console.log('👤 Datos de user parseados:', user);
                    const nick = user.nick || 'Invitado';
                    document.getElementById('userNick').textContent = nick;
                    console.log('👤 Nick cargado desde user:', nick);
                } else {
                    document.getElementById('userNick').textContent = 'Invitado';
                    console.log('👤 Usando nick por defecto - no hay datos de usuario');
                }
                
                // Aplicar color del nick según el modo actual
                applyNickColor();
            } catch (error) {
                console.error('❌ Error cargando nick:', error);
                document.getElementById('userNick').textContent = 'Invitado';
            }
        };

        // ===== APLICAR COLOR DEL NICK SEGÚN MODO =====
        function applyNickColor() {
            console.log('🎨 Aplicando color del nick según el modo actual');
            
            const userNickElement = document.getElementById('userNick');
            if (!userNickElement) {
                console.log('❌ No se encontró elemento userNick');
                return;
            }
            
            // Obtener modo actual
            const currentMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
            console.log('🎯 Modo actual para color del nick:', currentMode);
            
            // Colores según el modo (iguales que en index.html)
            const modeColors = {
                'beginner': '#facc15',  // Amarillo dorado
                'normal': '#2fdde6',    // Azul cyan
                'extreme': '#ef4444'    // Rojo
            };
            
            const color = modeColors[currentMode] || modeColors['normal'];
            userNickElement.style.color = color;
            
            console.log('🎨 Color aplicado al nick:', color, 'para modo:', currentMode);
        }

     // ========================================
        // MOSTRAR RANKING (SIMPLIFICADO)
        // ========================================
        function showRankingSuccess() {
            document.getElementById('ranking-success').classList.remove('hidden');
        }

// ========================================
        // CARGAR RANKING DESDE FIREBASE
        // ========================================
        async function loadRanking() {
            // Mostrar estado de carga (función eliminada, usar directamente)
            console.log('📊 Cargando ranking...');
            
            try {
                // Obtener modo actual
                const currentMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
                const modeNames = {
                    'beginner': 'Relax',
                    'normal': 'Normal', 
                    'extreme': 'Extremo'
                };
                
                // Actualizar título del ranking según el modo
                const rankingTitle = document.getElementById('ranking-title');
                
                if (rankingTitle) rankingTitle.textContent = `Ranking Global - ${modeNames[currentMode]}`;
                
                // ========================================
                // DATOS DEL USUARIO ACTUAL
                // ========================================
                const user = JSON.parse(localStorage.getItem('user') || '{}');
                const progressKey = `memoflip_progress_${currentMode}`;
                const progress = JSON.parse(localStorage.getItem(progressKey) || '{}');
                // Sistema de monedas simplificado (solo por modo)
                
                const currentUser = {
                    uid: user.uid,
                    name: user.nick || user.displayName || 'Usuario',
                    level: progress.level || 1,
                    coins: progress.coins || 0
                };
                
                // ========================================
                // CARGAR RANKING REAL DESDE FIREBASE
                // ========================================
                const globalRanking = await loadRealRankingFromFirebase(currentMode, currentUser);
                
                console.log(`🏆 Cargando ranking real para modo: ${currentMode} (${modeNames[currentMode]})`);
                console.log('🏆 Usuario actual:', currentUser);
                console.log('🏆 Ranking real:', globalRanking);
                
                // Renderizar tabla
                renderRankingTable(globalRanking, currentUser);
                
                // Mostrar ranking
                showRankingSuccess();
                
            } catch (error) {
                console.error('Error cargando ranking:', error);
                // Mostrar solo el usuario actual en caso de error
                loadRealRankingFromFirebase(currentMode, currentUser);
            }
        }
        // ========================================
        // CARGAR RANKING REAL DESDE FIREBASE
        // ========================================
        function loadRealRankingFromFirebase(mode, currentUser) {
            return new Promise((resolve) => {
                // Configurar callback para recibir datos del ranking
                window.__onRankingLoaded = function(rankingData) {
                    console.log('🏆 Ranking recibido desde Android:', rankingData);
                    
                    if (rankingData && rankingData.length > 0) {
                        const players = rankingData.map((player, index) => ({
                            name: player.nick || player.displayName || 'Usuario',
                            level: player.level || 1,
                            coins: player.coins || 0,
                            score: (player.level || 1) * 100 + (player.coins || 0),
                            position: index + 1,
                            isCurrentUser: player.uid === currentUser.uid
                        }));
                        
                        console.log(`🏆 Cargados ${players.length} jugadores reales desde Firebase`);
                        resolve(players);
                    } else {
                        console.log('🏆 No hay datos de ranking, mostrando solo usuario actual');
                        resolve([{
                            name: currentUser.name,
                            level: currentUser.level,
                            coins: currentUser.coins,
                            score: currentUser.level * 100 + currentUser.coins,
                            position: 1,
                            isCurrentUser: true
                        }]);
                    }
                };
                
                // Solicitar ranking desde Android
                if (window.AndroidInterface && window.AndroidInterface.getRanking) {
                    console.log('🏆 Solicitando ranking desde AndroidInterface para modo:', mode);
                    console.log('🏆 Usuario actual para comparación:', currentUser);
                    window.AndroidInterface.getRanking(mode);
                    
                    // Timeout de 5 segundos para evitar espera infinita
                    setTimeout(() => {
                        console.log('🏆 Timeout: No se recibieron datos de ranking en 5 segundos');
                        resolve([{
                            name: currentUser.name,
                            level: currentUser.level,
                            coins: currentUser.coins,
                            score: currentUser.level * 100 + currentUser.coins,
                            position: 1,
                            isCurrentUser: true
                        }]);
                    }, 5000);
                } else {
                    console.log('🏆 AndroidInterface no disponible, mostrando solo usuario actual');
                    resolve([{
                        name: currentUser.name,
                        level: currentUser.level,
                        coins: currentUser.coins,
                        score: currentUser.level * 100 + currentUser.coins,
                        position: 1,
                        isCurrentUser: true
                    }]);
                }
            });
        }
        // Funciones adicionales están en game-ui.js
        
        function togglePause() {
            const isPaused = TimerSystem.togglePause();
            gameStarted = !isPaused;
            
            // Cambiar icono y título del botón
            const btn = document.getElementById('pause-play-btn');
            const pauseIcon = btn.querySelector('.pause-icon');
            const playIcon = btn.querySelector('.play-icon');
            
            if (isPaused) {
                // Mostrar play, ocultar pause
                pauseIcon.style.display = 'none';
                playIcon.style.display = 'block';
                btn.title = 'Reanudar';
            } else {
                // Mostrar pause, ocultar play
                pauseIcon.style.display = 'block';
                playIcon.style.display = 'none';
                btn.title = 'Pausa';
            }
            
            console.log('⏸️ Juego pausado:', isPaused);
        }
        // ===== ACTUALIZAR MODO EN CONFIGURACIÓN =====
        function updateModeInSettings() {
            const selectedMode = getSelectedMode();
            currentMode = selectedMode;
            
            // Actualizar pill
            const modeNames = {
                'beginner': { text: 'Relax', icon: 'relax.png' },
                'normal': { text: 'Normal', icon: 'normal.png' },
                'extreme': { text: 'Extremo', icon: 'extremo.png' }
            };
            
            const modeData = modeNames[selectedMode];
            document.getElementById('modeIcon').src = modeData.icon;
            document.getElementById('modeText').textContent = modeData.text;
            
            // Aplicar clase CSS del modo al pill
            const pill = document.getElementById('modePill');
            pill.classList.remove('beginner', 'normal', 'extreme');
            pill.classList.add(selectedMode);
            
            // Actualizar botones en configuración
            document.querySelectorAll('.mode-button').forEach(btn => {
                btn.classList.remove('active');
                btn.querySelector('.mode-indicator').classList.remove('active');
            });
            
            const activeButton = document.getElementById(`mode-${selectedMode}`);
            if (activeButton) {
                activeButton.classList.add('active');
                activeButton.querySelector('.mode-indicator').classList.add('active');
            }
        }

        // Función para guardar datos en Firestore
        window.saveToFirestore = function() {
            try {
                const memoflipUser = localStorage.getItem('memoflip_user');
                if (memoflipUser && window.AndroidInterface && window.AndroidInterface.saveUserData) {
                    console.log('🔥 Guardando en Firestore desde game.html...');
                    window.AndroidInterface.saveUserData(memoflipUser);
                    console.log('✅ Datos enviados a Firestore');
                } else {
                    console.log('❌ No se puede guardar en Firestore:', {
                        memoflipUser: !!memoflipUser,
                        AndroidInterface: !!window.AndroidInterface,
                        saveUserData: !!(window.AndroidInterface && window.AndroidInterface.saveUserData)
                    });
                }
            } catch (error) {
                console.error('❌ Error guardando en Firestore:', error);
            }
        };

        // ===== SISTEMA COMPLETO DE GUARDADO POR MODO =====
        
        // Cache para evitar consultas repetidas a Firebase
        const firebaseProgressCache = {};
        const lastFirebaseCheck = {};
        
        // Función para obtener progreso por modo
        function getModeProgress(mode) {
            // USAR SOLO localStorage - Firebase se sincroniza en background
            const key = `memoflip_progress_${mode}`;
            const saved = localStorage.getItem(key);
            if (saved) {
                console.log(`📋 Cargando progreso desde localStorage para modo ${mode}`);
                return JSON.parse(saved);
            }
            
            // Valores por defecto para nuevo usuario
            return {
                level: 1,
                coins: 0,
                bestTime: null,
                bestFlips: null,
                totalGames: 0,
                totalWins: 0
            };
        }
        
        // Función para guardar progreso por modo
        function saveModeProgress(mode, progress) {
            const key = `memoflip_progress_${mode}`;
            localStorage.setItem(key, JSON.stringify(progress));
            console.log(`💾 Progreso guardado para modo ${mode}:`, progress);
            
            // Marcar como sucio para sincronización
            SyncSystem.markDirty();
        }
        
        // Función para obtener configuraciones
        function getSettings() {
            const saved = localStorage.getItem('memoflip_settings');
            if (saved) {
                return JSON.parse(saved);
            }
            return {
                soundEnabled: true,
                vibrationEnabled: true,
                musicEnabled: true,
                musicVolume: 0.7,
                soundVolume: 0.8
            };
        }
        
        // Función para guardar configuraciones
        function saveSettings(settings) {
            localStorage.setItem('memoflip_settings', JSON.stringify(settings));
            console.log('⚙️ Configuraciones guardadas en localStorage:', settings);
            
            // También guardar en Firestore si hay usuario
            const user = localStorage.getItem('user');
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    if (userData && userData.uid) {
                        // Guardar configuraciones en Firestore
                        const settingsData = {
                            uid: userData.uid,
                            settings: settings,
                            lastUpdated: new Date().toISOString()
                        };
                        
                        console.log('🔥 Enviando a Firebase:', {
                            uid: userData.uid,
                            settings: settings
                        });
                        console.log('🔥 Settings completo:', JSON.stringify(settings, null, 2));
                        
                        // Usar AndroidInterface para guardar en Firestore
                        if (window.AndroidInterface && window.AndroidInterface.saveGameProgress) {
                            // Enviar solo las configuraciones, no como tipo 'settings'
                            window.AndroidInterface.saveGameProgress(JSON.stringify({
                                uid: userData.uid,
                                nick: userData.nick || userData.displayName,
                                email: userData.email,
                                displayName: userData.displayName,
                                settings: settings,
                                lastUpdated: new Date().toISOString()
                            }));
                            console.log('⚙️ Configuraciones guardadas en Firestore:', settings);
                        }
                    }
                } catch (error) {
                    console.error('❌ Error guardando configuraciones en Firestore:', error);
                }
            }
        }
        
        // ===== SISTEMA DE DEBOUNCING PARA GUARDADO =====
        let saveGameProgressTimeout = null;
        let saveGameProgressPending = false;
        
        // ===== SISTEMA DE CONEXIÓN OFFLINE =====
        let isOnline = navigator.onLine;
        let pendingSyncData = null;
        
        // Función para actualizar el indicador de conexión
        function updateConnectionIndicator() {
            const indicator = document.getElementById('connection-status');
            if (indicator) {
                if (isOnline) {
                    indicator.textContent = '🌐';
                    indicator.className = 'connection-indicator online';
                    indicator.title = 'Conectado - Sincronizando con Firebase';
                } else {
                    indicator.textContent = '📴';
                    indicator.className = 'connection-indicator offline';
                    indicator.title = 'Sin conexión - Guardando localmente';
                }
            }
        }
        
        // Escuchar cambios de conexión
        window.addEventListener('online', function() {
            isOnline = true;
            console.log('🌐 Conexión restaurada - sincronizando datos pendientes...');
            updateConnectionIndicator();
            if (pendingSyncData) {
                syncPendingData();
            }
        });
        
        window.addEventListener('offline', function() {
            isOnline = false;
            console.log('📴 Sin conexión - guardando localmente');
            updateConnectionIndicator();
        });
        
        // Función para sincronizar datos pendientes
        function syncPendingData() {
            if (pendingSyncData && window.AndroidInterface && window.AndroidInterface.saveGameProgress) {
                try {
                    window.AndroidInterface.saveGameProgress(JSON.stringify(pendingSyncData));
                    console.log('✅ Datos pendientes sincronizados con Firebase');
                    pendingSyncData = null;
                } catch (error) {
                    console.warn('⚠️ Error sincronizando datos pendientes:', error);
                }
            }
        }
        
        // Función para guardar progreso del juego (COMPLETA) con debouncing
        window.saveGameProgress = function() {
            // Cancelar guardado anterior si está pendiente
            if (saveGameProgressTimeout) {
                clearTimeout(saveGameProgressTimeout);
            }
            
            // Si ya hay un guardado en progreso, marcar como pendiente
            if (saveGameProgressPending) {
                console.log('⏳ Guardado ya en progreso, marcando como pendiente...');
                saveGameProgressTimeout = setTimeout(() => {
                    window.saveGameProgress();
                }, 1000);
                return;
            }
            
            // Marcar como en progreso
            saveGameProgressPending = true;
            
            // Ejecutar guardado después de 500ms (debouncing)
            saveGameProgressTimeout = setTimeout(() => {
                executeSaveGameProgress();
                saveGameProgressPending = false;
            }, 500);
        };
        
        // Función real de guardado (sin debouncing)
        function executeSaveGameProgress() {
            try {
                const memoflipUser = localStorage.getItem('user');
                console.log('🔍 Verificando AndroidInterface.saveGameProgress:', !!(window.AndroidInterface && window.AndroidInterface.saveGameProgress));
                if (memoflipUser && window.AndroidInterface && window.AndroidInterface.saveGameProgress) {
                    const user = JSON.parse(memoflipUser);
                    const currentMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
                    const currentLevelElement = document.getElementById('currentLevel');
                    const currentLevel = currentLevelElement ? parseInt(currentLevelElement.textContent) || 1 : 1;
                    
                    // Obtener progreso actual del modo
                    const modeProgress = getModeProgress(currentMode);
                    
                    // Actualizar progreso del modo actual
                    const updatedProgress = {
                        ...modeProgress,
                        level: Math.max(modeProgress.level, currentLevel),
                        coins: CoinSystem.totalCoins, // Monedas del modo actual
                        lastPlayed: new Date().toISOString()
                    };
                    
                    // Guardar progreso local
                    saveModeProgress(currentMode, updatedProgress);
                    
                    // Obtener configuraciones (solo las necesarias)
                    const settings = getSettings();
                    const simplifiedSettings = {
                        soundEnabled: settings.soundEnabled,
                        musicEnabled: settings.musicEnabled,
                        musicVolume: settings.musicVolume,
                        soundVolume: settings.soundVolume,
                        vibrationEnabled: settings.vibrationEnabled
                    };
                    
                    // Obtener modo seleccionado
                    const selectedMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
                    
                    // Obtener datos de vidas por modo
                    // console.log('🔍 Verificando LifeSystem:', !!window.LifeSystem); // Log reducido
                    // console.log('🔍 LifeSystem.getCurrentLives:', !!(window.LifeSystem && window.LifeSystem.getCurrentLives)); // Log reducido
                    
                    const livesData = {
                        beginner: {
                            currentLives: window.LifeSystem ? window.LifeSystem.getCurrentLives('beginner') : 0,
                            lastLifeRegen: window.LifeSystem ? new Date(window.LifeSystem.getLastRegenTime('beginner')).toISOString() : new Date().toISOString()
                        },
                        normal: {
                            currentLives: window.LifeSystem ? window.LifeSystem.getCurrentLives('normal') : 0,
                            lastLifeRegen: window.LifeSystem ? new Date(window.LifeSystem.getLastRegenTime('normal')).toISOString() : new Date().toISOString()
                        },
                        extreme: {
                            currentLives: window.LifeSystem ? window.LifeSystem.getCurrentLives('extreme') : 0,
                            lastLifeRegen: window.LifeSystem ? new Date(window.LifeSystem.getLastRegenTime('extreme')).toISOString() : new Date().toISOString()
                        }
                    };
                    
                    console.log('💚 Datos de vidas preparados:', livesData);
                    
                    // Preparar progreso simplificado (sin campos innecesarios)
                    const simplifiedProgress = {
                        beginner: {
                            level: getModeProgress('beginner').level,
                            coins: getModeProgress('beginner').coins,
                            totalGames: getModeProgress('beginner').totalGames,
                            totalWins: getModeProgress('beginner').totalWins,
                            lastPlayed: getModeProgress('beginner').lastPlayed
                        },
                        normal: {
                            level: getModeProgress('normal').level,
                            coins: getModeProgress('normal').coins,
                            totalGames: getModeProgress('normal').totalGames,
                            totalWins: getModeProgress('normal').totalWins,
                            lastPlayed: getModeProgress('normal').lastPlayed
                        },
                        extreme: {
                            level: getModeProgress('extreme').level,
                            coins: getModeProgress('extreme').coins,
                            totalGames: getModeProgress('extreme').totalGames,
                            totalWins: getModeProgress('extreme').totalWins,
                            lastPlayed: getModeProgress('extreme').lastPlayed
                        }
                    };
                    
                    // Preparar datos para Firestore (SIN DUPLICACIÓN)
                    const progressData = {
                        uid: user.uid,
                        nick: user.nick,
                        email: user.email,
                        displayName: user.displayName,
                        livesData: livesData,
                        selectedMode: selectedMode,
                        progress: simplifiedProgress,
                        settings: simplifiedSettings,
                        lastUpdated: new Date().toISOString()
                    };
                    
                    console.log('🔥 ===== ENVIANDO A FIRESTORE =====');
                    console.log('🔥 Usuario:', user.uid);
                    console.log('🔥 Modo actual:', currentMode);
                    console.log('🔥 Nivel actual:', currentLevel);
                    console.log('🔥 Monedas totales:', CoinSystem.totalCoins);
                    console.log('🔥 Progreso del modo:', updatedProgress);
                    console.log('🔥 Datos completos:', progressData);
                    console.log('🔥 ===== FIN ENVÍO A FIRESTORE =====');
                    
                    // Intentar guardar en Firebase
                    if (isOnline) {
                        try {
                    window.AndroidInterface.saveGameProgress(JSON.stringify(progressData));
                    console.log('✅ Progreso completo enviado a Firestore');
                        } catch (error) {
                            console.warn('⚠️ Error enviando a Firebase:', error);
                            // Guardar para sincronización posterior
                            pendingSyncData = progressData;
                            console.log('💾 Datos guardados para sincronización posterior');
                        }
                    } else {
                        // Sin conexión - guardar para sincronización posterior
                        pendingSyncData = progressData;
                        console.log('📴 Sin conexión - datos guardados para sincronización posterior');
                    }
                } else {
                    console.log('❌ No se puede guardar progreso:', {
                        user: !!memoflipUser,
                        AndroidInterface: !!window.AndroidInterface,
                        saveGameProgress: !!(window.AndroidInterface && window.AndroidInterface.saveGameProgress)
                    });
                }
            } catch (error) {
                console.error('❌ Error guardando progreso:', error);
            }
        };
        
        // Función para cargar configuraciones al iniciar
        function loadSettings() {
            const settings = getSettings();
            
            // Aplicar configuraciones a las variables globales
            soundEnabled = settings.soundEnabled;
            vibrationEnabled = settings.vibrationEnabled;
            
            // Aplicar volumen de música si está disponible
            if (backgroundMusic.audio && settings.musicVolume !== undefined) {
                backgroundMusic.audio.volume = settings.musicVolume;
            }
            
            // Actualizar UI de configuraciones
            updateSettingsUI();
            
            console.log('⚙️ Configuraciones cargadas:', settings);
        }
        // Función para actualizar la UI de configuraciones
        function updateSettingsUI() {
            // Solo actualizar si los elementos existen (modal abierto)
            const soundIcon = document.getElementById('sound-icon');
            const soundName = document.getElementById('sound-name');
            const soundToggle = document.getElementById('sound-toggle');
            
            if (soundIcon && soundName && soundToggle) {
                if (soundEnabled) {
                    soundIcon.textContent = '🔔';
                    soundName.textContent = 'Efectos de sonido';
                    soundToggle.textContent = 'Desactivar';
                    soundToggle.classList.add('active');
                } else {
                    soundIcon.textContent = '🔕';
                    soundName.textContent = 'Efectos desactivados';
                    soundToggle.textContent = 'Activar';
                    soundToggle.classList.remove('active');
                }
            }
            
            // Actualizar música si los elementos existen
            const musicIcon = document.getElementById('music-icon');
            const musicName = document.getElementById('music-name');
            const musicToggle = document.getElementById('music-toggle');
            
            if (musicIcon && musicName && musicToggle) {
                const settings = getSettings();
                if (settings.musicEnabled) {
                    musicIcon.textContent = '🎵';
                    musicName.textContent = 'Música de fondo';
                    musicToggle.textContent = 'Desactivar';
                    musicToggle.classList.add('active');
                } else {
                    musicIcon.textContent = '🔇';
                    musicName.textContent = 'Música desactivada';
                    musicToggle.textContent = 'Activar';
                    musicToggle.classList.remove('active');
                }
            }
            
            // Actualizar vibración si los elementos existen
            const vibrationIcon = document.getElementById('vibration-icon');
            const vibrationName = document.getElementById('vibration-name');
            const vibrationToggle = document.getElementById('vibration-toggle');
            
            if (vibrationIcon && vibrationName && vibrationToggle) {
                if (vibrationEnabled) {
                    vibrationIcon.textContent = '📱';
                    vibrationName.textContent = 'Vibración Activada';
                    vibrationToggle.textContent = 'Desactivar';
                    vibrationToggle.classList.add('active');
                } else {
                    vibrationIcon.textContent = '📵';
                    vibrationName.textContent = 'Vibración Desactivada';
                    vibrationToggle.textContent = 'Activar';
                    vibrationToggle.classList.remove('active');
                }
            }
        }
        
        // Debounce para evitar consultas excesivas a Firebase
        let firebaseDebounceTimer = null;
        const FIREBASE_DEBOUNCE_DELAY = 2000; // 2 segundos

        // Callback para cuando se recibe progreso desde Firebase
        window.__onUserProgressLoaded = function(mode, progressData) {
            console.log('📥 ===== DATOS RECIBIDOS DE FIREBASE =====');
            console.log('📥 Modo:', mode);
            console.log('📥 Datos de Firebase:', progressData);
            
            // Marcar que se recibieron datos de este modo
            LoadingSystem.receivedFirebaseData(mode);
            
            // Guardar en cache
            const user = localStorage.getItem('user');
            if (user) {
                const userData = JSON.parse(user);
                const cacheKey = `${userData.uid}_${mode}`;
                firebaseProgressCache[cacheKey] = progressData;
                console.log('💾 Datos guardados en cache de Firebase');
            }
            
                // Comparar con localStorage
                const localProgress = getModeProgress(mode);
                console.log('📥 Datos locales:', localProgress);
                if (progressData) {
                    console.log('📥 Firebase vs Local - Nivel:', progressData.level, 'vs', localProgress.level);
                    console.log('📥 Firebase vs Local - Monedas:', progressData.coins, 'vs', localProgress.coins);
                }
                console.log('📥 ===== FIN COMPARACIÓN FIREBASE =====');
            
            if (progressData) {
                const key = `memoflip_progress_${mode}`;
                const localData = localStorage.getItem(key);
                
                // Comparar datos locales vs Firebase
                if (localData) {
                    try {
                        const localProgress = JSON.parse(localData);
                        const firebaseProgress = progressData;
                        
                        // Solo actualizar si Firebase tiene datos mejores (nivel más alto o más monedas)
                        const shouldUpdate = (
                            firebaseProgress.level > localProgress.level ||
                            (firebaseProgress.level === localProgress.level && firebaseProgress.coins > localProgress.coins) ||
                            (firebaseProgress.level === localProgress.level && firebaseProgress.coins === localProgress.coins && 
                             firebaseProgress.totalWins > localProgress.totalWins)
                        );
                        
                        if (shouldUpdate) {
                            localStorage.setItem(key, JSON.stringify(progressData));
                            console.log(`💾 Progreso de Firebase guardado en localStorage para modo ${mode} (datos mejores)`);
                            
                            // Recargar el juego si es el modo actual
                            const currentMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
                            if (mode === currentMode) {
                                console.log(`🔄 Recargando juego con datos actualizados de Firebase...`);
                                setTimeout(() => {
                                    loadGameProgress();
                                    CoinSystem.init();
                                    initGame();
                                }, 500);
                            }
                        } else {
                            console.log(`📊 Datos locales son mejores que Firebase para modo ${mode}, manteniendo locales`);
                        }
                    } catch (error) {
                        console.error('❌ Error comparando datos:', error);
                        // En caso de error, usar Firebase
                        localStorage.setItem(key, JSON.stringify(progressData));
                        console.log(`💾 Progreso de Firebase guardado en localStorage para modo ${mode} (error en comparación)`);
                    }
                } else {
                    // No hay datos locales, usar Firebase directamente
                    localStorage.setItem(key, JSON.stringify(progressData));
                    console.log(`💾 Progreso de Firebase guardado en localStorage para modo ${mode} (sin datos locales)`);
                    
                    // Recargar el juego si es el modo actual
                    const currentMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
                    if (mode === currentMode) {
                        console.log(`🔄 Recargando juego con datos de Firebase (sin datos locales)...`);
                        setTimeout(() => {
                            loadGameProgress();
                            CoinSystem.init();
                            initGame();
                        }, 500);
                    }
                }
            } else {
                console.log(`📊 No hay datos de Firebase para modo ${mode}`);
            }
            
            // Actualizar UI si es el modo actual
            const currentMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
            if (mode === currentMode) {
                updateUI();
            }
        };

        // Función para cargar progreso al iniciar
        function loadGameProgress() {
            // VERIFICACIÓN CRÍTICA: Detectar datos corruptos de usuario anterior
            const user = localStorage.getItem('user');
            const lastUserUid = localStorage.getItem('lastUserUid');
            
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    
                    // Verificar si hay datos de progreso que no coinciden con el usuario actual
                    const currentMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
                    const progressKey = `memoflip_progress_${currentMode}`;
                    const progress = localStorage.getItem(progressKey);
                    
                    if (progress) {
                        const progressData = JSON.parse(progress);
                        
                        // Solo limpiar si hay datos significativos Y el usuario es realmente diferente
                        const hasSignificantProgress = progressData.level > 1 || progressData.coins > 0 || progressData.totalWins > 0;
                        const isDifferentUser = lastUserUid && lastUserUid !== userData.uid;
                        
                        if (hasSignificantProgress && isDifferentUser) {
                            console.log('🚨 DATOS CORRUPTOS DETECTADOS: Usuario diferente con progreso de usuario anterior');
                            console.log('👤 Usuario actual:', userData.uid);
                            console.log('👤 lastUserUid:', lastUserUid);
                            console.log('📊 Progreso encontrado:', progressData);
                            console.log('🧹 Limpiando localStorage por datos corruptos...');
                            
                            clearAllLocalStorage();
                            localStorage.setItem('lastUserUid', userData.uid);
                            
                            console.log('✅ localStorage limpiado por datos corruptos');
                        } else {
                            // Actualizar lastUserUid si no existe o es el mismo usuario
                            localStorage.setItem('lastUserUid', userData.uid);
                        }
                    }
                } catch (error) {
                    console.error('❌ Error verificando consistencia:', error);
                }
            }
            
            const currentMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
            const modeProgress = getModeProgress(currentMode);
            
            // Cargar nivel del modo
            currentLevel = modeProgress.level;
            document.getElementById('currentLevel').textContent = currentLevel;
            console.log('🎯 Nivel cargado desde progreso:', currentLevel);
            console.log('🎯 Progreso del modo:', modeProgress);
            
            // Cargar monedas del modo
            const coinElement = document.getElementById('coin-counter');
            if (coinElement) {
                coinElement.textContent = modeProgress.coins;
            }
            
            // Cargar configuraciones
            const settings = getSettings();
            if (window.CoinSystem) {
                window.CoinSystem.setCoins(modeProgress.coins);
            }
            
            // Cargar vidas del modo actual
            LifeSystem.updateDisplay();
            
            console.log(`📂 Progreso cargado para modo ${currentMode}:`, modeProgress);
            console.log('⚙️ Configuraciones cargadas:', settings);
        }
        
        // Callback para manejar respuesta de guardado de progreso
        window.__onSaveGameProgress = function(success, error) {
            if (success) {
                console.log('✅ Progreso del juego guardado exitosamente en Firestore');
            } else {
                console.error('❌ Error guardando progreso del juego:', error);
            }
        };
        
        // ===== FUNCIONES DE VALIDACIÓN Y DIAGNÓSTICO =====
        
        // Función para validar que todos los datos se guarden correctamente
        function validateDataIntegrity() {
            console.log('🔍 VALIDACIÓN DE INTEGRIDAD DE DATOS');
            
            const currentMode = localStorage.getItem('memoflip_selected_mode') || 'normal';
            const user = localStorage.getItem('user');
            
            // Validar datos del usuario
            if (user) {
                try {
                    const userData = JSON.parse(user);
                    console.log('✅ Usuario válido:', userData.uid);
                } catch (error) {
                    console.error('❌ Error en datos de usuario:', error);
                }
            } else {
                console.log('⚠️ No hay usuario logueado');
            }
            
            // Validar progreso del modo actual
            const progressKey = `memoflip_progress_${currentMode}`;
            const progress = localStorage.getItem(progressKey);
            if (progress) {
                try {
                    const progressData = JSON.parse(progress);
                    console.log(`✅ Progreso del modo ${currentMode}:`, {
                        level: progressData.level,
                        coins: progressData.coins,
                        totalGames: progressData.totalGames,
                        totalWins: progressData.totalWins
                    });
                } catch (error) {
                    console.error(`❌ Error en progreso del modo ${currentMode}:`, error);
                }
            } else {
                console.log(`⚠️ No hay progreso para el modo ${currentMode}`);
            }
            
            // Sistema de monedas simplificado (solo por modo)
            console.log('✅ Sistema de monedas: solo por modo');
            
            // Validar vidas del modo actual
            const livesKey = `memoflip_lives_${currentMode}`;
            const lives = localStorage.getItem(livesKey);
            if (lives) {
                try {
                    const livesData = JSON.parse(lives);
                    console.log(`✅ Vidas del modo ${currentMode}:`, {
                        lives: livesData.lives,
                        lastLifeLost: livesData.lastLifeLost
                    });
                } catch (error) {
                    console.error(`❌ Error en vidas del modo ${currentMode}:`, error);
                }
            } else {
                console.log(`⚠️ No hay datos de vidas para el modo ${currentMode}`);
            }
            
            // Validar configuraciones
            const settings = localStorage.getItem('memoflip_settings');
            if (settings) {
                try {
                    const settingsData = JSON.parse(settings);
                    console.log('✅ Configuraciones:', settingsData);
                } catch (error) {
                    console.error('❌ Error en configuraciones:', error);
                }
            } else {
                console.log('⚠️ No hay configuraciones');
            }
            
            console.log('🔍 VALIDACIÓN COMPLETADA');
        }
        
        // Función para diagnosticar problemas de sincronización
        function diagnoseSyncIssues() {
            console.log('🔍 DIAGNÓSTICO SIMPLIFICADO:');
            console.log('✅ Sistema de monedas: solo por modo (sin inconsistencias)');
        }
        
        // ===== FUNCIONES DE GESTIÓN DE DATOS =====
        
        // Verificar si hay datos de invitado en localStorage
        function checkForGuestData() {
            const modes = ['beginner', 'normal', 'extreme'];
            let hasData = false;
            
            for (const mode of modes) {
                const progressKey = `memoflip_progress_${mode}`;
                const progress = localStorage.getItem(progressKey);
                if (progress) {
                    try {
                        const data = JSON.parse(progress);
                        if (data.level > 1 || data.coins > 0 || data.totalWins > 0) {
                            hasData = true;
                            console.log(`📊 Datos de invitado encontrados en modo ${mode}:`, data);
                        }
                    } catch (error) {
                        console.error(`❌ Error parseando datos de ${mode}:`, error);
                    }
                }
            }
            
            // Sistema de monedas simplificado (solo por modo)
            
            return hasData;
        }
        
        // Recopilar datos de invitado
        function collectGuestData() {
            const modes = ['beginner', 'normal', 'extreme'];
            const guestData = {};
            
            for (const mode of modes) {
                const progressKey = `memoflip_progress_${mode}`;
                const progress = localStorage.getItem(progressKey);
                if (progress) {
                    try {
                        const data = JSON.parse(progress);
                        if (data.level > 1 || data.coins > 0 || data.totalWins > 0) {
                            guestData[mode] = data;
                        }
                    } catch (error) {
                        console.error(`❌ Error parseando datos de ${mode}:`, error);
                    }
                }
            }
            
            // Sistema de monedas simplificado (solo por modo)
            
            return guestData;
        }

        // Obtener datos de Firebase del usuario
        async function getUserDataFromFirebase(uid) {
            return new Promise((resolve) => {
                if (window.AndroidInterface && window.AndroidInterface.getUserProgress) {
                    // Solicitar datos de todos los modos
                    const modes = ['beginner', 'normal', 'extreme'];
                    let completedModes = 0;
                    const firebaseData = {};
                    
                    modes.forEach(mode => {
                        window.AndroidInterface.getUserProgress(uid, mode);
                        
                        // Configurar callback temporal para este modo
                        const originalCallback = window.__onUserProgressLoaded;
                        window.__onUserProgressLoaded = function(mode, progressData) {
                            if (progressData) {
                                firebaseData[mode] = progressData;
                            }
                            completedModes++;
                            
                            if (completedModes === modes.length) {
                                window.__onUserProgressLoaded = originalCallback;
                                resolve(firebaseData);
                            }
                        };
                    });
                } else {
                    resolve({});
                }
            });
        }
        
        // Fusionar datos de invitado y usuario
        function mergeGuestAndUserData(guestData, firebaseData) {
            const mergedData = {};
            const modes = ['beginner', 'normal', 'extreme'];
            
            for (const mode of modes) {
                const guestModeData = guestData[mode] || {level: 1, coins: 0, totalGames: 0, totalWins: 0};
                const firebaseModeData = firebaseData[mode] || {level: 1, coins: 0, totalGames: 0, totalWins: 0};
                
                // Usar el mejor de ambos (nivel más alto, más monedas, más victorias)
                mergedData[mode] = {
                    level: Math.max(guestModeData.level, firebaseModeData.level),
                    coins: Math.max(guestModeData.coins, firebaseModeData.coins),
                    totalGames: Math.max(guestModeData.totalGames, firebaseModeData.totalGames),
                    totalWins: Math.max(guestModeData.totalWins, firebaseModeData.totalWins),
                    lastPlayed: new Date().toISOString()
                };
            }
            
            // Sistema de monedas simplificado (solo por modo)
            
            return mergedData;
        }
        
        // Guardar datos fusionados en localStorage
        function saveMergedData(mergedData) {
            const modes = ['beginner', 'normal', 'extreme'];
            
            for (const mode of modes) {
                if (mergedData[mode]) {
                    const key = `memoflip_progress_${mode}`;
                    localStorage.setItem(key, JSON.stringify(mergedData[mode]));
                    console.log(`💾 Datos fusionados guardados para modo ${mode}:`, mergedData[mode]);
                }
            }
            
            // Sistema de monedas simplificado (solo por modo)
        }
        
        // Guardar datos fusionados en Firebase
        async function saveMergedDataToFirebase(uid, mergedData) {
            return new Promise((resolve) => {
                if (window.AndroidInterface && window.AndroidInterface.saveGameProgress) {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    const progressData = {
                        uid: uid,
                        nick: user.nick || 'Usuario',
                        email: user.email || '',
                        displayName: user.displayName || 'Usuario',
                        livesData: {
                            beginner: {lives: 3, lastLifeLost: new Date().toISOString()},
                            normal: {lives: 3, lastLifeLost: new Date().toISOString()},
                            extreme: {lives: 3, lastLifeLost: new Date().toISOString()}
                        },
                        memoflip_progress_beginner: mergedData.beginner || {level: 1, coins: 0, totalGames: 0, totalWins: 0, lastPlayed: new Date().toISOString()},
                        memoflip_progress_normal: mergedData.normal || {level: 1, coins: 0, totalGames: 0, totalWins: 0, lastPlayed: new Date().toISOString()},
                        memoflip_progress_extreme: mergedData.extreme || {level: 1, coins: 0, totalGames: 0, totalWins: 0, lastPlayed: new Date().toISOString()},
                        lastUpdated: new Date().toISOString()
                    };
                    
                    window.AndroidInterface.saveGameProgress(JSON.stringify(progressData));
                    console.log('💾 Datos fusionados enviados a Firebase');
                    resolve();
                } else {
                    resolve();
                }
            });
        }
        
        // Manejar flujo: Invitado → Login
        async function handleGuestToLogin(userData) {
            console.log('🎯 MANEJANDO: Invitado → Login');
            
            // Recopilar datos de invitado
            const guestData = collectGuestData();
            console.log('📊 Datos de invitado recopilados:', guestData);
            
            // Obtener datos de Firebase del usuario
            const firebaseData = await getUserDataFromFirebase(userData.uid);
            console.log('📊 Datos de Firebase del usuario:', firebaseData);
            
            // Fusionar datos (invitado + Firebase)
            const mergedData = mergeGuestAndUserData(guestData, firebaseData);
            console.log('📊 Datos fusionados:', mergedData);
            
            // Guardar datos fusionados en localStorage
            saveMergedData(mergedData);
            
            // Guardar datos fusionados en Firebase
            await saveMergedDataToFirebase(userData.uid, mergedData);
            
            console.log('✅ Fusión invitado → usuario completada');
        }
        
        // Limpiar todo el localStorage
        function clearAllLocalStorage() {
            console.log('🧹 Limpiando localStorage completamente...');
            
            // Limpiar progreso de todos los modos
            localStorage.removeItem('memoflip_progress_beginner');
            localStorage.removeItem('memoflip_progress_normal');
            localStorage.removeItem('memoflip_progress_extreme');
            
            // Limpiar vidas
            localStorage.removeItem('memoflip_lives_beginner');
            localStorage.removeItem('memoflip_lives_normal');
            localStorage.removeItem('memoflip_lives_extreme');
            
            // Limpiar usuario anterior
            localStorage.removeItem('user');
            localStorage.removeItem('memoflip_user');
            localStorage.removeItem('lastUserUid');
            
            // Limpiar configuraciones
            localStorage.removeItem('memoflip_settings');
            localStorage.removeItem('memoflip_selected_mode');
            
            console.log('✅ localStorage limpiado completamente');
        }
        
        // Guardar datos del usuario en localStorage
        function saveUserDataToLocalStorage(firebaseData) {
            const modes = ['beginner', 'normal', 'extreme'];
            
            for (const mode of modes) {
                if (firebaseData[mode]) {
                    const key = `memoflip_progress_${mode}`;
                    localStorage.setItem(key, JSON.stringify(firebaseData[mode]));
                    console.log(`💾 Datos del usuario guardados para modo ${mode}:`, firebaseData[mode]);
                }
            }
            
            // Guardar monedas globales (usar la mayor de todos los modos)
            // Sistema de monedas simplificado (solo por modo)
        }

        // Inicializar datos para nuevo usuario
        function initializeNewUserData() {
            console.log('🆕 Inicializando datos para nuevo usuario...');
            
            const modes = ['beginner', 'normal', 'extreme'];
            const defaultProgress = {
                level: 1,
                coins: 0,
                bestTime: null,
                bestFlips: null,
                totalGames: 0,
                totalWins: 0,
                lastPlayed: new Date().toISOString()
            };
            
            for (const mode of modes) {
                const key = `memoflip_progress_${mode}`;
                localStorage.setItem(key, JSON.stringify(defaultProgress));
            }
            
            // Sistema de monedas simplificado (solo por modo)
            
            // Inicializar vidas
            const defaultLives = {
                lives: 3,
                lastLifeLost: new Date().toISOString()
            };
            
            for (const mode of modes) {
                const key = `memoflip_lives_${mode}`;
                localStorage.setItem(key, JSON.stringify(defaultLives));
            }
            
            console.log('✅ Datos inicializados para nuevo usuario');
        }

        // Manejar flujo: Usuario → Usuario diferente
        async function handleUserSwitch(userData) {
            console.log('🎯 MANEJANDO: Usuario → Usuario diferente');
            
            // Limpiar localStorage completamente
            clearAllLocalStorage();
            
            // Guardar el nuevo usuario
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('lastUserUid', userData.uid);
            
            // Solicitar datos de Firebase directamente
            console.log('🔄 Solicitando datos de Firebase para nuevo usuario...');
            const modes = ['normal', 'beginner', 'extreme'];
            modes.forEach(mode => {
                if (window.AndroidInterface && window.AndroidInterface.getUserProgress) {
                    console.log(`📡 Solicitando datos de Firebase para modo ${mode}...`);
                    window.AndroidInterface.getUserProgress(userData.uid, mode);
                }
            });
            
            // Inicializar datos por defecto mientras se cargan de Firebase
            initializeNewUserData();
            
            // Recargar el juego inmediatamente
            setTimeout(() => {
                console.log('🔄 Recargando juego con datos del nuevo usuario...');
                loadGameProgress();
                CoinSystem.init();
                initGame();
            }, 100);
        }

        // Recopilar datos actuales del usuario
        function collectCurrentUserData() {
            const modes = ['beginner', 'normal', 'extreme'];
            const localData = {};
            
            for (const mode of modes) {
                const progressKey = `memoflip_progress_${mode}`;
                const progress = localStorage.getItem(progressKey);
                if (progress) {
                    try {
                        localData[mode] = JSON.parse(progress);
                    } catch (error) {
                        console.error(`❌ Error parseando datos locales de ${mode}:`, error);
                    }
                }
            }
            
            // Sistema de monedas simplificado (solo por modo)
            
            return localData;
        }

        // Resolver conflictos entre datos locales y Firebase
        function resolveDataConflicts(localData, firebaseData) {
            const modes = ['beginner', 'normal', 'extreme'];
            const resolvedData = {};
            
            for (const mode of modes) {
                const localModeData = localData[mode] || {level: 1, coins: 0, totalGames: 0, totalWins: 0};
                const firebaseModeData = firebaseData[mode] || {level: 1, coins: 0, totalGames: 0, totalWins: 0};
                
                // Usar el mejor de ambos (nivel más alto, más monedas, más victorias)
                resolvedData[mode] = {
                    level: Math.max(localModeData.level, firebaseModeData.level),
                    coins: Math.max(localModeData.coins, firebaseModeData.coins),
                    totalGames: Math.max(localModeData.totalGames, firebaseModeData.totalGames),
                    totalWins: Math.max(localModeData.totalWins, firebaseModeData.totalWins),
                    lastPlayed: new Date().toISOString()
                };
            }
            
            // Sistema de monedas simplificado (solo por modo)
            
            return resolvedData;
        }

        // Guardar datos del usuario en Firebase
        async function saveUserDataToFirebase(uid, userData) {
            return new Promise((resolve) => {
                if (window.AndroidInterface && window.AndroidInterface.saveGameProgress) {
                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                    const progressData = {
                        uid: uid,
                        nick: user.nick || 'Usuario',
                        email: user.email || '',
                        displayName: user.displayName || 'Usuario',
                        livesData: {
                            beginner: {lives: 3, lastLifeLost: new Date().toISOString()},
                            normal: {lives: 3, lastLifeLost: new Date().toISOString()},
                            extreme: {lives: 3, lastLifeLost: new Date().toISOString()}
                        },
                        memoflip_progress_beginner: userData.beginner || {level: 1, coins: 0, totalGames: 0, totalWins: 0, lastPlayed: new Date().toISOString()},
                        memoflip_progress_normal: userData.normal || {level: 1, coins: 0, totalGames: 0, totalWins: 0, lastPlayed: new Date().toISOString()},
                        memoflip_progress_extreme: userData.extreme || {level: 1, coins: 0, totalGames: 0, totalWins: 0, lastPlayed: new Date().toISOString()},
                        lastUpdated: new Date().toISOString()
                    };
                    
                    window.AndroidInterface.saveGameProgress(JSON.stringify(progressData));
                    console.log('💾 Datos del usuario enviados a Firebase');
                    resolve();
                } else {
                    resolve();
                }
            });
        }
        

// Manejar flujo: Mismo usuario, actualizar datos
        async function handleSameUserUpdate(userData) {
            console.log('🎯 MANEJANDO: Mismo usuario, actualizando datos');
            
            // Obtener datos actuales de localStorage
            const localData = collectCurrentUserData();
            
            // Obtener datos de Firebase
            const firebaseData = await getUserDataFromFirebase(userData.uid);
            
            if (firebaseData && Object.keys(firebaseData).length > 0) {
                // Comparar y resolver conflictos si los hay
                const resolvedData = resolveDataConflicts(localData, firebaseData);
                
                // Actualizar localStorage con datos resueltos
                saveUserDataToLocalStorage(resolvedData);
                
                // Sincronizar con Firebase si hay cambios
                if (JSON.stringify(resolvedData) !== JSON.stringify(firebaseData)) {
                    await saveUserDataToFirebase(userData.uid, resolvedData);
                }
            }
            
            console.log('✅ Datos del usuario actualizados');
        }