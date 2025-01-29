'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface VictoryMessageProps {
  isVisible: boolean;
  onComplete?: () => void;
}

export default function VictoryMessage({ isVisible, onComplete }: VictoryMessageProps) {
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = [
    "¡Increíble! 🎉",
    "¡Perfecto! ⭐",
    "¡Excelente trabajo! 🚀",
    "¡Fantástico! 🌟",
    "¡Genial! 🎯",
    "¡Bien hecho! 👏",
    "¡Increíble habilidad! 🏆",
    "¡Perfecto timing! ⏰",
    "¡Excelente memoria! 🧠",
    "¡Fantástico! 🎊"
  ];

  useEffect(() => {
    if (isVisible) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => {
          const nextIndex = (prev + 1) % messages.length;
          setCurrentMessage(messages[nextIndex]);
          return nextIndex;
        });
      }, 2000);

      // Mostrar primer mensaje inmediatamente
      setCurrentMessage(messages[0]);

      return () => clearInterval(interval);
    }
  }, [isVisible, messages]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20 backdrop-blur-sm"
      >
        <motion.div
          key={currentMessage}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="text-4xl font-bold text-white mb-4"
        >
          {currentMessage}
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-white/70 text-lg"
        >
          ¡Sigue así!
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

