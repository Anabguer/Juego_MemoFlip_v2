function showMechanicHelp() {
    const list = document.getElementById('mechanic-help-list');
    if (!list) return;
    
    // Obtener mecánicas del nivel actual
    const levelData = getCurrentLevelData();
    const levelMechanics = levelData.mechanics || ['basic'];
    
    console.log('🎮 Mostrando ayuda para mecánicas:', levelMechanics);
    
    list.innerHTML = '';
    
    levelMechanics.forEach(mechanic => {
        const info = MECHANIC_INFO[mechanic];
        if (!info) return;
        
        const item = document.createElement('div');
        item.className = 'mechanic-help-item';
        item.innerHTML = `
            <div class="mechanic-help-header-item">
                <img src="${info.icon}" class="mechanic-help-icon" alt="${info.name}">
                <h3 class="mechanic-help-name">${info.name}</h3>
            </div>
            <p class="mechanic-help-desc">${info.description}</p>
        `;
        
        list.appendChild(item);
    });
    
    const modal = document.getElementById('mechanic-help-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeMechanicHelp() {
    const modal = document.getElementById('mechanic-help-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Mostrar modal de anuncio de mecánicas
function showMechanicIntro(levelMechanics) {
    console.log('🎯 showMechanicIntro llamada con:', levelMechanics);
    
    // Verificar que hay mecánicas especiales
    if (!levelMechanics || levelMechanics.length === 0) {
        console.log('🎯 No hay mecánicas especiales, no mostrando modal');
        return;
    }
    
    const overlay = document.getElementById('mechanic-intro');
    const list = document.getElementById('mechanic-list');
    
    if (!overlay || !list) {
        console.error('❌ Elementos del modal de mecánicas no encontrados');
        return;
    }
    
    // Limpiar lista
    list.innerHTML = '';
    
    // Agregar cada mecánica
    levelMechanics.forEach(mechanic => {
        const info = MECHANIC_INFO[mechanic];
        if (!info) {
            console.warn('⚠️ Info no encontrada para mecánica:', mechanic);
            return;
        }
        
        const item = document.createElement('div');
        item.className = 'mechanic-item';
        
        const icon = document.createElement('img');
        icon.className = 'mechanic-icon';
        icon.src = info.icon;
        icon.alt = info.name;
        
        const name = document.createElement('span');
        name.className = 'mechanic-name';
        name.textContent = info.name;
        
        item.appendChild(icon);
        item.appendChild(name);
        list.appendChild(item);
    });
    
    // Mostrar modal
    overlay.classList.add('show');
    console.log('🎯 Mostrando modal de mecánicas:', levelMechanics);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        overlay.classList.remove('show');
        console.log('🎯 Modal de mecánicas ocultado');
    }, 3000);
}

// ========================================
// FUNCIONES DE MODALES - COMPLETAS
// ========================================

// ===== ESTADO GLOBAL =====
// Las variables están declaradas en game.html y game-core.js

// Precargar animación de victoria
let victoryAnimationData = null;
let victoryAnimationLoaded = false;

// Función para precargar la animación de victoria
function preloadVictoryAnimation() {
    if (victoryAnimationLoaded) return Promise.resolve();
    
    console.log('🎬 Precargando animación de victoria...');
    
    // En APK, usar la animación que ya está cargada en partida_ganada.js
    if (window.PARTIDA_GANADA_ANIMATION) {
        victoryAnimationData = window.PARTIDA_GANADA_ANIMATION;
        victoryAnimationLoaded = true;
        console.log('✅ Animación de victoria precargada desde partida_ganada.js');
        return Promise.resolve();
    }
    
    // Fallback: intentar cargar desde JSON (solo para web)
    return fetch('./partida_ganada.json')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            victoryAnimationData = data;
            victoryAnimationLoaded = true;
            console.log('✅ Animación de victoria precargada desde JSON');
        })
        .catch(error => {
            console.error('❌ Error precargando animación:', error);
            victoryAnimationLoaded = false;
        });
}


        // ===== MODAL VICTORIA =====
        function showVictoryModal() {
            // Usar el tiempo real del TimerSystem en lugar de Date.now
            const timePlayed = TimerSystem.actualGameTime || 0;
            
            // Usar las monedas reales ganadas en el nivel
            const earnedCoins = window.levelCoinsEarned || 0;
            
            document.getElementById('time-played').textContent = formatTime(timePlayed);
            document.getElementById('flips-count').textContent = TimerSystem.totalFlips || 0;
            document.getElementById('coins-earned').textContent = `+${earnedCoins}`;
            
            console.log('🏆 Mostrando modal de victoria con trofeo dorado');
            console.log('🪙 Monedas ganadas en el nivel:', earnedCoins);
            
            document.getElementById('modal-victory').classList.remove('hidden');
            soundSystem.play('acierto');
        }

        // ===== MODAL DERROTA =====
        function showDefeatModal() {
            const levelData = getCurrentLevelData();
            const timeLimit = levelData.timeSec || 0;
            const earnedCards = Math.max(5, 10 - currentLevel);
            
            document.getElementById('failed-level').textContent = currentLevel;
            document.getElementById('time-limit').textContent = formatTime(timeLimit);
            document.getElementById('coins-earned-fail').textContent = earnedCards;
            // Usar LifeSystem para obtener las vidas correctas
            const currentLives = window.LifeSystem ? window.LifeSystem.getCurrentLives() : 0;
            document.getElementById('lives-remaining').textContent = currentLives;
            
            document.getElementById('modal-defeat').classList.remove('hidden');
            soundSystem.play('fallo');
        }

        // ===== MODAL SIN VIDAS =====
        function showNoLivesModal() {
            console.log('🚨 MOSTRANDO MODAL SIN VIDAS');
            document.getElementById('modal-no-lives').classList.remove('hidden');
            // NO iniciar timer de regeneración automática
            // El usuario debe ver anuncio para recuperar vida
        }

        // ===== CALLBACK CUANDO SE VE EL ANUNCIO =====
        function onAdWatched() {
            console.log('📺 Anuncio visto, recuperando UNA vida...');
            
            // Cerrar TODOS los modales relacionados con vidas
            document.getElementById('modal-no-lives').classList.add('hidden');
            document.getElementById('modal-defeat').classList.add('hidden');
            
            // Recuperar SOLO UNA vida
            if (window.LifeSystem) {
                window.LifeSystem.gainLife();
                console.log('💚 Vida recuperada por ver anuncio');
                
                // Mostrar modal de vida ganada con efecto
                showLifeEarnedModal();
                
                // Forzar guardado inmediato de vidas
                setTimeout(() => {
                    window.LifeSystem.forceSaveLives();
                }, 100);
            }
            
            // Rehabilitar botón
            const btnWatchAd = document.getElementById('btn-watch-ad');
            if (btnWatchAd) {
                btnWatchAd.disabled = false;
            }
            
            // Reiniciar el nivel automáticamente
            setTimeout(() => {
                initGame();
            }, 1000);
        }

    
    // ===== ANIMACIÓN DE VIDA GANADA (SIN MODAL) =====
    function showLifeEarnedModal() {
        console.log('💚 Mostrando animación de vida ganada (sin modal)...');
        
        // Solo reproducir sonido
        soundSystem.play('acierto');
        
        // Crear corazón volador (sin modal)
        const flyingHeart = document.createElement('div');
        flyingHeart.innerHTML = '💚';
        flyingHeart.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            font-size: 60px;
            z-index: 99999;
            pointer-events: none;
            transform: translate(-50%, -50%);
            animation: flyToLives 2s ease-out forwards;
        `;
        
        document.body.appendChild(flyingHeart);
        console.log('💚 Corazón volador creado y animado');
        
        // Eliminar después de la animación
        setTimeout(() => {
            flyingHeart.remove();
            console.log('💚 Corazón volador eliminado');
        }, 2000);
    }
        
        // Función para mostrar anuncio intersticial después de completar un nivel
        function showInterstitialAdAfterLevel() {
            console.log('📺 Mostrando anuncio intersticial después de completar nivel...');
            
            // Llamar a AdMob para mostrar anuncio interstitial
            if (window.AndroidInterface && window.AndroidInterface.showInterstitialAd) {
                console.log('📺 Llamando a AdMob para mostrar anuncio intersticial...');
                window.AndroidInterface.showInterstitialAd();
            } else {
                console.log('⚠️ AdMob no disponible, mostrando modal de victoria directamente...');
                // Fallback: mostrar modal de victoria directamente
                showVictoryModal();
            }
        }
        
        // Función global para cuando se cierra el anuncio intersticial (después de completar nivel)
        window.onInterstitialAdClosed = function() {
            console.log('📺 Anuncio intersticial cerrado, mostrando modal de victoria...');
            
            // IMPORTANTE: Incrementar el nivel ANTES de mostrar el modal
            currentLevel += 1;
            console.log('🎯 Nivel incrementado a:', currentLevel);
            
            // Actualizar la UI del nivel
            const currentLevelElement = document.getElementById('currentLevel');
            if (currentLevelElement) {
                currentLevelElement.textContent = currentLevel;
                console.log('✅ Nivel actualizado en pantalla:', currentLevel);
            }
            
            showVictoryModal();
        };
        
        // Función global para cuando se cierra el anuncio intersticial (para recuperar vida)
        window.onInterstitialAdForLifeClosed = function() {
            console.log('📺 Anuncio intersticial para vida cerrado, recuperando vida...');
            onAdWatched(); // Usar la función existente para recuperar vida
        };

        // ===== MODAL CONFIGURACIÓN =====
        // openSettingsModal() movida fuera del bloque local


// ===== FUNCIONES DE MODALES GLOBALES =====
function openSettingsModal() {
    // Cargar configuraciones actuales
    const settings = getSettings();
    
    // Inicializar controles de música
    const musicIcon = document.getElementById('music-icon');
    const musicName = document.getElementById('music-name');
    const musicDesc = document.getElementById('music-desc');
    const musicToggle = document.getElementById('music-toggle');
    const musicVolumeSlider = document.getElementById('music-volume');
    
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
    musicVolumeSlider.value = settings.musicVolume;
    
    // Inicializar controles de efectos
    const soundIcon = document.getElementById('sound-icon');
    const soundName = document.getElementById('sound-name');
    const soundDesc = document.getElementById('sound-desc');
    const soundToggle = document.getElementById('sound-toggle');
    const soundVolumeSlider = document.getElementById('sound-volume');
    
                if (settings.soundEnabled) {
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
    soundVolumeSlider.value = settings.soundVolume;
    
    document.getElementById('settings-modal').classList.remove('hidden');
}

function closeSettingsModal() {
    document.getElementById('settings-modal').classList.add('hidden');
}

// ===== TOGGLE SONIDO =====
function toggleSound() {
    const settings = getSettings();
    settings.soundEnabled = !settings.soundEnabled;
    saveSettings(settings);
    
    const icon = document.getElementById('sound-icon');
    const name = document.getElementById('sound-name');
    const desc = document.getElementById('sound-desc');
    const toggle = document.getElementById('sound-toggle');
    
                if (settings.soundEnabled) {
                    icon.textContent = '🔔';
                    name.textContent = 'Efectos de sonido';
                    toggle.textContent = 'Desactivar';
                    toggle.classList.add('active');
                    
                    soundSystem.play('cartavolteada');
                } else {
                    icon.textContent = '🔕';
                    name.textContent = 'Efectos desactivados';
                    toggle.textContent = 'Activar';
                    toggle.classList.remove('active');
                }
    
    console.log('🔔 Efectos de sonido:', settings.soundEnabled ? 'Activados' : 'Desactivados');
}

function toggleMusic() {
    const settings = getSettings();
    settings.musicEnabled = !settings.musicEnabled;
    saveSettings(settings);
    
    const icon = document.getElementById('music-icon');
    const name = document.getElementById('music-name');
    const desc = document.getElementById('music-desc');
    const toggle = document.getElementById('music-toggle');
    
                if (settings.musicEnabled) {
                    icon.textContent = '🎵';
                    name.textContent = 'Música de fondo';
                    toggle.textContent = 'Desactivar';
                    toggle.classList.add('active');
                    
                    // Reanudar música si está pausada
                    if (backgroundMusic.audio && backgroundMusic.audio.paused) {
                        backgroundMusic.play();
                    }
                } else {
                    icon.textContent = '🔇';
                    name.textContent = 'Música desactivada';
                    toggle.textContent = 'Activar';
                    toggle.classList.remove('active');
                    
                    // Pausar música
                    if (backgroundMusic.audio && !backgroundMusic.audio.paused) {
                        backgroundMusic.pause();
                    }
                }
    
    console.log('🎵 Música de fondo:', settings.musicEnabled ? 'Activada' : 'Desactivada');
}

function updateMusicVolume(value) {
    const settings = getSettings();
    settings.musicVolume = parseFloat(value);
    saveSettings(settings);
    
    // Aplicar volumen inmediatamente
    if (backgroundMusic.audio) {
        backgroundMusic.audio.volume = settings.musicVolume;
    }
    
    console.log('🎵 Volumen música actualizado:', settings.musicVolume);
}

function updateSoundVolume(value) {
    const settings = getSettings();
    settings.soundVolume = parseFloat(value);
    saveSettings(settings);
    
    console.log('🔔 Volumen efectos actualizado:', settings.soundVolume);
}

// ===== TOGGLE VIBRACIÓN =====
function toggleVibration() {
    vibrationEnabled = !vibrationEnabled;
    
    // Guardar configuración en localStorage
    const settings = getSettings();
    settings.vibrationEnabled = vibrationEnabled;
    saveSettings(settings);
    
    const icon = document.getElementById('vibration-icon');
    const name = document.getElementById('vibration-name');
    const desc = document.getElementById('vibration-desc');
    const toggle = document.getElementById('vibration-toggle');
    
    if (vibrationEnabled) {
        icon.textContent = '📱';
        name.textContent = 'Vibración Activada';
        desc.textContent = 'Vibración al tocar cartas';
        toggle.textContent = 'Desactivar';
        toggle.classList.add('active');
    } else {
        icon.textContent = '📵';
        name.textContent = 'Vibración Desactivada';
        desc.textContent = 'Sin vibración';
        toggle.textContent = 'Activar';
        toggle.classList.remove('active');
    }
    
    if (soundEnabled) {
        soundSystem.play('cartavolteada');
    }
    
    console.log('📳 Vibración:', vibrationEnabled ? 'Activada' : 'Desactivada');
}

// ===== CAMBIAR MODO DE JUEGO =====
function changeGameMode(mode) {
    // Remover active de todos
    document.getElementById('mode-beginner').classList.remove('active');
    document.getElementById('mode-normal').classList.remove('active');
    document.getElementById('mode-extreme').classList.remove('active');
    
    // Remover active de indicators
    document.querySelectorAll('.mode-indicator').forEach(ind => {
        ind.classList.remove('active');
    });
    
    // Agregar active al seleccionado
    const button = document.getElementById(`mode-${mode}`);
    button.classList.add('active');
    button.querySelector('.mode-indicator').classList.add('active');
    
    currentGameMode = mode;
    
    if (soundEnabled) {
        soundSystem.play('cartavolteada');
    }
    
    console.log('🎮 Modo cambiado a:', mode);
}

// ===== LOGIN CON GOOGLE =====
function loginWithGoogle() {
    console.log('🔵 Iniciando login con Google...');
    if (window.tryFirebaseLogin) {
        window.tryFirebaseLogin().then(user => {
            console.log('✅ Login exitoso:', user);
            closeSettingsModal();
        }).catch(error => {
            console.error('❌ Error en login:', error);
            alert('Error al iniciar sesión');
        });
    } else {
        alert('Función de login con Google no disponible');
    }
}

// ===== FUNCIONES DE LOGOUT NATIVO =====
window.__onNativeLogout = function() {
    console.log('🚪 __onNativeLogout llamado');
    console.log('🧹 Limpiando localStorage...');
    console.log('🔍 localStorage antes:', {
        user: localStorage.getItem('user'),
        memoflip_user: localStorage.getItem('memoflip_user')
    });
    
    localStorage.removeItem('user');
    localStorage.removeItem('memoflip_user');
    localStorage.removeItem('memoflip_user_email');
    localStorage.removeItem('memoflip_user_token');
    localStorage.removeItem('memoflip_progress');
    
    // Limpiar progreso del usuario logueado para volver a modo invitado
    localStorage.removeItem('memoflip_progress_normal');
    localStorage.removeItem('memoflip_progress_beginner');
    localStorage.removeItem('memoflip_progress_extreme');
    localStorage.removeItem('lastUserUid');
    
    console.log('🔍 localStorage después:', {
        user: localStorage.getItem('user'),
        memoflip_user: localStorage.getItem('memoflip_user')
    });
    
    console.log('🎨 Actualizando UI a estado no logueado...');
    updateAccountDisplay();
    
    // Actualizar el nick a "Invitado"
    const userNickElement = document.getElementById('userNick');
    if (userNickElement) {
        userNickElement.textContent = 'Invitado';
        console.log('👤 Nick actualizado a "Invitado"');
    }
    
    closeSettingsModal();
    console.log('✅ Logout completado');
    
    // Ir a la pantalla de inicio para que el usuario pueda elegir
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 100);
};

// ===== CERRAR SESIÓN =====
function logout() {
    showConfirmModal(
        'Cerrar Sesión',
        '¿Estás seguro de que quieres cerrar sesión?',
        'Cerrar Sesión',
        'Cancelar',
        () => {
            console.log('🚪 Iniciando logout...');
            console.log('🔍 AndroidInterface disponible:', !!window.AndroidInterface);
            console.log('🔍 AndroidInterface.logout disponible:', !!(window.AndroidInterface && window.AndroidInterface.logout));
            
            if (window.AndroidInterface && window.AndroidInterface.logout) {
                console.log('📱 Llamando a AndroidInterface.logout()...');
                window.AndroidInterface.logout();
                console.log('✅ AndroidInterface.logout() llamado');
            } else {
                console.error('❌ AndroidInterface.logout no disponible');
                // Fallback: limpiar localStorage y recargar
                console.log('🔄 Usando fallback: limpiar localStorage y recargar');
                localStorage.removeItem('user');
                localStorage.removeItem('memoflip_user');
            localStorage.removeItem('memoflip_user_email');
            localStorage.removeItem('memoflip_user_token');
            localStorage.removeItem('memoflip_progress');
            
            updateAccountDisplay();
                
                // Actualizar el nick a "Invitado"
                const userNickElement = document.getElementById('userNick');
                if (userNickElement) {
                    userNickElement.textContent = 'Invitado';
                    console.log('👤 Nick actualizado a "Invitado" (fallback)');
                }
            
            closeSettingsModal();
            
            setTimeout(() => {
                    // Ir a la pantalla de inicio para que el usuario pueda elegir
                    window.location.href = 'index.html';
            }, 100);
            }
        }
    );
}

// ===== ELIMINAR CUENTA =====
function deleteAccount() {
    console.log('🗑️ Abriendo página de eliminación de cuenta...');
    
    // Abrir la página web de eliminación de cuenta
    window.open('https://colisan.com/sistema_apps_upload/eliminar_cuenta.html', '_blank');
    
    // Cerrar modal de configuración
    closeSettingsModal();
}

// ===== MODAL ANUNCIO DE MECÁNICAS =====
const MECHANIC_ICONS = {
    fog: '🌫️',
    ghost: '👻',
    bomb: '💣',
    chameleon: '🦎',
    darkness: '🌑',
    rotation: '🔄',
    frozen: '❄️',
    peeked_card: '👁️',
    trio: '3️⃣'
};

const MECHANIC_NAMES = {
    fog: 'Niebla',
    ghost: 'Fantasma',
    bomb: 'Bomba',
    chameleon: 'Camaleón',
    darkness: 'Oscuridad',
    rotation: 'Rotación',
    frozen: 'Congelado',
    peeked_card: 'Vista Previa',
    trio: 'Trío'
};


// ===== FUNCIONES AUXILIARES =====
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function startLifeRegenTimer() {
    // Simular timer de regeneración de vidas
    let timeLeft = 30 * 60; // 30 minutos en segundos
    
    const timer = setInterval(() => {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        document.getElementById('life-timer').textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        timeLeft--;
        
        if (timeLeft < 0) {
            clearInterval(timer);
            document.getElementById('life-timer').textContent = '00:00';
        }
    }, 1000);
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    // Verificar si hay usuario logueado
    updateAccountDisplay();

    // Event listeners para botones de modales
    document.getElementById('btn-next-level')?.addEventListener('click', () => {
        document.getElementById('modal-victory').classList.add('hidden');
        // Resetear flipCount después de mostrar el modal
        flipCount = 0;
        nextLevel();
    });

    document.getElementById('btn-exit')?.addEventListener('click', () => {
        document.getElementById('modal-defeat').classList.add('hidden');
        goBack();
    });

    document.getElementById('btn-retry')?.addEventListener('click', () => {
        document.getElementById('modal-defeat').classList.add('hidden');
        initGame();
    });

    document.getElementById('btn-close-no-lives')?.addEventListener('click', () => {
        document.getElementById('modal-no-lives').classList.add('hidden');
    });

    // Prevenir múltiples registros del event listener
    const btnWatchAd = document.getElementById('btn-watch-ad');
    if (btnWatchAd && !btnWatchAd.hasAttribute('data-listener-added')) {
        btnWatchAd.setAttribute('data-listener-added', 'true');
        btnWatchAd.addEventListener('click', () => {
            // Prevenir doble clic
            if (btnWatchAd.disabled) return;
            btnWatchAd.disabled = true;
            
            console.log('📺 Botón "Ver Video" presionado...');
            
            // Llamar a AdMob para mostrar anuncio interstitial (para recuperar vida)
            if (window.AndroidInterface && window.AndroidInterface.showInterstitialAdForLife) {
                console.log('📺 Llamando a AdMob para mostrar anuncio (recuperar vida)...');
                window.AndroidInterface.showInterstitialAdForLife();
            } else {
                console.log('⚠️ AdMob no disponible, simulando anuncio...');
                // Fallback: simular anuncio
                setTimeout(() => {
                    onAdWatched();
                    btnWatchAd.disabled = false; // Rehabilitar botón
                }, 2000);
            }
        });
    }
});

// ===== NAVEGACIÓN =====
function goToMainMenu() {
    console.log('🏠 Volviendo al menú principal...');
    // Cargar la pantalla de inicio
    window.location.href = 'index.html';
}

// ===== ACTUALIZAR DISPLAY DE CUENTA =====
function updateAccountDisplay() {
    const user = localStorage.getItem('user');
    const loggedOutDiv = document.getElementById('account-logged-out');
    const loggedInDiv = document.getElementById('account-logged-in');
    const userEmailElement = document.getElementById('user-email');
    
    if (user) {
        try {
            const userData = JSON.parse(user);
            if (userData && userData.email) {
                // Verificar si es un usuario diferente al anterior
                const lastUserUid = localStorage.getItem('lastUserUid');
                if (lastUserUid && lastUserUid !== userData.uid) {
                    console.log('🚨 CAMBIO DE USUARIO DETECTADO EN updateAccountDisplay');
                    console.log('👤 Usuario anterior:', lastUserUid);
                    console.log('👤 Usuario nuevo:', userData.uid);
                    
                    // Limpiar localStorage para el nuevo usuario
                    clearAllLocalStorage();
                    
                    // Guardar el nuevo usuario y UID
                    localStorage.setItem('user', JSON.stringify(userData));
                    localStorage.setItem('lastUserUid', userData.uid);
                    
                    console.log('✅ localStorage limpiado para nuevo usuario');
                    
                    // Activar pantalla de carga y solicitar datos de Firebase
                    LoadingSystem.expectFirebaseData();
                    
                    if (window.AndroidInterface && window.AndroidInterface.getUserProgress) {
                        console.log('🔄 Solicitando datos de Firebase para nuevo usuario:', userData.email);
                        const modes = ['normal', 'beginner', 'extreme'];
                        modes.forEach(mode => {
                            window.AndroidInterface.getUserProgress(userData.uid, mode);
                        });
                    }
                } else if (!lastUserUid) {
                    // Primera vez, guardar el UID
                    localStorage.setItem('lastUserUid', userData.uid);
                }
                
                // Usuario logueado
                loggedOutDiv.classList.add('hidden');
                loggedInDiv.classList.remove('hidden');
                userEmailElement.textContent = userData.email;
                console.log('👤 Usuario logueado mostrado:', userData.email);
            } else {
                // Datos de usuario inválidos
                loggedOutDiv.classList.remove('hidden');
                loggedInDiv.classList.add('hidden');
                console.log('👤 Datos de usuario inválidos');
            }
        } catch (error) {
            // Error parseando usuario
            loggedOutDiv.classList.remove('hidden');
            loggedInDiv.classList.add('hidden');
            console.error('❌ Error parseando datos de usuario:', error);
        }
    } else {
        // No hay usuario
        loggedOutDiv.classList.remove('hidden');
        loggedInDiv.classList.add('hidden');
        console.log('👤 No hay usuario logueado');
    }
}

// ===== LOGIN DESDE JUEGO =====
function loginWithGoogleFromGame() {
    console.log('🔐 Iniciando login con Google desde juego...');
    
    // Verificar si hay datos de usuario anterior antes del login
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
        try {
            const currentUserData = JSON.parse(currentUser);
            console.log('🔍 Usuario actual antes del login:', currentUserData.uid);
            console.log('🔍 Datos actuales en localStorage:', {
                normal: localStorage.getItem('memoflip_progress_normal')
            });
        } catch (error) {
            console.error('❌ Error parseando usuario actual:', error);
        }
    } else {
        console.log('🔍 No hay usuario actual antes del login');
    }
    
    if (window.AndroidInterface && window.AndroidInterface.login) {
        window.AndroidInterface.login();
    } else {
        console.error('❌ AndroidInterface.login no disponible');
        alert('Error: AndroidInterface no disponible');
    }
}

// ===== AYUDA DE MODOS =====
function showModeHelp() {
    document.getElementById('help-modal').classList.remove('hidden');
}

function closeHelpModal() {
    document.getElementById('help-modal').classList.add('hidden');
}

// ===== MODAL DE CONFIRMACIÓN =====
function showConfirmModal(title, message, confirmText, cancelText, onConfirm) {
    const modal = document.getElementById('confirm-modal');
    const titleEl = document.getElementById('confirm-title');
    const messageEl = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    confirmBtn.textContent = confirmText;
    cancelBtn.textContent = cancelText;
    
    // Limpiar eventos anteriores
    confirmBtn.onclick = null;
    cancelBtn.onclick = null;
    
    // Nuevos eventos
    confirmBtn.onclick = () => {
        closeConfirmModal();
        if (onConfirm) onConfirm();
    };
    
    cancelBtn.onclick = closeConfirmModal;
    
    modal.classList.remove('hidden');
}

function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
}

// ===== MODAL DE ALERTA =====
function showAlertModal(title, message) {
    const modal = document.getElementById('alert-modal');
    const titleEl = document.getElementById('alert-title');
    const messageEl = document.getElementById('alert-message');
    const okBtn = document.getElementById('alert-ok-btn');
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Limpiar eventos anteriores
    okBtn.onclick = null;
    
    // Nuevo evento
    okBtn.onclick = closeAlertModal;
    
    modal.classList.remove('hidden');
}

function closeAlertModal() {
    document.getElementById('alert-modal').classList.add('hidden');
}





// ===== ACTUALIZAR FUNCIÓN showSettings =====
function showSettings() {
    openSettingsModal();
}

// ===== FUNCIÓN showRanking =====
function showRanking() {
    openRankingModal();
}

// ===== SISTEMA DE RANKING =====
let currentRankingData = [];

// ===== TEXTOS DE MECÁNICAS =====
const MECHANIC_INFO = {
    basic: {
        icon: 'basic.png',
        name: 'Básica',
        description: 'Mecánica estándar sin efectos especiales. Simplemente encuentra las parejas iguales.'
    },
                ghost: {
                    icon: 'ghost.png',
                    name: 'Fantasma',
                    description: 'Las cartas aparecen y desaparecen periódicamente.'
                },
    fog: {
        icon: 'fog.png',
        name: 'Niebla',
        description: 'Las cartas se ven borrosas y semi-transparentes, dificultando su identificación.'
    },
    chameleon: {
        icon: 'chamelon.png',
        name: 'Camaleón',
        description: 'Todo el grid cambia de color periódicamente (verde, rojo, azul, amarillo) para confundir.'
    },
    bomb: {
        icon: 'bomb.png',
        name: 'Bomba',
        description: 'Algunas cartas tienen bombas. Al tocar una, todas pasan de amarillo → naranja → rojo → explotan.'
    },
    trio: {
        icon: 'trio.png',
        name: 'Trío',
        description: 'En lugar de parejas, necesitas hacer grupos de 3 cartas idénticas.'
    },
    rotation: {
        icon: 'rotation.png',
        name: 'Rotación',
        description: 'El tablero rota periódicamente, cambiando la orientación de las cartas.'
    },
    peeked_card: {
        icon: 'basic.png', // Usar basic.png como fallback
        name: 'Vista Previa',
        description: 'Una carta se muestra brevemente al inicio para darte una pista.'
    },
    combo: {
        icon: 'basic.png', // Usar basic.png como fallback
        name: 'Combo',
        description: 'Bonificaciones por hacer secuencias de aciertos consecutivos.'
    },
    frozen: {
        icon: 'frozen.png',
        name: 'Congelación',
        description: 'Algunas cartas se congelan temporalmente y no se pueden voltear.'
    },
    darkness: {
        icon: 'darkness.png',
        name: 'Oscuridad',
        description: 'Toda la pantalla se oscurece periódicamente, dificultando la visión.'
    }
};

// ===== MECÁNICAS INDIVIDUALES =====

// 👻 GHOST: 25% cartas, aparecer/desaparecer 1-3s
const GhostMechanic = {
    applyToLevel(cards) {
        cards.forEach(card => {
            if (Math.random() < 0.25) { // 25% probabilidad
                this.applyToCard(card);
            }
        });
    },
    
    applyToCard(card) {
        card.mechanic = 'ghost';
        card.mechanicData = {
            isVisible: true,
            visibilityDuration: Math.random() * 2 + 1 // 1-3s aleatorio por carta
        };
        
        card.element.classList.add('ghost');
        
        console.log('👻 Aplicando mecánica ghost a carta:', card.id);
        
        // Crear efecto visual de fantasma (sin imagen, solo CSS)
        card.element.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.element.style.position = 'relative';
        
        // Timer independiente para esta carta
        this.startTimer(card);
    },
    
    startTimer(card) {
        const toggle = () => {
            // Si está emparejada, DETENER y dejar visible
            if (card.matched) {
                card.element.classList.remove('invisible', 'ghost');
                card.element.style.opacity = '1';
                return; // ← Detener timer
            }
            
            // Alternar
            card.mechanicData.isVisible = !card.mechanicData.isVisible;
            
            if (card.mechanicData.isVisible) {
                // Carta visible - efecto dramático
                card.element.classList.remove('invisible');
                card.element.style.opacity = '1';
                card.element.style.transform = 'scale(1)';
                card.element.style.filter = 'none';
                console.log('👻 Carta visible:', card.id);
            } else {
                // Carta invisible - efecto fantasma dramático
                card.element.classList.add('invisible');
                card.element.style.opacity = '0.3';
                card.element.style.transform = 'scale(0.95)';
                card.element.style.filter = 'blur(2px) grayscale(50%)';
                console.log('👻 Carta invisible (efecto fantasma):', card.id);
            }
            
            // Siguiente toggle (aleatorio 1-3s)
            setTimeout(toggle, (Math.random() * 2 + 1) * 1000);
        };
        
        // Primera alternancia
        setTimeout(toggle, card.mechanicData.visibilityDuration * 1000);
    },
    
    canClick(card) {
        if (card.mechanic !== 'ghost') return true;
        if (card.matched) return true;
        return card.mechanicData.isVisible;
    }
};

// 💨 FOG: 30% cartas, blur y transparencia
const FogMechanic = {
    applyToLevel(cards) {
        cards.forEach(card => {
            if (Math.random() < 0.3) { // 30% probabilidad
                this.applyToCard(card);
            }
        });
    },
    
    applyToCard(card) {
        card.mechanic = 'fog';
        const fogLevel = Math.random() * 0.8 + 0.2; // 0.2 a 1.0
        
        card.mechanicData = { fogLevel };
        
        // Aplicar efectos CSS
        card.element.style.filter = `blur(${fogLevel * 8}px)`;
        card.element.style.opacity = Math.max(0.3, fogLevel);
        card.element.classList.add('fog');
    },
    
    // Al emparejar: quitar niebla
    onMatch(card) {
        if (card.mechanic === 'fog') {
            card.element.style.filter = 'none';
            card.element.style.opacity = '1';
        }
    }
};

// 💣 BOMB: 20% cartas, niveles amarillo→naranja→rojo→explosión
const BombMechanic = {
    applyToLevel(cards) {
        const totalCards = cards.length;
        const bombCount = Math.floor(totalCards * 0.2); // 20%
        
        // Seleccionar cartas aleatorias para bombas
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        const bombCards = shuffled.slice(0, bombCount);
        
        bombCards.forEach(card => {
            this.applyToCard(card);
        });
    },
    
    applyToCard(card) {
        card.mechanic = 'bomb';
        card.mechanicData = {
            bombLevel: 0,
            isExploded: false
        };
        
        card.element.classList.add('bomb', 'bomb-level-0');
    },
    
    // Al emparejar: quitar bomba y asignar nueva
    onMatch(card) {
        if (card.mechanic === 'bomb') {
            // Quitar todas las clases de bomba
            card.element.classList.remove('bomb', 'bomb-level-0', 'bomb-level-1', 'bomb-level-2', 'exploded', 'exploded-permanent');
            
            // Limpiar datos de bomba
            card.mechanic = 'basic';
            card.mechanicData = {};
            
            // Restaurar estilos
            card.element.style.opacity = '1';
            card.element.style.pointerEvents = 'auto';
            card.element.style.filter = 'none';
            
            console.log('💣 Bomba desactivada por match correcto');
            
            // Asignar nueva bomba a otra carta aleatoria
            this.assignNewBomb();
        }
    },
    
    // Asignar nueva bomba a una carta aleatoria
    assignNewBomb() {
        // Obtener todas las cartas no emparejadas y sin bomba
        const availableCards = MechanicEngine.activeCards.filter(card => 
            !card.matched && 
            card.mechanic !== 'bomb' && 
            !card.mechanicData?.isExploded
        );
        
        if (availableCards.length > 0) {
            // Seleccionar carta aleatoria
            const randomCard = availableCards[Math.floor(Math.random() * availableCards.length)];
            
            // Aplicar bomba
            this.applyToCard(randomCard);
            
            console.log('💣 Nueva bomba asignada a carta aleatoria');
        }
    },
    
    // Cuando hay un error (no match)
    onMismatch(allCards) {
        allCards.forEach(card => {
            if (card.mechanic === 'bomb' && !card.matched) {
                card.mechanicData.bombLevel++;
                
                // Actualizar visual
                card.element.classList.remove('bomb-level-0', 'bomb-level-1', 'bomb-level-2');
                card.element.classList.add(`bomb-level-${card.mechanicData.bombLevel}`);
                
                // Si llega a nivel 3: EXPLOSIÓN
                if (card.mechanicData.bombLevel >= 3) {
                    card.mechanicData.isExploded = true;
                    card.element.classList.add('exploded');
                    
                    // Crear partículas de explosión
                    createParticles('💥', card.element);
                    
                    // Marcar como explotada pero mantener posición
                    setTimeout(() => {
                        card.element.style.opacity = '0.5';
                        card.element.style.pointerEvents = 'none';
                        card.element.style.filter = 'grayscale(100%)';
                        card.element.classList.add('exploded-permanent');
                    }, 300);
                    
                    // Restaurar después de unos segundos
                    setTimeout(() => {
                        card.element.style.opacity = '1';
                        card.element.style.pointerEvents = 'auto';
                        card.element.style.filter = 'none';
                        card.element.classList.remove('exploded-permanent');
                        card.mechanicData.isExploded = false;
                        card.mechanicData.bombLevel = 0;
                        card.element.classList.remove('exploded', 'bomb-level-0', 'bomb-level-1', 'bomb-level-2');
                    }, 3000); // Restaurar después de 3 segundos
                    
                    console.log('💥 Bomba explotada!');
                }
            }
        });
    }
};


// ❄️ FROZEN: Congelar 2 cartas cada 6s por 3s
const FrozenMechanic = {
    intervalMs: 6000,  // Congelar cada 6 segundos
    durationMs: 3000,  // Durar 3 segundos
    
    start(cards) {
        const freezeCycle = () => {
            // Seleccionar 2 cartas NO emparejadas
            const available = cards.filter(c => !c.matched && !c.isFrozen);
            
            if (available.length >= 2) {
                // Barajar y tomar 2
                const shuffled = available.sort(() => Math.random() - 0.5);
                const toFreeze = shuffled.slice(0, 2);
                
                toFreeze.forEach(card => {
                    card.isFrozen = true;
                    card.element.classList.add('frozen');
                    
                    // Agregar imagen de hielo
                    const iceEmoji = document.createElement('img');
                    iceEmoji.className = 'ice-emoji';
                    iceEmoji.src = 'frozen.png';
                    iceEmoji.alt = 'Congelado';
                    iceEmoji.style.position = 'absolute';
                    iceEmoji.style.top = '0';
                    iceEmoji.style.left = '0';
                    iceEmoji.style.right = '0';
                    iceEmoji.style.bottom = '0';
                    iceEmoji.style.zIndex = '100';
                    iceEmoji.style.width = '100%';
                    iceEmoji.style.height = '100%';
                    iceEmoji.style.objectFit = 'contain';
                    card.element.appendChild(iceEmoji);
                    card.iceEmoji = iceEmoji;
                });
                
                console.log('🧊 2 cartas congeladas por 3s');
                
                // Descongelar después de 3s
                setTimeout(() => {
                    toFreeze.forEach(card => {
                        card.isFrozen = false;
                        card.element.classList.remove('frozen');
                        if (card.iceEmoji) {
                            card.iceEmoji.remove();
                        }
                    });
                    console.log('🔥 Cartas descongeladas');
                }, this.durationMs);
            }
            
            // Repetir ciclo cada 6s
            setTimeout(freezeCycle, this.intervalMs);
        };
        
        // Iniciar primer ciclo
        setTimeout(freezeCycle, this.intervalMs);
    },
    
    canClick(card) {
        return !card.isFrozen;
    }
};

// 🔄 ROTATION: Rotar todas las cartas cada 2s
const RotationMechanic = {
    start(cards) {
        setInterval(() => {
            cards.forEach(card => {
                if (!card.matched) {
                    // Ángulo aleatorio
                    const angles = [0, 90, 180, 270];
                    const angle = angles[Math.floor(Math.random() * 4)];
                    
                    card.element.style.transform = `rotate(${angle}deg)`;
                    card.mechanicData = { rotation: angle };
                }
            });
            
            console.log('🔄 Cartas rotadas');
        }, 2000);
    }
};

// 🦎 CHAMELEON: Cambiar color del grid cada 2s
const ChameleonMechanic = {
    colors: ['normal', 'green', 'red', 'blue', 'yellow'],
    currentIndex: 0,
    intervalId: null,
    
    start() {
        // Limpiar intervalo anterior si existe
        this.stop();
        
        this.intervalId = setInterval(() => {
            const grid = document.getElementById('cardsGrid');
            
            // Remover color anterior
            grid.classList.remove('filter-green', 'filter-red', 'filter-blue', 'filter-yellow');
            
            // Siguiente color
            this.currentIndex = (this.currentIndex + 1) % this.colors.length;
            const color = this.colors[this.currentIndex];
            
            if (color !== 'normal') {
                grid.classList.add(`filter-${color}`);
            }
            
            console.log('🦎 Color cambiado a:', color);
        }, 2000);
    },
    
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            
            // Limpiar filtros del grid
            const grid = document.getElementById('cardsGrid');
            if (grid) {
                grid.classList.remove('filter-green', 'filter-red', 'filter-blue', 'filter-yellow');
            }
            
            console.log('🦎 Mecánica camaleón detenida');
        }
    }
};

// 👁️ PEEKED_CARD: 40% cartas, auto-peek cada 10s por 2s
const PeekedMechanic = {
    applyToLevel(cards) {
        cards.forEach(card => {
            if (Math.random() < 0.4) { // 40% probabilidad
                this.applyToCard(card);
            }
        });
    },
    
    applyToCard(card) {
        card.mechanic = 'peeked_card';
        
        const peekCycle = () => {
            if (card.matched) return; // Detener si está emparejada
            
            // Voltear
            card.element.classList.add('flipped', 'auto-peeked');
            console.log('👁️ Carta auto-peek');
            
            // Cerrar después de 2s
            setTimeout(() => {
                if (!card.matched) {
                    card.element.classList.remove('flipped', 'auto-peeked');
                }
                
                // Repetir en 10s
                setTimeout(peekCycle, 10000);
            }, 2000);
        };
        
        // Primer peek después de 1s
        setTimeout(peekCycle, 1000);
    }
};

// 🌑 DARKNESS: Oscuridad gradual en todas las cartas
const DarknessMechanic = {
    darknessLevel: 0,
    
    start(cards) {
        const darknessLoop = () => {
            // Aumentar oscuridad gradualmente
            this.darknessLevel = Math.min(0.8, this.darknessLevel + 0.002);
            
            cards.forEach(card => {
                if (!card.matched) {
                    card.element.style.filter = `brightness(${1 - this.darknessLevel})`;
                    card.element.style.opacity = 1 - (this.darknessLevel * 0.5);
                }
            });
            
            requestAnimationFrame(darknessLoop);
        };
        
        requestAnimationFrame(darknessLoop);
    }
};

// ===== MOTOR DE MECÁNICAS =====
const MechanicEngine = {
    activeCards: [],
    timers: [],
    intervals: [],
    
    // Limpiar todos los timers e intervalos
    clearAll() {
        this.timers.forEach(timer => clearTimeout(timer));
        this.intervals.forEach(interval => clearInterval(interval));
        this.timers = [];
        this.intervals = [];
        this.activeCards = [];
    },
    
    // Limpiar todas las mecánicas activas
    clearAllMechanics() {
        console.log('🧹 Limpiando todas las mecánicas activas...');
        
        // Detener mecánica camaleón
        ChameleonMechanic.stop();
        
        // Limpiar filtros del grid
        const grid = document.getElementById('cardsGrid');
        if (grid) {
            grid.classList.remove('filter-green', 'filter-red', 'filter-blue', 'filter-yellow');
        }
        
        // Limpiar otras mecánicas si tienen funciones stop
        // (añadir aquí otras mecánicas que necesiten limpieza)
    },
    
    // Inicializar nivel con mecánicas
    initLevel(levelData, cards) {
        // Limpiar mecánicas anteriores antes de iniciar nuevas
        this.clearAllMechanics();
        
        this.activeCards = cards;
        console.log('🎮 Iniciando mecánicas:', levelData.mechanics);
        
        levelData.mechanics.forEach(mechanic => {
            switch(mechanic) {
                case 'ghost':
                    GhostMechanic.applyToLevel(cards);
                    break;
                case 'fog':
                    FogMechanic.applyToLevel(cards);
                    break;
                case 'bomb':
                    BombMechanic.applyToLevel(cards);
                    break;
                case 'frozen':
                    FrozenMechanic.start(cards);
                    break;
                case 'rotation':
                    RotationMechanic.start(cards);
                    break;
                case 'chameleon':
                    ChameleonMechanic.start();
                    break;
                case 'peeked_card':
                    PeekedMechanic.applyToLevel(cards);
                    break;
                case 'darkness':
                    DarknessMechanic.start(cards);
                    break;
            }
        });
    },
    
    // Verificar si se puede hacer click en una carta
    canClickCard(card) {
        if (card.isFrozen) return false;
        if (card.mechanic === 'ghost' && !GhostMechanic.canClick(card)) return false;
        return true;
    },
    
    // Cuando hay error (no match)
    onMismatch(cards) {
        BombMechanic.onMismatch(this.activeCards);
    },
    
    // Cuando hay match exitoso
    onMatch(card) {
        FogMechanic.onMatch(card);
        BombMechanic.onMatch(card);
    }
};

// ========================================
// ABRIR MODAL
// ========================================
function openRankingModal() {
    // Verificar si hay usuario logueado
    const user = localStorage.getItem('user');
    
    if (!user) {
        // No hay usuario - mostrar mensaje para invitados
        showGuestRankingMessage();
    } else {
        // Hay usuario - mostrar ranking normal
        document.getElementById('ranking-modal').classList.remove('hidden');
        loadRanking();
    }
}

function closeRankingModal() {
    document.getElementById('ranking-modal').classList.add('hidden');
}

// ===== MENSAJE PARA INVITADOS EN RANKING =====
function showGuestRankingMessage() {
    // Crear modal temporal para invitados con el mismo diseño que configuración
    const modal = document.createElement('div');
    modal.id = 'guest-ranking-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeGuestRankingModal()"></div>
        
        <div class="settings-modal-box">
            <!-- Header -->
            <div class="settings-header">
                <div class="header-left">
                    <div class="header-icon">
                        <span style="font-size: 24px;">🏆</span>
                    </div>
                    <h2 class="header-title">Ranking</h2>
                </div>
                <button class="btn-close" onclick="closeGuestRankingModal()">✕</button>
            </div>
            
            <!-- Content -->
            <div class="settings-content">
                <div class="settings-section">
                    <h3 class="section-title">Inicia sesión para ver el ranking</h3>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-icon">👤</span>
                            <div class="setting-text">
                                <p class="setting-name">Modo invitado</p>
                                <p class="setting-desc">Para ver tu posición en el ranking global necesitas iniciar sesión con Google</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-icon">🏆</span>
                            <div class="setting-text">
                                <p class="setting-name">Ver tu posición</p>
                                <p class="setting-desc">Compara tu progreso con otros jugadores</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-icon">💾</span>
                            <div class="setting-text">
                                <p class="setting-name">Guardar progreso</p>
                                <p class="setting-desc">Tu progreso se sincronizará entre dispositivos</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="setting-item">
                        <div class="setting-info">
                            <span class="setting-icon">🎯</span>
                            <div class="setting-text">
                                <p class="setting-name">Competir globalmente</p>
                                <p class="setting-desc">Participa en el ranking mundial</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Botones -->
                <div class="settings-section">
                    <button class="setting-toggle active" onclick="goToLogin()" style="width: 100%; margin-bottom: 12px;">
                        <span style="margin-right: 8px;">🔐</span>
                        Entrar con Google
                    </button>
                    
                    <button class="setting-toggle" onclick="closeGuestRankingModal()" style="width: 100%; background: transparent; border: 1px solid rgba(148, 163, 184, 0.3);">
                        Seguir como invitado
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function closeGuestRankingModal() {
    const modal = document.getElementById('guest-ranking-modal');
    if (modal) {
        modal.remove();
    }
}

function goToLogin() {
    console.log('🔐 Iniciando login desde ranking de invitado...');
    
    // Cerrar modal de invitado
    closeGuestRankingModal();
    
    // Ejecutar login directamente desde game.html
    loginWithGoogleFromGame();
}






// ========================================
// RENDERIZAR TABLA
// ========================================
    function renderRankingTable(data, currentUser) {
    const tbody = document.getElementById('ranking-list');
    tbody.innerHTML = '';
    
        // Encontrar la posición del usuario actual
        const userPosition = data.findIndex(player => player.isCurrentUser);
        const startIndex = Math.max(0, userPosition - 5); // Mostrar 5 posiciones arriba
        const endIndex = Math.min(data.length, userPosition + 6); // Mostrar 5 posiciones abajo
        
        // Renderizar solo una ventana del ranking centrada en el usuario
        for (let i = startIndex; i < endIndex; i++) {
            const player = data[i];
        const tr = document.createElement('tr');
        
            // Destacar al usuario actual
            if (player.isCurrentUser) {
                tr.classList.add('current-user');
            }
            
            // Iconos de posición
            let positionIcon = '';
            if (player.position === 1) positionIcon = '🥇';
            else if (player.position === 2) positionIcon = '🥈';
            else if (player.position === 3) positionIcon = '🥉';
            else positionIcon = player.position;
        
        tr.innerHTML = `
                <td class="position">${positionIcon}</td>
            <td class="player">${player.name}</td>
                <td class="level">${player.level}</td>
                <td class="coins">${player.coins.toLocaleString()}</td>
        `;
        
        tbody.appendChild(tr);
        }
        
        // Scroll automático a la posición del usuario
        setTimeout(() => {
            const currentUserRow = tbody.querySelector('.current-user');
            if (currentUserRow) {
                currentUserRow.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
        }, 100);
}

// ========================================
// ABRIR RANKING NATIVO (Google Play Games)
// ========================================
function openNativeRanking() {
    console.log('🏆 Abriendo ranking nativo de Google Play Games...');
    // Aquí iría la llamada al plugin nativo
    alert('Abriendo ranking nativo...');
}

// ===== LEER MODO SELECCIONADO DESDE PANTALLA DE INICIO =====
function getSelectedMode() {
    const savedMode = localStorage.getItem('memoflip_selected_mode');
    return savedMode || 'normal';
}

// ===== SELECTOR DE MODO BONITO =====
function toggleModeSelector() {
    const dropdown = document.getElementById('modeDropdown');
    const pill = document.getElementById('modePill');
    
    dropdown.classList.toggle('open');
    pill.classList.toggle('open');
}

function changeMode(newMode) {
    console.log('🔄 FUNCIÓN changeMode LLAMADA con:', newMode);
    // Guardar modo seleccionado
    localStorage.setItem('memoflip_selected_mode', newMode);
    currentMode = newMode;
    
    // Guardar modo en Firestore si hay usuario logueado
    const user = localStorage.getItem('user');
    console.log('🔍 Usuario encontrado:', !!user);
    console.log('🔍 AndroidInterface disponible:', !!window.AndroidInterface);
    console.log('🔍 saveGameProgress disponible:', !!(window.AndroidInterface && window.AndroidInterface.saveGameProgress));
    
    if (user && window.AndroidInterface && window.AndroidInterface.saveGameProgress) {
        try {
            const userData = JSON.parse(user);
            const progressData = {
                uid: userData.uid,
                nick: userData.nick,
                email: userData.email,
                displayName: userData.displayName,
                selectedMode: newMode,
                lastUpdated: new Date().toISOString()
            };
            console.log('📤 Enviando datos a Firestore:', progressData);
            window.AndroidInterface.saveGameProgress(JSON.stringify(progressData));
            console.log('🎯 Modo guardado en Firestore desde juego:', newMode);
        } catch (error) {
            console.error('❌ Error guardando modo en Firestore:', error);
        }
    } else {
        console.log('⚠️ No se puede guardar en Firestore - condiciones no cumplidas');
    }
    
    // Cargar progreso del nuevo modo
    loadGameProgress();
    
    // Reinicializar CoinSystem para el nuevo modo
    CoinSystem.init();
    console.log(`🪙 CoinSystem reinicializado para modo: ${newMode}`);
    
    // Sistema de monedas simplificado (solo por modo)
    
    // Recargar datos de niveles del nuevo modo
    loadLevelsData().then(() => {
        console.log('✅ Datos de niveles recargados para modo:', newMode);
        
        // Limpiar mecánicas del modo anterior
        if (MechanicEngine && MechanicEngine.clearAllMechanics) {
            MechanicEngine.clearAllMechanics();
        }
        
        // Reiniciar juego con el nuevo modo y nivel
        initGame();
    }).catch(error => {
        console.error('❌ Error recargando datos de niveles:', error);
        
        // Limpiar mecánicas del modo anterior
        if (MechanicEngine && MechanicEngine.clearAllMechanics) {
            MechanicEngine.clearAllMechanics();
        }
        
        // Aún así reiniciar el juego
        initGame();
    });
    
    // Actualizar pill
    const modeNames = {
        'beginner': { text: 'Relax', icon: 'relax.png' },
        'normal': { text: 'Normal', icon: 'normal.png' },
        'extreme': { text: 'Extremo', icon: 'extremo.png' }
    };
    
    const modeData = modeNames[newMode];
    document.getElementById('modeIcon').src = modeData.icon;
    document.getElementById('modeText').textContent = modeData.text;
    
    // Cerrar dropdown
    const dropdown = document.getElementById('modeDropdown');
    const pill = document.getElementById('modePill');
    dropdown.classList.remove('open');
    pill.classList.remove('open');
    
    // Aplicar clase CSS del modo al pill
    pill.classList.remove('beginner', 'normal', 'extreme');
    pill.classList.add(newMode);
    
    // Aplicar clase CSS del modo al nick
    const userNickElement = document.getElementById('userNick');
    if (userNickElement) {
        userNickElement.parentElement.classList.remove('mode-beginner', 'mode-normal', 'mode-extreme');
        userNickElement.parentElement.classList.add(`mode-${newMode}`);
    }
    
    // Aplicar color del nick según el modo
    if (typeof applyNickColor === 'function') {
        applyNickColor();
    }
    
    // Actualizar opciones activas
    document.querySelectorAll('.mode-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Activar la opción correspondiente al modo seleccionado
    const modeButtons = {
        'beginner': document.querySelector('.mode-option[onclick*="beginner"]'),
        'normal': document.querySelector('.mode-option[onclick*="normal"]'),
        'extreme': document.querySelector('.mode-option[onclick*="extreme"]')
    };
    
    if (modeButtons[newMode]) {
        modeButtons[newMode].classList.add('active');
    }
    
    // Actualizar display de vidas para el nuevo modo
    LifeSystem.updateDisplay();
    
    // Modo cambiado (sin modal)
    console.log('🎯 Modo cambiado a:', newMode);
    
    // Validar integridad de datos después del cambio de modo
    setTimeout(() => {
        validateDataIntegrity();
        diagnoseSyncIssues();
    }, 1000);
}

// ===== FRASES MOTIVACIONALES POR MODO =====
function showModeMotivationalMessage(mode) {
    console.log('🎯 Mostrando mensaje motivacional para modo:', mode);
    const messages = {
        'beginner': {
            title: '🌿 Modo Relax',
            message: '¡Perfecto para relajarte! Sin presión de tiempo, disfruta del juego a tu ritmo y mejora tu memoria de forma tranquila.'
        },
        'normal': {
            title: '⚡ Modo Normal',
            message: '¡El equilibrio perfecto! Tienes tiempo limitado para completar cada nivel. ¡Demuestra tu habilidad y concentración!'
        },
        'extreme': {
            title: '🔥 Modo Extremo',
            message: '¡Estás preparado para el desafío máximo! Cada nivel te retará con mecánicas especiales y tiempo muy limitado. ¡Demuestra que eres un verdadero maestro de la memoria!'
        }
    };

    const messageData = messages[mode];
    if (messageData) {
        // Crear modal temporal para mostrar el mensaje
        showTemporaryMessage(messageData.title, messageData.message, mode);
    }
}

        // ===== MOSTRAR MENSAJE TEMPORAL =====
        function showTemporaryMessage(title, message, mode = 'normal') {
            console.log('🎨 showTemporaryMessage llamado con modo:', mode);
            // Colores según el modo (iguales que en la pantalla de inicio)
            const modeColors = {
                'beginner': {
                    background: 'rgba(250, 204, 21, 0.3)',
                    border: '2px solid #facc15',
                    titleColor: '#facc15',
                    boxShadow: '0 4px 12px rgba(250, 204, 21, 0.3)'
                },
                'normal': {
                    background: 'rgba(59, 130, 246, 0.3)',
                    border: '2px solid #2fdde6',
                    titleColor: '#2fdde6',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                },
                'extreme': {
                    background: 'rgba(239, 68, 68, 0.3)',
                    border: '2px solid #ef4444',
                    titleColor: '#ef4444',
                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                }
            };

            const colors = modeColors[mode] || modeColors['normal'];
            console.log('🎨 Colores aplicados para modo', mode, ':', colors);

            // Crear overlay
            const overlay = document.createElement('div');
            overlay.className = 'temp-message-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            `;

            // Crear modal
            const modal = document.createElement('div');
            modal.className = 'temp-message-modal';
            modal.style.cssText = `
                background: ${colors.background};
                border-radius: 20px;
                padding: 24px;
                max-width: 320px;
                text-align: center;
                box-shadow: ${colors.boxShadow};
                border: ${colors.border};
                animation: slideIn 0.3s ease-out;
            `;
            console.log('🎨 Modal creado con estilos:', modal.style.cssText);

            modal.innerHTML = `
                <div style="position: relative;">
                    <button class="close-btn" style="position: absolute; top: -8px; right: -8px; background: rgba(34, 197, 94, 0.9); color: white; border: none; border-radius: 12px; width: 32px; height: 24px; cursor: pointer; font-size: 12px; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);">OK</button>
                    <h3 style="color: ${colors.titleColor}; font-size: 18px; font-weight: 700; margin: 0 0 12px 0; text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);">
                        ${title}
                    </h3>
                    <p style="color: rgba(255, 255, 255, 0.9); font-size: 14px; line-height: 1.5; margin: 0; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);">
                        ${message}
                    </p>
                </div>
            `;

            // Añadir animación CSS
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
            `;
            document.head.appendChild(style);

            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            console.log('🎨 Modal creado y añadido al DOM');

            // Función para cerrar el modal
            const closeModal = () => {
                overlay.style.animation = 'slideOut 0.3s ease-in forwards';
                setTimeout(() => {
                    if (overlay.parentNode) {
                        overlay.parentNode.removeChild(overlay);
                    }
                    if (style.parentNode) {
                        style.parentNode.removeChild(style);
                    }
                }, 300);
            };

            // Cerrar al hacer clic en el botón X
            const closeBtn = modal.querySelector('.close-btn');
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                closeModal();
            });

            // Cerrar al hacer clic fuera del modal
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeModal();
                }
            });

            // Añadir animación de salida
            const exitStyle = document.createElement('style');
            exitStyle.textContent = `
                @keyframes slideOut {
                    from {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                    to {
                        opacity: 0;
                        transform: translateY(-20px) scale(0.9);
                    }
                }
            `;
            document.head.appendChild(exitStyle);
        }
