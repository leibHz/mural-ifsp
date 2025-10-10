/**
 * CAMINHO: src/services/supabase.js
 * 
 * Cliente Supabase - Configuração e inicialização
 * Gerencia a conexão com o banco de dados Supabase
 */

import { createClient } from '@supabase/supabase-js';

// ============================================
// VALIDAÇÃO DAS VARIÁVEIS DE AMBIENTE
// ============================================
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas!');
  console.error('Por favor, configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.local');
  throw new Error('Configuração do Supabase ausente');
}

// ============================================
// CRIAÇÃO DO CLIENTE SUPABASE
// ============================================
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configurações de autenticação
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'mural-ifsp-auth',
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'mural-ifsp',
    },
  },
  realtime: {
    // Configurações de tempo real (para atualizações automáticas)
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ============================================
// CONFIGURAÇÕES DE STORAGE
// ============================================
export const STORAGE_BUCKETS = {
  FOTOS_PERFIL: 'fotos-perfil',
  POSTAGENS_MIDIA: 'postagens-midia',
  THUMBNAILS: 'thumbnails',
};

// ============================================
// CONFIGURAÇÕES DE LIMITES
// ============================================
export const UPLOAD_LIMITS = {
  IMAGE: {
    maxSize: (import.meta.env.VITE_MAX_IMAGE_SIZE_MB || 10) * 1024 * 1024, // MB para bytes
    formats: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  },
  VIDEO: {
    maxSize: (import.meta.env.VITE_MAX_VIDEO_SIZE_MB || 100) * 1024 * 1024,
    formats: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  },
  AUDIO: {
    maxSize: (import.meta.env.VITE_MAX_AUDIO_SIZE_MB || 20) * 1024 * 1024,
    formats: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'],
  },
  PDF: {
    maxSize: (import.meta.env.VITE_MAX_PDF_SIZE_MB || 15) * 1024 * 1024,
    formats: ['application/pdf'],
  },
  GIF: {
    maxSize: (import.meta.env.VITE_MAX_IMAGE_SIZE_MB || 10) * 1024 * 1024,
    formats: ['image/gif'],
  },
};

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Verifica se o usuário está autenticado
 */
export const isAuthenticated = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Obtém o usuário atual
 */
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Obtém o ID do usuário atual
 */
export const getCurrentUserId = async () => {
  const user = await getCurrentUser();
  return user?.id || null;
};

/**
 * Faz logout do usuário
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
  // Limpar storage local
  localStorage.removeItem('mural-ifsp-user-data');
  return true;
};

/**
 * Verifica a saúde da conexão com Supabase
 */
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    return { success: true, message: 'Conectado ao Supabase' };
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Gera URL pública para arquivo no storage
 */
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Valida tipo e tamanho de arquivo
 */
export const validateFile = (file, type) => {
  const limits = UPLOAD_LIMITS[type.toUpperCase()];
  
  if (!limits) {
    return { valid: false, error: 'Tipo de arquivo não suportado' };
  }
  
  if (file.size > limits.maxSize) {
    const maxSizeMB = (limits.maxSize / (1024 * 1024)).toFixed(0);
    return { 
      valid: false, 
      error: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB` 
    };
  }
  
  if (!limits.formats.includes(file.type)) {
    return { 
      valid: false, 
      error: `Formato não suportado. Formatos aceitos: ${limits.formats.join(', ')}` 
    };
  }
  
  return { valid: true };
};

// ============================================
// LISTENERS DE AUTENTICAÇÃO
// ============================================

/**
 * Configura listener para mudanças de autenticação
 */
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
};

// ============================================
// EXPORTAÇÕES PADRÃO
// ============================================
export default supabase;