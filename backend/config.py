"""
Configurações do Mural IFSP
Carrega variáveis de ambiente e define configurações da aplicação
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

class Config:
    """Configurações base da aplicação"""
    
    # ===== FLASK =====
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    FLASK_ENV = os.getenv('FLASK_ENV', 'development')
    DEBUG = os.getenv('FLASK_DEBUG', 'False').lower() == 'true'
    
    # ===== SUPABASE =====
    SUPABASE_URL = os.getenv('SUPABASE_URL')
    SUPABASE_KEY = os.getenv('SUPABASE_KEY')
    SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')
    
    # Validação: Supabase é obrigatório
    if not all([SUPABASE_URL, SUPABASE_KEY]):
        raise ValueError("Supabase URL e KEY são obrigatórios! Configure no arquivo .env")
    
    # ===== JWT =====
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', SECRET_KEY)
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', 24))
    JWT_ALGORITHM = os.getenv('JWT_ALGORITHM', 'HS256')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=JWT_EXPIRATION_HOURS)
    
    # ===== EMAIL (SUPABASE SMTP) =====
    USE_SUPABASE_SMTP = os.getenv('USE_SUPABASE_SMTP', 'True').lower() == 'true'
    
    # SMTP Personalizado (apenas se não usar Supabase)
    SMTP_HOST = os.getenv('SMTP_HOST', 'smtp.resend.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 465))
    SMTP_USE_TLS = os.getenv('SMTP_USE_TLS', 'True').lower() == 'true'
    SMTP_USER = os.getenv('SMTP_USER', '')
    SMTP_PASSWORD = os.getenv('SMTP_PASSWORD', '')
    EMAIL_FROM = os.getenv('EMAIL_FROM', f'Mural IFSP <noreply@ifsp.edu.br>')
    
    # ===== UPLOAD =====
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, '..', os.getenv('UPLOAD_FOLDER', 'frontend/static/uploads'))
    MAX_FILE_SIZE = int(os.getenv('MAX_FILE_SIZE', 52428800))  # 50MB
    
    # Criar pasta de upload se não existir
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_FOLDER, 'images'), exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_FOLDER, 'videos'), exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_FOLDER, 'audio'), exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_FOLDER, 'docs'), exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_FOLDER, 'thumbnails'), exist_ok=True)
    os.makedirs(os.path.join(UPLOAD_FOLDER, 'profile_pics'), exist_ok=True)
    
    # Formatos permitidos
    ALLOWED_IMAGE_FORMATS = set(os.getenv('ALLOWED_IMAGE_FORMATS', 'jpg,jpeg,png,gif,webp').split(','))
    ALLOWED_VIDEO_FORMATS = set(os.getenv('ALLOWED_VIDEO_FORMATS', 'mp4,webm,mov').split(','))
    ALLOWED_AUDIO_FORMATS = set(os.getenv('ALLOWED_AUDIO_FORMATS', 'mp3,wav,ogg').split(','))
    ALLOWED_DOC_FORMATS = set(os.getenv('ALLOWED_DOC_FORMATS', 'pdf').split(','))
    
    # ===== TRANSCRIÇÃO =====
    TRANSCRIPTION_SERVICE = os.getenv('TRANSCRIPTION_SERVICE', 'whisper_local')
    WHISPER_MODEL = os.getenv('WHISPER_MODEL', 'base')  # tiny, base, small, medium, large
    
    # Alternativa: Deepgram
    DEEPGRAM_API_KEY = os.getenv('DEEPGRAM_API_KEY')
    
    # ===== SEGURANÇA =====
    RATE_LIMIT_POSTS_PER_HOUR = int(os.getenv('RATE_LIMIT_POSTS_PER_HOUR', 10))
    RATE_LIMIT_COMMENTS_PER_HOUR = int(os.getenv('RATE_LIMIT_COMMENTS_PER_HOUR', 50))
    RATE_LIMIT_LOGIN_ATTEMPTS = int(os.getenv('RATE_LIMIT_LOGIN_ATTEMPTS', 5))
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:5000').split(',')
    
    # ===== IFSP =====
    IFSP_EMAIL_DOMAIN = os.getenv('IFSP_EMAIL_DOMAIN', '@aluno.ifsp.edu.br')
    BP_REGEX = os.getenv('BP_REGEX', r'^[A-Z]{2}[0-9]{6}[A-Z0-9]{1,2}$')
    
    # ===== MODERAÇÃO =====
    AUTO_HIDE_THRESHOLD = int(os.getenv('AUTO_HIDE_THRESHOLD', 3))
    
    # ===== CACHE =====
    CACHE_TYPE = os.getenv('CACHE_TYPE', 'simple')
    CACHE_DEFAULT_TIMEOUT = int(os.getenv('CACHE_DEFAULT_TIMEOUT', 300))
    
    # ===== LOGS =====
    LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE = os.getenv('LOG_FILE', 'logs/mural-ifsp.log')
    
    # Criar pasta de logs
    os.makedirs('logs', exist_ok=True)
    
    # ===== DESENVOLVIMENTO =====
    DEV_MODE = os.getenv('DEV_MODE', 'True').lower() == 'true'
    SKIP_EMAIL_VERIFICATION = os.getenv('SKIP_EMAIL_VERIFICATION', 'False').lower() == 'true'
    
    @staticmethod
    def get_allowed_formats():
        """Retorna todos os formatos permitidos"""
        return {
            'imagem': Config.ALLOWED_IMAGE_FORMATS,
            'video': Config.ALLOWED_VIDEO_FORMATS,
            'audio': Config.ALLOWED_AUDIO_FORMATS,
            'pdf': Config.ALLOWED_DOC_FORMATS
        }
    
    @staticmethod
    def is_valid_format(filename, tipo_midia):
        """Verifica se o formato do arquivo é válido"""
        if not filename or '.' not in filename:
            return False
        
        extensao = filename.rsplit('.', 1)[1].lower()
        
        formatos_map = {
            'imagem': Config.ALLOWED_IMAGE_FORMATS,
            'video': Config.ALLOWED_VIDEO_FORMATS,
            'audio': Config.ALLOWED_AUDIO_FORMATS,
            'pdf': Config.ALLOWED_DOC_FORMATS,
            'gif': {'gif'}
        }
        
        formatos_permitidos = formatos_map.get(tipo_midia, set())
        return extensao in formatos_permitidos
    
    @staticmethod
    def get_upload_path(tipo_midia):
        """Retorna o caminho de upload baseado no tipo de mídia"""
        paths = {
            'imagem': 'images',
            'video': 'videos',
            'audio': 'audio',
            'pdf': 'docs',
            'gif': 'images',
            'texto': 'images'  # Postagens de texto podem ter imagem de fundo
        }
        
        subpasta = paths.get(tipo_midia, 'others')
        return os.path.join(Config.UPLOAD_FOLDER, subpasta)


class DevelopmentConfig(Config):
    """Configurações específicas para desenvolvimento"""
    DEBUG = True
    TESTING = False


class ProductionConfig(Config):
    """Configurações específicas para produção"""
    DEBUG = False
    TESTING = False
    
    def __init__(self):
        super().__init__()
        # Em produção, exigir chaves fortes
        if self.SECRET_KEY == 'dev-secret-key-change-in-production':
            raise ValueError("Configure uma SECRET_KEY forte em produção!")


class TestingConfig(Config):
    """Configurações específicas para testes"""
    TESTING = True
    DEBUG = True
    SKIP_EMAIL_VERIFICATION = True


# Mapeamento de ambientes
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig
}

# Configuração ativa baseada no ambiente
active_config = config_by_name[os.getenv('FLASK_ENV', 'development')]