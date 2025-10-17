# ===== backend/utils/__init__.py =====
"""
Utilitários e funções auxiliares
"""

from .database import db
from .validators import (
    ValidationError,
    validar_email,
    validar_email_ifsp,
    validar_bp,
    validar_senha,
    validar_nome_usuario
)
from .helpers import (
    gerar_codigo_verificacao,
    gerar_nome_arquivo_unico,
    calcular_expiracao_codigo,
    formatarDataRelativa
)

__all__ = [
    'db',
    'ValidationError',
    'validar_email',
    'validar_email_ifsp',
    'validar_bp',
    'validar_senha',
    'validar_nome_usuario',
    'gerar_codigo_verificacao',
    'gerar_nome_arquivo_unico',
    'calcular_expiracao_codigo',
    'formatarDataRelativa'
]