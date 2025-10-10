/**
 * CAMINHO: src/App.jsx
 * 
 * Componente principal da aplicação
 * Configura o roteamento e providers
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

// Services
import { checkConnection } from './services/supabase';

// Hooks
import { useAuth, useAuthListener } from './hooks/useAuth';

// Constantes
import { ROUTES } from './utils/constants';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
// import Home from './pages/Home';
// import Profile from './pages/Profile';
// import Admin from './pages/Admin';

function App() {
  const { initialize, loading } = useAuth();

  // Verificar conexão com Supabase ao iniciar
  useEffect(() => {
    const checkSupabaseConnection = async () => {
      const result = await checkConnection();
      if (result.success) {
        console.log('✅', result.message);
      } else {
        console.error('❌ Erro de conexão:', result.message);
      }
    };
    
    checkSupabaseConnection();
    initialize();
  }, [initialize]);

  // Configurar listener de autenticação
  useAuthListener();

  // Mostrar loading enquanto verifica autenticação
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
          Carregando...
        </p>
      </div>
    );
  }

  return (
    <Router>
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        reverseOrder={false}
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
            style: {
              border: '1px solid #10B981',
            },
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#F5F5F5',
            },
            style: {
              border: '1px solid #DC2626',
            },
          },
        }}
      />

      {/* Rotas da Aplicação */}
      <Routes>
        {/* Rotas de Autenticação */}
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />

        {/* Rota temporária - Home */}
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
                  <h2 style={{ color: '#10B981', marginBottom: '1rem' }}>✅ Fase 2: Sistema de Autenticação - COMPLETA!</h2>
                  <p style={{ color: '#A3A3A3', lineHeight: '1.8' }}>
                    Agora você pode:<br /><br />
                    <strong style={{ color: '#0B6623' }}>✓ Fazer login</strong><br />
                    <strong style={{ color: '#0B6623' }}>✓ Cadastrar estudantes (com BP)</strong><br />
                    <strong style={{ color: '#0B6623' }}>✓ Cadastrar visitantes</strong><br />
                    <strong style={{ color: '#0B6623' }}>✓ Verificar email com código de 4 dígitos</strong><br />
                    <strong style={{ color: '#0B6623' }}>✓ Gerenciar sessões</strong>
                  </p>
                  <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
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

        {/* Rotas comentadas - serão ativadas nas próximas fases */}
        {/* <Route path={ROUTES.HOME} element={<Home />} /> */}
        {/* <Route path={ROUTES.PROFILE} element={<Profile />} /> */}
        {/* <Route path={ROUTES.ADMIN} element={<Admin />} /> */}

        {/* Rota 404 - Redirecionar para home */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Router>
  );
}

export default App;