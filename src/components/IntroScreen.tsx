'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, User } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import UserModal from './UserModal';
import { User as UserType } from '@/types/game';

interface IntroScreenProps {
  onStartGame: () => void;
}

export default function IntroScreen({
  onStartGame
}: IntroScreenProps) {
  const [fallingCards, setFallingCards] = useState<Array<{ id: number; left: string; duration: string }>>([]);
  const [isClient, setIsClient] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const { loadProgress, getProgress, currentUser, setCurrentUser } = useGameStore();
  const progress = getProgress();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Efecto de cartas cayendo (adaptado del código original)
  useEffect(() => {
    const createFallingCard = () => {
      const newCard = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100 + '%',
        duration: (Math.random() * 4 + 3) + 's'
      };
      
      setFallingCards(prev => [...prev, newCard]);
      
      // Remover la carta después de 7 segundos
      setTimeout(() => {
        setFallingCards(prev => prev.filter(card => card.id !== newCard.id));
      }, 7000);
    };

    // Crear cartas cada 1.5s
    const interval = setInterval(createFallingCard, 1500);
    
    // Crear algunas cartas iniciales con retraso
    for (let i = 0; i < 3; i++) {
      setTimeout(createFallingCard, i * 500);
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const handleUserSave = (user: UserType) => {
    setCurrentUser(user);
    setShowUserModal(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Efecto de cartas cayendo */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        {fallingCards.map((card) => (
          <motion.div
            key={card.id}
            className="absolute w-10 h-12 rounded-lg shadow-lg"
            style={{
              left: card.left,
              background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
              animation: `fall ${card.duration} linear infinite`
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />
        ))}
      </div>

      {/* Contenedor principal */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center bg-white/10 backdrop-blur-xl rounded-3xl p-12 md:p-16 shadow-2xl border-2 border-white/20 max-w-lg w-full mx-4"
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/logo.png" 
                alt="MemoFlip" 
                className="max-w-48 h-auto drop-shadow-lg"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
              />
            </div>
          </motion.div>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-white/90 mb-12 font-medium leading-relaxed"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}
          >
            ¡No es un simple juego de memoria! Supera mecánicas desafiantes
          </motion.p>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="space-y-4"
          >
            {/* Botón principal JUGAR */}
            <motion.button
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStartGame}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-xl md:text-2xl py-4 px-8 rounded-full shadow-xl border-3 border-white hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
              style={{ boxShadow: '0 8px 20px rgba(255, 215, 0, 0.4)' }}
            >
              <Play className="w-6 h-6" />
              JUGAR
            </motion.button>

            {/* Botón Identificarse */}
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowUserModal(true)}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-medium text-lg py-3 px-6 rounded-full border border-white/30 hover:border-white/50 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm"
            >
              <User className="w-5 h-5" />
              {currentUser ? 'Actualizar Perfil' : 'Identificarse'}
            </motion.button>

          </motion.div>

          {/* Información del progreso */}
          {isClient && progress.level > 1 && (
            <div className="mt-8 text-white/70 text-sm">
              Nivel: {progress.level} | Monedas: {progress.coins}
            </div>
          )}
        </motion.div>
      </div>

      {/* Copyright */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="fixed bottom-5 left-1/2 transform -translate-x-1/2 text-white/70 text-sm text-center z-20"
      >
        © 2024 @intocables13 - Todos los derechos reservados
      </motion.div>

      {/* Modal de Usuario */}
      <UserModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onSave={handleUserSave}
        currentUser={currentUser}
      />

      {/* CSS para la animación de caída */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateY(calc(100vh + 100px)) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}