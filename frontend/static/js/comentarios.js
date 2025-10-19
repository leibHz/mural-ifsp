/**
 * MURAL IFSP - Sistema de Comentários
 * Gerenciamento completo de comentários
 */

let comentariosCache = {};
let paginaComentarios = {};

// ===== ABRIR SEÇÃO DE COMENTÁRIOS =====

async function abrirComentarios(postagemId) {
    const modal = window.muralIFSP.criarModal(
        'Comentários',
        '<div id="comentariosContainer" class="comentarios-container"></div>',
        []
    );

    // Adicionar classe especial ao modal
    modal.querySelector('.modal').style.maxWidth = '700px';

    // Carregar comentários
    await carregarComentarios(postagemId);
}

// ===== CARREGAR COMENTÁRIOS =====

async function carregarComentarios(postagemId, pagina = 1) {
    try {
        const container = document.getElementById('comentariosContainer');
        
        if (!container) return;

        // Mostrar loading
        if (pagina === 1) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <div class="spinner" style="margin: 0 auto;"></div>
                    <p style="color: var(--texto-secundario); margin-top: 1rem;">Carregando comentários...</p>
                </div>
            `;
        }

        // Buscar comentários
        const params = new URLSearchParams({
            pagina: pagina,
            por_pagina: 20,
            ordenacao: 'recentes'
        });

        const data = await window.muralIFSP.apiRequest(`/comentarios/postagem/${postagemId}?${params}`);

        // Renderizar
        renderizarComentarios(data, postagemId, pagina);

        // Salvar no cache
        comentariosCache[postagemId] = data.dados;
        paginaComentarios[postagemId] = pagina;

    } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        
        const container = document.getElementById('comentariosContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 2rem;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--vermelho-alerta);"></i>
                    <p style="color: var(--texto-secundario); margin-top: 1rem;">Erro ao carregar comentários</p>
                    <button class="btn btn-secondary" onclick="carregarComentarios('${postagemId}')">
                        <i class="fas fa-redo"></i> Tentar novamente
                    </button>
                </div>
            `;
        }
    }
}

// ===== RENDERIZAR COMENTÁRIOS =====

function renderizarComentarios(data, postagemId, paginaAtual) {
    const container = document.getElementById('comentariosContainer');
    if (!container) return;

    const user = window.muralIFSP.currentUser();
    const comentarios = data.dados || [];
    const paginacao = data.paginacao || {};

    let html = `
        <!-- Formulário de Novo Comentário -->
        ${user ? `
            <div class="novo-comentario-form" style="margin-bottom: 2rem; padding: 1.5rem; background: var(--background-hover); border-radius: var(--radius-md);">
                <h3 style="margin-bottom: 1rem; color: var(--verde-principal);">
                    <i class="fas fa-comment-dots"></i> Adicionar Comentário
                </h3>
                <form id="formNovoComentario" onsubmit="enviarComentario(event, '${postagemId}')">
                    <textarea 
                        class="form-textarea" 
                        id="textoComentario"
                        placeholder="Digite seu comentário..."
                        required
                        minlength="1"
                        maxlength="1000"
                        rows="3"
                        style="margin-bottom: 0.5rem;"
                    ></textarea>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span id="contadorComentario" style="color: var(--texto-secundario); font-size: 0.9rem;">0 / 1000</span>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Comentar
                        </button>
                    </div>
                </form>
            </div>
        ` : `
            <div style="text-align: center; padding: 2rem; background: var(--background-hover); border-radius: var(--radius-md); margin-bottom: 2rem;">
                <i class="fas fa-lock" style="font-size: 2rem; color: var(--texto-secundario); margin-bottom: 1rem;"></i>
                <p style="color: var(--texto-secundario); margin-bottom: 1rem;">Faça login para comentar</p>
                <button class="btn btn-primary" onclick="window.location.href='/login'">
                    <i class="fas fa-sign-in-alt"></i> Entrar
                </button>
            </div>
        `}

        <!-- Lista de Comentários -->
        <div class="comentarios-lista">
            ${comentarios.length > 0 ? `
                <h3 style="margin-bottom: 1.5rem; color: var(--texto-primario);">
                    <i class="fas fa-comments"></i> ${paginacao.total_items || 0} ${paginacao.total_items === 1 ? 'Comentário' : 'Comentários'}
                </h3>
                ${comentarios.map(comentario => renderizarComentario(comentario, user)).join('')}
            ` : `
                <div style="text-align: center; padding: 3rem;">
                    <i class="fas fa-comment-slash" style="font-size: 3rem; color: var(--texto-terciario); margin-bottom: 1rem;"></i>
                    <p style="color: var(--texto-secundario);">Nenhum comentário ainda. Seja o primeiro!</p>
                </div>
            `}
        </div>

        <!-- Paginação -->
        ${paginacao.total_paginas > 1 ? `
            <div class="comentarios-paginacao" style="display: flex; justify-content: center; gap: 0.5rem; margin-top: 2rem;">
                ${paginacao.tem_anterior ? `
                    <button class="btn btn-secondary" onclick="carregarComentarios('${postagemId}', ${paginaAtual - 1})">
                        <i class="fas fa-chevron-left"></i> Anterior
                    </button>
                ` : ''}
                
                <span style="display: flex; align-items: center; padding: 0 1rem; color: var(--texto-secundario);">
                    Página ${paginaAtual} de ${paginacao.total_paginas}
                </span>
                
                ${paginacao.tem_proxima ? `
                    <button class="btn btn-secondary" onclick="carregarComentarios('${postagemId}', ${paginaAtual + 1})">
                        Próxima <i class="fas fa-chevron-right"></i>
                    </button>
                ` : ''}
            </div>
        ` : ''}
    `;

    container.innerHTML = html;

    // Configurar contador de caracteres
    const textarea = document.getElementById('textoComentario');
    const contador = document.getElementById('contadorComentario');
    
    if (textarea && contador) {
        textarea.addEventListener('input', () => {
            contador.textContent = `${textarea.value.length} / 1000`;
        });
    }
}

