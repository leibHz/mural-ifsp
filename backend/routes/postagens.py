"""
Rotas de Postagens
CRUD completo de postagens com upload de mídia
"""

from flask import Blueprint, request, jsonify, g
from middleware.auth_middleware import token_required, estudante_required, optional_auth
from services.media_service import MediaService
from services.transcription_service import TranscriptionService
from utils.database import db
from utils.validators import validar_descricao_postagem, ValidationError
from utils.helpers import criar_resposta_paginada
import logging

logger = logging.getLogger(__name__)

postagens_bp = Blueprint('postagens', __name__)


@postagens_bp.route('', methods=['GET'])
@optional_auth
def listar_postagens():
    """
    Listar postagens com filtros e paginação
    
    Query params:
    - pagina: Número da página (padrão: 1)
    - por_pagina: Itens por página (padrão: 12)
    - tipo: Filtrar por tipo de mídia
    - ordem: recentes, visualizacoes, comentarios
    """
    try:
        # Parâmetros de paginação
        pagina = request.args.get('pagina', 1, type=int)
        por_pagina = request.args.get('por_pagina', 12, type=int)
        tipo_filtro = request.args.get('tipo', '')
        ordenacao = request.args.get('ordem', 'recentes')
        
        # Limitar por_pagina
        por_pagina = min(por_pagina, 50)
        
        # Query base - apenas postagens aprovadas e não deletadas
        query = db.postagens.select('*, usuarios(nome_usuario, foto_perfil_url)').eq('aprovado', True).is_('deletado_em', 'null')
        
        # Aplicar filtro de tipo
        if tipo_filtro:
            query = query.eq('tipo_midia', tipo_filtro)
        
        # Aplicar ordenação
        if ordenacao == 'visualizacoes':
            query = query.order('visualizacoes', desc=True)
        elif ordenacao == 'comentarios':
            # TODO: Adicionar contagem de comentários quando implementado
            query = query.order('criado_em', desc=True)
        else:  # recentes (padrão)
            query = query.order('criado_em', desc=True)
        
        # Contar total
        count_query = db.postagens.select('id', count='exact').eq('aprovado', True).is_('deletado_em', 'null')
        if tipo_filtro:
            count_query = count_query.eq('tipo_midia', tipo_filtro)
        count_result = count_query.execute()
        total = count_result.count if hasattr(count_result, 'count') else 0
        
        # Aplicar paginação
        inicio = (pagina - 1) * por_pagina
        query = query.range(inicio, inicio + por_pagina - 1)
        
        # Executar query
        result = query.execute()
        
        postagens = result.data if result.data else []
        
        # Adicionar contagem de comentários (placeholder por enquanto)
        for postagem in postagens:
            postagem['num_comentarios'] = 0  # TODO: Implementar contagem real
        
        # Criar resposta paginada
        resposta = criar_resposta_paginada(postagens, pagina, por_pagina, total)
        
        return jsonify(resposta), 200
        
    except Exception as e:
        logger.error(f"Erro ao listar postagens: {e}")
        return jsonify({
            'erro': 'Erro ao buscar postagens'
        }), 500


