'use client';

import { useState } from 'react';
import { X, Mail, RefreshCw } from 'lucide-react';
import { memoflipApi } from '@/lib/capacitorApi';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  onVerificationSuccess: () => void;
}

export default function VerificationModal({ 
  isOpen, 
  onClose, 
  email,
  onVerificationSuccess 
}: VerificationModalProps) {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resending, setResending] = useState(false);

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (codigo.length !== 6) {
      setError('El código debe tener 6 dígitos');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const data = await memoflipApi('auth.php', {
        method: 'POST',
        body: {
          action: 'verify_code',
          email: email,
          codigo: codigo
        }
      }) as { success: boolean; message?: string; error?: string };

      if (data.success) {
        setSuccess('¡Cuenta verificada correctamente!');
        setTimeout(() => {
          onVerificationSuccess();
          onClose();
        }, 1500);
      } else {
        setError(data.error || 'Código incorrecto');
      }
    } catch (err) {
      setError('Error al verificar el código');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResending(true);
    setError('');
    setSuccess('');
    
    try {
      const data = await memoflipApi('auth.php', {
        method: 'POST',
        body: {
          action: 'resend_code',
          email: email
        }
      }) as { success: boolean; message?: string; error?: string };

      if (data.success) {
        setSuccess('Código reenviado a tu email');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Error al reenviar el código');
      }
    } catch (err) {
      setError('Error al reenviar el código');
      console.error('Error:', err);
    } finally {
      setResending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCodigo(value);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-800 via-purple-900 to-slate-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/10 border border-white/20">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Verificar Email</h2>
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
            {/* Información */}
            <div className="text-center space-y-2">
              <p className="text-white text-lg">
                Hemos enviado un código de verificación a:
              </p>
              <p className="text-yellow-400 font-semibold text-xl">
                {email}
              </p>
              <p className="text-gray-400 text-sm">
                Introduce el código de 6 dígitos para activar tu cuenta
              </p>
            </div>

            {/* Input del código */}
            <div className="space-y-2">
              <label className="block text-white font-medium">
                Código de Verificación
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={codigo}
                onChange={handleInputChange}
                placeholder="000000"
                className="w-full px-6 py-4 text-center text-3xl font-bold tracking-widest bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-yellow-400 transition"
                disabled={loading}
              />
            </div>

            {/* Mensajes de error/éxito */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/20 border border-red-400/30">
                <p className="text-red-400 text-center font-medium">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 rounded-xl bg-green-500/20 border border-green-400/30">
                <p className="text-green-400 text-center font-medium">{success}</p>
              </div>
            )}

            {/* Botones */}
            <div className="space-y-3">
              {/* Botón Verificar */}
              <button
                onClick={handleVerify}
                disabled={loading || codigo.length !== 6}
                className="w-full py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-lg rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : 'Verificar Código'}
              </button>

              {/* Botón Reenviar */}
              <button
                onClick={handleResendCode}
                disabled={resending}
                className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={`w-5 h-5 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </div>

            {/* Información adicional */}
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-400">
                El código expira en <span className="text-yellow-400 font-semibold">24 horas</span>
              </p>
              <p className="text-xs text-gray-500">
                Si no recibes el email, revisa tu carpeta de spam
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

