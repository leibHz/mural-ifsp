"""
Serviço de Geração de Thumbnails
Cria miniaturas para imagens, vídeos e PDFs
"""

import os
from PIL import Image
import logging
from config import active_config

logger = logging.getLogger(__name__)


class ThumbnailService:
    """Serviço para gerar miniaturas"""
    
    THUMBNAIL_SIZE = (400, 400)  # Tamanho padrão das thumbnails
    
    @staticmethod
    def gerar_thumbnail_imagem(caminho_imagem: str) -> str:
        """
        Gerar thumbnail de uma imagem
        
        Args:
            caminho_imagem: Caminho da imagem original
            
        Returns:
            URL do thumbnail
        """
        try:
            # Abrir imagem
            img = Image.open(caminho_imagem)
            
            # Converter RGBA para RGB se necessário
            if img.mode == 'RGBA':
                rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                rgb_img.paste(img, mask=img.split()[3])
                img = rgb_img
            
            # Criar thumbnail mantendo proporção
            img.thumbnail(ThumbnailService.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
            
            # Gerar nome do thumbnail
            nome_arquivo = os.path.basename(caminho_imagem)
            nome_thumb = f"thumb_{nome_arquivo}"
            
            # Pasta de thumbnails
            pasta_thumbs = os.path.join(active_config.UPLOAD_FOLDER, 'thumbnails')
            os.makedirs(pasta_thumbs, exist_ok=True)
            
            # Caminho completo do thumbnail
            caminho_thumb = os.path.join(pasta_thumbs, nome_thumb)
            
            # Salvar thumbnail
            img.save(caminho_thumb, optimize=True, quality=85)
            
            # URL relativa
            url_thumb = f"/static/uploads/thumbnails/{nome_thumb}"
            
            logger.info(f"Thumbnail de imagem gerado: {nome_thumb}")
            return url_thumb
            
        except Exception as e:
            logger.error(f"Erro ao gerar thumbnail de imagem: {e}")
            # Retornar imagem original se falhar
            pasta_tipo = os.path.basename(os.path.dirname(caminho_imagem))
            nome = os.path.basename(caminho_imagem)
            return f"/static/uploads/{pasta_tipo}/{nome}"
    
    @staticmethod
    def gerar_thumbnail_video(caminho_video: str, segundo: int = 1) -> str:
        """
        Gerar thumbnail de um vídeo
        
        Args:
            caminho_video: Caminho do vídeo
            segundo: Segundo do vídeo para capturar (padrão: 1)
            
        Returns:
            URL do thumbnail
        """
        try:
            from moviepy.editor import VideoFileClip
            
            # Abrir vídeo
            with VideoFileClip(caminho_video) as clip:
                # Capturar frame no segundo especificado
                # Se o segundo for maior que a duração, usar o meio do vídeo
                tempo = min(segundo, clip.duration / 2)
                frame = clip.get_frame(tempo)
            
            # Converter frame para imagem PIL
            img = Image.fromarray(frame)
            
            # Criar thumbnail
            img.thumbnail(ThumbnailService.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
            
            # Gerar nome do thumbnail
            nome_arquivo = os.path.basename(caminho_video)
            nome_base = os.path.splitext(nome_arquivo)[0]
            nome_thumb = f"thumb_{nome_base}.jpg"
            
            # Pasta de thumbnails
            pasta_thumbs = os.path.join(active_config.UPLOAD_FOLDER, 'thumbnails')
            os.makedirs(pasta_thumbs, exist_ok=True)
            
            # Caminho completo do thumbnail
            caminho_thumb = os.path.join(pasta_thumbs, nome_thumb)
            
            # Salvar thumbnail
            img.save(caminho_thumb, 'JPEG', optimize=True, quality=85)
            
            # URL relativa
            url_thumb = f"/static/uploads/thumbnails/{nome_thumb}"
            
            logger.info(f"Thumbnail de vídeo gerado: {nome_thumb}")
            return url_thumb
            
        except Exception as e:
            logger.error(f"Erro ao gerar thumbnail de vídeo: {e}")
            # Retornar ícone padrão se falhar
            return "/static/images/video-placeholder.png"
    
    @staticmethod
    def gerar_thumbnail_pdf(caminho_pdf: str, pagina: int = 0) -> str:
        """
        Gerar thumbnail da primeira página de um PDF
        
        Args:
            caminho_pdf: Caminho do PDF
            pagina: Número da página (padrão: 0 = primeira)
            
        Returns:
            URL do thumbnail
        """
        try:
            from pdf2image import convert_from_path
            
            # Converter primeira página do PDF para imagem
            imagens = convert_from_path(
                caminho_pdf,
                first_page=pagina + 1,
                last_page=pagina + 1,
                dpi=150
            )
            
            if not imagens:
                raise Exception("Não foi possível converter PDF")
            
            img = imagens[0]
            
            # Criar thumbnail
            img.thumbnail(ThumbnailService.THUMBNAIL_SIZE, Image.Resampling.LANCZOS)
            
            # Gerar nome do thumbnail
            nome_arquivo = os.path.basename(caminho_pdf)
            nome_base = os.path.splitext(nome_arquivo)[0]
            nome_thumb = f"thumb_{nome_base}.jpg"
            
            # Pasta de thumbnails
            pasta_thumbs = os.path.join(active_config.UPLOAD_FOLDER, 'thumbnails')
            os.makedirs(pasta_thumbs, exist_ok=True)
            
            # Caminho completo do thumbnail
            caminho_thumb = os.path.join(pasta_thumbs, nome_thumb)
            
            # Salvar thumbnail
            img.save(caminho_thumb, 'JPEG', optimize=True, quality=85)
            
            # URL relativa
            url_thumb = f"/static/uploads/thumbnails/{nome_thumb}"
            
            logger.info(f"Thumbnail de PDF gerado: {nome_thumb}")
            return url_thumb
            
        except Exception as e:
            logger.error(f"Erro ao gerar thumbnail de PDF: {e}")
            # Retornar ícone padrão se falhar
            return "/static/images/pdf-placeholder.png"
    
    @staticmethod
    def deletar_thumbnail(url_thumbnail: str) -> bool:
        """
        Deletar thumbnail do servidor
        
        Args:
            url_thumbnail: URL do thumbnail
            
        Returns:
            True se deletado com sucesso
        """
        try:
            # Converter URL para caminho do sistema
            if url_thumbnail.startswith('/static/uploads/thumbnails/'):
                nome_arquivo = url_thumbnail.split('/')[-1]
                caminho = os.path.join(
                    active_config.UPLOAD_FOLDER,
                    'thumbnails',
                    nome_arquivo
                )
                
                if os.path.exists(caminho):
                    os.remove(caminho)
                    logger.info(f"Thumbnail deletado: {nome_arquivo}")
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Erro ao deletar thumbnail: {e}")
            return False