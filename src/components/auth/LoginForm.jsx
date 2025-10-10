/**
 * CAMINHO: src/components/auth/LoginForm.jsx
 * 
 * Formulário de login
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { login } from '../../services/auth';
import { validateLoginForm } from '../../utils/validators';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

function LoginForm() {
  const navigate = useNavigate();
  const { login: setAuthLogin } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pendingUserId, setPendingUserId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
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
    const validation = validateLoginForm(formData);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    // Fazer login
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      toast.success(result.message);
      setAuthLogin(result.user, result.session);
      navigate(ROUTES.HOME);
    } else if (result.needsVerification) {
      setNeedsVerification(true);
      setPendingUserId(result.userId);
      toast.error(result.error);
    } else {
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  const handleGoToVerification = () => {
    navigate(ROUTES.REGISTER, { 
      state: { 
        needsVerification: true,
        userId: pendingUserId 
      } 
    });
  };

  return (
    <div className="card glass" style={{ maxWidth: '450px', width: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          Entrar
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
          Acesse sua conta do Mural IFSP
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="label">
            <FiMail style={{ display: 'inline', marginRight: '0.5rem' }} />
            Email
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>
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
              value={formData.password}
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
        </div>

        {/* Esqueceu a senha */}
        <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
          <a
            href="#"
            style={{
              color: 'var(--color-primary-light)',
              fontSize: 'var(--text-sm)',
              textDecoration: 'none',
            }}
          >
            Esqueceu sua senha?
          </a>
        </div>

        {/* Botão de login */}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          {loading ? (
            <>
              <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }} />
              Entrando...
            </>
          ) : (
            <>
              <FiLogIn />
              Entrar
            </>
          )}
        </button>

        {/* Verificação pendente */}
        {needsVerification && (
          <div
            style={{
              padding: '1rem',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid var(--color-warning)',
              borderRadius: 'var(--radius-md)',
              marginTop: '1rem',
            }}
          >
            <p style={{ color: 'var(--color-warning)', marginBottom: '0.5rem', fontSize: 'var(--text-sm)' }}>
              Seu email ainda não foi verificado.
            </p>
            <button
              type="button"
              onClick={handleGoToVerification}
              className="btn btn-ghost"
              style={{ width: '100%', fontSize: 'var(--text-sm)' }}
            >
              Verificar agora
            </button>
          </div>
        )}

        {/* Link para cadastro */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
            Não tem uma conta?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate(ROUTES.REGISTER);
              }}
              style={{
                color: 'var(--color-primary-light)',
                fontWeight: '600',
              }}
            >
              Cadastre-se
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;