@postagens_bp.route('', methods=['POST'])
@token_required
@estudante_required
def criar_postagem():
    """
    Criar nova postagem
    
    Form data:
    - descricao: Descrição obrigatória
    - tipo_midia: imagem, video, audio, pdf, gif, texto
    - arquivo: Arquivo (se não for texto)
    - transcrever: true/false (apenas para áudio)
    """
    try:
        # Obter dados do formulário
        descricao = request.form.get('descricao', '').strip()
        tipo_midia = request.form.get('tipo_midia', '').lower()
        transcrever = request.form.get('transcrever', 'false').lower() == 'true'
        
        # Validar descrição
        validar_descricao_postagem(descricao)
        
        # Validar tipo de mídia
        tipos_validos = ['imagem', 'video', 'audio', 'pdf', 'gif', 'texto']
        if tipo_midia not in tipos_validos:
            return jsonify({
                'erro': f'Tipo de mídia inválido. Tipos válidos: {", ".join(tipos_validos)}'
            }), 400
        
        url_midia = None
        url_miniatura = None
        transcricao_audio = None
        tamanho_arquivo = None
        duracao_midia = None
        formato_arquivo = None
        caminho_arquivo = None
        
        # Processar arquivo (se não for texto)
        if tipo_midia != 'texto':
            if 'arquivo' not in request.files:
                return jsonify({
                    'erro': 'Arquivo é obrigatório para este tipo de mídia'
                }), 400
            
            arquivo = request.files['arquivo']
            
            # Fazer upload
            sucesso, mensagem, dados = MediaService.fazer_upload(arquivo, tipo_midia)
            
            if not sucesso:
                return jsonify({'erro': mensagem}), 400
            
            url_midia = dados['url_midia']
            tamanho_arquivo = dados['tamanho_arquivo']
            formato_arquivo = dados['formato_arquivo']
            caminho_arquivo = dados['caminho_completo']
            
            # Processar baseado no tipo
            if tipo_midia in ['imagem', 'gif']:
                url_miniatura = MediaService.processar_imagem(caminho_arquivo, gerar_thumbnail=True)
            
            elif tipo_midia == 'video':
                url_miniatura = MediaService.processar_video(caminho_arquivo)
                duracao_midia = MediaService.obter_duracao_midia(caminho_arquivo, 'video')
            
            elif tipo_midia == 'audio':
                duracao_midia = MediaService.obter_duracao_midia(caminho_arquivo, 'audio')
                
                # Transcrever se solicitado
                if transcrever:
                    logger.info(f"Iniciando transcrição de áudio: {arquivo.filename}")
                    transcricao_audio = MediaService.processar_audio(caminho_arquivo, transcrever=True)
                    
                    if transcricao_audio:
                        logger.info(f"Transcrição concluída: {len(transcricao_audio)} caracteres")
                    else:
                        logger.warning("Transcrição falhou, continuando sem transcrição")
            
            elif tipo_midia == 'pdf':
                url_miniatura = MediaService.processar_pdf(caminho_arquivo)
        
        # Criar postagem no banco
        nova_postagem = {
            'usuario_id': g.usuario_id,
            'descricao': descricao,
            'tipo_midia': tipo_midia,
            'url_midia': url_midia,
            'url_miniatura': url_miniatura,
            'transcricao_audio': transcricao_audio,
            'tamanho_arquivo': tamanho_arquivo,
            'duracao_midia': duracao_midia,
            'formato_arquivo': formato_arquivo,
            'aprovado': True,  # Aprovação automática (pode mudar depois)
            'denunciado': False,
            'numero_denuncias': 0,
            'visualizacoes': 0
        }
        
        result = db.postagens.insert(nova_postagem).execute()
        
        if result.data:
            postagem = result.data[0]
            logger.info(f"Postagem criada: {postagem['id']} por {g.usuario_atual['nome_usuario']}")
            
            return jsonify({
                'sucesso': True,
                'mensagem': 'Postagem criada com sucesso!',
                'postagem': postagem
            }), 201
        
        return jsonify({
            'erro': 'Erro ao criar postagem'
        }), 500
        
    except ValidationError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        logger.error(f"Erro ao criar postagem: {e}", exc_info=True)
        return jsonify({
            'erro': 'Erro ao processar postagem'
        }), 500


@postagens_bp.route('/<postagem_id>', methods=['GET'])
@optional_auth
def obter_postagem(postagem_id):
    """
    Obter detalhes de uma postagem específica
    """
    try:
        # Buscar postagem
        result = db.postagens.select(
            '*, usuarios(nome_usuario, nome_real, foto_perfil_url, tipo_usuario)'
        ).eq('id', postagem_id).eq('aprovado', True).is_('deletado_em', 'null').execute()
        
        if not result.data:
            return jsonify({
                'erro': 'Postagem não encontrada'
            }), 404
        
        postagem = result.data[0]
        
        # Incrementar visualizações
        try:
            db.incrementar_visualizacao(postagem_id)
        except:
            pass  # Não falhar se não conseguir incrementar
        
        # Adicionar contagem de comentários (placeholder)
        postagem['num_comentarios'] = 0  # TODO: Implementar contagem real
        
        return jsonify({
            'postagem': postagem
        }), 200
        
    except Exception as e:
        logger.error(f"Erro ao obter postagem: {e}")
        return jsonify({
            'erro': 'Erro ao buscar postagem'
        }), 500


