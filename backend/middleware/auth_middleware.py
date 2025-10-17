"""
Middleware de Autenticação
Decoradores para proteger rotas
"""

from functools import wraps
from flask import request, jsonify, g
from services.auth_service import AuthService
from utils.database import db
import logging

logger = logging.getLogger(__name__)


def token_required(f):
    """
    Decorator para rotas que requerem autenticação
    Adiciona o usuário autenticado no objeto 'g' do Flask
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Procurar token no header Authorization
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Formato esperado: "Bearer TOKEN"
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({
                    'erro': 'Token inválido',
                    'mensagem': 'Formato de token incorreto. Use: Bearer TOKEN'
                }), 401
        
        # Ou procurar no cookie
        elif 'token' in request.cookies:
            token = request.cookies.get('token')
        
        if not token:
            return jsonify({
                'erro': 'Token não fornecido',
                'mensagem': 'É necessário estar autenticado para acessar este recurso'
            }), 401
        
        # Decodificar e validar token
        payload = AuthService.decodificar_jwt_token(token)
        
        if not payload:
            return jsonify({
                'erro': 'Token inválido ou expirado',
                'mensagem': 'Faça login novamente'
            }), 401
        
        # Buscar dados completos do usuário
        try:
            result = db.usuarios.select('*').eq('id', payload['user_id']).execute()
            
            if not result.data:
                return jsonify({
                    'erro': 'Usuário não encontrado'
                }), 404
            
            usuario = result.data[0]
            
            # Verificar se usuário está banido
            if usuario['banido']:
                return jsonify({
                    'erro': 'Usuário banido',
                    'mensagem': f"Motivo: {usuario.get('motivo_ban', 'Não especificado')}"
                }), 403
            
            # Adicionar usuário no contexto global
            g.usuario_atual = usuario
            g.usuario_id = usuario['id']
            g.tipo_usuario = usuario['tipo_usuario']
            
            logger.debug(f"Usuário autenticado: {usuario['nome_usuario']}")
            
        except Exception as e:
            logger.error(f"Erro ao buscar usuário: {e}")
            return jsonify({
                'erro': 'Erro ao validar autenticação'
            }), 500
        
        return f(*args, **kwargs)
    
    return decorated


def estudante_required(f):
    """
    Decorator para rotas que requerem ser estudante
    Deve ser usado APÓS @token_required
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'usuario_atual'):
            return jsonify({
                'erro': 'Autenticação necessária'
            }), 401
        
        if g.tipo_usuario != 'estudante':
            return jsonify({
                'erro': 'Acesso negado',
                'mensagem': 'Apenas estudantes podem acessar este recurso'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated


def admin_required(f):
    """
    Decorator para rotas que requerem ser administrador
    Deve ser usado APÓS @token_required
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'usuario_atual'):
            return jsonify({
                'erro': 'Autenticação necessária'
            }), 401
        
        # Verificar se é admin
        try:
            result = db.administradores.select('*').eq(
                'usuario_id', g.usuario_id
            ).execute()
            
            if not result.data:
                return jsonify({
                    'erro': 'Acesso negado',
                    'mensagem': 'Apenas administradores podem acessar este recurso'
                }), 403
            
            # Adicionar dados de admin no contexto
            g.admin_data = result.data[0]
            g.nivel_permissao = g.admin_data['nivel_permissao']
            
        except Exception as e:
            logger.error(f"Erro ao verificar admin: {e}")
            return jsonify({
                'erro': 'Erro ao verificar permissões'
            }), 500
        
        return f(*args, **kwargs)
    
    return decorated


def super_admin_required(f):
    """
    Decorator para rotas que requerem ser super admin
    Deve ser usado APÓS @admin_required
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'nivel_permissao'):
            return jsonify({
                'erro': 'Acesso negado'
            }), 403
        
        if g.nivel_permissao != 'super_admin':
            return jsonify({
                'erro': 'Acesso negado',
                'mensagem': 'Apenas super administradores podem acessar este recurso'
            }), 403
        
        return f(*args, **kwargs)
    
    return decorated


def optional_auth(f):
    """
    Decorator para rotas que podem ter autenticação opcional
    Se token fornecido, adiciona usuário no contexto
    Se não, continua sem autenticação
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(' ')[1]
            except:
                pass
        elif 'token' in request.cookies:
            token = request.cookies.get('token')
        
        if token:
            payload = AuthService.decodificar_jwt_token(token)
            
            if payload:
                try:
                    result = db.usuarios.select('*').eq('id', payload['user_id']).execute()
                    
                    if result.data and not result.data[0]['banido']:
                        usuario = result.data[0]
                        g.usuario_atual = usuario
                        g.usuario_id = usuario['id']
                        g.tipo_usuario = usuario['tipo_usuario']
                        g.autenticado = True
                except:
                    pass
        
        if not hasattr(g, 'autenticado'):
            g.autenticado = False
            g.usuario_atual = None
        
        return f(*args, **kwargs)
    
    return decorated