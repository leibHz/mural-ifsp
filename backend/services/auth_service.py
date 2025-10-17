"""
Serviço de Autenticação
Gerencia registro, login e tokens JWT
"""

import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
from config import active_config
from utils.database import db
from utils.validators import (
    validar_email, validar_email_ifsp, validar_bp,
    validar_senha, validar_nome_usuario, validar_codigo_verificacao
)
from utils.helpers import (
    gerar_codigo_verificacao, calcular_expiracao_codigo,
    gerar_token_sessao, calcular_expiracao_sessao,
    verificar_codigo_expirado
)
import logging

logger = logging.getLogger(__name__)


class AuthService:
    """Serviço de autenticação"""
    
    @staticmethod
    def hash_senha(senha: str) -> str:
        """
        Criar hash da senha usando bcrypt
        
        Args:
            senha: Senha em texto puro
            
        Returns:
            Hash da senha
        """
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(senha.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verificar_senha(senha: str, senha_hash: str) -> bool:
        """
        Verificar se senha corresponde ao hash
        
        Args:
            senha: Senha em texto puro
            senha_hash: Hash armazenado
            
        Returns:
            True se senha correta
        """
        return bcrypt.checkpw(senha.encode('utf-8'), senha_hash.encode('utf-8'))
    
    @staticmethod
    def gerar_jwt_token(usuario_id: str, tipo_usuario: str) -> str:
        """
        Gerar token JWT para autenticação
        
        Args:
            usuario_id: ID do usuário
            tipo_usuario: Tipo (estudante ou visitante)
            
        Returns:
            Token JWT
        """
        payload = {
            'user_id': usuario_id,
            'tipo_usuario': tipo_usuario,
            'exp': datetime.utcnow() + timedelta(hours=active_config.JWT_EXPIRATION_HOURS),
            'iat': datetime.utcnow()
        }
        
        return jwt.encode(
            payload,
            active_config.JWT_SECRET_KEY,
            algorithm=active_config.JWT_ALGORITHM
        )
    
    @staticmethod
    def decodificar_jwt_token(token: str) -> Optional[Dict]:
        """
        Decodificar e validar token JWT
        
        Args:
            token: Token JWT
            
        Returns:
            Payload do token ou None se inválido
        """
        try:
            payload = jwt.decode(
                token,
                active_config.JWT_SECRET_KEY,
                algorithms=[active_config.JWT_ALGORITHM]
            )
            return payload
        except jwt.ExpiredSignatureError:
            logger.warning("Token JWT expirado")
            return None
        except jwt.InvalidTokenError:
            logger.warning("Token JWT inválido")
            return None
    
    @staticmethod
    def registrar_estudante(
        nome_real: str,
        bp: str,
        email: str,
        senha: str,
        nome_usuario: str
    ) -> Tuple[bool, str, Optional[Dict]]:
        """
        Registrar novo estudante
        
        Args:
            nome_real: Nome completo do estudante
            bp: Prontuário (BP)
            email: Email institucional
            senha: Senha
            nome_usuario: Nome de usuário escolhido
            
        Returns:
            Tupla (sucesso, mensagem, dados_usuario)
        """
        try:
            # Validações
            validar_nome_usuario(nome_usuario)
            validar_email_ifsp(email)
            validar_bp(bp)
            validar_senha(senha)
            
            # Verificar se já existe
            usuario_existente = db.usuarios.select('id').or_(
                f'nome_usuario.eq.{nome_usuario},'
                f'email.eq.{email},'
                f'bp.eq.{bp}'
            ).execute()
            
            if usuario_existente.data:
                return False, "Usuário, email ou BP já cadastrado", None
            
            # Hash da senha
            senha_hash = AuthService.hash_senha(senha)
            
            # Inserir usuário
            novo_usuario = {
                'tipo_usuario': 'estudante',
                'nome_usuario': nome_usuario,
                'email': email,
                'senha_hash': senha_hash,
                'nome_real': nome_real,
                'bp': bp.upper(),
                'email_verificado': True  # Estudantes são verificados automaticamente
            }
            
            result = db.usuarios.insert(novo_usuario).execute()
            
            if result.data:
                usuario = result.data[0]
                logger.info(f"Estudante registrado: {nome_usuario} ({bp})")
                
                return True, "Estudante cadastrado com sucesso!", {
                    'id': usuario['id'],
                    'nome_usuario': usuario['nome_usuario'],
                    'tipo_usuario': usuario['tipo_usuario']
                }
            
            return False, "Erro ao cadastrar estudante", None
            
        except Exception as e:
            logger.error(f"Erro ao registrar estudante: {e}")
            return False, str(e), None
    
    @staticmethod
    def registrar_visitante(
        nome_usuario: str,
        email: str,
        senha: str
    ) -> Tuple[bool, str, Optional[str]]:
        """
        Registrar novo visitante (envia código de verificação)
        
        Args:
            nome_usuario: Nome de usuário escolhido
            email: Email
            senha: Senha
            
        Returns:
            Tupla (sucesso, mensagem, usuario_id)
        """
        try:
            # Validações
            validar_nome_usuario(nome_usuario)
            validar_email(email)
            validar_senha(senha)
            
            # Verificar se já existe
            usuario_existente = db.usuarios.select('id').or_(
                f'nome_usuario.eq.{nome_usuario},'
                f'email.eq.{email}'
            ).execute()
            
            if usuario_existente.data:
                return False, "Nome de usuário ou email já cadastrado", None
            
            # Gerar código de verificação
            codigo = gerar_codigo_verificacao()
            expiracao = calcular_expiracao_codigo(15)  # 15 minutos
            
            # Hash da senha
            senha_hash = AuthService.hash_senha(senha)
            
            # Inserir usuário (não verificado)
            novo_usuario = {
                'tipo_usuario': 'visitante',
                'nome_usuario': nome_usuario,
                'email': email,
                'senha_hash': senha_hash,
                'email_verificado': False,
                'codigo_verificacao': codigo,
                'codigo_expiracao': expiracao.isoformat()
            }
            
            result = db.usuarios.insert(novo_usuario).execute()
            
            if result.data:
                usuario = result.data[0]
                logger.info(f"Visitante pré-registrado: {nome_usuario}")
                
                # Enviar email com código (será implementado no email_service)
                from services.email_service import EmailService
                EmailService.enviar_codigo_verificacao(email, codigo)
                
                return True, "Código de verificação enviado para seu email", usuario['id']
            
            return False, "Erro ao cadastrar visitante", None
            
        except Exception as e:
            logger.error(f"Erro ao registrar visitante: {e}")
            return False, str(e), None
    
    @staticmethod
    def verificar_codigo(usuario_id: str, codigo: str) -> Tuple[bool, str]:
        """
        Verificar código de verificação de email
        
        Args:
            usuario_id: ID do usuário
            codigo: Código de 4 dígitos
            
        Returns:
            Tupla (sucesso, mensagem)
        """
        try:
            validar_codigo_verificacao(codigo)
            
            # Buscar usuário
            result = db.usuarios.select('*').eq('id', usuario_id).execute()
            
            if not result.data:
                return False, "Usuário não encontrado"
            
            usuario = result.data[0]
            
            # Verificar se já está verificado
            if usuario['email_verificado']:
                return False, "Email já verificado"
            
            # Verificar código
            if usuario['codigo_verificacao'] != codigo:
                return False, "Código incorreto"
            
            # Verificar expiração
            expiracao = datetime.fromisoformat(usuario['codigo_expiracao'])
            if verificar_codigo_expirado(expiracao):
                return False, "Código expirado. Solicite um novo código"
            
            # Marcar como verificado
            db.usuarios.update({
                'email_verificado': True,
                'codigo_verificacao': None,
                'codigo_expiracao': None
            }).eq('id', usuario_id).execute()
            
            logger.info(f"Email verificado: {usuario['nome_usuario']}")
            return True, "Email verificado com sucesso!"
            
        except Exception as e:
            logger.error(f"Erro ao verificar código: {e}")
            return False, str(e)
    
    @staticmethod
    def login(identificador: str, senha: str, ip_address: str = None, user_agent: str = None) -> Tuple[bool, str, Optional[Dict]]:
        """
        Fazer login de usuário
        
        Args:
            identificador: Email ou nome de usuário
            senha: Senha
            ip_address: IP do cliente
            user_agent: User agent do navegador
            
        Returns:
            Tupla (sucesso, mensagem, dados)
        """
        try:
            # Buscar usuário por email ou nome de usuário
            result = db.usuarios.select('*').or_(
                f'email.eq.{identificador},'
                f'nome_usuario.eq.{identificador}'
            ).execute()
            
            if not result.data:
                return False, "Usuário não encontrado", None
            
            usuario = result.data[0]
            
            # Verificar se está banido
            if usuario['banido']:
                return False, f"Usuário banido. Motivo: {usuario.get('motivo_ban', 'Não especificado')}", None
            
            # Verificar senha
            if not AuthService.verificar_senha(senha, usuario['senha_hash']):
                return False, "Senha incorreta", None
            
            # Verificar se email foi verificado (apenas para visitantes)
            if usuario['tipo_usuario'] == 'visitante' and not usuario['email_verificado']:
                return False, "Email não verificado. Verifique seu email", None
            
            # Gerar token JWT
            token = AuthService.gerar_jwt_token(usuario['id'], usuario['tipo_usuario'])
            
            # Criar sessão
            token_sessao = gerar_token_sessao()
            expiracao_sessao = calcular_expiracao_sessao(24)
            
            db.sessoes.insert({
                'usuario_id': usuario['id'],
                'token': token_sessao,
                'ip_address': ip_address,
                'user_agent': user_agent,
                'expira_em': expiracao_sessao.isoformat()
            }).execute()
            
            # Atualizar último acesso
            db.usuarios.update({
                'ultimo_acesso': datetime.now().isoformat()
            }).eq('id', usuario['id']).execute()
            
            logger.info(f"Login bem-sucedido: {usuario['nome_usuario']}")
            
            return True, "Login realizado com sucesso!", {
                'token': token,
                'token_sessao': token_sessao,
                'usuario': {
                    'id': usuario['id'],
                    'nome_usuario': usuario['nome_usuario'],
                    'nome_real': usuario.get('nome_real'),
                    'email': usuario['email'],
                    'tipo_usuario': usuario['tipo_usuario'],
                    'foto_perfil_url': usuario.get('foto_perfil_url')
                }
            }
            
        except Exception as e:
            logger.error(f"Erro ao fazer login: {e}")
            return False, "Erro ao fazer login", None
    
    @staticmethod
    def logout(token_sessao: str) -> bool:
        """
        Fazer logout (remover sessão)
        
        Args:
            token_sessao: Token da sessão
            
        Returns:
            True se bem-sucedido
        """
        try:
            db.sessoes.delete().eq('token', token_sessao).execute()
            logger.info("Logout realizado")
            return True
        except Exception as e:
            logger.error(f"Erro ao fazer logout: {e}")
            return False