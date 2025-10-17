"""
Gerenciamento de conexão com o Supabase
"""

from supabase import create_client, Client
from config import active_config
import logging

logger = logging.getLogger(__name__)


class Database:
    """Singleton para gerenciar conexão com Supabase"""
    
    _instance = None
    _client: Client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Database, cls).__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Inicializar conexão com Supabase"""
        try:
            self._client = create_client(
                active_config.SUPABASE_URL,
                active_config.SUPABASE_KEY
            )
            logger.info("Conexão com Supabase estabelecida")
        except Exception as e:
            logger.error(f"Erro ao conectar com Supabase: {e}")
            raise
    
    @property
    def client(self) -> Client:
        """Retorna o cliente Supabase"""
        if self._client is None:
            self._initialize()
        return self._client
    
    # ===== MÉTODOS AUXILIARES =====
    
    def query(self, table: str):
        """Criar query para uma tabela"""
        return self._client.table(table)
    
    def execute_rpc(self, function_name: str, params: dict = None):
        """Executar função RPC do Supabase"""
        try:
            if params:
                result = self._client.rpc(function_name, params).execute()
            else:
                result = self._client.rpc(function_name).execute()
            return result
        except Exception as e:
            logger.error(f"Erro ao executar RPC {function_name}: {e}")
            raise
    
    # ===== TABELAS =====
    
    @property
    def usuarios(self):
        """Tabela de usuários"""
        return self.query('usuarios')
    
    @property
    def postagens(self):
        """Tabela de postagens"""
        return self.query('postagens')
    
    @property
    def comentarios(self):
        """Tabela de comentários"""
        return self.query('comentarios')
    
    @property
    def denuncias(self):
        """Tabela de denúncias"""
        return self.query('denuncias')
    
    @property
    def administradores(self):
        """Tabela de administradores"""
        return self.query('administradores')
    
    @property
    def logs_admin(self):
        """Tabela de logs administrativos"""
        return self.query('logs_admin')
    
    @property
    def sessoes(self):
        """Tabela de sessões"""
        return self.query('sessoes')
    
    # ===== FUNÇÕES ÚTEIS =====
    
    def incrementar_visualizacao(self, postagem_id: str):
        """Incrementar contador de visualizações de uma postagem"""
        return self.execute_rpc('incrementar_visualizacao', {
            'postagem_uuid': postagem_id
        })
    
    def limpar_sessoes_expiradas(self):
        """Limpar sessões expiradas do banco"""
        return self.execute_rpc('limpar_sessoes_expiradas')
    
    def verificar_eh_admin(self, usuario_id: str) -> bool:
        """Verificar se usuário é administrador"""
        try:
            result = self.execute_rpc('eh_admin', {
                'usuario_uuid': usuario_id
            })
            return result.data if result.data is not None else False
        except:
            return False


# Instância global
db = Database()