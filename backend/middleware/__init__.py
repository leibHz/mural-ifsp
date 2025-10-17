# ===== backend/middleware/__init__.py =====
"""
Middlewares da aplicação
"""

from .auth_middleware import (
    token_required,
    estudante_required,
    admin_required,
    super_admin_required,
    optional_auth
)

__all__ = [
    'token_required',
    'estudante_required', 
    'admin_required',
    'super_admin_required',
    'optional_auth'
]
