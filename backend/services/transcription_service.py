"""
Serviço de Transcrição de Áudio
Usa Whisper local (gratuito)
"""

import whisper
import os
from config import active_config
import logging

logger = logging.getLogger(__name__)

class TranscriptionService:
    """Serviço para transcrever áudios"""
    
    # Modelos disponíveis (do menor ao maior)
    # tiny, base, small, medium, large
    MODELO_PADRAO = "base"  # Bom equilíbrio velocidade/precisão
    
    _modelo_cache = None
    
    @classmethod
    def _carregar_modelo(cls):
        """Carregar modelo Whisper (lazy loading)"""
        if cls._modelo_cache is None:
            logger.info(f"Carregando modelo Whisper: {cls.MODELO_PADRAO}")
            cls._modelo_cache = whisper.load_model(cls.MODELO_PADRAO)
        return cls._modelo_cache
    
    @classmethod
    def transcrever_audio(cls, caminho_arquivo: str, idioma: str = "pt") -> dict:
        """
        Transcrever arquivo de áudio
        
        Args:
            caminho_arquivo: Caminho do arquivo de áudio
            idioma: Código do idioma (pt, en, es, etc)
            
        Returns:
            Dict com texto transcrito e confiança
        """
        try:
            if not os.path.exists(caminho_arquivo):
                raise FileNotFoundError(f"Arquivo não encontrado: {caminho_arquivo}")
            
            modelo = cls._carregar_modelo()
            
            # Transcrever
            logger.info(f"Transcrevendo áudio: {caminho_arquivo}")
            resultado = modelo.transcribe(
                caminho_arquivo,
                language=idioma,
                fp16=False,  # CPU compatível
                verbose=False
            )
            
            return {
                'sucesso': True,
                'texto': resultado['text'].strip(),
                'idioma_detectado': resultado.get('language', idioma),
                'segmentos': len(resultado.get('segments', []))
            }
            
        except Exception as e:
            logger.error(f"Erro ao transcrever áudio: {e}")
            return {
                'sucesso': False,
                'erro': str(e),
                'texto': None
            }
    
    @classmethod
    def transcrever_async(cls, caminho_arquivo: str, idioma: str = "pt"):
        """
        Transcrever de forma assíncrona (para arquivos grandes)
        Implementar com Celery ou threading se necessário
        """
        # TODO: Implementar fila de processamento
        return cls.transcrever_audio(caminho_arquivo, idioma)