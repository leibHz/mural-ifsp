/**
 * CAMINHO: src/pages/Register.jsx
 * 
 * Página de cadastro
 */

import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import RegisterForm from '../components/auth/RegisterForm';
import VerificationCode from '../components/auth/VerificationCode';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, IFSP_INFO } from '../utils/constants';

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Verificar se veio com dados de verificação
  const needsVerification = location.state?.needsVerification;
  const userId = location.state?.userId;

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, navigate]);

  const handleVerificationSuccess = () => {
    navigate(ROUTES.LOGIN);
  };

  // Se precisa verificar email
  if (needsVerification && userId) {
    return (
      <div 
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: 'var(--bg-dark)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <VerificationCode 
            userId={userId}
            onSuccess={handleVerificationSuccess}
            onBack={() => navigate(ROUTES.LOGIN)}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--bg-dark)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorativo */}
      <div 
        style={{
          position: 'absolute',
          top: '-30%',
          left: '-30%',
          width: '80%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(11, 102, 35, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        className="rotate-slow"
      />

      <div style={{ width: '100%', maxWidth: '1200px', position: 'relative', zIndex: 1 }}>
        <div 
          className="grid" 
          style={{ 
            gridTemplateColumns: window.innerWidth > 768 ? '1fr 1fr' : '1fr',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          {/* Lado esquerdo - Informações */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: window.innerWidth > 768 ? 'left' : 'center' }}
          >
            {/* Logo */}
            <div style={{ marginBottom: '2rem' }}>
              <img 
                src={IFSP_INFO.LOGO_URL}
                alt="Logo IFSP"
                style={{ 
                  height: '80px',
                  marginBottom: '1rem',
                  filter: 'brightness(1.2)',
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <h1 
                style={{ 
                  fontSize: 'var(--text-4xl)', 
                  color: 'var(--color-primary)',
                  marginBottom: '0.5rem',
                  fontWeight: '900',
                }}
              >
                Junte-se a Nós
              </h1>
              <p 
                style={{ 
                  fontSize: 'var(--text-xl)', 
                  color: 'var(--text-secondary)',
                }}
              >
                Faça parte da mudança
              </p>
            </div>

            <div 
              className="card glass" 
              style={{ 
                padding: '2rem',
                borderLeft: '4px solid var(--color-primary)',
              }}
            >
              <h2 
                style={{ 
                  fontSize: 'var(--text-2xl)',
                  marginBottom: '1rem',
                  color: 'var(--text-primary)',
                }}
              >
                Por que se cadastrar?
              </h2>
              
              <div className="flex-col" style={{ gap: '1.5rem' }}>
                <div>
                  <h3 
                    style={{ 
                      color: 'var(--color-primary-light)', 
                      marginBottom: '0.5rem',
                      fontSize: 'var(--text-lg)',
                    }}
                  >
                    📝 Para Estudantes
                  </h3>
                  <ul style={{ 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.8',
                    paddingLeft: '1.5rem',
                  }}>
                    <li>Criar postagens com mídia</li>
                    <li>Comentar em denúncias</li>
                    <li>Acompanhar casos</li>
                    <li>Perfil personalizado</li>
                  </ul>
                </div>

                <div className="divider" />

                <div>
                  <h3 
                    style={{ 
                      color: 'var(--color-primary-light)', 
                      marginBottom: '0.5rem',
                      fontSize: 'var(--text-lg)',
                    }}
                  >
                    👁️ Para Visitantes
                  </h3>
                  <ul style={{ 
                    color: 'var(--text-secondary)', 
                    lineHeight: '1.8',
                    paddingLeft: '1.5rem',
                  }}>
                    <li>Visualizar postagens</li>
                    <li>Comentar e apoiar</li>
                    <li>Acompanhar discussões</li>
                    <li>Contribuir com a causa</li>
                  </ul>
                </div>

                <div 
                  style={{
                    padding: '1rem',
                    background: 'rgba(11, 102, 35, 0.1)',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '1rem',
                  }}
                >
                  <p style={{ 
                    color: 'var(--color-primary-light)', 
                    fontSize: 'var(--text-sm)',
                    textAlign: 'center',
                  }}>
                    🔒 <strong>Seus dados estão seguros!</strong><br />
                    Utilizamos criptografia e proteção de dados.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lado direito - Formulário */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <RegisterForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Register;