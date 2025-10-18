"""
Serviço de Transcrição de Áudio
Usa Whisper local (gratuito, open source)
"""

import os
import logging
from typing import Dict, Optional
from config import active_config

logger = logging.getLogger(__name__)

class TranscriptionService:
    """Serviço para transcrever áudios usando Whisper local"""
    
    # Cache do modelo carregado
    _modelo_cache = None
    _whisper_disponivel = None
    
    @classmethod
    def _verificar_whisper_disponivel(cls) -> bool:
        """Verificar se Whisper está instalado"""
        if cls._whisper_disponivel is None:
            try:
                import whisper
                cls._whisper_disponivel = True
                logger.info("Whisper encontrado e disponível")
            except ImportError:
                cls._whisper_disponivel = False
                logger.warning(
                    "Whisper não instalado. Execute: pip install openai-whisper"
                )
        return cls._whisper_disponivel
    
    @classmethod
    def _carregar_modelo(cls):
        """
        Carregar modelo Whisper (lazy loading)
        Modelo é carregado apenas uma vez e reutilizado
        """
        if not cls._verificar_whisper_disponivel():
            raise ImportError("Whisper não está instalado")
        
        if cls._modelo_cache is None:
            import whisper
            modelo_nome = active_config.WHISPER_MODEL
            
            logger.info(f"Carregando modelo Whisper: {modelo_nome}")
            logger.info("Isso pode levar alguns minutos na primeira vez...")
            
            cls._modelo_cache = whisper.load_model(modelo_nome)
            
            logger.info(f"Modelo Whisper '{modelo_nome}' carregado com sucesso!")
        
        return cls._modelo_cache
    
    @classmethod
    def transcrever_audio(
        cls, 
        caminho_arquivo: str, 
        idioma: str = "pt",
        gerar_timestamps: bool = False
    ) -> Dict:
        """
        Transcrever arquivo de áudio
        
        Args:
            caminho_arquivo: Caminho do arquivo de áudio
            idioma: Código do idioma (pt, en, es, fr, etc)
            gerar_timestamps: Se deve retornar timestamps dos segmentos
            
        Returns:
            Dict com resultado da transcrição:
            {
                'sucesso': bool,
                'texto': str,
                'idioma_detectado': str,
                'confianca': float,
                'duracao': float,
                'segmentos': list (opcional)
            }
        """
        try:
            # Validar arquivo
            if not os.path.exists(caminho_arquivo):
                return {
                    'sucesso': False,
                    'erro': f"Arquivo não encontrado: {caminho_arquivo}",
                    'texto': None
                }
            
            tamanho_mb = os.path.getsize(caminho_arquivo) / (1024 * 1024)
            logger.info(f"Transcrevendo áudio: {os.path.basename(caminho_arquivo)} ({tamanho_mb:.2f}MB)")
            
            # Carregar modelo
            modelo = cls._carregar_modelo()
            
            # Transcrever
            resultado = modelo.transcribe(
                caminho_arquivo,
                language=idioma if idioma != 'auto' else None,
                fp16=False,  # Compatível com CPU
                verbose=False,
                task='transcribe'  # ou 'translate' para traduzir para inglês
            )
            
            # Processar resultado
            texto_completo = resultado['text'].strip()
            idioma_detectado = resultado.get('language', idioma)
            
            # Calcular confiança média (se disponível)
            confianca = 0.0
            if 'segments' in resultado and resultado['segments']:
                confiancas = [seg.get('no_speech_prob', 0) for seg in resultado['segments']]
                confianca = 1.0 - (sum(confiancas) / len(confiancas))
            
            response = {
                'sucesso': True,
                'texto': texto_completo,
                'idioma_detectado': idioma_detectado,
                'confianca': round(confianca, 2),
                'num_segmentos': len(resultado.get('segments', []))
            }
            
            # Adicionar timestamps se solicitado
            if gerar_timestamps and 'segments' in resultado:
                response['segmentos'] = [
                    {
                        'inicio': seg['start'],
                        'fim': seg['end'],
                        'texto': seg['text'].strip()
                    }
                    for seg in resultado['segments']
                ]
            
            logger.info(f"Transcrição concluída: {len(texto_completo)} caracteres, idioma: {idioma_detectado}")
            return response
            
        except ImportError as e:
            logger.error(f"Whisper não instalado: {e}")
            return {
                'sucesso': False,
                'erro': 'Whisper não está instalado. Execute: pip install openai-whisper',
                'texto': None
            }
        except Exception as e:
            logger.error(f"Erro ao transcrever áudio: {e}", exc_info=True)
            return {
                'sucesso': False,
                'erro': str(e),
                'texto': None
            }
    
    @classmethod
    def transcrever_com_traducao(cls, caminho_arquivo: str) -> Dict:
        """
        Transcrever áudio e traduzir para inglês
        
        Args:
            caminho_arquivo: Caminho do arquivo de áudio
            
        Returns:
            Dict com transcrição original e tradução
        """
        try:
            if not cls._verificar_whisper_disponivel():
                raise ImportError("Whisper não está instalado")
            
            modelo = cls._carregar_modelo()
            
            # Transcrever no idioma original
            resultado_transcricao = modelo.transcribe(
                caminho_arquivo,
                task='transcribe',
                fp16=False,
                verbose=False
            )
            
            # Traduzir para inglês
            resultado_traducao = modelo.transcribe(
                caminho_arquivo,
                task='translate',  # Traduz para inglês
                fp16=False,
                verbose=False
            )
            
            return {
                'sucesso': True,
                'texto_original': resultado_transcricao['text'].strip(),
                'idioma_original': resultado_transcricao.get('language'),
                'texto_traduzido': resultado_traducao['text'].strip()
            }
            
        except Exception as e:
            logger.error(f"Erro ao transcrever com tradução: {e}")
            return {
                'sucesso': False,
                'erro': str(e)
            }
    
    @classmethod
    def obter_info_modelos(cls) -> Dict:
        """
        Retornar informações sobre modelos Whisper disponíveis
        
        Returns:
            Dict com informações dos modelos
        """
        return {
            'modelos_disponiveis': ['tiny', 'base', 'small', 'medium', 'large'],
            'modelo_atual': active_config.WHISPER_MODEL,
            'descricoes': {
                'tiny': {
                    'tamanho': '39M parâmetros',
                    'vram': '~1GB',
                    'velocidade': 'Muito rápido',
                    'precisao': 'Básica',
                    'uso': 'Desenvolvimento/testes'
                },
                'base': {
                    'tamanho': '74M parâmetros',
                    'vram': '~1GB',
                    'velocidade': 'Rápido',
                    'precisao': 'Boa',
                    'uso': 'Recomendado para produção'
                },
                'small': {
                    'tamanho': '244M parâmetros',
                    'vram': '~2GB',
                    'velocidade': 'Moderado',
                    'precisao': 'Muito boa',
                    'uso': 'Alta qualidade'
                },
                'medium': {
                    'tamanho': '769M parâmetros',
                    'vram': '~5GB',
                    'velocidade': 'Lento',
                    'precisao': 'Excelente',
                    'uso': 'Máxima qualidade'
                },
                'large': {
                    'tamanho': '1550M parâmetros',
                    'vram': '~10GB',
                    'velocidade': 'Muito lento',
                    'precisao': 'Melhor possível',
                    'uso': 'GPU potente necessária'
                }
            },
            'idiomas_suportados': [
                'pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'ko', 'zh',
                'ru', 'ar', 'hi', 'nl', 'pl', 'tr', 'vi', 'id', 'th'
                # + 80 outros idiomas
            ]
        }
    
    @classmethod
    def estimar_tempo_transcricao(cls, duracao_audio_segundos: int) -> Dict:
        """
        Estimar tempo de transcrição baseado no modelo
        
        Args:
            duracao_audio_segundos: Duração do áudio em segundos
            
        Returns:
            Dict com estimativas de tempo
        """
        modelo = active_config.WHISPER_MODEL
        
        # Tempos aproximados por segundo de áudio (em CPU)
        tempos_por_modelo = {
            'tiny': 0.1,    # 10x mais rápido que tempo real
            'base': 0.2,    # 5x mais rápido
            'small': 0.5,   # 2x mais rápido
            'medium': 1.5,  # 1.5x mais lento
            'large': 3.0    # 3x mais lento
        }
        
        tempo_estimado = duracao_audio_segundos * tempos_por_modelo.get(modelo, 0.2)
        
        return {
            'modelo': modelo,
            'duracao_audio': duracao_audio_segundos,
            'tempo_estimado_segundos': round(tempo_estimado, 1),
            'tempo_estimado_minutos': round(tempo_estimado / 60, 1)
        }


# Função auxiliar para uso simples
def transcrever(caminho_arquivo: str, idioma: str = "pt") -> Optional[str]:
    """
    Função simples para transcrever áudio
    
    Args:
        caminho_arquivo: Caminho do arquivo
        idioma: Idioma do áudio
        
    Returns:
        Texto transcrito ou None se erro
    """
    resultado = TranscriptionService.transcrever_audio(caminho_arquivo, idioma)
    
    if resultado['sucesso']:
        return resultado['texto']
    else:
        logger.error(f"Erro na transcrição: {resultado.get('erro')}")
        return None