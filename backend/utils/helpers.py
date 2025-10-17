"""
Funções auxiliares diversas
"""

import os
import uuid
import random
import string
from datetime import datetime, timedelta
from typing import Optional, Tuple
from werkzeug.utils import secure_filename
from slugify import slugify
import hashlib


def gerar_codigo_verificacao() -> str:
    """
    Gerar código de verificação de 4 dígitos
    
    Returns:
        String com 4 dígitos aleatórios
    """
    return ''.join(random.choices(string.digits, k=4))


def gerar_nome_arquivo_unico(filename: str) -> str:
    """
    Gerar nome único para arquivo mantendo a extensão
    
    Args:
        filename: Nome original do arquivo
        
    Returns:
        Nome único seguro para o arquivo
    """
    # Obter extensão
    extensao = ''
    if '.' in filename:
        extensao = filename.rsplit('.', 1)[1].lower()
    
    # Gerar nome único
    nome_unico = f"{uuid.uuid4().hex}"
    
    if extensao:
        return f"{nome_unico}.{extensao}"
    return nome_unico


def gerar_slug(texto: str) -> str:
    """
    Gerar slug amigável para URLs
    
    Args:
        texto: Texto a ser convertido
        
    Returns:
        Slug gerado
    """
    return slugify(texto, max_length=100)


def calcular_expiracao_codigo(minutos: int = 15) -> datetime:
    """
    Calcular data de expiração para código de verificação
    
    Args:
        minutos: Minutos até expiração (padrão: 15)
        
    Returns:
        Data/hora de expiração
    """
    return datetime.now() + timedelta(minutes=minutos)


def calcular_expiracao_sessao(horas: int = 24) -> datetime:
    """
    Calcular data de expiração para sessão
    
    Args:
        horas: Horas até expiração (padrão: 24)
        
    Returns:
        Data/hora de expiração
    """
    return datetime.now() + timedelta(hours=horas)


def verificar_codigo_expirado(data_expiracao: datetime) -> bool:
    """
    Verificar se código/sessão expirou
    
    Args:
        data_expiracao: Data de expiração a verificar
        
    Returns:
        True se expirado, False caso contrário
    """
    return datetime.now() > data_expiracao


def formatar_tamanho_arquivo(bytes_size: int) -> str:
    """
    Formatar tamanho de arquivo em formato legível
    
    Args:
        bytes_size: Tamanho em bytes
        
    Returns:
        String formatada (ex: "2.5 MB")
    """
    for unidade in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024.0:
            return f"{bytes_size:.1f} {unidade}"
        bytes_size /= 1024.0
    return f"{bytes_size:.1f} TB"


def extrair_extensao(filename: str) -> Optional[str]:
    """
    Extrair extensão de um arquivo
    
    Args:
        filename: Nome do arquivo
        
    Returns:
        Extensão em minúsculas ou None
    """
    if '.' not in filename:
        return None
    return filename.rsplit('.', 1)[1].lower()


def salvar_arquivo_com_nome_unico(arquivo, pasta_destino: str, tipo_midia: str) -> Tuple[str, str]:
    """
    Salvar arquivo com nome único
    
    Args:
        arquivo: Objeto FileStorage do Flask
        pasta_destino: Pasta onde salvar
        tipo_midia: Tipo de mídia (para organização)
        
    Returns:
        Tupla (caminho_relativo, nome_arquivo)
    """
    # Gerar nome único
    nome_original = secure_filename(arquivo.filename)
    nome_unico = gerar_nome_arquivo_unico(nome_original)
    
    # Criar subpasta por tipo se não existir
    pasta_final = os.path.join(pasta_destino, tipo_midia)
    os.makedirs(pasta_final, exist_ok=True)
    
    # Caminho completo
    caminho_completo = os.path.join(pasta_final, nome_unico)
    
    # Salvar arquivo
    arquivo.save(caminho_completo)
    
    # Retornar caminho relativo para URL
    caminho_relativo = os.path.join(tipo_midia, nome_unico)
    
    return caminho_relativo, nome_unico


