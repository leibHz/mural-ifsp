# ===== backend/routes/__init__.py =====
"""
Rotas da API
"""

from .auth import auth_bp
from .postagens import postagens_bp
from .comentarios import comentarios_bp

__all__ = [
    'auth_bp',
    'postagens_bp',
    'comentarios_bp'
]