// ===== RENDERIZAR COMENTÁRIO INDIVIDUAL =====

function renderizarComentario(comentario, user) {
    const avatar = comentario.usuario?.foto_perfil_url || 
                   `https://ui-avatars.com/api/?name=${encodeURIComponent(comentario.usuario?.nome_usuario || 'User')}&background=009640&color=fff`;
    
    const ehAutor = user && user.id === comentario.usuario_id;
    const podeEditar = ehAutor && !comentario.deletado_em;

    return `
        <div class="comentario-item" id="comentario-${comentario.id}" 
             style="padding: 1.5rem; background: var(--background-card); border: 1px solid var(--borda); 
                    border-radius: var(--radius-md); margin-bottom: 1rem; transition: all 0.3s;">
            
            <!-- Header do Comentário -->
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem;">
                <img src="${avatar}" alt="${comentario.usuario?.nome_usuario}" 
                     style="width: 40px; height: 40px; border-radius: 50%; border: 2px solid var(--verde-principal);">
                
                <div style="flex: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <strong style="color: var(--texto-primario); display: block;">
                                ${comentario.usuario?.nome_usuario || 'Usuário'}
                            </strong>
                            <span style="color: var(--texto-secundario); font-size: 0.85rem;">
                                ${window.muralIFSP.formatarDataRelativa(comentario.criado_em)}
                                ${comentario.atualizado_em !== comentario.criado_em ? ' (editado)' : ''}
                            </span>
                        </div>
                        
                        ${podeEditar ? `
                            <div class="comentario-menu">
                                <button class="icon-btn" onclick="toggleMenuComentario('${comentario.id}')">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <div class="comentario-dropdown" id="menu-${comentario.id}" 
                                     style="display: none; position: absolute; right: 0; top: 100%; 
                                            background: var(--background-card); border: 1px solid var(--borda); 
                                            border-radius: var(--radius-md); box-shadow: var(--shadow-lg); 
                                            z-index: 100; min-width: 150px; margin-top: 0.5rem;">
                                    <button class="dropdown-item" onclick="editarComentario('${comentario.id}')">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="dropdown-item text-danger" onclick="deletarComentario('${comentario.id}')">
                                        <i class="fas fa-trash"></i> Deletar
                                    </button>
                                </div>
                            </div>
                        ` : user ? `
                            <button class="icon-btn" onclick="denunciarComentario('${comentario.id}')" title="Denunciar">
                                <i class="fas fa-flag"></i>
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>

            <!-- Texto do Comentário -->
            <div class="comentario-texto" id="texto-${comentario.id}" 
                 style="color: var(--texto-primario); line-height: 1.6; padding-left: 56px;">
                ${comentario.texto}
            </div>

            <!-- Formulário de Edição (oculto) -->
            <div class="comentario-edit-form" id="edit-form-${comentario.id}" style="display: none; padding-left: 56px; margin-top: 1rem;">
                <form onsubmit="salvarEdicaoComentario(event, '${comentario.id}')">
                    <textarea class="form-textarea" id="edit-texto-${comentario.id}" 
                              required minlength="1" maxlength="1000" rows="3">${comentario.texto}</textarea>
                    <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                        <button type="submit" class="btn btn-primary btn-sm">
                            <i class="fas fa-save"></i> Salvar
                        </button>
                        <button type="button" class="btn btn-secondary btn-sm" onclick="cancelarEdicaoComentario('${comentario.id}')">
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// ===== ENVIAR COMENTÁRIO =====

async function enviarComentario(event, postagemId) {
    event.preventDefault();

    const textarea = document.getElementById('textoComentario');
    const texto = textarea.value.trim();

    if (!texto) {
        window.muralIFSP.showToast('Digite um comentário', 'warning');
        return;
    }

    try {
        window.muralIFSP.toggleLoading(true);

        const data = await window.muralIFSP.apiRequest('/comentarios', {
            method: 'POST',
            body: JSON.stringify({
                postagem_id: postagemId,
                texto: texto
            })
        });

        window.muralIFSP.showToast('Comentário publicado!', 'success');
        
        // Limpar formulário
        textarea.value = '';
        document.getElementById('contadorComentario').textContent = '0 / 1000';

        // Recarregar comentários
        await carregarComentarios(postagemId);

    } catch (error) {
        window.muralIFSP.showToast(error.message || 'Erro ao publicar comentário', 'error');
    } finally {
        window.muralIFSP.toggleLoading(false);
    }
}

// ===== EDITAR COMENTÁRIO =====

function editarComentario(comentarioId) {
    // Esconder texto original
    document.getElementById(`texto-${comentarioId}`).style.display = 'none';
    
    // Mostrar formulário de edição
    document.getElementById(`edit-form-${comentarioId}`).style.display = 'block';
    
    // Fechar menu
    const menu = document.getElementById(`menu-${comentarioId}`);
    if (menu) menu.style.display = 'none';
}

function cancelarEdicaoComentario(comentarioId) {
    // Mostrar texto original
    document.getElementById(`texto-${comentarioId}`).style.display = 'block';
    
    // Esconder formulário de edição
    document.getElementById(`edit-form-${comentarioId}`).style.display = 'none';
}

async function salvarEdicaoComentario(event, comentarioId) {
    event.preventDefault();

    const textarea = document.getElementById(`edit-texto-${comentarioId}`);
    const novoTexto = textarea.value.trim();

    if (!novoTexto) {
        window.muralIFSP.showToast('Comentário não pode estar vazio', 'warning');
        return;
    }

    try {
        window.muralIFSP.toggleLoading(true);

        await window.muralIFSP.apiRequest(`/comentarios/${comentarioId}`, {
            method: 'PUT',
            body: JSON.stringify({
                texto: novoTexto
            })
        });

        window.muralIFSP.showToast('Comentário atualizado!', 'success');

        // Atualizar texto no DOM
        document.getElementById(`texto-${comentarioId}`).textContent = novoTexto;
        
        // Voltar para visualização
        cancelarEdicaoComentario(comentarioId);

    } catch (error) {
        window.muralIFSP.showToast(error.message || 'Erro ao atualizar comentário', 'error');
    } finally {
        window.muralIFSP.toggleLoading(false);
    }
}

// ===== DELETAR COMENTÁRIO =====

async function deletarComentario(comentarioId) {
    if (!confirm('Tem certeza que deseja deletar este comentário?')) {
        return;
    }

    try {
        window.muralIFSP.toggleLoading(true);

        await window.muralIFSP.apiRequest(`/comentarios/${comentarioId}`, {
            method: 'DELETE'
        });

        window.muralIFSP.showToast('Comentário deletado', 'success');

        // Remover do DOM
        const elemento = document.getElementById(`comentario-${comentarioId}`);
        if (elemento) {
            elemento.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => elemento.remove(), 300);
        }

    } catch (error) {
        window.muralIFSP.showToast(error.message || 'Erro ao deletar comentário', 'error');
    } finally {
        window.muralIFSP.toggleLoading(false);
    }
}

