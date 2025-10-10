/**
 * CAMINHO: src/utils/constants.js
 * 
 * Constantes globais da aplicação
 * Centralizando valores fixos para facilitar manutenção
 */

// ============================================
// TIPOS DE USUÁRIO
// ============================================
export const USER_TYPES = {
  ESTUDANTE: 'estudante',
  VISITANTE: 'visitante',
};

// ============================================
// TIPOS DE MÍDIA
// ============================================
export const MEDIA_TYPES = {
  IMAGEM: 'imagem',
  VIDEO: 'video',
  GIF: 'gif',
  PDF: 'pdf',
  AUDIO: 'audio',
  TEXTO: 'texto',
};

// ============================================
// NÍVEIS DE PERMISSÃO ADMIN
// ============================================
export const ADMIN_LEVELS = {
  SUPER_ADMIN: 'super_admin',
  MODERADOR: 'moderador',
};

// ============================================
// STATUS DE POSTAGEM
// ============================================
export const POST_STATUS = {
  APROVADO: 'aprovado',
  PENDENTE: 'pendente',
  REJEITADO: 'rejeitado',
  DENUNCIADO: 'denunciado',
};

// ============================================
// TIPOS DE DENÚNCIA
// ============================================
export const REPORT_TYPES = {
  VIOLENCIA: 'Violência',
  BULLYING: 'Bullying',
  DISCRIMINACAO: 'Discriminação',
  ASSEDIO: 'Assédio',
  CONTEUDO_INAPROPRIADO: 'Conteúdo Inapropriado',
  SPAM: 'Spam',
  DESINFORMACAO: 'Desinformação',
  OUTRO: 'Outro',
};

// ============================================
// ROTAS DA APLICAÇÃO
// ============================================
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/cadastro',
  PROFILE: '/perfil',
  POST: '/postagem',
  NEW_POST: '/nova-postagem',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/usuarios',
  ADMIN_POSTS: '/admin/postagens',
  ADMIN_REPORTS: '/admin/denuncias',
  ADMIN_LOGS: '/admin/logs',
};

// ============================================
// MENSAGENS DE VALIDAÇÃO
// ============================================
export const VALIDATION_MESSAGES = {
  REQUIRED_FIELD: 'Este campo é obrigatório',
  INVALID_EMAIL: 'Email inválido',
  INVALID_BP: 'Prontuário (BP) inválido. Use o formato: BRGXXXXX',
  PASSWORD_TOO_SHORT: 'A senha deve ter no mínimo 8 caracteres',
  PASSWORD_MISMATCH: 'As senhas não coincidem',
  USERNAME_TOO_SHORT: 'O nome de usuário deve ter no mínimo 3 caracteres',
  USERNAME_INVALID: 'Nome de usuário inválido. Use apenas letras, números e underscore',
  INVALID_CODE: 'Código de verificação inválido',
  FILE_TOO_LARGE: 'Arquivo muito grande',
  INVALID_FILE_TYPE: 'Tipo de arquivo não suportado',
};

// ============================================
// MENSAGENS DE ERRO
// ============================================
export const ERROR_MESSAGES = {
  GENERIC: 'Ocorreu um erro. Tente novamente.',
  NETWORK: 'Erro de conexão. Verifique sua internet.',
  UNAUTHORIZED: 'Você não tem permissão para esta ação.',
  NOT_FOUND: 'Recurso não encontrado.',
  SERVER_ERROR: 'Erro no servidor. Tente novamente mais tarde.',
  SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente.',
  USER_BANNED: 'Sua conta foi banida.',
  EMAIL_ALREADY_EXISTS: 'Este email já está cadastrado.',
  BP_ALREADY_EXISTS: 'Este prontuário (BP) já está cadastrado.',
  USERNAME_ALREADY_EXISTS: 'Este nome de usuário já está em uso.',
  INVALID_CREDENTIALS: 'Email ou senha incorretos.',
  UPLOAD_FAILED: 'Falha no upload do arquivo.',
};

// ============================================
// MENSAGENS DE SUCESSO
// ============================================
export const SUCCESS_MESSAGES = {
  POST_CREATED: 'Postagem criada com sucesso!',
  POST_UPDATED: 'Postagem atualizada com sucesso!',
  POST_DELETED: 'Postagem removida com sucesso!',
  COMMENT_POSTED: 'Comentário publicado!',
  PROFILE_UPDATED: 'Perfil atualizado com sucesso!',
  USER_REGISTERED: 'Cadastro realizado! Verifique seu email.',
  LOGIN_SUCCESS: 'Login realizado com sucesso!',
  LOGOUT_SUCCESS: 'Logout realizado com sucesso!',
  REPORT_SENT: 'Denúncia enviada com sucesso!',
  CODE_SENT: 'Código de verificação enviado para seu email!',
  EMAIL_VERIFIED: 'Email verificado com sucesso!',
};

// ============================================
// CONFIGURAÇÕES DE PAGINAÇÃO
// ============================================
export const PAGINATION = {
  POSTS_PER_PAGE: 12,
  COMMENTS_PER_PAGE: 10,
  USERS_PER_PAGE: 20,
  REPORTS_PER_PAGE: 15,
};

// ============================================
// REGEX PATTERNS
// ============================================
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  BP: /^BRG\d{5}$/i, // Formato: BRG12345
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  PHONE: /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/,
};

