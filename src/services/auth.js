/**
 * CAMINHO: src/services/auth.js (ATUALIZADO)
 * 
 * Serviços de autenticação com envio de email real
 */

import { supabase } from './supabase';
import { sanitizeString } from '../utils/validators';

/**
 * Gera código de verificação de 4 dígitos
 */
const generateVerificationCode = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

/**
 * Envia email de verificação usando Supabase
 */
const sendVerificationEmail = async (email, code, userName) => {
  try {
    // Usando a API do Supabase para enviar email
    const { error } = await supabase.functions.invoke('send-verification-email', {
      body: {
        email: email,
        code: code,
        userName: userName,
      }
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    return false;
  }
};

/**
 * Registra novo estudante
 */
export const registerStudent = async (formData) => {
  try {
    const { fullName, username, bp, email, password } = formData;
    
    // Sanitizar dados
    const sanitizedData = {
      fullName: sanitizeString(fullName),
      username: sanitizeString(username).toLowerCase(),
      bp: sanitizeString(bp).toUpperCase(),
      email: sanitizeString(email).toLowerCase(),
    };
    
    // Verificar se BP já existe
    const { data: existingBP } = await supabase
      .from('usuarios')
      .select('id')
      .eq('bp', sanitizedData.bp)
      .single();
    
    if (existingBP) {
      return { 
        success: false, 
        error: 'Este prontuário (BP) já está cadastrado' 
      };
    }
    
    // Verificar se username já existe
    const { data: existingUsername } = await supabase
      .from('usuarios')
      .select('id')
      .eq('nome_usuario', sanitizedData.username)
      .single();
    
    if (existingUsername) {
      return { 
        success: false, 
        error: 'Este nome de usuário já está em uso' 
      };
    }
    
    // Verificar se email já existe
    const { data: existingEmail } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', sanitizedData.email)
      .single();
    
    if (existingEmail) {
      return { 
        success: false, 
        error: 'Este email já está cadastrado' 
      };
    }
    
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedData.email,
      password: password,
      options: {
        data: {
          username: sanitizedData.username,
          tipo_usuario: 'estudante',
        },
        emailRedirectTo: `${window.location.origin}/verificar-email`,
      }
    });
    
    if (authError) {
      return { success: false, error: authError.message };
    }
    
    // Gerar código de verificação
    const verificationCode = generateVerificationCode();
    const codeExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    
    // Inserir dados na tabela usuarios
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        tipo_usuario: 'estudante',
        nome_usuario: sanitizedData.username,
        email: sanitizedData.email,
        nome_real: sanitizedData.fullName,
        bp: sanitizedData.bp,
        codigo_verificacao: verificationCode,
        codigo_expiracao: codeExpiration.toISOString(),
        email_verificado: false,
      });
    
    if (insertError) {
      // Se falhar ao inserir, deletar o usuário do auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: insertError.message };
    }
    
    // ENVIAR EMAIL DE VERIFICAÇÃO
    const emailSent = await sendVerificationEmail(
      sanitizedData.email, 
      verificationCode,
      sanitizedData.username
    );

    // Para desenvolvimento: ainda mostrar no console
    if (import.meta.env.DEV) {
      console.log('🔐 Código de verificação (DEV):', verificationCode);
    }
    
    return {
      success: true,
      userId: authData.user.id,
      emailSent: emailSent,
      message: emailSent 
        ? 'Cadastro realizado! Verifique seu email.' 
        : 'Cadastro realizado! Código: ' + verificationCode
    };
    
  } catch (error) {
    console.error('Erro ao registrar estudante:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Registra novo visitante
 */
export const registerVisitor = async (formData) => {
  try {
    const { username, email, password } = formData;
    
    // Sanitizar dados
    const sanitizedData = {
      username: sanitizeString(username).toLowerCase(),
      email: sanitizeString(email).toLowerCase(),
    };
    
    // Verificar se username já existe
    const { data: existingUsername } = await supabase
      .from('usuarios')
      .select('id')
      .eq('nome_usuario', sanitizedData.username)
      .single();
    
    if (existingUsername) {
      return { 
        success: false, 
        error: 'Este nome de usuário já está em uso' 
      };
    }
    
    // Verificar se email já existe
    const { data: existingEmail } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', sanitizedData.email)
      .single();
    
    if (existingEmail) {
      return { 
        success: false, 
        error: 'Este email já está cadastrado' 
      };
    }
    
    // Criar usuário no auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedData.email,
      password: password,
      options: {
        data: {
          username: sanitizedData.username,
          tipo_usuario: 'visitante',
        },
        emailRedirectTo: `${window.location.origin}/verificar-email`,
      }
    });
    
    if (authError) {
      return { success: false, error: authError.message };
    }
    
    // Gerar código de verificação
    const verificationCode = generateVerificationCode();
    const codeExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
    
    // Inserir dados na tabela usuarios
    const { error: insertError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        tipo_usuario: 'visitante',
        nome_usuario: sanitizedData.username,
        email: sanitizedData.email,
        codigo_verificacao: verificationCode,
        codigo_expiracao: codeExpiration.toISOString(),
        email_verificado: false,
      });
    
    if (insertError) {
      // Se falhar ao inserir, deletar o usuário do auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: insertError.message };
    }
    
    // ENVIAR EMAIL DE VERIFICAÇÃO
    const emailSent = await sendVerificationEmail(
      sanitizedData.email, 
      verificationCode,
      sanitizedData.username
    );

    // Para desenvolvimento: ainda mostrar no console
    if (import.meta.env.DEV) {
      console.log('🔐 Código de verificação (DEV):', verificationCode);
    }
    
    return {
      success: true,
      userId: authData.user.id,
      emailSent: emailSent,
      message: emailSent 
        ? 'Cadastro realizado! Verifique seu email.' 
        : 'Cadastro realizado! Código: ' + verificationCode
    };
    
  } catch (error) {
    console.error('Erro ao registrar visitante:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verifica código de verificação
 */
export const verifyEmailCode = async (userId, code) => {
  try {
    // Buscar usuário
    const { data: user, error: fetchError } = await supabase
      .from('usuarios')
      .select('codigo_verificacao, codigo_expiracao, email_verificado')
      .eq('id', userId)
      .single();
    
    if (fetchError) {
      return { success: false, error: 'Usuário não encontrado' };
    }
    
    if (user.email_verificado) {
      return { success: false, error: 'Email já verificado' };
    }
    
    // Verificar se o código expirou
    const now = new Date();
    const expiration = new Date(user.codigo_expiracao);
    
    if (now > expiration) {
      return { success: false, error: 'Código expirado. Solicite um novo código.' };
    }
    
    // Verificar se o código está correto
    if (user.codigo_verificacao !== code) {
      return { success: false, error: 'Código incorreto' };
    }
    
    // Atualizar usuário como verificado
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        email_verificado: true,
        codigo_verificacao: null,
        codigo_expiracao: null,
      })
      .eq('id', userId);
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    return {
      success: true,
      message: 'Email verificado com sucesso!'
    };
    
  } catch (error) {
    console.error('Erro ao verificar código:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Reenviar código de verificação
 */
export const resendVerificationCode = async (userId) => {
  try {
    // Buscar dados do usuário
    const { data: user, error: fetchError } = await supabase
      .from('usuarios')
      .select('email, nome_usuario')
      .eq('id', userId)
      .single();

    if (fetchError) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Gerar novo código
    const verificationCode = generateVerificationCode();
    const codeExpiration = new Date(Date.now() + 15 * 60 * 1000);
    
    // Atualizar código
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({
        codigo_verificacao: verificationCode,
        codigo_expiracao: codeExpiration.toISOString(),
      })
      .eq('id', userId);
    
    if (updateError) {
      return { success: false, error: updateError.message };
    }
    
    // ENVIAR EMAIL COM NOVO CÓDIGO
    const emailSent = await sendVerificationEmail(
      user.email,
      verificationCode,
      user.nome_usuario
    );

    // Para desenvolvimento: ainda mostrar no console
    if (import.meta.env.DEV) {
      console.log('🔐 Novo código de verificação (DEV):', verificationCode);
    }
    
    return {
      success: true,
      emailSent: emailSent,
      message: 'Novo código enviado para seu email'
    };
    
  } catch (error) {
    console.error('Erro ao reenviar código:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Login
 */
export const login = async (email, password) => {
  try {
    const sanitizedEmail = sanitizeString(email).toLowerCase();
    
    // Fazer login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: sanitizedEmail,
      password: password,
    });
    
    if (error) {
      return { success: false, error: 'Email ou senha incorretos' };
    }
    
    // Buscar dados do usuário
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      return { success: false, error: 'Erro ao buscar dados do usuário' };
    }
    
    // Verificar se o usuário está banido
    if (userData.banido) {
      await supabase.auth.signOut();
      return { 
        success: false, 
        error: `Sua conta foi banida. Motivo: ${userData.motivo_ban || 'Não especificado'}` 
      };
    }
    
    // Verificar se o email foi verificado
    if (!userData.email_verificado) {
      return {
        success: false,
        needsVerification: true,
        userId: userData.id,
        error: 'Por favor, verifique seu email antes de fazer login'
      };
    }
    
    // Atualizar último acesso
    await supabase
      .from('usuarios')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', userData.id);
    
    return {
      success: true,
      user: userData,
      session: data.session,
      message: 'Login realizado com sucesso!'
    };
    
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Logout
 */
export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    // Limpar dados locais
    localStorage.removeItem('mural-ifsp-user-data');
    
    return {
      success: true,
      message: 'Logout realizado com sucesso!'
    };
    
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Obter usuário atual
 */
export const getCurrentUserData = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' };
    }
    
    const { data: userData, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return {
      success: true,
      user: userData
    };
    
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Verificar se o usuário é admin
 */
export const isAdmin = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('administradores')
      .select('nivel_permissao')
      .eq('usuario_id', userId)
      .single();
    
    if (error) {
      return { isAdmin: false, level: null };
    }
    
    return {
      isAdmin: true,
      level: data.nivel_permissao
    };
    
  } catch (error) {
    return { isAdmin: false, level: null };
  }
};