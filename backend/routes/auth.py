"""
Rotas de Autenticação
Registro, Login, Verificação de Email
"""

from flask import Blueprint, request, jsonify, g
from services.auth_service import AuthService
from utils.validators import ValidationError
from middleware.auth_middleware import token_required
import logging

logger = logging.getLogger(__name__)

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/registrar/estudante', methods=['POST'])
def registrar_estudante():
    """
    Registrar novo estudante
    
    Body JSON:
    {
        "nome_real": "João Silva",
        "bp": "BP1234567X",
        "email": "joao.silva@aluno.ifsp.edu.br",
        "senha": "SenhaForte123",
        "nome_usuario": "joaosilva"
    }
    """
    try:
        dados = request.get_json()
        
        # Validar campos obrigatórios
        campos_obrigatorios = ['nome_real', 'bp', 'email', 'senha', 'nome_usuario']
        for campo in campos_obrigatorios:
            if campo not in dados:
                return jsonify({
                    'erro': f'Campo obrigatório ausente: {campo}'
                }), 400
        
        # Registrar estudante
        sucesso, mensagem, usuario = AuthService.registrar_estudante(
            nome_real=dados['nome_real'],
            bp=dados['bp'],
            email=dados['email'],
            senha=dados['senha'],
            nome_usuario=dados['nome_usuario']
        )
        
        if sucesso:
            return jsonify({
                'sucesso': True,
                'mensagem': mensagem,
                'usuario': usuario
            }), 201
        else:
            return jsonify({
                'erro': mensagem
            }), 400
            
    except ValidationError as e:
        return jsonify({
            'erro': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Erro ao registrar estudante: {e}")
        return jsonify({
            'erro': 'Erro ao processar registro'
        }), 500


@auth_bp.route('/registrar/visitante', methods=['POST'])
def registrar_visitante():
    """
    Registrar novo visitante (envia código de verificação)
    
    Body JSON:
    {
        "nome_usuario": "maria_visitante",
        "email": "maria@example.com",
        "senha": "SenhaForte123"
    }
    """
    try:
        dados = request.get_json()
        
        # Validar campos obrigatórios
        campos_obrigatorios = ['nome_usuario', 'email', 'senha']
        for campo in campos_obrigatorios:
            if campo not in dados:
                return jsonify({
                    'erro': f'Campo obrigatório ausente: {campo}'
                }), 400
        
        # Registrar visitante
        sucesso, mensagem, usuario_id = AuthService.registrar_visitante(
            nome_usuario=dados['nome_usuario'],
            email=dados['email'],
            senha=dados['senha']
        )
        
        if sucesso:
            return jsonify({
                'sucesso': True,
                'mensagem': mensagem,
                'usuario_id': usuario_id,
                'proxima_etapa': 'verificar_codigo'
            }), 201
        else:
            return jsonify({
                'erro': mensagem
            }), 400
            
    except ValidationError as e:
        return jsonify({
            'erro': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Erro ao registrar visitante: {e}")
        return jsonify({
            'erro': 'Erro ao processar registro'
        }), 500


@auth_bp.route('/verificar-codigo', methods=['POST'])
def verificar_codigo():
    """
    Verificar código de verificação de email
    
    Body JSON:
    {
        "usuario_id": "uuid-do-usuario",
        "codigo": "1234"
    }
    """
    try:
        dados = request.get_json()
        
        if 'usuario_id' not in dados or 'codigo' not in dados:
            return jsonify({
                'erro': 'usuario_id e codigo são obrigatórios'
            }), 400
        
        sucesso, mensagem = AuthService.verificar_codigo(
            usuario_id=dados['usuario_id'],
            codigo=dados['codigo']
        )
        
        if sucesso:
            return jsonify({
                'sucesso': True,
                'mensagem': mensagem
            }), 200
        else:
            return jsonify({
                'erro': mensagem
            }), 400
            
    except ValidationError as e:
        return jsonify({
            'erro': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Erro ao verificar código: {e}")
        return jsonify({
            'erro': 'Erro ao processar verificação'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Fazer login
    
    Body JSON:
    {
        "identificador": "joaosilva ou joao.silva@aluno.ifsp.edu.br",
        "senha": "SenhaForte123"
    }
    """
    try:
        dados = request.get_json()
        
        if 'identificador' not in dados or 'senha' not in dados:
            return jsonify({
                'erro': 'identificador e senha são obrigatórios'
            }), 400
        
        # Obter IP e User Agent
        ip_address = request.remote_addr
        user_agent = request.headers.get('User-Agent', '')
        
        # Fazer login
        sucesso, mensagem, dados_login = AuthService.login(
            identificador=dados['identificador'],
            senha=dados['senha'],
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        if sucesso:
            response = jsonify({
                'sucesso': True,
                'mensagem': mensagem,
                'token': dados_login['token'],
                'usuario': dados_login['usuario']
            })
            
            # Definir cookie com token (opcional, pode usar só o token)
            response.set_cookie(
                'token',
                dados_login['token'],
                max_age=86400,  # 24 horas
                httponly=True,
                secure=False,  # True em produção com HTTPS
                samesite='Lax'
            )
            
            return response, 200
        else:
            return jsonify({
                'erro': mensagem
            }), 401
            
    except Exception as e:
        logger.error(f"Erro ao fazer login: {e}")
        return jsonify({
            'erro': 'Erro ao processar login'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """
    Fazer logout (requer autenticação)
    """
    try:
        # Obter token da sessão
        token_sessao = request.cookies.get('token_sessao')
        
        if token_sessao:
            AuthService.logout(token_sessao)
        
        response = jsonify({
            'sucesso': True,
            'mensagem': 'Logout realizado com sucesso'
        })
        
        # Remover cookie
        response.set_cookie('token', '', max_age=0)
        
        return response, 200
        
    except Exception as e:
        logger.error(f"Erro ao fazer logout: {e}")
        return jsonify({
            'erro': 'Erro ao processar logout'
        }), 500


@auth_bp.route('/me', methods=['GET'])
@token_required
def obter_usuario_atual():
    """
    Obter dados do usuário autenticado
    """
    try:
        usuario = g.usuario_atual
        
        return jsonify({
            'usuario': {
                'id': usuario['id'],
                'nome_usuario': usuario['nome_usuario'],
                'nome_real': usuario.get('nome_real'),
                'email': usuario['email'],
                'tipo_usuario': usuario['tipo_usuario'],
                'bp': usuario.get('bp'),
                'foto_perfil_url': usuario.get('foto_perfil_url'),
                'email_verificado': usuario['email_verificado'],
                'criado_em': usuario['criado_em']
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter usuário atual: {e}")
        return jsonify({
            'erro': 'Erro ao obter dados do usuário'
        }), 500


@auth_bp.route('/validar-token', methods=['GET'])
def validar_token():
    """
    Validar se token é válido (sem necessitar autenticação completa)
    """
    token = None
    
    if 'Authorization' in request.headers:
        try:
            token = request.headers['Authorization'].split(' ')[1]
        except:
            pass
    elif 'token' in request.cookies:
        token = request.cookies.get('token')
    
    if not token:
        return jsonify({
            'valido': False,
            'mensagem': 'Token não fornecido'
        }), 200
    
    payload = AuthService.decodificar_jwt_token(token)
    
    if payload:
        return jsonify({
            'valido': True,
            'usuario_id': payload.get('user_id'),
            'tipo_usuario': payload.get('tipo_usuario')
        }), 200
    else:
        return jsonify({
            'valido': False,
            'mensagem': 'Token inválido ou expirado'
        }), 200


@auth_bp.route('/reenviar-codigo', methods=['POST'])
def reenviar_codigo():
    """
    Reenviar código de verificação
    
    Body JSON:
    {
        "usuario_id": "uuid-do-usuario"
    }
    """
    try:
        dados = request.get_json()
        
        if 'usuario_id' not in dados:
            return jsonify({
                'erro': 'usuario_id é obrigatório'
            }), 400
        
        from utils.database import db
        from utils.helpers import gerar_codigo_verificacao, calcular_expiracao_codigo
        from services.email_service import EmailService
        
        # Buscar usuário
        result = db.usuarios.select('*').eq('id', dados['usuario_id']).execute()
        
        if not result.data:
            return jsonify({
                'erro': 'Usuário não encontrado'
            }), 404
        
        usuario = result.data[0]
        
        if usuario['email_verificado']:
            return jsonify({
                'erro': 'Email já verificado'
            }), 400
        
        # Gerar novo código
        codigo = gerar_codigo_verificacao()
        expiracao = calcular_expiracao_codigo(15)
        
        # Atualizar no banco
        db.usuarios.update({
            'codigo_verificacao': codigo,
            'codigo_expiracao': expiracao.isoformat()
        }).eq('id', dados['usuario_id']).execute()
        
        # Enviar email
        EmailService.enviar_codigo_verificacao(usuario['email'], codigo)
        
        return jsonify({
            'sucesso': True,
            'mensagem': 'Novo código enviado para seu email'
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao reenviar código: {e}")
        return jsonify({
            'erro': 'Erro ao reenviar código'
        }), 500