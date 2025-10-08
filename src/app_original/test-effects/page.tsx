'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TestEffects() {
  const [selectedEffect, setSelectedEffect] = useState<string>('flip3d');
  const [isFlipped, setIsFlipped] = useState(false);

  const effects = {
    flip3d: {
      name: 'Giro 3D (actual)',
      component: (
        <div className="[perspective:1000px]">
          <motion.div
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-24 h-32 rounded-xl cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div
              className="absolute inset-0 flex items-center justify-center rounded-xl"
              style={{
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              <span className="text-white text-2xl">?</span>
            </div>
            <div
              className="absolute inset-0 flex items-center justify-center rounded-xl"
              style={{
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                border: '2px solid rgba(0,0,0,0.1)'
              }}
            >
              <span className="text-blue-600 text-2xl font-bold">A</span>
            </div>
          </motion.div>
        </div>
      )
    },
    flipSmooth: {
      name: 'Giro Suave',
      component: (
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-24 h-32 rounded-xl cursor-pointer [perspective:1000px]"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            <span className="text-white text-2xl">?</span>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              border: '2px solid rgba(0,0,0,0.1)'
            }}
          >
            <span className="text-blue-600 text-2xl font-bold">A</span>
          </div>
        </motion.div>
      )
    },
    slide: {
      name: 'Deslizamiento',
      component: (
        <motion.div
          animate={{ x: isFlipped ? 100 : 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="relative w-24 h-32 rounded-xl cursor-pointer overflow-hidden"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            <span className="text-white text-2xl">?</span>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              border: '2px solid rgba(0,0,0,0.1)'
            }}
          >
            <span className="text-blue-600 text-2xl font-bold">A</span>
          </div>
        </motion.div>
      )
    },
    scale: {
      name: 'Escala',
      component: (
        <motion.div
          animate={{ scale: isFlipped ? 0 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative w-24 h-32 rounded-xl cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            <span className="text-white text-2xl">?</span>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              border: '2px solid rgba(0,0,0,0.1)'
            }}
          >
            <span className="text-blue-600 text-2xl font-bold">A</span>
          </div>
        </motion.div>
      )
    },
    fade: {
      name: 'Desvanecimiento',
      component: (
        <motion.div
          animate={{ opacity: isFlipped ? 0 : 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="relative w-24 h-32 rounded-xl cursor-pointer"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}
          >
            <span className="text-white text-2xl">?</span>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
              border: '2px solid rgba(0,0,0,0.1)'
            }}
          >
            <span className="text-blue-600 text-2xl font-bold">A</span>
          </div>
        </motion.div>
      )
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          🎨 Test de Efectos de Cartas
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Selector de efectos */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Efectos Disponibles</h2>
            <div className="space-y-3">
              {Object.entries(effects).map(([key, effect]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedEffect(key);
                    setIsFlipped(false);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedEffect === key
                      ? 'bg-yellow-400 text-black font-bold'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {effect.name}
                </button>
              ))}
            </div>
          </div>

          {/* Vista previa */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Vista Previa</h2>
            <div className="flex justify-center items-center h-64">
              {effects[selectedEffect as keyof typeof effects].component}
            </div>
            <div className="text-center mt-4">
              <p className="text-white/80 mb-2">Haz clic en la carta para probar</p>
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
              >
                {isFlipped ? 'Volver a ?' : 'Mostrar A'}
              </button>
            </div>
          </div>
        </div>

        {/* Botón para aplicar */}
        <div className="text-center mt-8">
          <button
            onClick={() => {
              alert(`Efecto seleccionado: ${effects[selectedEffect as keyof typeof effects].name}`);
            }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold py-3 px-8 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105"
          >
            ✅ Aplicar Este Efecto
          </button>
        </div>
      </div>
    </div>
  );
}
