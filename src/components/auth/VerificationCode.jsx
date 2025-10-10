/**
 * CAMINHO: src/components/auth/VerificationCode.jsx
 * 
 * Componente para verificação de email com código de 4 dígitos
 */

import { useState, useRef, useEffect } from 'react';
import { FiMail, FiCheck, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { verifyEmailCode, resendVerificationCode } from '../../services/auth';

function VerificationCode({ userId, onSuccess, onBack }) {
  const [code, setCode] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos em segundos
  
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  // Timer de expiração
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Focar no primeiro input ao montar
  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Permitir apenas números
    if (value && !/^\d$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Mover para o próximo input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
    
    // Verificar automaticamente quando completar os 4 dígitos
    if (newCode.every(digit => digit !== '') && index === 3) {
      handleVerify(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: voltar para o input anterior
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    
    // Setas: navegar entre inputs
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Verificar se são 4 dígitos
    if (/^\d{4}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setCode(digits);
      inputRefs[3].current?.focus();
      
      // Verificar automaticamente
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeToVerify = null) => {
    const fullCode = codeToVerify || code.join('');
    
    if (fullCode.length !== 4) {
      toast.error('Digite o código completo');
      return;
    }
    
    setLoading(true);
    
    const result = await verifyEmailCode(userId, fullCode);
    
    if (result.success) {
      toast.success(result.message);
      onSuccess();
    } else {
      toast.error(result.error);
      // Limpar código em caso de erro
      setCode(['', '', '', '']);
      inputRefs[0].current?.focus();
    }
    
    setLoading(false);
  };

  const handleResend = async () => {
    setResending(true);
    
    const result = await resendVerificationCode(userId);
    
    if (result.success) {
      toast.success(result.message);
      setTimeLeft(900); // Resetar timer
      setCode(['', '', '', '']);
      inputRefs[0].current?.focus();
      
      // Mostrar código no console (apenas para desenvolvimento)
      if (result.verificationCode) {
        console.log('🔐 Novo código:', result.verificationCode);
      }
    } else {
      toast.error(result.error);
    }
    
    setResending(false);
  };

  // Formatar tempo restante
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card glass" style={{ maxWidth: '450px', width: '100%' }}>
      {/* Botão voltar */}
      {onBack && (
        <button
          onClick={onBack}
          className="btn btn-ghost"
          style={{ 
            marginBottom: '1rem',
            width: 'auto',
            padding: '0.5rem',
          }}
        >
          <FiArrowLeft />
        </button>
      )}

      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div 
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1rem',
            background: 'rgba(11, 102, 35, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="pulse"
        >
          <FiMail size={40} color="var(--color-primary)" />
        </div>
        
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          Verifique seu Email
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Enviamos um código de 4 dígitos para seu email
        </p>
      </div>

      {/* Inputs de código */}
      <div 
        className="flex-center" 
        style={{ 
          gap: '1rem', 
          marginBottom: '2rem',
        }}
      >
        {code.map((digit, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={index === 0 ? handlePaste : undefined}
            disabled={loading}
            style={{
              width: '4rem',
              height: '4.5rem',
              fontSize: '2rem',
              textAlign: 'center',
              fontWeight: '700',
              fontFamily: 'monospace',
              background: 'var(--bg-hover)',
              border: `2px solid ${digit ? 'var(--color-primary)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-lg)',
              color: 'var(--text-primary)',
              transition: 'all var(--transition-fast)',
            }}
            className={digit ? 'bounce-in' : ''}
          />
        ))}
      </div>

      {/* Timer de expiração */}
      {timeLeft > 0 ? (
        <div 
          style={{ 
            textAlign: 'center', 
            marginBottom: '1.5rem',
            padding: '0.75rem',
            background: 'rgba(11, 102, 35, 0.1)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p style={{ 
            color: 'var(--color-primary-light)', 
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
          }}>
            ⏱️ Código expira em: {formatTime(timeLeft)}
          </p>
        </div>
      ) : (
        <div 
          style={{ 
            textAlign: 'center', 
            marginBottom: '1.5rem',
            padding: '0.75rem',
            background: 'rgba(220, 38, 38, 0.1)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          <p style={{ 
            color: 'var(--color-danger)', 
            fontSize: 'var(--text-sm)',
            fontWeight: '600',
          }}>
            ⚠️ Código expirado! Solicite um novo código.
          </p>
        </div>
      )}

      {/* Botão de verificar */}
      <button
        onClick={() => handleVerify()}
        className="btn btn-primary"
        disabled={loading || code.some(d => d === '')}
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {loading ? (
          <>
            <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
            Verificando...
          </>
        ) : (
          <>
            <FiCheck />
            Verificar Código
          </>
        )}
      </button>

      {/* Botão de reenviar */}
      <button
        onClick={handleResend}
        className="btn btn-ghost"
        disabled={resending}
        style={{ width: '100%' }}
      >
        {resending ? (
          <>
            <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
            Reenviando...
          </>
        ) : (
          <>
            <FiRefreshCw />
            Reenviar Código
          </>
        )}
      </button>

      {/* Dica */}
      <div 
        style={{ 
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--bg-hover)',
          borderRadius: 'var(--radius-md)',
          borderLeft: '4px solid var(--color-info)',
        }}
      >
        <p style={{ 
          color: 'var(--text-secondary)', 
          fontSize: 'var(--text-xs)',
          lineHeight: '1.6',
        }}>
          💡 <strong>Dica:</strong> Não recebeu o código? Verifique sua caixa de spam ou lixo eletrônico.
        </p>
      </div>
    </div>
  );
}

export default VerificationCode;