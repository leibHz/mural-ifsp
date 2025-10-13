/**
 * CAMINHO: src/hooks/useAuth.js
 * 
 * Hook customizado para gerenciar autenticação (OTIMIZADO)
 */

import { useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../services/supabase';
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
      initialized: false,
      
      // Ações
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setAdmin: (isAdmin, adminLevel) => set({ isAdmin, adminLevel }),
      
      // Inicializar autenticação (apenas uma vez)
      initialize: async () => {
        // Evitar múltiplas inicializações
        if (get().initialized && !get().loading) {
          return;
        }
        
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
                initialized: true,
              });
            } else {
              set({ 
                user: null, 
                session: null, 
                loading: false, 
                initialized: true 
              });
            }
          } else {
            set({ 
              user: null, 
              session: null, 
              loading: false, 
              initialized: true 
            });
          }
        } catch (error) {
          console.error('Erro ao inicializar auth:', error);
          set({ 
            user: null, 
            session: null, 
            loading: false, 
            initialized: true 
          });
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
 * Hook OTIMIZADO para configurar listener de autenticação
 */
export const useAuthListener = () => {
  useEffect(() => {
    // Inicializar apenas uma vez
    const store = useAuthStore.getState();
    if (!store.initialized) {
      store.initialize();
    }
    
    // Configurar listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event);
        
        if (event === 'SIGNED_IN' && session) {
          await store.initialize();
        } else if (event === 'SIGNED_OUT') {
          store.logout();
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Apenas atualizar session, sem reinicializar tudo
          store.setSession(session);
        }
      }
    );
    
    // Cleanup
    return () => {
      subscription?.unsubscribe();
    };
  }, []); // Array vazio = executa apenas uma vez
};

export default useAuth;