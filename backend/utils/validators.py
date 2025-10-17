"""
Funções de validação de dados
"""

import re
from email_validator import validate_email, EmailNotValidError
from config import active_config


class ValidationError(Exception):
    """Exceção customizada para erros de validação"""
    pass


def validar_email(email: str) -> bool:
    """
    Validar formato de email
    
    Args:
        email: Email a ser validado
        
    Returns:
        True se válido
        
    Raises:
        ValidationError: Se email inválido
    """
    try:
        validate_email(email, check_deliverability=False)
        return True
    except EmailNotValidError as e:
        raise ValidationError(f"Email inválido: {str(e)}")


def validar_email_ifsp(email: str) -> bool:
    """
    Validar se email é do domínio IFSP
    
    Args:
        email: Email a ser validado
        
    Returns:
        True se for do IFSP
        
    Raises:
        ValidationError: Se não for email IFSP
    """
    validar_email(email)
    
    if not email.endswith(active_config.IFSP_EMAIL_DOMAIN):
        raise ValidationError(
            f"Email deve ser do domínio {active_config.IFSP_EMAIL_DOMAIN}"
        )
    
    return True


def validar_bp(bp: str) -> bool:
    """
    Validar formato do BP (Prontuário)
    Formato: XX0000000X (exemplo: BP1234567X)
    
    Args:
        bp: BP a ser validado
        
    Returns:
        True se válido
        
    Raises:
        ValidationError: Se BP inválido
    """
    if not bp:
        raise ValidationError("BP não pode ser vazio")
    
    # Remover espaços e converter para maiúsculas
    bp = bp.strip().upper()
    
    # Validar formato
    if not re.match(active_config.BP_REGEX, bp):
        raise ValidationError(
            "Formato de BP inválido. Exemplo válido: BP1234567X"
        )
    
    return True


def validar_senha(senha: str) -> bool:
    """
    Validar força da senha
    Requisitos:
    - Mínimo 8 caracteres
    - Pelo menos uma letra maiúscula
    - Pelo menos uma letra minúscula
    - Pelo menos um número
    
    Args:
        senha: Senha a ser validada
        
    Returns:
        True se válida
        
    Raises:
        ValidationError: Se senha fraca
    """
    if not senha:
        raise ValidationError("Senha não pode ser vazia")
    
    if len(senha) < 8:
        raise ValidationError("Senha deve ter no mínimo 8 caracteres")
    
    if not re.search(r'[A-Z]', senha):
        raise ValidationError("Senha deve conter pelo menos uma letra maiúscula")
    
    if not re.search(r'[a-z]', senha):
        raise ValidationError("Senha deve conter pelo menos uma letra minúscula")
    
    if not re.search(r'\d', senha):
        raise ValidationError("Senha deve conter pelo menos um número")
    
    return True


def validar_nome_usuario(nome_usuario: str) -> bool:
    """
    Validar nome de usuário
    Requisitos:
    - 3-50 caracteres
    - Apenas letras, números, underscore e hífen
    - Não pode começar ou terminar com caracteres especiais
    
    Args:
        nome_usuario: Nome de usuário a ser validado
        
    Returns:
        True se válido
        
    Raises:
        ValidationError: Se inválido
    """
    if not nome_usuario:
        raise ValidationError("Nome de usuário não pode ser vazio")
    
    # Remover espaços
    nome_usuario = nome_usuario.strip()
    
    if len(nome_usuario) < 3:
        raise ValidationError("Nome de usuário deve ter no mínimo 3 caracteres")
    
    if len(nome_usuario) > 50:
        raise ValidationError("Nome de usuário deve ter no máximo 50 caracteres")
    
    # Validar caracteres permitidos
    if not re.match(r'^[a-zA-Z0-9][a-zA-Z0-9_-]*[a-zA-Z0-9]$', nome_usuario):
        raise ValidationError(
            "Nome de usuário deve conter apenas letras, números, _ e -, "
            "e não pode começar ou terminar com caracteres especiais"
        )
    
    return True


