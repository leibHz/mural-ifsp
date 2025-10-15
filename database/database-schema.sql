-- ============================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- Mural IFSP - Sistema de Denúncia Escolar
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABELA: usuarios
-- Armazena todos os usuários (estudantes e visitantes)
-- ============================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('estudante', 'visitante')),
    
    -- Dados comuns
    nome_usuario VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    foto_perfil_url TEXT,
    
    -- Dados específicos de estudantes
    nome_real VARCHAR(255),
    bp VARCHAR(20) UNIQUE, -- Prontuário (apenas para estudantes)
    
    -- Controle
    email_verificado BOOLEAN DEFAULT FALSE,
    codigo_verificacao VARCHAR(4),
    codigo_expiracao TIMESTAMP,
    banido BOOLEAN DEFAULT FALSE,
    motivo_ban TEXT,
    data_ban TIMESTAMP,
    
    -- Metadados
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    ultimo_acesso TIMESTAMP,
    
    -- Constraints
    CONSTRAINT check_estudante_bp CHECK (
        (tipo_usuario = 'estudante' AND bp IS NOT NULL AND nome_real IS NOT NULL) OR
        (tipo_usuario = 'visitante' AND bp IS NULL)
    )
);

-- ============================================
-- TABELA: postagens
-- Armazena todas as postagens do mural
-- ============================================
CREATE TABLE postagens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Conteúdo
    descricao TEXT NOT NULL,
    tipo_midia VARCHAR(20) NOT NULL CHECK (tipo_midia IN ('imagem', 'video', 'gif', 'pdf', 'audio', 'texto')),
    url_midia TEXT,
    url_miniatura TEXT, -- Thumbnail gerada
    transcricao_audio TEXT, -- Para áudios transcritos
    
    -- Metadados da mídia
    tamanho_arquivo BIGINT,
    duracao_midia INTEGER, -- Em segundos (para vídeo/áudio)
    formato_arquivo VARCHAR(10),
    
    -- Moderação
    aprovado BOOLEAN DEFAULT TRUE,
    denunciado BOOLEAN DEFAULT FALSE,
    numero_denuncias INTEGER DEFAULT 0,
    
    -- Estatísticas
    visualizacoes INTEGER DEFAULT 0,
    
    -- Timestamps
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    deletado_em TIMESTAMP
);

-- ============================================
-- TABELA: comentarios
-- Comentários nas postagens (visitantes e estudantes)
-- ============================================
CREATE TABLE comentarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    postagem_id UUID NOT NULL REFERENCES postagens(id) ON DELETE CASCADE,
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Conteúdo
    texto TEXT NOT NULL,
    
    -- Moderação
    aprovado BOOLEAN DEFAULT TRUE,
    denunciado BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    criado_em TIMESTAMP DEFAULT NOW(),
    atualizado_em TIMESTAMP DEFAULT NOW(),
    deletado_em TIMESTAMP
);

-- ============================================
-- TABELA: denuncias
-- Registro de denúncias de conteúdo
-- ============================================
CREATE TABLE denuncias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    denunciante_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    
    -- Tipo de denúncia
    tipo_conteudo VARCHAR(20) NOT NULL CHECK (tipo_conteudo IN ('postagem', 'comentario', 'usuario')),
    conteudo_id UUID NOT NULL,
    
    -- Detalhes
    motivo VARCHAR(100) NOT NULL,
    descricao TEXT,
    
    -- Status
    resolvido BOOLEAN DEFAULT FALSE,
    admin_responsavel_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    acao_tomada TEXT,
    
    -- Timestamps
    criado_em TIMESTAMP DEFAULT NOW(),
    resolvido_em TIMESTAMP
);

-- ============================================
-- TABELA: administradores
-- Controle de privilégios administrativos
-- ============================================
CREATE TABLE administradores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    nivel_permissao VARCHAR(20) NOT NULL CHECK (nivel_permissao IN ('super_admin', 'moderador')),
    
    -- Timestamps
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: logs_admin
-- Registro de ações administrativas
-- ============================================
CREATE TABLE logs_admin (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    
    -- Ação
    tipo_acao VARCHAR(50) NOT NULL,
    descricao TEXT NOT NULL,
    alvo_id UUID, -- ID do usuário/postagem/comentário afetado
    dados_anteriores JSONB, -- Estado antes da ação
    
    -- Timestamp
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- TABELA: sessoes
-- Controle de sessões ativas
-- ============================================
CREATE TABLE sessoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expira_em TIMESTAMP NOT NULL,
    criado_em TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES para melhor performance
-- ============================================

-- Usuários
CREATE INDEX idx_usuarios_tipo ON usuarios(tipo_usuario);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_bp ON usuarios(bp);
CREATE INDEX idx_usuarios_banido ON usuarios(banido);

-- Postagens
CREATE INDEX idx_postagens_usuario ON postagens(usuario_id);
CREATE INDEX idx_postagens_tipo ON postagens(tipo_midia);
CREATE INDEX idx_postagens_data ON postagens(criado_em DESC);
CREATE INDEX idx_postagens_aprovado ON postagens(aprovado);
CREATE INDEX idx_postagens_denunciado ON postagens(denunciado);

-- Comentários
CREATE INDEX idx_comentarios_postagem ON comentarios(postagem_id);
CREATE INDEX idx_comentarios_usuario ON comentarios(usuario_id);
CREATE INDEX idx_comentarios_data ON comentarios(criado_em DESC);

-- Denúncias
CREATE INDEX idx_denuncias_tipo ON denuncias(tipo_conteudo, conteudo_id);
CREATE INDEX idx_denuncias_resolvido ON denuncias(resolvido);

-- Sessões
CREATE INDEX idx_sessoes_usuario ON sessoes(usuario_id);
CREATE INDEX idx_sessoes_token ON sessoes(token);
CREATE INDEX idx_sessoes_expira ON sessoes(expira_em);

-- ============================================
-- TRIGGERS para atualizar updated_at
-- ============================================

CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_timestamp
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_postagens_timestamp
    BEFORE UPDATE ON postagens
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER trigger_comentarios_timestamp
    BEFORE UPDATE ON comentarios
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();



-- ============================================
-- FUNÇÕES UTILITÁRIAS
-- ============================================

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION limpar_sessoes_expiradas()
RETURNS void AS $$
BEGIN
    DELETE FROM sessoes WHERE expira_em < NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para incrementar visualizações
CREATE OR REPLACE FUNCTION incrementar_visualizacao(postagem_uuid UUID)
RETURNS void AS $$
BEGIN
    UPDATE postagens 
    SET visualizacoes = visualizacoes + 1 
    WHERE id = postagem_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- DADOS INICIAIS (Opcional)
-- ============================================

-- Criar primeiro admin (ajustar dados conforme necessário)
-- NOTA: A senha deve ser hashada pela aplicação antes de inserir
-- INSERT INTO usuarios (tipo_usuario, nome_usuario, email, senha_hash, nome_real, bp, email_verificado)
-- VALUES ('estudante', 'admin', 'admin@ifsp.edu.br', '$hashed_password', 'Administrador', 'ADMIN001', TRUE);

-- INSERT INTO administradores (usuario_id, nivel_permissao)
-- VALUES ((SELECT id FROM usuarios WHERE nome_usuario = 'admin'), 'super_admin');

-- ============================================
-- FIM DO SCRIPT
-- ============================================