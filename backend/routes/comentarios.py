"""
Rotas de Comentários
CRUD completo de comentários
"""

from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import token_required, optional_auth
from services.comentario_service import ComentarioService
from utils.validators import ValidationError
from utils.helpers import criar_resposta_paginada
from utils.database import db
import logging

logger = logging.getLogger(__name__)

comentarios_bp = Blueprint('comentarios', __name__)


@comentarios_bp.route('/postagem/<postagem_id>', methods=['GET'])
@optional_auth
def listar_comentarios_postagem(postagem_id):
    """
    Listar comentários de uma postagem
    
    Query params:
    - pagina: Número da página (padrão: 1)
    - por_pagina: Itens por página (padrão: 20)
    - ordenacao: recentes, antigos (padrão: recentes)
    """
    try:
        # Parâmetros
        pagina = request.args.get('pagina', 1, type=int)
        por_pagina = request.args.get('por_pagina', 20, type=int)
        ordenacao = request.args.get('ordenacao', 'recentes')
        
        # Limitar por_pagina
        por_pagina = min(por_pagina, 50)
        
        # Buscar comentários
        comentarios, total = ComentarioService.listar_comentarios(
            postagem_id=postagem_id,
            pagina=pagina,
            por_pagina=por_pagina,
            ordenacao=ordenacao
        )
        
        # Criar resposta paginada
        resposta = criar_resposta_paginada(comentarios, pagina, por_pagina, total)
        
        return jsonify(resposta), 200
        
    except Exception as e:
        logger.error(f"Erro ao listar comentários: {e}")
        return jsonify({
            'erro': 'Erro ao buscar comentários'
        }), 500


@comentarios_bp.route('', methods=['POST'])
@token_required
def criar_comentario():
    """
    Criar novo comentário
    
    Body JSON:
    {
        "postagem_id": "uuid-da-postagem",
        "texto": "Texto do comentário"
    }
    """
    try:
        dados = request.get_json()
        
        # Validar campos obrigatórios
        if 'postagem_id' not in dados or 'texto' not in dados:
            return jsonify({
                'erro': 'postagem_id e texto são obrigatórios'
            }), 400
        
        # Criar comentário
        sucesso, mensagem, comentario = ComentarioService.criar_comentario(
            postagem_id=dados['postagem_id'],
            usuario_id=g.usuario_id,
            texto=dados['texto']
        )
        
        if sucesso:
            return jsonify({
                'sucesso': True,
                'mensagem': mensagem,
                'comentario': comentario
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
        logger.error(f"Erro ao criar comentário: {e}")
        return jsonify({
            'erro': 'Erro ao processar comentário'
        }), 500


@comentarios_bp.route('/<comentario_id>', methods=['GET'])
@optional_auth
def obter_comentario(comentario_id):
    """
    Obter comentário específico
    """
    try:
        comentario = ComentarioService.obter_comentario(comentario_id)
        
        if not comentario:
            return jsonify({
                'erro': 'Comentário não encontrado'
            }), 404
        
        return jsonify({
            'comentario': comentario
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter comentário: {e}")
        return jsonify({
            'erro': 'Erro ao buscar comentário'
        }), 500


@comentarios_bp.route('/<comentario_id>', methods=['PUT'])
@token_required
def editar_comentario(comentario_id):
    """
    Editar comentário
    
    Body JSON:
    {
        "texto": "Novo texto do comentário"
    }
    """
    try:
        dados = request.get_json()
        
        if 'texto' not in dados:
            return jsonify({
                'erro': 'texto é obrigatório'
            }), 400
        
        # Editar comentário
        sucesso, mensagem = ComentarioService.editar_comentario(
            comentario_id=comentario_id,
            usuario_id=g.usuario_id,
            novo_texto=dados['texto']
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
        logger.error(f"Erro ao editar comentário: {e}")
        return jsonify({
            'erro': 'Erro ao processar edição'
        }), 500


@comentarios_bp.route('/<comentario_id>', methods=['DELETE'])
@token_required
def deletar_comentario(comentario_id):
    """
    Deletar comentário (soft delete)
    """
    try:
        # Verificar se é admin
        is_admin = db.verificar_eh_admin(g.usuario_id)
        
        # Deletar comentário
        sucesso, mensagem = ComentarioService.deletar_comentario(
            comentario_id=comentario_id,
            usuario_id=g.usuario_id,
            is_admin=is_admin
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
            
    except Exception as e:
        logger.error(f"Erro ao deletar comentário: {e}")
        return jsonify({
            'erro': 'Erro ao processar deleção'
        }), 500


@comentarios_bp.route('/<comentario_id>/denunciar', methods=['POST'])
@token_required
def denunciar_comentario(comentario_id):
    """
    Denunciar comentário
    
    Body JSON:
    {
        "motivo": "conteudo_inapropriado",
        "descricao": "Descrição opcional"
    }
    """
    try:
        dados = request.get_json()
        
        if 'motivo' not in dados:
            return jsonify({
                'erro': 'motivo é obrigatório'
            }), 400
        
        # Denunciar
        sucesso, mensagem = ComentarioService.denunciar_comentario(
            comentario_id=comentario_id,
            denunciante_id=g.usuario_id,
            motivo=dados['motivo'],
            descricao=dados.get('descricao')
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
            
    except Exception as e:
        logger.error(f"Erro ao denunciar comentário: {e}")
        return jsonify({
            'erro': 'Erro ao processar denúncia'
        }), 500


@comentarios_bp.route('/postagem/<postagem_id>/contar', methods=['GET'])
def contar_comentarios(postagem_id):
    """
    Contar comentários de uma postagem
    """
    try:
        total = ComentarioService.contar_comentarios(postagem_id)
        
        return jsonify({
            'postagem_id': postagem_id,
            'total_comentarios': total
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao contar comentários: {e}")
        return jsonify({
            'erro': 'Erro ao contar comentários'
        }), 500


@comentarios_bp.route('/usuario/<usuario_id>', methods=['GET'])
@optional_auth
def listar_comentarios_usuario(usuario_id):
    """
    Listar comentários de um usuário
    """
    try:
        pagina = request.args.get('pagina', 1, type=int)
        por_pagina = request.args.get('por_pagina', 20, type=int)
        
        # Query
        query = db.comentarios.select(
            '*, usuarios(id, nome_usuario, foto_perfil_url), postagens(id, descricao, tipo_midia)'
        ).eq('usuario_id', usuario_id).eq('aprovado', True).is_('deletado_em', 'null').order('criado_em', desc=True)
        
        # Contar total
        count_result = db.comentarios.select(
            'id', count='exact'
        ).eq('usuario_id', usuario_id).eq('aprovado', True).is_('deletado_em', 'null').execute()
        
        total = count_result.count if hasattr(count_result, 'count') else 0
        
        # Paginação
        inicio = (pagina - 1) * por_pagina
        query = query.range(inicio, inicio + por_pagina - 1)
        
        result = query.execute()
        comentarios = result.data if result.data else []
        
        resposta = criar_resposta_paginada(comentarios, pagina, por_pagina, total)
        
        return jsonify(resposta), 200
        
    except Exception as e:
        logger.error(f"Erro ao listar comentários do usuário: {e}")
        return jsonify({
            'erro': 'Erro ao buscar comentários'
        }), 500