@postagens_bp.route('/<postagem_id>', methods=['PUT'])
@token_required
def editar_postagem(postagem_id):
    """
    Editar postagem (apenas descrição)
    Apenas o autor pode editar
    """
    try:
        # Buscar postagem
        result = db.postagens.select('*').eq('id', postagem_id).execute()
        
        if not result.data:
            return jsonify({'erro': 'Postagem não encontrada'}), 404
        
        postagem = result.data[0]
        
        # Verificar se é o autor
        if postagem['usuario_id'] != g.usuario_id:
            return jsonify({
                'erro': 'Você só pode editar suas próprias postagens'
            }), 403
        
        # Obter nova descrição
        dados = request.get_json()
        nova_descricao = dados.get('descricao', '').strip()
        
        # Validar descrição
        validar_descricao_postagem(nova_descricao)
        
        # Atualizar postagem
        result = db.postagens.update({
            'descricao': nova_descricao
        }).eq('id', postagem_id).execute()
        
        if result.data:
            logger.info(f"Postagem editada: {postagem_id}")
            return jsonify({
                'sucesso': True,
                'mensagem': 'Postagem atualizada com sucesso'
            }), 200
        
        return jsonify({
            'erro': 'Erro ao atualizar postagem'
        }), 500
        
    except ValidationError as e:
        return jsonify({'erro': str(e)}), 400
    except Exception as e:
        logger.error(f"Erro ao editar postagem: {e}")
        return jsonify({
            'erro': 'Erro ao processar atualização'
        }), 500


@postagens_bp.route('/<postagem_id>', methods=['DELETE'])
@token_required
def deletar_postagem(postagem_id):
    """
    Deletar postagem (soft delete)
    Apenas o autor ou admin pode deletar
    """
    try:
        # Buscar postagem
        result = db.postagens.select('*').eq('id', postagem_id).execute()
        
        if not result.data:
            return jsonify({'erro': 'Postagem não encontrada'}), 404
        
        postagem = result.data[0]
        
        # Verificar se é o autor ou admin
        eh_autor = postagem['usuario_id'] == g.usuario_id
        eh_admin = db.verificar_eh_admin(g.usuario_id) if hasattr(g, 'usuario_id') else False
        
        if not (eh_autor or eh_admin):
            return jsonify({
                'erro': 'Você não tem permissão para deletar esta postagem'
            }), 403
        
        # Soft delete
        from datetime import datetime
        result = db.postagens.update({
            'deletado_em': datetime.now().isoformat()
        }).eq('id', postagem_id).execute()
        
        if result.data:
            logger.info(f"Postagem deletada: {postagem_id} por {g.usuario_atual['nome_usuario']}")
            
            # TODO: Deletar arquivos do servidor (opcional, pode manter para backup)
            # if postagem['url_midia']:
            #     MediaService.deletar_arquivo(...)
            
            return jsonify({
                'sucesso': True,
                'mensagem': 'Postagem deletada com sucesso'
            }), 200
        
        return jsonify({
            'erro': 'Erro ao deletar postagem'
        }), 500
        
    except Exception as e:
        logger.error(f"Erro ao deletar postagem: {e}")
        return jsonify({
            'erro': 'Erro ao processar deleção'
        }), 500


@postagens_bp.route('/usuario/<usuario_id>', methods=['GET'])
@optional_auth
def listar_postagens_usuario(usuario_id):
    """
    Listar postagens de um usuário específico
    """
    try:
        pagina = request.args.get('pagina', 1, type=int)
        por_pagina = request.args.get('por_pagina', 12, type=int)
        
        # Query
        query = db.postagens.select(
            '*, usuarios(nome_usuario, foto_perfil_url)'
        ).eq('usuario_id', usuario_id).eq('aprovado', True).is_('deletado_em', 'null').order('criado_em', desc=True)
        
        # Contar total
        count_result = db.postagens.select('id', count='exact').eq('usuario_id', usuario_id).eq('aprovado', True).is_('deletado_em', 'null').execute()
        total = count_result.count if hasattr(count_result, 'count') else 0
        
        # Paginação
        inicio = (pagina - 1) * por_pagina
        query = query.range(inicio, inicio + por_pagina - 1)
        
        result = query.execute()
        postagens = result.data if result.data else []
        
        # Adicionar contagem de comentários
        for postagem in postagens:
            postagem['num_comentarios'] = 0
        
        resposta = criar_resposta_paginada(postagens, pagina, por_pagina, total)
        
        return jsonify(resposta), 200
        
    except Exception as e:
        logger.error(f"Erro ao listar postagens do usuário: {e}")
        return jsonify({
            'erro': 'Erro ao buscar postagens'
        }), 500