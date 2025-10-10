/**
 * CAMINHO: src/components/auth/RegisterForm.jsx
 * 
 * Formulário de cadastro (estudante e visitante)
 */

import { useState } from 'react';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiCreditCard } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { registerStudent, registerVisitor } from '../../services/auth';
import { 
  validateStudentRegisterForm, 
  validateVisitorRegisterForm 
} from '../../utils/validators';
import VerificationCode from './VerificationCode';

function RegisterForm() {
  const [userType, setUserType] = useState('estudante'); // estudante | visitante
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registeredUserId, setRegisteredUserId] = useState(null);
  const [showVerification, setShowVerification] = useState(false);

  // Dados do formulário de estudante
  const [studentData, setStudentData] = useState({
    fullName: '',
    username: '',
    bp: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Dados do formulário de visitante
  const [visitorData, setVisitorData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const currentData = userType === 'estudante' ? studentData : visitorData;
  const setCurrentData = userType === 'estudante' ? setStudentData : setVisitorData;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar formulário
    const validation = userType === 'estudante' 
      ? validateStudentRegisterForm(currentData)
      : validateVisitorRegisterForm(currentData);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    setPasswordStrength(validation.passwordStrength || 0);
    setLoading(true);
    setErrors({});
    
    // Registrar
    const result = userType === 'estudante'
      ? await registerStudent(currentData)
      : await registerVisitor(currentData);
    
    if (result.success) {
      toast.success(result.message);
      setRegisteredUserId(result.userId);
      setShowVerification(true);
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  const handleVerificationSuccess = () => {
    toast.success('Email verificado! Você já pode fazer login.');
    setShowVerification(false);
    // Resetar formulário
    if (userType === 'estudante') {
      setStudentData({
        fullName: '',
        username: '',
        bp: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    } else {
      setVisitorData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    }
  };

  // Se está mostrando verificação
  if (showVerification && registeredUserId) {
    return (
      <VerificationCode 
        userId={registeredUserId}
        onSuccess={handleVerificationSuccess}
        onBack={() => setShowVerification(false)}
      />
    );
  }

  return (
    <div className="card glass" style={{ maxWidth: '500px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          Criar Conta
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Cadastre-se no Mural IFSP
        </p>
      </div>

      {/* Seletor de tipo de usuário */}
      <div 
        className="flex" 
        style={{ 
          gap: '1rem', 
          marginBottom: '2rem',
          background: 'var(--bg-hover)',
          padding: '0.5rem',
          borderRadius: 'var(--radius-lg)',
        }}
      >
        <button
          type="button"
          onClick={() => setUserType('estudante')}
          className={userType === 'estudante' ? 'btn btn-primary' : 'btn btn-ghost'}
          style={{ 
            flex: 1,
            fontSize: 'var(--text-sm)',
          }}
        >
          <FiCreditCard />
          Estudante
        </button>
        <button
          type="button"
          onClick={() => setUserType('visitante')}
          className={userType === 'visitante' ? 'btn btn-primary' : 'btn btn-ghost'}
          style={{ 
            flex: 1,
            fontSize: 'var(--text-sm)',
          }}
        >
          <FiUser />
          Visitante
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Campos específicos para estudante */}
        {userType === 'estudante' && (
          <>
            {/* Nome Completo */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">
                <FiUser style={{ display: 'inline', marginRight: '0.5rem' }} />
                Nome Completo
              </label>
              <input
                type="text"
                name="fullName"
                value={studentData.fullName}
                onChange={handleChange}
                className={`input ${errors.fullName ? 'input-error' : ''}`}
                placeholder="João Silva Santos"
                disabled={loading}
              />
              {errors.fullName && (
                <p className="error-message">{errors.fullName}</p>
              )}
            </div>

            {/* BP (Prontuário) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label">
                <FiCreditCard style={{ display: 'inline', marginRight: '0.5rem' }} />
                Prontuário (BP)
              </label>
              <input
                type="text"
                name="bp"
                value={studentData.bp}
                onChange={handleChange}
                className={`input ${errors.bp ? 'input-error' : ''}`}
                placeholder="BRG12345"
                disabled={loading}
                maxLength={8}
                style={{ textTransform: 'uppercase' }}
              />
              {errors.bp && (
                <p className="error-message">{errors.bp}</p>
              )}
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Formato: BRG + 5 dígitos (ex: BRG12345)
              </p>
            </div>
          </>
        )}

        {/* Nome de Usuário */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">
            <FiUser style={{ display: 'inline', marginRight: '0.5rem' }} />
            Nome de Usuário
          </label>
          <input
            type="text"
            name="username"
            value={currentData.username}
            onChange={handleChange}
            className={`input ${errors.username ? 'input-error' : ''}`}
            placeholder="joao_silva"
            disabled={loading}
          />
          {errors.username && (
            <p className="error-message">{errors.username}</p>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">
            <FiMail style={{ display: 'inline', marginRight: '0.5rem' }} />
            Email
          </label>
          <input
            type="email"
            name="email"
            value={currentData.email}
            onChange={handleChange}
            className={`input ${errors.email ? 'input-error' : ''}`}
            placeholder="seu@email.com"
            disabled={loading}
          />
          {errors.email && (
            <p className="error-message">{errors.email}</p>
          )}
        </div>

        {/* Senha */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">
            <FiLock style={{ display: 'inline', marginRight: '0.5rem' }} />
            Senha
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={currentData.password}
              onChange={handleChange}
              className={`input ${errors.password ? 'input-error' : ''}`}
              placeholder="••••••••"
              disabled={loading}
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="error-message">{errors.password}</p>
          )}
          
          {/* Indicador de força da senha */}
          {currentData.password && (
            <div style={{ marginTop: '0.5rem' }}>
              <div style={{ 
                height: '4px', 
                background: 'var(--bg-hover)', 
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(passwordStrength / 4) * 100}%`,
                  background: passwordStrength <= 1 ? 'var(--color-danger)' 
                    : passwordStrength === 2 ? 'var(--color-warning)'
                    : passwordStrength === 3 ? 'var(--color-info)'
                    : 'var(--color-success)',
                  transition: 'all var(--transition-normal)',
                }} />
              </div>
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Força: {passwordStrength <= 1 ? 'Fraca' : passwordStrength === 2 ? 'Média' : passwordStrength === 3 ? 'Boa' : 'Forte'}
              </p>
            </div>
          )}
        </div>

        {/* Confirmar Senha */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">
            <FiLock style={{ display: 'inline', marginRight: '0.5rem' }} />
            Confirmar Senha
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={currentData.confirmPassword}
              onChange={handleChange}
              className={`input ${errors.confirmPassword ? 'input-error' : ''}`}
              placeholder="••••••••"
              disabled={loading}
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '0.25rem',
              }}
            >
              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="error-message">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Botão de cadastro */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
              Cadastrando...
            </>
          ) : (
            <>
              <FiUserPlus />
              Criar Conta
            </>
          )}
        </button>

        {/* Link para login */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Já tem uma conta?{' '}
            <a
              href="/login"
              style={{
                color: 'var(--color-primary-light)',
                fontWeight: '600',
              }}
            >
              Fazer login
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default RegisterForm;