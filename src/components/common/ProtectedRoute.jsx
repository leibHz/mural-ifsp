/**
 * CAMINHO: src/components/common/ProtectedRoute.jsx
 * 
 * Componente para proteger rotas que precisam de autenticação
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';

function ProtectedRoute({ children, requireAdmin = false, requireStudent = false }) {
  const { isAuthenticated, isEmailVerified, isAdmin, isStudent, loading } = useAuth();

  // Mostrar loading enquanto verifica
  if (loading) {
    return (
      <div 
        className="flex-center" 
        style={{ 
          minHeight: '100vh', 
          background: 'var(--bg-dark)',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <div className="spinner" style={{ width: '60px', height: '60px' }} />
        <p style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
          Verificando permissões...
        </p>
      </div>
    );
  }

  // Verificar se está autenticado
  if (!isAuthenticated()) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // Verificar se o email foi verificado
  if (!isEmailVerified()) {
    return (
      <div 
        className="flex-center" 
        style={{ 
          minHeight: '100vh', 
          background: 'var(--bg-dark)',
          padding: '2rem',
        }}
      >
        <div 
          className="card glass" 
          style={{ 
            maxWidth: '500px', 
            textAlign: 'center',
            padding: '3rem',
          }}
        >
          <div 
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              background: 'rgba(251, 191, 36, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '3rem' }}>⚠️</span>
          </div>
          <h2 style={{ color: 'var(--color-warning)', marginBottom: '1rem' }}>
            Email Não Verificado
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Por favor, verifique seu email antes de acessar esta página.
            Enviamos um código de verificação para seu email.
          </p>
          <button
            onClick={() => window.location.href = ROUTES.REGISTER}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Verificar Email
          </button>
        </div>
      </div>
    );
  }

  // Verificar se precisa ser admin
  if (requireAdmin && !isAdmin) {
    return (
      <div 
        className="flex-center" 
        style={{ 
          minHeight: '100vh', 
          background: 'var(--bg-dark)',
          padding: '2rem',
        }}
      >
        <div 
          className="card glass" 
          style={{ 
            maxWidth: '500px', 
            textAlign: 'center',
            padding: '3rem',
          }}
        >
          <div 
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              background: 'rgba(220, 38, 38, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '3rem' }}>🚫</span>
          </div>
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>
            Acesso Negado
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Você não tem permissão para acessar esta página.
            Apenas administradores podem acessar o painel administrativo.
          </p>
          <button
            onClick={() => window.location.href = ROUTES.HOME}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  // Verificar se precisa ser estudante
  if (requireStudent && !isStudent()) {
    return (
      <div 
        className="flex-center" 
        style={{ 
          minHeight: '100vh', 
          background: 'var(--bg-dark)',
          padding: '2rem',
        }}
      >
        <div 
          className="card glass" 
          style={{ 
            maxWidth: '500px', 
            textAlign: 'center',
            padding: '3rem',
          }}
        >
          <div 
            style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 1.5rem',
              background: 'rgba(220, 38, 38, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '3rem' }}>🎓</span>
          </div>
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>
            Apenas para Estudantes
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Esta funcionalidade está disponível apenas para estudantes do IFSP.
            Visitantes podem comentar e visualizar postagens.
          </p>
          <button
            onClick={() => window.location.href = ROUTES.HOME}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Voltar para Home
          </button>
        </div>
      </div>
    );
  }

  // Se passou em todas as verificações, renderizar o conteúdo
  return children;
}

export default ProtectedRoute;