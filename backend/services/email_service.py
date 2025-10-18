"""
Serviço de Email
Usa Supabase Auth para emails automáticos
"""

from config import active_config
from utils.database import db
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)


class EmailService:
    """Serviço para envio de emails"""
    
    @staticmethod
    def _usar_supabase_smtp():
        """Verificar se deve usar SMTP do Supabase"""
        return active_config.USE_SUPABASE_SMTP
    
    @staticmethod
    def enviar_codigo_verificacao(email: str, codigo: str) -> bool:
        """
        Enviar código de verificação de 4 dígitos
        
        NOTA: O Supabase Auth envia emails automaticamente quando
        USE_SUPABASE_SMTP=True. Este método é backup para SMTP personalizado.
        
        Args:
            email: Email do destinatário
            codigo: Código de 4 dígitos
            
        Returns:
            True se enviado com sucesso
        """
        
        # Se usar Supabase SMTP, o email é enviado automaticamente pelo Auth
        if EmailService._usar_supabase_smtp():
            logger.info(f"Email será enviado automaticamente pelo Supabase Auth para {email}")
            logger.info(f"Código de verificação: {codigo}")
            
            # Em desenvolvimento, logar o código
            if active_config.DEV_MODE:
                logger.warning(f"[DEV] Código de verificação para {email}: {codigo}")
            
            return True
        
        # Caso contrário, usar SMTP personalizado
        return EmailService._enviar_email_smtp(email, codigo)
    
    @staticmethod
    def _enviar_email_smtp(email: str, codigo: str) -> bool:
        """
        Enviar email via SMTP personalizado (Resend, SendGrid, etc)
        """
        try:
            # Verificar se SMTP está configurado
            if not active_config.SMTP_USER or not active_config.SMTP_PASSWORD:
                logger.warning("SMTP personalizado não configurado")
                return False
            
            assunto = "Código de Verificação - Mural IFSP"
            
            corpo_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body {{
                        font-family: 'Segoe UI', sans-serif;
                        background-color: #0d1117;
                        color: #e6edf3;
                        padding: 20px;
                    }}
                    .container {{
                        max-width: 600px;
                        margin: 0 auto;
                        background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
                        border-radius: 16px;
                        padding: 40px;
                        border: 1px solid #30363d;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                    }}
                    .logo h1 {{
                        color: #009640;
                        margin: 0 0 30px 0;
                        font-size: 28px;
                        text-align: center;
                    }}
                    .codigo-box {{
                        background: rgba(0, 150, 64, 0.1);
                        border: 2px solid #009640;
                        border-radius: 12px;
                        padding: 30px;
                        text-align: center;
                        margin: 30px 0;
                    }}
                    .codigo {{
                        font-size: 48px;
                        font-weight: bold;
                        color: #00de5e;
                        letter-spacing: 8px;
                        font-family: 'Courier New', monospace;
                    }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="logo">
                        <h1>🎓 Mural IFSP</h1>
                    </div>
                    <p style="color: #8b949e; margin-bottom: 20px;">
                        Para completar seu cadastro, utilize o código de verificação abaixo:
                    </p>
                    <div class="codigo-box">
                        <div class="codigo">{codigo}</div>
                        <p style="margin: 10px 0 0 0; color: #8b949e;">Código de Verificação</p>
                    </div>
                    <p style="color: #8b949e;">
                        Este código expira em <strong>15 minutos</strong>.
                    </p>
                </div>
            </body>
            </html>
            """
            
            # Criar mensagem
            mensagem = MIMEMultipart('alternative')
            mensagem['From'] = active_config.EMAIL_FROM
            mensagem['To'] = email
            mensagem['Subject'] = assunto
            
            parte_html = MIMEText(corpo_html, 'html', 'utf-8')
            mensagem.attach(parte_html)
            
            # Conectar e enviar
            with smtplib.SMTP(active_config.SMTP_HOST, active_config.SMTP_PORT) as servidor:
                if active_config.SMTP_USE_TLS:
                    servidor.starttls()
                
                servidor.login(active_config.SMTP_USER, active_config.SMTP_PASSWORD)
                servidor.send_message(mensagem)
            
            logger.info(f"Email enviado via SMTP para {email}")
            return True
            
        except Exception as e:
            logger.error(f"Erro ao enviar email via SMTP: {e}")
            return False
    
    @staticmethod
    def enviar_notificacao_ban(email: str, nome_usuario: str, motivo: str) -> bool:
        """
        Notificar usuário sobre banimento
        
        Args:
            email: Email do usuário
            nome_usuario: Nome de usuário
            motivo: Motivo do banimento
            
        Returns:
            True se enviado com sucesso
        """
        assunto = "Conta Suspensa - Mural IFSP"
        
        corpo_texto = f"""
        Olá {nome_usuario},
        
        Sua conta no Mural IFSP foi suspensa.
        
        Motivo: {motivo}
        
        Se você acredita que isso foi um erro, entre em contato com a administração.
        
        ---
        Mural IFSP Bragança Paulista
        """
        
        corpo_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #0d1117;
                    color: #e6edf3;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
                    border-radius: 16px;
                    padding: 40px;
                    border: 1px solid #30363d;
                }}
                .alerta {{
                    background: rgba(211, 47, 47, 0.2);
                    border: 2px solid #d32f2f;
                    border-radius: 12px;
                    padding: 20px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1 style="color: #d32f2f;">⚠️ Conta Suspensa</h1>
                <p>Olá <strong>{nome_usuario}</strong>,</p>
                <p>Sua conta no Mural IFSP foi suspensa.</p>
                <div class="alerta">
                    <strong>Motivo:</strong> {motivo}
                </div>
                <p>Se você acredita que isso foi um erro, entre em contato com a administração.</p>
            </div>
        </body>
        </html>
        """
        
        return EmailService._enviar_email(email, assunto, corpo_html, corpo_texto)
    
    @staticmethod
    def enviar_notificacao_denuncia_resolvida(email: str, tipo_conteudo: str, acao: str) -> bool:
        """
        Notificar usuário sobre resolução de denúncia
        
        Args:
            email: Email do denunciante
            tipo_conteudo: Tipo de conteúdo denunciado
            acao: Ação tomada
            
        Returns:
            True se enviado com sucesso
        """
        assunto = "Denúncia Resolvida - Mural IFSP"
        
        corpo_html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #0d1117;
                    color: #e6edf3;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: linear-gradient(135deg, #161b22 0%, #1f2937 100%);
                    border-radius: 16px;
                    padding: 40px;
                }}
                .sucesso {{
                    background: rgba(0, 150, 64, 0.2);
                    border-left: 4px solid #009640;
                    padding: 15px;
                    border-radius: 4px;
                    margin: 20px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <h1 style="color: #009640;">✅ Denúncia Resolvida</h1>
                <p>Sua denúncia sobre um(a) <strong>{tipo_conteudo}</strong> foi analisada.</p>
                <div class="sucesso">
                    <strong>Ação tomada:</strong> {acao}
                </div>
                <p>Obrigado por ajudar a manter o Mural IFSP seguro!</p>
            </div>
        </body>
        </html>
        """
        
        return EmailService._enviar_email(email, assunto, corpo_html)