// ===== DENUNCIAR COMENTÁRIO =====

function denunciarComentario(comentarioId) {
    const modal = window.muralIFSP.criarModal(
        'Denunciar Comentário',
        `
            <form id="formDenunciaComentario">
                <div class="form-group">
                    <label class="form-label">Motivo da denúncia</label>
                    <select class="form-select" id="motivoDenunciaComentario" required>
                        <option value="">Selecione um motivo</option>
                        <option value="conteudo_inapropriado">Conteúdo inapropriado</option>
                        <option value="spam">Spam</option>
                        <option value="assedio">Assédio ou bullying</option>
                        <option value="discurso_odio">Discurso de ódio</option>
                        <option value="informacao_falsa">Informação falsa</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Descrição (opcional)</label>
                    <textarea class="form-textarea" id="descricaoDenunciaComentario" rows="3" 
                              placeholder="Descreva o problema..."></textarea>
                </div>
            </form>
        `,
        [
            { texto: 'Cancelar', classe: 'btn-secondary', onclick: 'this.closest(".modal-overlay").remove()' },
            { texto: 'Enviar Denúncia', classe: 'btn-danger', onclick: `enviarDenunciaComentario('${comentarioId}')` }
        ]
    );
}

async function enviarDenunciaComentario(comentarioId) {
    const motivo = document.getElementById('motivoDenunciaComentario').value;
    const descricao = document.getElementById('descricaoDenunciaComentario').value;

    if (!motivo) {
        window.muralIFSP.showToast('Selecione um motivo', 'warning');
        return;
    }

    try {
        window.muralIFSP.toggleLoading(true);

        await window.muralIFSP.apiRequest(`/comentarios/${comentarioId}/denunciar`, {
            method: 'POST',
            body: JSON.stringify({
                motivo: motivo,
                descricao: descricao
            })
        });

        window.muralIFSP.showToast('Denúncia enviada com sucesso', 'success');
        
        // Fechar modal
        document.querySelector('.modal-overlay').remove();

    } catch (error) {
        window.muralIFSP.showToast(error.message || 'Erro ao enviar denúncia', 'error');
    } finally {
        window.muralIFSP.toggleLoading(false);
    }
}

