'use client';

import { useState } from 'react';
import { X, Mail, Lock, Key, CheckCircle } from 'lucide-react';
import { memoflipApi } from '@/lib/capacitorApi';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
}

type Step = 'email' | 'code' | 'password' | 'success';

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = '' }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState(initialEmail);
  const [codigo, setCodigo] = useState('');
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');

  const handleSendCode = async () => {
    if (!email.trim()) {
      setErrors({ email: 'Email es obligatorio' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const data = await memoflipApi('auth.php', {
        method: 'POST',
        body: {
          action: 'forgot_password',
          email: email.trim()
        }
      }) as { 
        success?: boolean; 
        error?: string; 
        message?: string;
        email_sent?: boolean;
        codigo_dev?: string;
      };

      if (data.success) {
        setSuccess(data.message || 'Código enviado a tu email');
        setStep('code');
        
        // Si no se envió email (desarrollo), mostrar código
        if (!data.email_sent && data.codigo_dev) {
          console.log('🔧 Código de desarrollo:', data.codigo_dev);
          setCodigo(data.codigo_dev);
        }
      } else {
        setErrors({ general: data.error || data.message || 'Error enviando código' });
      }
    } catch (error) {
      console.error('❌ Error enviando código:', error);
      setErrors({ general: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!codigo.trim()) {
      setErrors({ codigo: 'Código es obligatorio' });
      return;
    }

    if (codigo.length !== 6) {
      setErrors({ codigo: 'El código debe tener 6 dígitos' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const data = await memoflipApi('auth.php', {
        method: 'POST',
        body: {
          action: 'reset_password',
          email: email.trim(),
          codigo: codigo.trim(),
          nueva_password: nuevaPassword
        }
      }) as { 
        success?: boolean; 
        error?: string; 
        message?: string;
        password_updated?: boolean;
      };

      if (data.success) {
        setStep('password');
        setErrors({});
      } else {
        setErrors({ general: data.error || data.message || 'Código incorrecto' });
      }
    } catch (error) {
      console.error('❌ Error verificando código:', error);
      setErrors({ general: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!nuevaPassword.trim()) {
      setErrors({ nuevaPassword: 'Nueva contraseña es obligatoria' });
      return;
    }

    if (nuevaPassword.length < 6) {
      setErrors({ nuevaPassword: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    if (!confirmPassword.trim()) {
      setErrors({ confirmPassword: 'Debes confirmar la contraseña' });
      return;
    }

    if (nuevaPassword !== confirmPassword) {
      setErrors({ confirmPassword: 'Las contraseñas no coinciden' });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const data = await memoflipApi('auth.php', {
        method: 'POST',
        body: {
          action: 'reset_password',
          email: email.trim(),
          codigo: codigo.trim(),
          nueva_password: nuevaPassword.trim()
        }
      }) as { 
        success?: boolean; 
        error?: string; 
        message?: string;
        password_updated?: boolean;
      };

      if (data.success) {
        setStep('success');
        setSuccess(data.message || 'Contraseña actualizada correctamente');
      } else {
        setErrors({ general: data.error || data.message || 'Error actualizando contraseña' });
      }
    } catch (error) {
      console.error('❌ Error actualizando contraseña:', error);
      setErrors({ general: 'Error de conexión. Intenta de nuevo.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep('email');
    setEmail('');
    setCodigo('');
    setNuevaPassword('');
    setConfirmPassword('');
    setErrors({});
    setSuccess('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                <Key className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">
                Recuperar contraseña
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Step 1: Email */}
            {step === 'email' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-gray-300">
                    Introduce tu email y te enviaremos un código de recuperación
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({});
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="tu@email.com"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm">{errors.email}</p>
                  )}
                </div>

                {errors.general && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">{errors.general}</p>
                  </div>
                )}

                <button
                  onClick={handleSendCode}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando código...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Enviar código
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Code */}
            {step === 'code' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 mb-4">
                    <p className="text-green-400 text-sm">{success}</p>
                  </div>
                  <p className="text-gray-300">
                    Introduce el código de 6 dígitos que recibiste y tu nueva contraseña
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Email: <span className="text-blue-400">{email}</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Código de verificación *
                  </label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={codigo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setCodigo(value);
                        if (errors.codigo) setErrors({});
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                      placeholder="123456"
                      maxLength={6}
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.codigo && (
                    <p className="text-red-400 text-sm">{errors.codigo}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Nueva contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={nuevaPassword}
                      onChange={(e) => {
                        setNuevaPassword(e.target.value);
                        if (errors.nuevaPassword) setErrors({});
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Mínimo 6 caracteres"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.nuevaPassword && (
                    <p className="text-red-400 text-sm">{errors.nuevaPassword}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Confirmar nueva contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({});
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Repite tu nueva contraseña"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                  )}
                </div>

                {errors.general && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">{errors.general}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('email')}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={isSubmitting || codigo.length !== 6 || !nuevaPassword || !confirmPassword}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Actualizar contraseña
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 'password' && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20 mb-4">
                    <p className="text-green-400 text-sm">¡Código verificado correctamente!</p>
                  </div>
                  <p className="text-gray-300">
                    Ahora introduce tu nueva contraseña
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Nueva contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={nuevaPassword}
                      onChange={(e) => {
                        setNuevaPassword(e.target.value);
                        if (errors.password) setErrors({});
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Mínimo 6 caracteres"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Confirmar contraseña *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (errors.confirmPassword) setErrors({});
                      }}
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Repite tu contraseña"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-400 text-sm">{errors.confirmPassword}</p>
                  )}
                </div>

                {errors.general && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-red-400 text-sm">{errors.general}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('code')}
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
                  >
                    Volver
                  </button>
                  <button
                    onClick={handleResetPassword}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Actualizando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Actualizar
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div className="text-center space-y-6">
                <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-400 mb-2">
                    ¡Contraseña actualizada!
                  </h3>
                  <p className="text-gray-300">{success}</p>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg"
                >
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
