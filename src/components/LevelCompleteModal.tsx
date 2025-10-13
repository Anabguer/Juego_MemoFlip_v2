'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Coins, ArrowRight, Home } from 'lucide-react';
import VictoryMessage from './VictoryMessage';

interface LevelCompleteModalProps {
  isOpen: boolean;
  level: number;
  coinsEarned: number;
  timeLeft: number;
  onNextLevel: () => void;
  onBackToMenu: () => void;
  onPlayAgain: () => void;
}

export default function LevelCompleteModal({
  isOpen,
  level,
  coinsEarned,
  timeLeft,
  onNextLevel,
  onBackToMenu,
  onPlayAgain
}: LevelCompleteModalProps) {
  console.log('🎯 LevelCompleteModal renderizado:', { isOpen, level, coinsEarned });
  if (!isOpen) return null;

  return (
    <>
      <VictoryMessage isVisible={isOpen} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-white/20 backdrop-blur-sm"
        >
          {/* Icono de victoria con animación personalizada */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-4 relative"
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto drop-shadow-lg" />
            </motion.div>
            
            {/* Partículas de celebración */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                initial={{ 
                  scale: 0,
                  x: 0,
                  y: 0,
                  opacity: 1
                }}
                animate={{ 
                  scale: [0, 1, 0],
                  x: Math.cos(i * 45 * Math.PI / 180) * 60,
                  y: Math.sin(i * 45 * Math.PI / 180) * 60,
                  opacity: [1, 1, 0]
                }}
                transition={{ 
                  delay: 0.5 + i * 0.1,
                  duration: 1.5,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>

          {/* Título */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-2"
          >
            ¡Nivel Completado!
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/90 text-base mb-4"
          >
            Nivel {level} superado
          </motion.p>

          {/* Estadísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/20 rounded-xl p-3 mb-4 space-y-2"
          >
            <div className="flex items-center justify-center gap-2">
              <Coins className="w-5 h-5 text-yellow-300" />
              <span className="text-white font-semibold">+{coinsEarned} monedas</span>
            </div>
            
            {timeLeft > 0 && (
              <div className="flex items-center justify-center gap-2">
                <Star className="w-5 h-5 text-yellow-300" />
                <span className="text-white font-semibold">Tiempo extra: {timeLeft}s</span>
              </div>
            )}
          </motion.div>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onNextLevel}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-5 h-5" />
              Siguiente Nivel
            </motion.button>

            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onPlayAgain}
                className="bg-white/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                Repetir
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBackToMenu}
                className="bg-white/20 text-white font-semibold py-2 px-4 rounded-lg hover:bg-white/30 transition-all duration-200 flex items-center justify-center gap-1"
              >
                <Home className="w-4 h-4" />
                Menú
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
    </>
  );
}
