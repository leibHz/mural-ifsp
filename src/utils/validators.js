/**
 * CAMINHO: src/utils/validators.js
 * 
 * Funções de validação para formulários
 * Validação de email, senha, BP, etc.
 */

import { REGEX_PATTERNS, VALIDATION_MESSAGES, CHARACTER_LIMITS } from './constants';

/**
 * Valida email
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { valid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  if (!REGEX_PATTERNS.EMAIL.test(email)) {
    return { valid: false, error: VALIDATION_MESSAGES.INVALID_EMAIL };
  }
  
  return { valid: true };
};

/**
 * Valida senha
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { valid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  if (password.length < CHARACTER_LIMITS.PASSWORD.min) {
    return { valid: false, error: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT };
  }
  
  if (password.length > CHARACTER_LIMITS.PASSWORD.max) {
    return { valid: false, error: `Senha muito longa (máximo ${CHARACTER_LIMITS.PASSWORD.max} caracteres)` };
  }
  
  // Validar força da senha
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  return { 
    valid: true, 
    strength, // 0-4
    feedback: strength < 3 ? 'Considere usar letras maiúsculas, minúsculas, números e caracteres especiais' : null
  };
};

/**
 * Valida confirmação de senha
 */
export const validatePasswordConfirmation = (password, confirmation) => {
  if (!confirmation || confirmation.trim() === '') {
    return { valid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  if (password !== confirmation) {
    return { valid: false, error: VALIDATION_MESSAGES.PASSWORD_MISMATCH };
  }
  
  return { valid: true };
};

/**
 * Valida nome de usuário
 */
export const validateUsername = (username) => {
  if (!username || username.trim() === '') {
    return { valid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  const trimmed = username.trim();
  
  if (trimmed.length < CHARACTER_LIMITS.USERNAME.min) {
    return { valid: false, error: VALIDATION_MESSAGES.USERNAME_TOO_SHORT };
  }
  
  if (trimmed.length > CHARACTER_LIMITS.USERNAME.max) {
    return { valid: false, error: `Nome de usuário muito longo (máximo ${CHARACTER_LIMITS.USERNAME.max} caracteres)` };
  }
  
  if (!REGEX_PATTERNS.USERNAME.test(trimmed)) {
    return { valid: false, error: VALIDATION_MESSAGES.USERNAME_INVALID };
  }
  
  return { valid: true };
};

/**
 * Valida BP (prontuário)
 */
export const validateBP = (bp) => {
  if (!bp || bp.trim() === '') {
    return { valid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  const trimmed = bp.trim().toUpperCase();
  
  if (!REGEX_PATTERNS.BP.test(trimmed)) {
    return { valid: false, error: VALIDATION_MESSAGES.INVALID_BP };
  }
  
  return { valid: true, formatted: trimmed };
};

/**
 * Valida nome completo
 */
export const validateFullName = (name) => {
  if (!name || name.trim() === '') {
    return { valid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  const trimmed = name.trim();
  
  if (trimmed.length < CHARACTER_LIMITS.NAME.min) {
    return { valid: false, error: `Nome muito curto (mínimo ${CHARACTER_LIMITS.NAME.min} caracteres)` };
  }
  
  if (trimmed.length > CHARACTER_LIMITS.NAME.max) {
    return { valid: false, error: `Nome muito longo (máximo ${CHARACTER_LIMITS.NAME.max} caracteres)` };
  }
  
  // Verificar se tem pelo menos nome e sobrenome
  const parts = trimmed.split(' ').filter(part => part.length > 0);
  if (parts.length < 2) {
    return { valid: false, error: 'Digite seu nome completo (nome e sobrenome)' };
  }
  
  return { valid: true };
};

/**
 * Valida código de verificação (4 dígitos)
 */
export const validateVerificationCode = (code) => {
  if (!code || code.trim() === '') {
    return { valid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  const trimmed = code.trim();
  
  if (!/^\d{4}$/.test(trimmed)) {
    return { valid: false, error: VALIDATION_MESSAGES.INVALID_CODE };
  }
  
  return { valid: true };
};

/**
 * Valida descrição de postagem
 */
export const validateDescription = (description) => {
  if (!description || description.trim() === '') {
    return { valid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  const trimmed = description.trim();
  
  if (trimmed.length < CHARACTER_LIMITS.DESCRIPTION.min) {
    return { valid: false, error: `Descrição muito curta (mínimo ${CHARACTER_LIMITS.DESCRIPTION.min} caracteres)` };
  }
  
  if (trimmed.length > CHARACTER_LIMITS.DESCRIPTION.max) {
    return { valid: false, error: `Descrição muito longa (máximo ${CHARACTER_LIMITS.DESCRIPTION.max} caracteres)` };
  }
  
  return { valid: true };
};

/**
 * Valida comentário
 */
export const validateComment = (comment) => {
  if (!comment || comment.trim() === '') {
    return { valid: false, error: VALIDATION_MESSAGES.REQUIRED_FIELD };
  }
  
  const trimmed = comment.trim();
  
  if (trimmed.length < CHARACTER_LIMITS.COMMENT.min) {
    return { valid: false, error: `Comentário muito curto (mínimo ${CHARACTER_LIMITS.COMMENT.min} caractere)` };
  }
  
  if (trimmed.length > CHARACTER_LIMITS.COMMENT.max) {
    return { valid: false, error: `Comentário muito longo (máximo ${CHARACTER_LIMITS.COMMENT.max} caracteres)` };
  }
  
  return { valid: true };
};

/**
 * Sanitiza string (remove HTML, scripts, etc)
 */
export const sanitizeString = (str) => {
  if (!str) return '';
  
  return str
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/[<>]/g, ''); // Remove < e >
};

/**
 * Valida formulário de login
 */
export const validateLoginForm = (formData) => {
  const errors = {};
  
  // Email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }
  
  // Senha
  if (!formData.password || formData.password.trim() === '') {
    errors.password = VALIDATION_MESSAGES.REQUIRED_FIELD;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida formulário de registro (estudante)
 */
export const validateStudentRegisterForm = (formData) => {
  const errors = {};
  
  // Nome completo
  const nameValidation = validateFullName(formData.fullName);
  if (!nameValidation.valid) {
    errors.fullName = nameValidation.error;
  }
  
  // Nome de usuário
  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.valid) {
    errors.username = usernameValidation.error;
  }
  
  // BP
  const bpValidation = validateBP(formData.bp);
  if (!bpValidation.valid) {
    errors.bp = bpValidation.error;
  }
  
  // Email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }
  
  // Senha
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error;
  }
  
  // Confirmação de senha
  const confirmValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword);
  if (!confirmValidation.valid) {
    errors.confirmPassword = confirmValidation.error;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    passwordStrength: passwordValidation.strength
  };
};

/**
 * Valida formulário de registro (visitante)
 */
export const validateVisitorRegisterForm = (formData) => {
  const errors = {};
  
  // Nome de usuário
  const usernameValidation = validateUsername(formData.username);
  if (!usernameValidation.valid) {
    errors.username = usernameValidation.error;
  }
  
  // Email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.valid) {
    errors.email = emailValidation.error;
  }
  
  // Senha
  const passwordValidation = validatePassword(formData.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error;
  }
  
  // Confirmação de senha
  const confirmValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword);
  if (!confirmValidation.valid) {
    errors.confirmPassword = confirmValidation.error;
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors,
    passwordStrength: passwordValidation.strength
  };
};