// ============================================
// CORES DO TEMA
// ============================================
export const THEME_COLORS = {
  // Verde IFSP (cor predominante)
  PRIMARY: '#0B6623', // Verde escuro
  PRIMARY_LIGHT: '#0E8B2F',
  PRIMARY_DARK: '#054A1A',
  
  // Vermelho (mínimo, para alertas)
  DANGER: '#DC2626',
  DANGER_LIGHT: '#EF4444',
  
  // Tons de cinza para tema escuro
  BG_DARK: '#0F0F0F',
  BG_CARD: '#1A1A1A',
  BG_HOVER: '#252525',
  
  // Textos
  TEXT_PRIMARY: '#F5F5F5',
  TEXT_SECONDARY: '#A3A3A3',
  TEXT_MUTED: '#737373',
  
  // Bordas
  BORDER: '#2A2A2A',
  BORDER_LIGHT: '#3A3A3A',
  
  // Status
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
};

// ============================================
// DURAÇÃO DAS ANIMAÇÕES (em segundos)
// ============================================
export const ANIMATION_DURATION = {
  FAST: 0.2,
  NORMAL: 0.3,
  SLOW: 0.5,
  VERY_SLOW: 0.8,
};

// ============================================
// CONFIGURAÇÕES DE TEMPO
// ============================================
export const TIME_CONFIG = {
  SESSION_EXPIRATION: 24 * 60 * 60 * 1000, // 24 horas em ms
  CODE_EXPIRATION: 15 * 60 * 1000, // 15 minutos em ms
  DEBOUNCE_DELAY: 300, // 300ms
  TOAST_DURATION: 3000, // 3 segundos
};

// ============================================
// FORMATOS DE ARQUIVO ACEITOS
// ============================================
export const ACCEPTED_FORMATS = {
  IMAGE: '.jpg,.jpeg,.png,.gif,.webp',
  VIDEO: '.mp4,.webm,.ogg,.mov',
  AUDIO: '.mp3,.wav,.ogg',
  PDF: '.pdf',
  ALL_MEDIA: '.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.ogg,.mov,.mp3,.wav,.pdf',
};

// ============================================
// CONFIGURAÇÕES DO PLAYER
// ============================================
export const PLAYER_CONFIG = {
  VIDEO: {
    controls: true,
    volume: 0.8,
    playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
  },
  AUDIO: {
    waveColor: '#0B6623',
    progressColor: '#0E8B2F',
    cursorColor: '#10B981',
    barWidth: 2,
    barRadius: 3,
    cursorWidth: 1,
    height: 80,
    barGap: 2,
  },
};

// ============================================
// TEXTOS DA INTERFACE
// ============================================
export const UI_TEXTS = {
  APP_NAME: 'Mural IFSP',
  APP_SUBTITLE: 'Bragança Paulista',
  SLOGAN: 'Sua voz contra a violência escolar',
  
  // Botões
  BTN_LOGIN: 'Entrar',
  BTN_REGISTER: 'Cadastrar',
  BTN_LOGOUT: 'Sair',
  BTN_SAVE: 'Salvar',
  BTN_CANCEL: 'Cancelar',
  BTN_DELETE: 'Excluir',
  BTN_EDIT: 'Editar',
  BTN_SEND: 'Enviar',
  BTN_UPLOAD: 'Fazer Upload',
  BTN_POST: 'Publicar',
  BTN_COMMENT: 'Comentar',
  BTN_REPORT: 'Denunciar',
  
  // Placeholders
  PLACEHOLDER_EMAIL: 'seuemail@exemplo.com',
  PLACEHOLDER_PASSWORD: 'Digite sua senha',
  PLACEHOLDER_USERNAME: 'nome_de_usuario',
  PLACEHOLDER_BP: 'BRG12345',
  PLACEHOLDER_NAME: 'Seu nome completo',
  PLACEHOLDER_DESCRIPTION: 'Descreva sua postagem...',
  PLACEHOLDER_COMMENT: 'Escreva um comentário...',
  PLACEHOLDER_SEARCH: 'Buscar postagens...',
};

// ============================================
// INFORMAÇÕES DO IFSP
// ============================================
export const IFSP_INFO = {
  NOME_COMPLETO: 'Instituto Federal de São Paulo',
  CAMPUS: 'Campus Bragança Paulista',
  LOGO_URL: 'https://bra.ifsp.edu.br/images/LogoIFSP/logoifspbra2.png',
  SITE: 'https://bra.ifsp.edu.br',
  EMAIL: 'bra.ifsp.edu.br',
};

// ============================================
// LIMITES DE CARACTERES
// ============================================
export const CHARACTER_LIMITS = {
  USERNAME: { min: 3, max: 30 },
  NAME: { min: 3, max: 100 },
  PASSWORD: { min: 8, max: 128 },
  DESCRIPTION: { min: 10, max: 1000 },
  COMMENT: { min: 1, max: 500 },
  BIO: { max: 200 },
  REPORT_REASON: { max: 500 },
};

// ============================================
// ENDPOINTS DA API (Se necessário)
// ============================================
export const API_ENDPOINTS = {
  TRANSCRIPTION: '/api/transcribe',
  EMAIL_VERIFICATION: '/api/verify-email',
  REPORTS: '/api/reports',
};