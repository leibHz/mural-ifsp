"""
Serviço de Upload e Processamento de Mídia
Gerencia upload, validação e processamento de arquivos
"""

import os
import uuid
from werkzeug.utils import secure_filename
from PIL import Image
import logging
from typing import Tuple, Optional, Dict
from config import active_config
from utils.validators import validar_tamanho_arquivo, validar_extensao_arquivo, ValidationError
from utils.helpers import gerar_nome_arquivo_unico

logger = logging.getLogger(__name__)


class MediaService:
    """Serviço para gerenciar upload e processamento de mídia"""
    
    @staticmethod
    def validar_arquivo(arquivo, tipo_midia: str) -> Tuple[bool, str]:
        """
        Validar arquivo antes do upload
        
        Args:
            arquivo: Objeto FileStorage do Flask
            tipo_midia: Tipo de mídia (imagem, video, audio, pdf)
            
        Returns:
            Tupla (válido, mensagem_erro)
        """
        try:
            if not arquivo or not arquivo.filename:
                return False, "Nenhum arquivo enviado"
            
            # Validar extensão
            validar_extensao_arquivo(arquivo.filename, tipo_midia)
            
            # Validar tamanho
            arquivo.seek(0, os.SEEK_END)
            tamanho = arquivo.tell()
            arquivo.seek(0)
            
            validar_tamanho_arquivo(tamanho)
            
            return True, "Arquivo válido"
            
        except ValidationError as e:
            return False, str(e)
        except Exception as e:
            logger.error(f"Erro ao validar arquivo: {e}")
            return False, "Erro ao validar arquivo"
    
    @staticmethod
    def fazer_upload(arquivo, tipo_midia: str) -> Tuple[bool, str, Optional[Dict]]:
        """
        Fazer upload de arquivo
        
        Args:
            arquivo: Objeto FileStorage
            tipo_midia: Tipo de mídia
            
        Returns:
            Tupla (sucesso, mensagem, dados_arquivo)
        """
        try:
            # Validar arquivo
            valido, erro = MediaService.validar_arquivo(arquivo, tipo_midia)
            if not valido:
                return False, erro, None
            
            # Gerar nome único
            nome_original = secure_filename(arquivo.filename)
            nome_unico = gerar_nome_arquivo_unico(nome_original)
            
            # Determinar pasta de destino
            pasta_tipo = MediaService._obter_pasta_tipo(tipo_midia)
            pasta_destino = os.path.join(active_config.UPLOAD_FOLDER, pasta_tipo)
            os.makedirs(pasta_destino, exist_ok=True)
            
            # Caminho completo
            caminho_arquivo = os.path.join(pasta_destino, nome_unico)
            
            # Salvar arquivo
            arquivo.save(caminho_arquivo)
            
            # Obter informações do arquivo
            tamanho_arquivo = os.path.getsize(caminho_arquivo)
            extensao = nome_original.rsplit('.', 1)[1].lower() if '.' in nome_original else ''
            
            # URL relativa para acesso
            url_relativa = f"/static/uploads/{pasta_tipo}/{nome_unico}"
            
            dados = {
                'nome_arquivo': nome_unico,
                'nome_original': nome_original,
                'caminho_completo': caminho_arquivo,
                'url_midia': url_relativa,
                'tamanho_arquivo': tamanho_arquivo,
                'formato_arquivo': extensao
            }
            
            logger.info(f"Arquivo enviado com sucesso: {nome_unico}")
            return True, "Upload realizado com sucesso", dados
            
        except Exception as e:
            logger.error(f"Erro ao fazer upload: {e}")
            return False, f"Erro ao fazer upload: {str(e)}", None
    
    @staticmethod
    def _obter_pasta_tipo(tipo_midia: str) -> str:
        """Obter pasta de destino baseado no tipo de mídia"""
        mapeamento = {
            'imagem': 'images',
            'video': 'videos',
            'audio': 'audio',
            'pdf': 'docs',
            'gif': 'images',
            'texto': 'images'
        }
        return mapeamento.get(tipo_midia, 'others')
    
    @staticmethod
    def processar_imagem(caminho_arquivo: str, gerar_thumbnail: bool = True) -> Optional[str]:
        """
        Processar imagem: comprimir e gerar thumbnail
        
        Args:
            caminho_arquivo: Caminho do arquivo
            gerar_thumbnail: Se deve gerar thumbnail
            
        Returns:
            Caminho do thumbnail ou None
        """
        try:
            from services.thumbnail_service import ThumbnailService
            
            # Abrir imagem
            img = Image.open(caminho_arquivo)
            
            # Converter RGBA para RGB se necessário
            if img.mode == 'RGBA':
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[3])
                img = rgb_img
            
            # Otimizar tamanho (reduzir se muito grande)
            max_size = 1920
            if max(img.size) > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                img.save(caminho_arquivo, optimize=True, quality=85)
                logger.info(f"Imagem redimensionada: {caminho_arquivo}")
            
            # Gerar thumbnail
            if gerar_thumbnail:
                url_thumb = ThumbnailService.gerar_thumbnail_imagem(caminho_arquivo)
                return url_thumb
            
            return None
            
        except Exception as e:
            logger.error(f"Erro ao processar imagem: {e}")
            return None
    
    @staticmethod
    def processar_video(caminho_arquivo: str) -> Optional[str]:
        """
        Processar vídeo: gerar thumbnail
        
        Args:
            caminho_arquivo: Caminho do vídeo
            
        Returns:
            URL do thumbnail ou None
        """
        try:
            from services.thumbnail_service import ThumbnailService
            return ThumbnailService.gerar_thumbnail_video(caminho_arquivo)
        except Exception as e:
            logger.error(f"Erro ao processar vídeo: {e}")
            return None
    
    @staticmethod
    def processar_pdf(caminho_arquivo: str) -> Optional[str]:
        """
        Processar PDF: gerar thumbnail da primeira página
        
        Args:
            caminho_arquivo: Caminho do PDF
            
        Returns:
            URL do thumbnail ou None
        """
        try:
            from services.thumbnail_service import ThumbnailService
            return ThumbnailService.gerar_thumbnail_pdf(caminho_arquivo)
        except Exception as e:
            logger.error(f"Erro ao processar PDF: {e}")
            return None
    
    @staticmethod
    def processar_audio(caminho_arquivo: str, transcrever: bool = False) -> Optional[str]:
        """
        Processar áudio: transcrever se solicitado
        
        Args:
            caminho_arquivo: Caminho do áudio
            transcrever: Se deve transcrever
            
        Returns:
            Texto transcrito ou None
        """
        if not transcrever:
            return None
        
        try:
            from services.transcription_service import TranscriptionService
            
            resultado = TranscriptionService.transcrever_audio(caminho_arquivo, idioma='pt')
            
            if resultado['sucesso']:
                return resultado['texto']
            else:
                logger.error(f"Erro na transcrição: {resultado.get('erro')}")
                return None
                
        except Exception as e:
            logger.error(f"Erro ao processar áudio: {e}")
            return None
    
    @staticmethod
    def obter_duracao_midia(caminho_arquivo: str, tipo_midia: str) -> Optional[int]:
        """
        Obter duração de vídeo ou áudio em segundos
        
        Args:
            caminho_arquivo: Caminho do arquivo
            tipo_midia: Tipo (video ou audio)
            
        Returns:
            Duração em segundos ou None
        """
        try:
            if tipo_midia == 'video':
                from moviepy.editor import VideoFileClip
                with VideoFileClip(caminho_arquivo) as clip:
                    return int(clip.duration)
            
            elif tipo_midia == 'audio':
                from pydub import AudioSegment
                audio = AudioSegment.from_file(caminho_arquivo)
                return int(audio.duration_seconds)
            
            return None
            
        except Exception as e:
            logger.error(f"Erro ao obter duração: {e}")
            return None
    
    @staticmethod
    def deletar_arquivo(caminho_arquivo: str) -> bool:
        """
        Deletar arquivo do servidor
        
        Args:
            caminho_arquivo: Caminho do arquivo
            
        Returns:
            True se deletado com sucesso
        """
        try:
            if os.path.exists(caminho_arquivo):
                os.remove(caminho_arquivo)
                logger.info(f"Arquivo deletado: {caminho_arquivo}")
                return True
            return False
        except Exception as e:
            logger.error(f"Erro ao deletar arquivo: {e}")
            return False