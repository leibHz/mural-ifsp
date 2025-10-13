/**
 * CAMINHO: src/App.jsx (OTIMIZADO)
 * 
 * Componente principal da aplicação
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Hooks
import { useAuth, useAuthListener } from './hooks/useAuth';

// Constantes
import { ROUTES } from './utils/constants';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const { loading } = useAuth();

  // Configurar listener (executa apenas uma vez)
  useAuthListener();

  // Loading simplificado
  if (loading) {
    return (
      <div 
        className="flex-center" 
        style={{ 
          minHeight: '100vh', 
          background: 'var(--bg-dark)',
        }}
      >
        <div className="spinner" style={{ width: '50px', height: '50px' }} />
      </div>
    );
  }

  return (
    <Router>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1A1A',
            color: '#F5F5F5',
            border: '1px solid #2A2A2A',
            padding: '16px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#F5F5F5',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#F5F5F5',
            },
          },
        }}
      />

      {/* Rotas da Aplicação */}
      <Routes>
        {/* Rotas de Autenticação */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />

        {/* Rota Home */}
        <Route
          path={ROUTES.HOME}
          element={
            <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: '#0B6623' }}>
                  🎓 Mural IFSP
                </h1>
                <p style={{ fontSize: '1.5rem', color: '#A3A3A3' }}>
                  Bragança Paulista
                </p>
                <p style={{ marginTop: '2rem', fontSize: '1.2rem' }}>
                  Sua voz contra a violência escolar
                </p>
                <div style={{ marginTop: '3rem', padding: '2rem', background: '#1A1A1A', borderRadius: '12px', maxWidth: '700px' }}>
                  <h2 style={{ color: '#10B981', marginBottom: '1rem' }}>✅ Sistema de Autenticação Completo!</h2>
                  <p style={{ color: '#A3A3A3', lineHeight: '1.8' }}>
                    <strong style={{ color: '#0B6623' }}>✓ Login e cadastro funcionando</strong><br />
                    <strong style={{ color: '#0B6623' }}>✓ Verificação de email</strong><br />
                    <strong style={{ color: '#0B6623' }}>✓ Performance otimizada</strong>
                  </p>
                  <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <a 
                      href={ROUTES.LOGIN}
                      className="btn btn-primary"
                    >
                      Fazer Login
                    </a>
                    <a 
                      href={ROUTES.REGISTER}
                      className="btn btn-ghost"
                    >
                      Cadastrar
                    </a>
                  </div>
                </div>
              </div>
            </div>
          }
        />

        {/* Rota 404 */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Router>
  );
}

export default App;