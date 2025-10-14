'use client';

import { useState } from 'react';
import { X, User, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { memoflipApi } from '@/lib/capacitorApi';
import VerificationModal from './VerificationModal';

interface SessionUser {
  email: string;
  nombre: string;
  authenticated: boolean;
  game_data?: {
    max_level_unlocked: number;
    coins_total: number;
    lives_current: number;
    sound_enabled: boolean;
  };
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (userData: SessionUser, email: string, password: string) => void;
}

export default function UserModal({ isOpen, onClose, onLoginSuccess }: UserModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nombre: '',
    nick: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validaciones básicas
    if (!formData.email || !formData.password) {
      setErrors({ general: 'Email y contraseña son obligatorios' });
      return;
    }
    
    if (activeTab === 'register') {
      if (!formData.nombre || !formData.nick) {
        setErrors({ general: 'Todos los campos son obligatorios' });
        return;
      }
      
      if (!formData.confirmPassword) {
        setErrors({ general: 'Debes confirmar tu contraseña' });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setErrors({ general: 'Las contraseñas no coinciden' });
        return;
      }
      
      if (formData.password.length < 6) {
        setErrors({ general: 'La contraseña debe tener al menos 6 caracteres' });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const action = activeTab === 'login' ? 'login' : 'register';
      const body: Record<string, string> = {
        action,
        email: formData.email.trim(),
        password: formData.password
      };
      
      if (activeTab === 'register') {
        body.nombre = formData.nombre.trim();
        body.nick = formData.nick.trim();
      }

      const data = await memoflipApi('auth.php', {
        method: 'POST',
        body: body
      }) as SessionUser & { 
        success?: boolean; 
        error?: string; 
        message?: string;
        requires_verification?: boolean;
        email_sent?: boolean;
      };

      console.log('🔍 Respuesta completa del servidor:', data);
      console.log('🔍 success:', data.success);
      console.log('🔍 requires_verification:', data.requires_verification);

      if (data.success) {
        // Si es registro y requiere verificación
        if (activeTab === 'register' && data.requires_verification) {
          console.log('📧 Registro exitoso, se requiere verificación');
          setRegisteredEmail(formData.email);
          setShowVerification(true);
          // NO mostrar mensaje de éxito aquí, se mostrará en el modal de verificación
        } else {
          // Login normal o registro sin verificación
          console.log('✅ Autenticación exitosa:', data);
          onLoginSuccess(data, formData.email, formData.password);
          onClose();
          // Recargar página para actualizar sesión
          window.location.reload();
        }
      } else {
        // ✅ DETECTAR si el error es por email no verificado
        const errorMsg = data.error || data.message || 'Error en autenticación';
        
        if (errorMsg.toLowerCase().includes('verificar') || errorMsg.toLowerCase().includes('verify')) {
          console.log('📧 Login bloqueado: email no verificado. Abriendo modal de verificación...');
          setRegisteredEmail(formData.email);
          setShowVerification(true);
          setErrors({}); // Limpiar errores
        } else {
          setErrors({ general: errorMsg });
        }
      }
    } catch (error) {
      console.error('❌ Error en autenticación:', error);
      setErrors({ general: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSuccess = async () => {
    console.log('✅ Verificación exitosa, haciendo auto-login...');
    setShowVerification(false);
    
    // AUTO-LOGIN automático después de verificación
    try {
      const loginData = await memoflipApi('auth.php', {
        method: 'POST',
        body: {
          action: 'login',
          email: registeredEmail,
          password: formData.password
        }
      }) as SessionUser & { success?: boolean; error?: string };
      
      if (loginData.success) {
        console.log('✅ Auto-login exitoso después de verificación');
        onLoginSuccess(loginData, registeredEmail, formData.password);
        onClose();
        window.location.reload();
      } else {
        // Si falla auto-login, mostrar mensaje y dejar que entre manualmente
        alert('¡Cuenta verificada! Ya puedes iniciar sesión.');
        setActiveTab('login');
        onClose();
      }
    } catch (error) {
      console.error('❌ Error en auto-login:', error);
      alert('¡Cuenta verificada! Ya puedes iniciar sesión.');
      setActiveTab('login');
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.general) {
      setErrors({});
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
                {activeTab === 'login' ? (
                  <LogIn className="w-6 h-6 text-white" />
                ) : (
                  <UserPlus className="w-6 h-6 text-white" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">
                Identificación
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === 'login'
                  ? 'bg-white/10 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <LogIn className="w-4 h-4 inline mr-2" />
              Entrar
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-all ${
                activeTab === 'register'
                  ? 'bg-white/10 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <UserPlus className="w-4 h-4 inline mr-2" />
              Crear cuenta
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre (solo en register) */}
              {activeTab === 'register' && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Nombre *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Tu nombre completo"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">
                      Nick *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={formData.nick}
                        onChange={(e) => handleInputChange('nick', e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Tu nick de usuario"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </>
              )}

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
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="tu@email.com"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Contraseña *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={activeTab === 'register' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Confirmar Contraseña (solo en register) */}
              {activeTab === 'register' && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Repite tu contraseña"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}

              {/* Error general */}
              {errors.general && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-red-400 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Botón submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {activeTab === 'login' ? 'Entrando...' : 'Registrando...'}
                  </>
                ) : (
                  <>
                    {activeTab === 'login' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                    {activeTab === 'login' ? 'Entrar' : 'Crear cuenta'}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer info */}
          <div className="p-6 border-t border-white/10 bg-white/5">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <p className="text-blue-300 text-sm">
                💡 <strong>Info:</strong> {activeTab === 'login' 
                  ? 'Tu progreso se sincroniza entre dispositivos.' 
                  : 'Crea tu cuenta para guardar tu progreso en la nube.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Verificación */}
      <VerificationModal
        isOpen={showVerification}
        onClose={() => setShowVerification(false)}
        email={registeredEmail}
        onVerificationSuccess={handleVerificationSuccess}
      />
    </div>
  );
}
