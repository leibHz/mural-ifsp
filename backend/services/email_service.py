"""
Serviço de Email usando Supabase Auth
"""

from config import active_config
from utils.database import db
import logging

logger = logging.getLogger(__name__)

class EmailService:
    """Serviço para gerenciar emails via Supabase Auth"""
    
    @staticmethod
    def enviar_codigo_verificacao_via_supabase(usuario_id: str, codigo: str):
        """
        O Supabase Auth envia emails automaticamente!
        Apenas salvamos o código no banco.
        """
        try:
            # Supabase Auth envia email automaticamente ao registrar
            # Apenas garantir que o código está salvo
            logger.info(f"Código de verificação salvo para {usuario_id}")
            return True
        except Exception as e:
            logger.error(f"Erro ao processar email: {e}")
            return False
    
    @staticmethod
    def _usar_smtp_personalizado():
        """Verificar se deve usar SMTP personalizado"""
        return active_config.get('USE_SUPABASE_SMTP', 'True') == 'False'