def validar_descricao_postagem(descricao: str) -> bool:
    """
    Validar descrição de postagem
    Requisitos:
    - Mínimo 10 caracteres
    - Máximo 5000 caracteres
    
    Args:
        descricao: Descrição a ser validada
        
    Returns:
        True se válida
        
    Raises:
        ValidationError: Se inválida
    """
    if not descricao:
        raise ValidationError("Descrição é obrigatória")
    
    descricao = descricao.strip()
    
    if len(descricao) < 10:
        raise ValidationError("Descrição deve ter no mínimo 10 caracteres")
    
    if len(descricao) > 5000:
        raise ValidationError("Descrição deve ter no máximo 5000 caracteres")
    
    return True


def validar_comentario(texto: str) -> bool:
    """
    Validar texto de comentário
    Requisitos:
    - Mínimo 1 caractere
    - Máximo 1000 caracteres
    
    Args:
        texto: Texto a ser validado
        
    Returns:
        True se válido
        
    Raises:
        ValidationError: Se inválido
    """
    if not texto:
        raise ValidationError("Comentário não pode ser vazio")
    
    texto = texto.strip()
    
    if len(texto) < 1:
        raise ValidationError("Comentário deve ter no mínimo 1 caractere")
    
    if len(texto) > 1000:
        raise ValidationError("Comentário deve ter no máximo 1000 caracteres")
    
    return True


def validar_codigo_verificacao(codigo: str) -> bool:
    """
    Validar código de verificação de 4 dígitos
    
    Args:
        codigo: Código a ser validado
        
    Returns:
        True se válido
        
    Raises:
        ValidationError: Se inválido
    """
    if not codigo:
        raise ValidationError("Código de verificação não pode ser vazio")
    
    codigo = codigo.strip()
    
    if not re.match(r'^\d{4}$', codigo):
        raise ValidationError("Código deve ter exatamente 4 dígitos")
    
    return True


def validar_tamanho_arquivo(tamanho: int) -> bool:
    """
    Validar tamanho de arquivo
    
    Args:
        tamanho: Tamanho em bytes
        
    Returns:
        True se válido
        
    Raises:
        ValidationError: Se exceder limite
    """
    if tamanho > active_config.MAX_FILE_SIZE:
        tamanho_mb = active_config.MAX_FILE_SIZE / 1048576
        raise ValidationError(
            f"Arquivo muito grande. Tamanho máximo: {tamanho_mb:.0f}MB"
        )
    
    return True


def validar_extensao_arquivo(filename: str, tipo_midia: str) -> bool:
    """
    Validar extensão do arquivo baseado no tipo de mídia
    
    Args:
        filename: Nome do arquivo
        tipo_midia: Tipo de mídia (imagem, video, audio, pdf)
        
    Returns:
        True se válido
        
    Raises:
        ValidationError: Se extensão inválida
    """
    if not filename or '.' not in filename:
        raise ValidationError("Nome de arquivo inválido")
    
    extensao = filename.rsplit('.', 1)[1].lower()
    
    extensoes_validas = {
        'imagem': active_config.ALLOWED_IMAGE_FORMATS,
        'video': active_config.ALLOWED_VIDEO_FORMATS,
        'audio': active_config.ALLOWED_AUDIO_FORMATS,
        'pdf': active_config.ALLOWED_DOC_FORMATS,
        'gif': {'gif'}
    }
    
    if tipo_midia not in extensoes_validas:
        raise ValidationError(f"Tipo de mídia '{tipo_midia}' não suportado")
    
    if extensao not in extensoes_validas[tipo_midia]:
        formatos_aceitos = ', '.join(extensoes_validas[tipo_midia])
        raise ValidationError(
            f"Formato .{extensao} não aceito para {tipo_midia}. "
            f"Formatos aceitos: {formatos_aceitos}"
        )
    
    return True