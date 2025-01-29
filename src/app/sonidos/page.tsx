'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { soundSystem } from '@/lib/soundSystem';
import { Volume2, VolumeX, Play, RotateCcw } from 'lucide-react';

export default function SonidosPage() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSounds, setSelectedSounds] = useState({
    cardFlip: 'bubble',
    match: 'crystal',
    error: 'tone',
    coin: 'coin',
    levelComplete: 'acierto',
    levelFailed: 'fallo'
  });

  // Inicializar sistema de sonidos
  useEffect(() => {
    soundSystem.initialize();
  }, []);

  // Función para alternar sonidos
  const toggleSound = () => {
    const newSoundState = !soundEnabled;
    setSoundEnabled(newSoundState);
    soundSystem.setEnabled(newSoundState);
    
    if (newSoundState) {
      soundSystem.play('cardFlip');
    }
  };

  // Función para probar sonido
  const testSound = (soundName: string) => {
    if (soundEnabled) {
      soundSystem.play(soundName);
    }
  };

  // Función para cambiar sonido seleccionado
  const changeSound = (category: string, soundType: string) => {
    setSelectedSounds(prev => ({
      ...prev,
      [category]: soundType
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">🎵 Prueba de Sonidos</h1>
          <p className="text-lg text-gray-300 mb-6">
            Prueba todos los sonidos del juego y elige cuáles te gustan más
          </p>
          
          {/* Control de sonidos */}
          <button
            onClick={toggleSound}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition mx-auto"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
            {soundEnabled ? "Sonidos Activados" : "Sonidos Desactivados"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Carta Volteada */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🫧 Carta Volteada
            </h2>
            <p className="text-gray-300 mb-4">
              Sonido cuando haces clic en una carta
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => testSound('cartavolteada')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-400/30 rounded-lg hover:bg-blue-500/30 transition"
              >
                <Play className="w-4 h-4" />
                🎵 Carta Volteada (MP3 Real)
              </button>
              <button
                onClick={() => testSound('cardFlip')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-lg hover:bg-blue-500/20 transition"
              >
                <Play className="w-4 h-4" />
                🫧 Burbujita (Sintético)
              </button>
              <button
                onClick={() => testSound('cardFlipClick')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-400/20 rounded-lg hover:bg-blue-500/20 transition"
              >
                <Play className="w-4 h-4" />
                🔘 Click Suave
              </button>
            </div>
          </div>

          {/* Match Exitoso */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              ✨ Match Exitoso
            </h2>
            <p className="text-gray-300 mb-4">
              Sonido cuando encuentras una pareja
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => testSound('matchexitoso')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-lg hover:bg-green-500/30 transition"
              >
                <Play className="w-4 h-4" />
                🎵 Match Exitoso (MP3 Real)
              </button>
              <button
                onClick={() => testSound('match')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-400/20 rounded-lg hover:bg-green-500/20 transition"
              >
                <Play className="w-4 h-4" />
                ✨ Cristal (Sintético)
              </button>
            </div>
          </div>

          {/* Error/Fallo */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              ❌ Error/Fallo
            </h2>
            <p className="text-gray-300 mb-4">
              Sonido cuando no encuentras la pareja
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => testSound('error')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-400/30 rounded-lg hover:bg-red-500/30 transition"
              >
                <Play className="w-4 h-4" />
                ❌ Tono (Actual)
              </button>
              <button
                onClick={() => testSound('errorSoft')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-400/20 rounded-lg hover:bg-red-500/20 transition"
              >
                <Play className="w-4 h-4" />
                🔇 Tono Suave
              </button>
            </div>
          </div>

          {/* Moneda */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🪙 Moneda
            </h2>
            <p className="text-gray-300 mb-4">
              Sonido cuando ganas monedas
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => testSound('coin')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-400/30 rounded-lg hover:bg-yellow-500/30 transition"
              >
                <Play className="w-4 h-4" />
                Probar Moneda (Actual)
              </button>
            </div>
          </div>

          {/* Nivel Completado */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🏆 Nivel Completado
            </h2>
            <p className="text-gray-300 mb-4">
              Sonido cuando completas un nivel (MP3 real)
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => testSound('acierto')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/30 rounded-lg hover:bg-emerald-500/30 transition"
              >
                <Play className="w-4 h-4" />
                Probar Acierto.mp3
              </button>
            </div>
          </div>

          {/* Nivel Fallido */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              💔 Nivel Fallido
            </h2>
            <p className="text-gray-300 mb-4">
              Sonido cuando se agota el tiempo (MP3 real)
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => testSound('fallo')}
                className="w-full flex items-center gap-2 px-4 py-2 bg-rose-500/20 border border-rose-400/30 rounded-lg hover:bg-rose-500/30 transition"
              >
                <Play className="w-4 h-4" />
                Probar Fallo.mp3
              </button>
            </div>
          </div>

          {/* Música de Fondo */}
          <div className="bg-white/10 rounded-xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              🎶 Música de Fondo
            </h2>
            <p className="text-gray-300 mb-4">
              Música que suena durante todo el juego (MP3 real con bucle)
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  soundSystem.playBackgroundMusic();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-400/30 rounded-lg hover:bg-purple-500/30 transition"
              >
                <Play className="w-4 h-4" />
                🎵 Iniciar Música de Fondo
              </button>
              <button
                onClick={() => {
                  soundSystem.stopBackgroundMusic();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-400/20 rounded-lg hover:bg-purple-500/20 transition"
              >
                <VolumeX className="w-4 h-4" />
                🔇 Parar Música de Fondo
              </button>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold mb-4">ℹ️ Información</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Sonidos Sintéticos:</h4>
              <ul className="space-y-1">
                <li>• 🫧 Burbujita: 660Hz, 0.12s</li>
                <li>• ✨ Cristal: 1320Hz, 0.25s</li>
                <li>• ❌ Tono: 440Hz, 0.2s</li>
                <li>• 🪙 Moneda: 1760Hz, 0.2s</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Sonidos MP3 Reales:</h4>
              <ul className="space-y-1">
                <li>• 🎵 Carta Volteada: Tu archivo real</li>
                <li>• 🎵 Match Exitoso: Tu archivo real</li>
                <li>• 🏆 Acierto: Tu archivo real</li>
                <li>• 💔 Fallo: Tu archivo real</li>
                <li>• 🎶 Música de Fondo: Tu archivo real (bucle)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botón para volver al juego */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-700 hover:to-blue-700 transition"
          >
            <RotateCcw className="w-4 h-4" />
            Volver al Juego
          </Link>
        </div>
      </div>
    </div>
  );
}
