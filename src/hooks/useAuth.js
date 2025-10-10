/**
 * CAMINHO: src/hooks/useAuth.js
 * 
 * Hook customizado para gerenciar autenticação
 * Fornece estado e funções de auth para toda a aplicação
 */

import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, onAuthStateChange } from '../services/supabase';
import { getCurrentUserData, isAdmin } from '../services/auth';

/**
 * Store Zustand para gerenciar estado de autenticação
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Estado
      user: null,
      session: null,
      loading: true,
      isAdmin: false,
      adminLevel: null,
      
      // Ações
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setAdmin: (isAdmin, adminLevel) => set({ isAdmin, adminLevel }),
      
      // Inicializar autenticação
      initialize: async () => {
        try {
          set({ loading: true });
          
          // Verificar sessão atual
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // Buscar dados do usuário
            const result = await getCurrentUserData();
            
            if (result.success) {
              // Verificar se é admin
              const adminCheck = await isAdmin(result.user.id);
              
              set({
                user: result.user,
                session: session,
                isAdmin: adminCheck.isAdmin,
                adminLevel: adminCheck.level,
                loading: false,
              });
            } else {
              set({ user: null, session: null, loading: false });
            }
          } else {
            set({ user: null, session: null, loading: false });
          }
        } catch (error) {
          console.error('Erro ao inicializar auth:', error);
          set({ user: null, session: null, loading: false });
        }
      },
      
      // Login
      login: async (user, session) => {
        const adminCheck = await isAdmin(user.id);
        
        set({
          user,
          session,
          isAdmin: adminCheck.isAdmin,
          adminLevel: adminCheck.level,
          loading: false,
        });
      },
      
      // Logout
      logout: () => {
        set({
          user: null,
          session: null,
          isAdmin: false,
          adminLevel: null,
          loading: false,
        });
      },
      
      // Atualizar usuário
      updateUser: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
      
      // Verificar se está autenticado
      isAuthenticated: () => {
        return get().user !== null && get().session !== null;
      },
      
      // Verificar se o email foi verificado
      isEmailVerified: () => {
        const user = get().user;
        return user?.email_verificado || false;
      },
      
      // Verificar se é estudante
      isStudent: () => {
        const user = get().user;
        return user?.tipo_usuario === 'estudante';
      },
      
      // Verificar se é visitante
      isVisitor: () => {
        const user = get().user;
        return user?.tipo_usuario === 'visitante';
      },
    }),
    {
      name: 'mural-ifsp-auth',
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAdmin: state.isAdmin,
        adminLevel: state.adminLevel,
      }),
    }
  )
);

/**
 * Hook para usar a autenticação
 */
export const useAuth = () => {
  const store = useAuthStore();
  
  return {
    user: store.user,
    session: store.session,
    loading: store.loading,
    isAdmin: store.isAdmin,
    adminLevel: store.adminLevel,
    setUser: store.setUser,
    setSession: store.setSession,
    setLoading: store.setLoading,
    initialize: store.initialize,
    login: store.login,
    logout: store.logout,
    updateUser: store.updateUser,
    isAuthenticated: store.isAuthenticated,
    isEmailVerified: store.isEmailVerified,
    isStudent: store.isStudent,
    isVisitor: store.isVisitor,
  };
};

/**
 * Hook para configurar listener de mudanças de autenticação
 */
export const useAuthListener = () => {
  const { initialize } = useAuth();
  
  // Configurar listener ao montar
  React.useEffect(() => {
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      
      if (event === 'SIGNED_IN') {
        await initialize();
      } else if (event === 'SIGNED_OUT') {
        useAuthStore.getState().logout();
      } else if (event === 'TOKEN_REFRESHED') {
        await initialize();
      }
    });
    
    // Inicializar ao montar
    initialize();
    
    // Cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, [initialize]);
};

export default useAuth;