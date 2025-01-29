'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, UserCheck, Save, UserPlus } from 'lucide-react';
import { User as UserType, UserFormData } from '@/types/game';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: UserType) => void;
  currentUser?: UserType | null;
}

export default function UserModal({ isOpen, onClose, onSave, currentUser }: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    nickname: currentUser?.nickname || '',
    name: currentUser?.name || '',
    email: currentUser?.email || ''
  });
  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'El nickname es obligatorio';
    } else if (formData.nickname.length < 3) {
      newErrors.nickname = 'El nickname debe tener al menos 3 caracteres';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (formData.name.length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const user: UserType = {
        id: currentUser?.id || `user_${Date.now()}`,
        nickname: formData.nickname.trim(),
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        createdAt: currentUser?.createdAt || Date.now(),
        lastLogin: Date.now(),
        isGuest: false,
        progress: currentUser?.progress || {
          level: 1,
          coins: 0,
          lives: 3,
          lastPlayed: Date.now(),
          totalScore: 0,
          phase: 1
        }
      };

      onSave(user);
      onClose();
    } catch (error) {
      // Error al guardar usuario
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                {currentUser ? (
                  <UserCheck className="w-6 h-6 text-white" />
                ) : (
                  <UserPlus className="w-6 h-6 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {currentUser ? 'Actualizar Perfil' : 'Identificarse'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nickname */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nickname *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => handleInputChange('nickname', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.nickname ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Tu nickname único"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.nickname && (
                  <p className="text-red-400 text-sm">{errors.nickname}</p>
                )}
              </div>

              {/* Nombre */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="Tu nombre completo"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-500' : 'border-white/20'
                    }`}
                    placeholder="tu@email.com"
                    disabled={isSubmitting}
                  />
                </div>
                {errors.email && (
                  <p className="text-red-400 text-sm">{errors.email}</p>
                )}
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/20"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {currentUser ? 'Actualizar' : 'Guardar'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-blue-300 text-sm">
                💡 <strong>Información:</strong> Tus datos se guardan localmente en tu dispositivo. 
                {currentUser ? ' Actualiza tu información cuando quieras.' : ' Puedes identificarte más tarde si cambias de opinión.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
