"""
Serviço de Comentários
Lógica de negócio para comentários
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime
from utils.database import db
from utils.validators import validar_comentario, ValidationError
from models.comentario import Comentario
import logging

logger = logging.getLogger(__name__)


class ComentarioService:
    """Serviço para gerenciar comentários"""
    
    @staticmethod
    def criar_comentario(
        postagem_id: str,
        usuario_id: str,
        texto: str
    ) -> Tuple[bool, str, Optional[Dict]]:
        """
        Criar novo comentário
        
        Args:
            postagem_id: ID da postagem
            usuario_id: ID do usuário
            texto: Texto do comentário
            
        Returns:
            Tupla (sucesso, mensagem, comentario_dict)
        """
        try:
            # Validar texto
            validar_comentario(texto)
            
            # Verificar se postagem existe
            postagem = db.postagens.select('id').eq('id', postagem_id).execute()
            if not postagem.data:
                return False, "Postagem não encontrada", None
            
            # Verificar se usuário está banido
            usuario = db.usuarios.select('banido').eq('id', usuario_id).execute()
            if usuario.data and usuario.data[0]['banido']:
                return False, "Usuário banido não pode comentar", None
            
            # Criar comentário
            novo_comentario = {
                'postagem_id': postagem_id,
                'usuario_id': usuario_id,
                'texto': texto.strip(),
                'aprovado': True,
                'denunciado': False
            }
            
            result = db.comentarios.insert(novo_comentario).execute()
            
            if result.data:
                comentario_data = result.data[0]
                
                # Buscar dados do usuário
                usuario_data = db.usuarios.select(
                    'id', 'nome_usuario', 'foto_perfil_url', 'tipo_usuario'
                ).eq('id', usuario_id).execute()
                
                if usuario_data.data:
                    comentario_data['usuario'] = usuario_data.data[0]
                
                logger.info(f"Comentário criado: {comentario_data['id']}")
                return True, "Comentário publicado com sucesso", comentario_data
            
            return False, "Erro ao criar comentário", None
            
        except ValidationError as e:
            return False, str(e), None
        except Exception as e:
            logger.error(f"Erro ao criar comentário: {e}")
            return False, "Erro ao processar comentário", None
    
    @staticmethod
    def listar_comentarios(
        postagem_id: str,
        pagina: int = 1,
        por_pagina: int = 20,
        ordenacao: str = 'recentes'
    ) -> Tuple[List[Dict], int]:
        """
        Listar comentários de uma postagem
        
        Args:
            postagem_id: ID da postagem
            pagina: Número da página
            por_pagina: Comentários por página
            ordenacao: Tipo de ordenação (recentes, antigos)
            
        Returns:
            Tupla (lista_comentarios, total)
        """
        try:
            # Query base
            query = db.comentarios.select(
                '*, usuarios(id, nome_usuario, foto_perfil_url, tipo_usuario)'
            ).eq('postagem_id', postagem_id).eq('aprovado', True).is_('deletado_em', 'null')
            
            # Aplicar ordenação
            if ordenacao == 'antigos':
                query = query.order('criado_em', desc=False)
            else:  # recentes
                query = query.order('criado_em', desc=True)
            
            # Contar total
            count_result = db.comentarios.select(
                'id', count='exact'
            ).eq('postagem_id', postagem_id).eq('aprovado', True).is_('deletado_em', 'null').execute()
            
            total = count_result.count if hasattr(count_result, 'count') else 0
            
            # Paginação
            inicio = (pagina - 1) * por_pagina
            query = query.range(inicio, inicio + por_pagina - 1)
            
            result = query.execute()
            comentarios = result.data if result.data else []
            
            return comentarios, total
            
        except Exception as e:
            logger.error(f"Erro ao listar comentários: {e}")
            return [], 0
    
    @staticmethod
    def obter_comentario(comentario_id: str) -> Optional[Dict]:
        """
        Obter comentário por ID
        
        Args:
            comentario_id: ID do comentário
            
        Returns:
            Dados do comentário ou None
        """
        try:
            result = db.comentarios.select(
                '*, usuarios(id, nome_usuario, foto_perfil_url, tipo_usuario)'
            ).eq('id', comentario_id).execute()
            
            if result.data:
                return result.data[0]
            
            return None
            
        except Exception as e:
            logger.error(f"Erro ao obter comentário: {e}")
            return None
    
    @staticmethod
    def editar_comentario(
        comentario_id: str,
        usuario_id: str,
        novo_texto: str
    ) -> Tuple[bool, str]:
        """
        Editar comentário
        
        Args:
            comentario_id: ID do comentário
            usuario_id: ID do usuário
            novo_texto: Novo texto
            
        Returns:
            Tupla (sucesso, mensagem)
        """
        try:
            # Validar texto
            validar_comentario(novo_texto)
            
            # Buscar comentário
            comentario = ComentarioService.obter_comentario(comentario_id)
            
            if not comentario:
                return False, "Comentário não encontrado"
            
            # Verificar permissão
            if comentario['usuario_id'] != usuario_id:
                return False, "Você não tem permissão para editar este comentário"
            
            if comentario.get('deletado_em'):
                return False, "Comentário deletado não pode ser editado"
            
            # Atualizar
            result = db.comentarios.update({
                'texto': novo_texto.strip()
            }).eq('id', comentario_id).execute()
            
            if result.data:
                logger.info(f"Comentário editado: {comentario_id}")
                return True, "Comentário atualizado com sucesso"
            
            return False, "Erro ao atualizar comentário"
            
        except ValidationError as e:
            return False, str(e)
        except Exception as e:
            logger.error(f"Erro ao editar comentário: {e}")
            return False, "Erro ao processar edição"
    
    @staticmethod
    def deletar_comentario(
        comentario_id: str,
        usuario_id: str,
        is_admin: bool = False
    ) -> Tuple[bool, str]:
        """
        Deletar comentário (soft delete)
        
        Args:
            comentario_id: ID do comentário
            usuario_id: ID do usuário
            is_admin: Se é administrador
            
        Returns:
            Tupla (sucesso, mensagem)
        """
        try:
            # Buscar comentário
            comentario = ComentarioService.obter_comentario(comentario_id)
            
            if not comentario:
                return False, "Comentário não encontrado"
            
            # Verificar permissão
            if comentario['usuario_id'] != usuario_id and not is_admin:
                return False, "Você não tem permissão para deletar este comentário"
            
            if comentario.get('deletado_em'):
                return False, "Comentário já foi deletado"
            
            # Soft delete
            result = db.comentarios.update({
                'deletado_em': datetime.now().isoformat()
            }).eq('id', comentario_id).execute()
            
            if result.data:
                logger.info(f"Comentário deletado: {comentario_id}")
                return True, "Comentário deletado com sucesso"
            
            return False, "Erro ao deletar comentário"
            
        except Exception as e:
            logger.error(f"Erro ao deletar comentário: {e}")
            return False, "Erro ao processar deleção"
    
    @staticmethod
    def contar_comentarios(postagem_id: str) -> int:
        """
        Contar comentários de uma postagem
        
        Args:
            postagem_id: ID da postagem
            
        Returns:
            Número de comentários
        """
        try:
            result = db.comentarios.select(
                'id', count='exact'
            ).eq('postagem_id', postagem_id).eq('aprovado', True).is_('deletado_em', 'null').execute()
            
            return result.count if hasattr(result, 'count') else 0
            
        except Exception as e:
            logger.error(f"Erro ao contar comentários: {e}")
            return 0
    
    @staticmethod
    def denunciar_comentario(
        comentario_id: str,
        denunciante_id: str,
        motivo: str,
        descricao: Optional[str] = None
    ) -> Tuple[bool, str]:
        """
        Denunciar comentário
        
        Args:
            comentario_id: ID do comentário
            denunciante_id: ID do denunciante
            motivo: Motivo da denúncia
            descricao: Descrição opcional
            
        Returns:
            Tupla (sucesso, mensagem)
        """
        try:
            # Verificar se comentário existe
            comentario = ComentarioService.obter_comentario(comentario_id)
            
            if not comentario:
                return False, "Comentário não encontrado"
            
            # Verificar se já denunciou
            denuncia_existente = db.denuncias.select('id').eq(
                'tipo_conteudo', 'comentario'
            ).eq('conteudo_id', comentario_id).eq('denunciante_id', denunciante_id).execute()
            
            if denuncia_existente.data:
                return False, "Você já denunciou este comentário"
            
            # Criar denúncia
            nova_denuncia = {
                'denunciante_id': denunciante_id,
                'tipo_conteudo': 'comentario',
                'conteudo_id': comentario_id,
                'motivo': motivo,
                'descricao': descricao,
                'resolvido': False
            }
            
            result = db.denuncias.insert(nova_denuncia).execute()
            
            if result.data:
                logger.info(f"Denúncia de comentário criada: {result.data[0]['id']}")
                return True, "Denúncia enviada com sucesso"
            
            return False, "Erro ao criar denúncia"
            
        except Exception as e:
            logger.error(f"Erro ao denunciar comentário: {e}")
            return False, "Erro ao processar denúncia"