// ===== TOGGLE MENU =====

function toggleMenuComentario(comentarioId) {
    const menu = document.getElementById(`menu-${comentarioId}`);
    if (!menu) return;

    // Fechar outros menus
    document.querySelectorAll('.comentario-dropdown').forEach(m => {
        if (m.id !== `menu-${comentarioId}`) {
            m.style.display = 'none';
        }
    });

    // Toggle menu atual
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
}

// Fechar menus ao clicar fora
document.addEventListener('click', (e) => {
    if (!e.target.closest('.comentario-menu')) {
        document.querySelectorAll('.comentario-dropdown').forEach(m => {
            m.style.display = 'none';
        });
    }
});

// ===== ATUALIZAR CONTADOR DE COMENTÁRIOS =====

async function atualizarContadorComentarios(postagemId) {
    try {
        const data = await window.muralIFSP.apiRequest(`/comentarios/postagem/${postagemId}/contar`);
        
        // Atualizar no card da postagem
        const contador = document.querySelector(`[data-postagem-id="${postagemId}"] .comentarios-count`);
        if (contador) {
            contador.textContent = data.total_comentarios;
        }

        return data.total_comentarios;

    } catch (error) {
        console.error('Erro ao atualizar contador:', error);
        return 0;
    }
}

// Exportar funções
window.comentariosIFSP = {
    abrirComentarios,
    carregarComentarios,
    enviarComentario,
    editarComentario,
    deletarComentario,
    denunciarComentario,
    atualizarContadorComentarios
};

console.log('💬 Sistema de comentários carregado!');