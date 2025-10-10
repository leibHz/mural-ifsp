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

// Constantes
import { ROUTES } from './utils/constants';

// Páginas (serão criadas nas próximas fases)
// import Home from './pages/Home';
// import Login from './pages/Login';
// import Register from './pages/Register';
// import Profile from './pages/Profile';
// import Admin from './pages/Admin';

function App() {
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
  }, []);

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
        {/* Rota temporária até criarmos as páginas */}
        <Route
          path={ROUTES.HOME}
          element={
            <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '2rem' }}>
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
                <div style={{ marginTop: '3rem', padding: '2rem', background: '#1A1A1A', borderRadius: '12px', maxWidth: '600px' }}>
                  <h2 style={{ color: '#10B981', marginBottom: '1rem' }}>✅ Configuração Inicial Completa!</h2>
                  <p style={{ color: '#A3A3A3', lineHeight: '1.8' }}>
                    O projeto está configurado e pronto para desenvolvimento.<br />
                    As próximas fases incluirão:<br /><br />
                    <strong style={{ color: '#0B6623' }}>• Sistema de Autenticação</strong><br />
                    <strong style={{ color: '#0B6623' }}>• Páginas e Componentes</strong><br />
                    <strong style={{ color: '#0B6623' }}>• Upload de Mídia</strong><br />
                    <strong style={{ color: '#0B6623' }}>• Painel Administrativo</strong>
                  </p>
                </div>
              </div>
            </div>
          }
        />

        {/* Rotas comentadas - serão ativadas quando criarmos as páginas */}
        {/* <Route path={ROUTES.HOME} element={<Home />} /> */}
        {/* <Route path={ROUTES.LOGIN} element={<Login />} /> */}
        {/* <Route path={ROUTES.REGISTER} element={<Register />} /> */}
        {/* <Route path={ROUTES.PROFILE} element={<Profile />} /> */}
        {/* <Route path={ROUTES.ADMIN} element={<Admin />} /> */}

        {/* Rota 404 - Redirecionar para home */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </Router>
  );
}

export default App;