"""
Mural IFSP - Aplicação Principal
Sistema de denúncia e postagens escolares
"""

from flask import Flask, render_template, jsonify
from flask_cors import CORS
from config import active_config
import logging
from logging.handlers import RotatingFileHandler
import os

# Importar rotas (serão criadas nos próximos módulos)
# from routes.auth import auth_bp
# from routes.postagens import postagens_bp
# from routes.comentarios import comentarios_bp
# from routes.usuarios import usuarios_bp
# from routes.admin import admin_bp


def create_app(config_class=active_config):
    """Factory function para criar a aplicação Flask"""
    
    app = Flask(
        __name__,
        template_folder='../frontend/templates',
        static_folder='../frontend/static'
    )
    
    # Carregar configurações
    app.config.from_object(config_class)
    
    # Configurar CORS
    CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
    
    # Configurar logging
    setup_logging(app)
    
    # Registrar blueprints (rotas)
    register_blueprints(app)
    
    # Registrar manipuladores de erro
    register_error_handlers(app)
    
    # Rota principal
    @app.route('/')
    def index():
        """Página inicial - Mural de postagens"""
        return render_template('index.html')
    
    @app.route('/health')
    def health_check():
        """Health check para monitoramento"""
        return jsonify({
            'status': 'ok',
            'service': 'Mural IFSP',
            'environment': app.config['FLASK_ENV']
        }), 200
    
    app.logger.info('Mural IFSP inicializado com sucesso!')
    
    return app


def setup_logging(app):
    """Configurar sistema de logs"""
    
    if not app.debug:
        # Configurar formato do log
        formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
        )
        
        # Handler para arquivo
        file_handler = RotatingFileHandler(
            app.config['LOG_FILE'],
            maxBytes=10240000,  # 10MB
            backupCount=10
        )
        file_handler.setFormatter(formatter)
        file_handler.setLevel(getattr(logging, app.config['LOG_LEVEL']))
        
        # Handler para console
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        console_handler.setLevel(logging.INFO)
        
        # Adicionar handlers ao logger do app
        app.logger.addHandler(file_handler)
        app.logger.addHandler(console_handler)
        app.logger.setLevel(getattr(logging, app.config['LOG_LEVEL']))
        
        app.logger.info('Logging configurado')


def register_blueprints(app):
    """Registrar todos os blueprints (rotas) da aplicação"""
    
    # Importar blueprints
    try:
        from routes.auth import auth_bp
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.logger.info('Blueprint auth registrado')
    except ImportError as e:
        app.logger.warning(f'Blueprint auth não disponível: {e}')
    
    # Outros blueprints serão adicionados conforme forem criados
    # from routes.postagens import postagens_bp
    # app.register_blueprint(postagens_bp, url_prefix='/api/postagens')
    
    # from routes.comentarios import comentarios_bp
    # app.register_blueprint(comentarios_bp, url_prefix='/api/comentarios')
    
    # from routes.usuarios import usuarios_bp
    # app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')
    
    # from routes.admin import admin_bp
    # app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    app.logger.info('Registro de blueprints concluído')


def register_error_handlers(app):
    """Registrar manipuladores de erro personalizados"""
    
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            'erro': 'Requisição inválida',
            'mensagem': str(error)
        }), 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({
            'erro': 'Não autorizado',
            'mensagem': 'Você precisa estar autenticado para acessar este recurso'
        }), 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({
            'erro': 'Proibido',
            'mensagem': 'Você não tem permissão para acessar este recurso'
        }), 403
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'erro': 'Não encontrado',
            'mensagem': 'O recurso solicitado não foi encontrado'
        }), 404
    
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({
            'erro': 'Arquivo muito grande',
            'mensagem': f'O tamanho máximo permitido é {app.config["MAX_FILE_SIZE"] / 1048576:.0f}MB'
        }), 413
    
    @app.errorhandler(500)
    def internal_server_error(error):
        app.logger.error(f'Erro interno do servidor: {error}')
        return jsonify({
            'erro': 'Erro interno do servidor',
            'mensagem': 'Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.'
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        """Capturar todas as exceções não tratadas"""
        app.logger.error(f'Exceção não tratada: {error}', exc_info=True)
        
        return jsonify({
            'erro': 'Erro interno',
            'mensagem': 'Ocorreu um erro inesperado'
        }), 500


# Executar aplicação
if __name__ == '__main__':
    app = create_app()
    
    # Configurações de desenvolvimento
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=app.config['DEBUG']
    )