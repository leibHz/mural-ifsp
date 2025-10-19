"""
Model de Comentário
Estrutura e validações para comentários
"""

from typing import Dict, Optional
from datetime import datetime


class Comentario:
    """Model para representar um comentário"""
    
    def __init__(
        self,
        id: str,
        postagem_id: str,
        usuario_id: str,
        texto: str,
        aprovado: bool = True,
        denunciado: bool = False,
        criado_em: datetime = None,
        atualizado_em: datetime = None,
        deletado_em: Optional[datetime] = None,
        usuario: Optional[Dict] = None
    ):
        self.id = id
        self.postagem_id = postagem_id
        self.usuario_id = usuario_id
        self.texto = texto
        self.aprovado = aprovado
        self.denunciado = denunciado
        self.criado_em = criado_em or datetime.now()
        self.atualizado_em = atualizado_em or datetime.now()
        self.deletado_em = deletado_em
        self.usuario = usuario or {}
    
    @classmethod
    def from_db(cls, data: Dict) -> 'Comentario':
        """Criar instância a partir de dados do banco"""
        return cls(
            id=data['id'],
            postagem_id=data['postagem_id'],
            usuario_id=data['usuario_id'],
            texto=data['texto'],
            aprovado=data.get('aprovado', True),
            denunciado=data.get('denunciado', False),
            criado_em=data.get('criado_em'),
            atualizado_em=data.get('atualizado_em'),
            deletado_em=data.get('deletado_em'),
            usuario=data.get('usuarios') or data.get('usuario')
        )
    
    def to_dict(self) -> Dict:
        """Converter para dicionário"""
        return {
            'id': self.id,
            'postagem_id': self.postagem_id,
            'usuario_id': self.usuario_id,
            'texto': self.texto,
            'aprovado': self.aprovado,
            'denunciado': self.denunciado,
            'criado_em': self.criado_em.isoformat() if isinstance(self.criado_em, datetime) else self.criado_em,
            'atualizado_em': self.atualizado_em.isoformat() if isinstance(self.atualizado_em, datetime) else self.atualizado_em,
            'deletado_em': self.deletado_em.isoformat() if self.deletado_em and isinstance(self.deletado_em, datetime) else self.deletado_em,
            'usuario': self.usuario
        }
    
    def pode_editar(self, usuario_id: str) -> bool:
        """Verificar se usuário pode editar o comentário"""
        return self.usuario_id == usuario_id and not self.deletado_em
    
    def pode_deletar(self, usuario_id: str, is_admin: bool = False) -> bool:
        """Verificar se usuário pode deletar o comentário"""
        return (self.usuario_id == usuario_id or is_admin) and not self.deletado_em
    
    def __repr__(self):
        return f"<Comentario {self.id[:8]}... por {self.usuario_id[:8]}...>"