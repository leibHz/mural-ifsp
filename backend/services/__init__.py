# ===== backend/services/__init__.py =====
"""
Serviços de lógica de negócio
"""

from .auth_service import AuthService
from .email_service import EmailService

__all__ = ['AuthService', 'EmailService']
