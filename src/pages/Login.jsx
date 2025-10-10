/**
 * CAMINHO: src/pages/Login.jsx
 * 
 * Página de login
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, IFSP_INFO } from '../utils/constants';

function Login() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(ROUTES.HOME);
    }
  }, [isAuthenticated, navigate]);

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
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(11, 102, 35, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
        className="rotate-slow"
      />
      
      <div 
        style={{
          position: 'absolute',
          bottom: '-50%',
          left: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(11, 102, 35, 0.05) 0%, transparent 70%)',
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
                className="gradient-animated"
              >
                Mural IFSP
              </h1>
              <p 
                style={{ 
                  fontSize: 'var(--text-xl)', 
                  color: 'var(--color-primary-light)',
                  fontWeight: '600',
                }}
              >
                {IFSP_INFO.CAMPUS}
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
                Sua voz contra a violência escolar
              </h2>
              <p 
                style={{ 
                  color: 'var(--text-secondary)',
                  lineHeight: '1.8',
                  marginBottom: '1.5rem',
                }}
              >
                O Mural IFSP é uma plataforma segura para denunciar casos de violência escolar. 
                Compartilhe sua história, apoie outros estudantes e ajude a construir um ambiente 
                educacional mais seguro para todos.
              </p>
              
              <div className="flex-col" style={{ gap: '1rem' }}>
                <div className="flex" style={{ gap: '1rem', alignItems: 'flex-start' }}>
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(11, 102, 35, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>🛡️</span>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      Seguro e Anônimo
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                      Suas denúncias são protegidas e moderadas
                    </p>
                  </div>
                </div>

                <div className="flex" style={{ gap: '1rem', alignItems: 'flex-start' }}>
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(11, 102, 35, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>💬</span>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      Compartilhe Mídia
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                      Vídeos, fotos, áudios e documentos
                    </p>
                  </div>
                </div>

                <div className="flex" style={{ gap: '1rem', alignItems: 'flex-start' }}>
                  <div 
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'rgba(11, 102, 35, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>👥</span>
                  </div>
                  <div>
                    <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      Comunidade Unida
                    </h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                      Apoio mútuo entre estudantes e visitantes
                    </p>
                  </div>
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
            <LoginForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Login;