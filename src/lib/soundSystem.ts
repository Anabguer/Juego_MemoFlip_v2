// Sistema de sonidos para el juego
export class SoundSystem {
  private static instance: SoundSystem;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private isEnabled: boolean = true;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
  }

  public static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  // Crear sonidos sintéticos más suaves y envolventes
  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer | null {
    if (!this.audioContext) return null;
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3); // Envelope suave
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.2;
    }
    
    return buffer;
  }

  // Crear sonido de burbujita suave
  private createBubbleTone(frequency: number, duration: number): AudioBuffer | null {
    if (!this.audioContext) return null;
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Envelope suave como una burbuja que se forma
      const envelope = Math.exp(-t * 4) * Math.sin(t * 30) * 0.3 + 0.7;
      
      // Sonido de burbuja con múltiples armónicos suaves
      const bubble = Math.sin(2 * Math.PI * frequency * t) + 
                     Math.sin(2 * Math.PI * frequency * 1.2 * t) * 0.4 +
                     Math.sin(2 * Math.PI * frequency * 1.8 * t) * 0.2 +
                     Math.sin(2 * Math.PI * frequency * 2.3 * t) * 0.1;
      
      // Agregar un poco de ruido suave para simular el "pop" de la burbuja
      const noise = (Math.random() - 0.5) * 0.05;
      
      data[i] = (bubble + noise) * envelope * 0.12;
    }
    
    return buffer;
  }

  // Crear sonido de click suave
  private createClickTone(frequency: number, duration: number): AudioBuffer | null {
    if (!this.audioContext) return null;
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 8);
      const click = Math.sin(2 * Math.PI * frequency * t) * envelope;
      data[i] = click * 0.1;
    }
    
    return buffer;
  }

  // Crear sonido de pop suave
  private createPopTone(frequency: number, duration: number): AudioBuffer | null {
    if (!this.audioContext) return null;
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 6) * (1 - t / duration);
      const pop = Math.sin(2 * Math.PI * frequency * t) + 
                  Math.sin(2 * Math.PI * frequency * 2 * t) * 0.3;
      data[i] = pop * envelope * 0.15;
    }
    
    return buffer;
  }

  // Crear sonido de cristal/glass
  private createCrystalTone(frequency: number, duration: number): AudioBuffer | null {
    if (!this.audioContext) return null;
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 4) * Math.sin(t * 20) * 0.5 + 0.5;
      const crystal = Math.sin(2 * Math.PI * frequency * t) + 
                      Math.sin(2 * Math.PI * frequency * 2.1 * t) * 0.4 +
                      Math.sin(2 * Math.PI * frequency * 3.2 * t) * 0.2;
      data[i] = crystal * envelope * 0.12;
    }
    
    return buffer;
  }

  // Crear sonido de moneda suave
  private createCoinTone(frequency: number, duration: number): AudioBuffer | null {
    if (!this.audioContext) return null;
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 6) * (1 - t / duration);
      const coin = Math.sin(2 * Math.PI * frequency * t) + 
                   Math.sin(2 * Math.PI * frequency * 1.8 * t) * 0.5 +
                   Math.sin(2 * Math.PI * frequency * 2.7 * t) * 0.3;
      data[i] = coin * envelope * 0.18;
    }
    
    return buffer;
  }

  // Crear sonido de victoria épica pero suave
  private createVictoryTone(frequency: number, duration: number): AudioBuffer | null {
    if (!this.audioContext) return null;
    
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 1.5) * (1 - t / duration);
      const victory = Math.sin(2 * Math.PI * frequency * t) + 
                      Math.sin(2 * Math.PI * frequency * 1.25 * t) * 0.6 +
                      Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.4 +
                      Math.sin(2 * Math.PI * frequency * 2 * t) * 0.2;
      data[i] = victory * envelope * 0.2;
    }
    
    return buffer;
  }

  // Inicializar sonidos
  public async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    // Evitar inicialización múltiple
    if (this.audioElements.size > 0) {
      console.log('🔊 Sistema de sonidos ya inicializado');
      return;
    }

    try {
      // Usar basePath configurado o fallback
      let soundsPath = '/sistema_apps_upload/memoflip_static/sounds';
      if (typeof window !== 'undefined') {
        const win = window as unknown as { __MEMOFLIP_CONFIG__?: { soundsPath?: string } };
        if (win.__MEMOFLIP_CONFIG__?.soundsPath) {
          soundsPath = win.__MEMOFLIP_CONFIG__.soundsPath;
        }
      }
      
      // Cargar archivos MP3 reales
      await this.loadAudioFile('acierto', `${soundsPath}/acierto.mp3`);
      await this.loadAudioFile('fallo', `${soundsPath}/fallo.mp3`);
      await this.loadAudioFile('cartavolteada', `${soundsPath}/cartavolteada.mp3`);
      await this.loadAudioFile('matchexitoso', `${soundsPath}/matchexitoso.mp3`);
      await this.loadAudioFile('fondo', `${soundsPath}/fondo.mp3`);
      
      // Sonidos sintéticos para acciones menores
      if (this.audioContext) {
        // Opciones para carta volteada
        const cardFlipSound = this.createBubbleTone(660, 0.12);
        if (cardFlipSound) this.sounds.set('cardFlip', cardFlipSound);
        const cardFlipClickSound = this.createClickTone(800, 0.08);
        if (cardFlipClickSound) this.sounds.set('cardFlipClick', cardFlipClickSound);
        
        const cardFlipPopSound = this.createPopTone(600, 0.1);
        if (cardFlipPopSound) this.sounds.set('cardFlipPop', cardFlipPopSound);
        
        // Opciones para match
        const matchSound = this.createCrystalTone(1320, 0.25);
        if (matchSound) this.sounds.set('match', matchSound);
        const matchBellSound = this.createTone(1000, 0.2);
        if (matchBellSound) this.sounds.set('matchBell', matchBellSound);
        
        // Opciones para error
        const errorSound = this.createTone(440, 0.2);
        if (errorSound) this.sounds.set('error', errorSound);
        
        const errorSoftSound = this.createTone(350, 0.15);
        if (errorSoftSound) this.sounds.set('errorSoft', errorSoftSound);
        
        // Moneda
        const coinSound = this.createCoinTone(1760, 0.2);
        if (coinSound) this.sounds.set('coin', coinSound);
      }
      
      console.log('🔊 Sistema de sonidos con MP3 reales inicializado');
    } catch (error) {
      console.warn('⚠️ Error inicializando sonidos:', error);
    }
  }

  // Cargar archivo de audio MP3
  private async loadAudioFile(name: string, url: string): Promise<void> {
    try {
      // Evitar cargar el mismo archivo múltiples veces
      if (this.audioElements.has(name)) {
        return;
      }
      
      const audio = new Audio(url);
      audio.preload = 'auto';
      this.audioElements.set(name, audio);
      console.log(`🔊 Cargado: ${name} desde ${url}`);
    } catch (error) {
      console.warn(`⚠️ Error cargando ${name}:`, error);
    }
  }

  // Reproducir sonido
  public play(soundName: string): void {
    if (!this.isEnabled) return;

    try {
      // Reproducir archivo MP3 si existe
      if (this.audioElements.has(soundName)) {
        const audio = this.audioElements.get(soundName);
        if (audio) {
          audio.currentTime = 0; // Reiniciar desde el principio
          audio.play().catch(error => {
            console.warn(`⚠️ Error reproduciendo MP3 ${soundName}:`, error);
          });
          return;
        }
      }

      // Reproducir sonido sintético si existe
      if (this.audioContext && this.sounds.has(soundName)) {
        const buffer = this.sounds.get(soundName);
        if (!buffer) return;

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioContext.destination);
        source.start();
      }
    } catch (error) {
      console.warn('⚠️ Error reproduciendo sonido:', error);
    }
  }

  // Reproducir sonido de fondo con bucle
  public playBackgroundMusic(): void {
    if (!this.isEnabled) return;

    try {
      const audio = this.audioElements.get('fondo');
      if (audio) {
        audio.loop = true;
        audio.volume = 0.3; // Volumen más bajo para música de fondo
        audio.play().catch(error => {
          console.warn('⚠️ Error reproduciendo música de fondo:', error);
        });
      }
    } catch (error) {
      console.warn('⚠️ Error al intentar reproducir música de fondo:', error);
    }
  }

  // Parar música de fondo
  public stopBackgroundMusic(): void {
    try {
      const audio = this.audioElements.get('fondo');
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch (error) {
      console.warn('⚠️ Error al parar música de fondo:', error);
    }
  }

  // Activar/desactivar sonidos
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    // Si se desactivan los sonidos, parar la música de fondo
    if (!enabled) {
      this.stopBackgroundMusic();
    }
  }

  // Verificar si los sonidos están habilitados
  public isSoundEnabled(): boolean {
    return this.isEnabled;
  }
}

// Instancia global
export const soundSystem = SoundSystem.getInstance();