def calcular_hash_arquivo(caminho_arquivo: str) -> str:
    """
    Calcular hash SHA256 de um arquivo
    
    Args:
        caminho_arquivo: Caminho do arquivo
        
    Returns:
        Hash hexadecimal
    """
    sha256_hash = hashlib.sha256()
    
    with open(caminho_arquivo, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    
    return sha256_hash.hexdigest()


def limpar_html(texto: str) -> str:
    """
    Remover tags HTML de um texto (sanitização básica)
    
    Args:
        texto: Texto possivelmente com HTML
        
    Returns:
        Texto limpo
    """
    import re
    clean = re.compile('<.*?>')
    return re.sub(clean, '', texto)


def truncar_texto(texto: str, max_length: int = 100, sufixo: str = '...') -> str:
    """
    Truncar texto mantendo palavras completas
    
    Args:
        texto: Texto a truncar
        max_length: Comprimento máximo
        sufixo: Sufixo a adicionar (padrão: '...')
        
    Returns:
        Texto truncado
    """
    if len(texto) <= max_length:
        return texto
    
    # Truncar e procurar último espaço
    texto_truncado = texto[:max_length]
    ultimo_espaco = texto_truncado.rfind(' ')
    
    if ultimo_espaco != -1:
        texto_truncado = texto_truncado[:ultimo_espaco]
    
    return texto_truncado + sufixo


def formatar_data_relativa(data: datetime) -> str:
    """
    Formatar data em formato relativo (ex: "há 2 horas")
    
    Args:
        data: Data a formatar
        
    Returns:
        String formatada
    """
    agora = datetime.now()
    diferenca = agora - data
    
    segundos = diferenca.total_seconds()
    
    if segundos < 60:
        return "agora mesmo"
    elif segundos < 3600:
        minutos = int(segundos / 60)
        return f"há {minutos} minuto{'s' if minutos > 1 else ''}"
    elif segundos < 86400:
        horas = int(segundos / 3600)
        return f"há {horas} hora{'s' if horas > 1 else ''}"
    elif segundos < 604800:
        dias = int(segundos / 86400)
        return f"há {dias} dia{'s' if dias > 1 else ''}"
    elif segundos < 2592000:
        semanas = int(segundos / 604800)
        return f"há {semanas} semana{'s' if semanas > 1 else ''}"
    elif segundos < 31536000:
        meses = int(segundos / 2592000)
        return f"há {meses} {'mês' if meses == 1 else 'meses'}"
    else:
        anos = int(segundos / 31536000)
        return f"há {anos} ano{'s' if anos > 1 else ''}"


def validar_uuid(uuid_string: str) -> bool:
    """
    Validar se string é um UUID válido
    
    Args:
        uuid_string: String a validar
        
    Returns:
        True se válido
    """
    try:
        uuid.UUID(uuid_string)
        return True
    except (ValueError, AttributeError):
        return False


def gerar_token_sessao() -> str:
    """
    Gerar token aleatório para sessão
    
    Returns:
        Token hexadecimal
    """
    return uuid.uuid4().hex + uuid.uuid4().hex  # 64 caracteres


def criar_resposta_paginada(dados: list, pagina: int, por_pagina: int, total: int) -> dict:
    """
    Criar resposta paginada padronizada
    
    Args:
        dados: Lista de itens da página atual
        pagina: Número da página atual
        por_pagina: Itens por página
        total: Total de itens
        
    Returns:
        Dicionário com dados paginados
    """
    total_paginas = (total + por_pagina - 1) // por_pagina
    
    return {
        'dados': dados,
        'paginacao': {
            'pagina_atual': pagina,
            'por_pagina': por_pagina,
            'total_items': total,
            'total_paginas': total_paginas,
            'tem_proxima': pagina < total_paginas,
            'tem_anterior': pagina > 1
        }
    }