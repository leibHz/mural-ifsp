/**
 * MURAL IFSP - Gerenciamento de Postagens
 * Criar, visualizar e interagir com postagens
 */

let paginaAtual = 1;
let postagensPorPagina = 12;

// ===== CARREGAR POSTAGENS =====

async function carregarPostagens(pagina = 1) {
    try {
        const grid = document.getElementById('postagensGrid');
        const skeleton = grid.querySelector('.loading-skeleton');
        const mensagemVazio = document.getElementById('mensagemVazio');
        
        if (skeleton) skeleton.style.display = 'block';
        mensagemVazio.style.display = 'none';

        // Obter filtros
        const filtroTipo = document.getElementById('filtroTipo')?.value || '';
        const ordenacao = document.getElementById('ordenacao')?.value || 'recentes';

        // Fazer requisição
        const params = new URLSearchParams({
            pagina: pagina,
            por_pagina: postagensPorPagina,
            tipo: filtroTipo,
            ordem: ordenacao
        });

        const data = await window.muralIFSP.apiRequest(`/postagens?${params}`);

        // Limpar grid
        grid.innerHTML = '';

        if (!data.dados || data.dados.length === 0) {
            mensagemVazio.style.display = 'block';
            return;
        }

        // Renderizar postagens
        data.dados.forEach((postagem, index) => {
            const card = criarCardPostagem(postagem);
            card.style.animationDelay = `${index * 0.1}s`;
            grid.appendChild(card);
        });

        // Renderizar paginação
        renderizarPaginacao(data.paginacao);

        paginaAtual = pagina;

    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
        window.muralIFSP.showToast('Erro ao carregar postagens', 'error');
    }
}

// ===== CRIAR CARD DE POSTAGEM =====

function criarCardPostagem(postagem) {
    const card = document.createElement('div');
    card.className = 'post-card fade-in-up';
    card.style.animationFillMode = 'both';

    // Avatar do autor
    const avatar = postagem.usuario?.foto_perfil_url || 
                   `https://ui-avatars.com/api/?name=${encodeURIComponent(postagem.usuario?.nome_usuario || 'User')}&background=009640&color=fff`;

    // Ícone do tipo de mídia
    const iconesTipo = {
        imagem: 'fa-image',
        video: 'fa-video',
        audio: 'fa-music',
        pdf: 'fa-file-pdf',
        gif: 'fa-film',
        texto: 'fa-align-left'
    };

    const icone = iconesTipo[postagem.tipo_midia] || 'fa-file';

    card.innerHTML = `
        <div class="post-header">
            <img src="${avatar}" alt="${postagem.usuario?.nome_usuario}" class="post-avatar">
            <div class="post-author-info">
                <div>
                    <span class="post-author">${postagem.usuario?.nome_usuario || 'Anônimo'}</span>
                    <span class="post-type">
                        <i class="fas ${icone}"></i> ${postagem.tipo_midia}
                    </span>
                </div>
                <span class="post-time">${window.muralIFSP.formatarDataRelativa(postagem.criado_em)}</span>
            </div>
            ${postagem.usuario_id === window.muralIFSP.currentUser()?.id ? `
                <div class="post-menu">
                    <button class="icon-btn" onclick="abrirMenuPostagem(event, '${postagem.id}')">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            ` : ''}
        </div>

        ${renderizarMidiaPostagem(postagem)}

        <div class="post-description">
            ${window.muralIFSP.truncarTexto(postagem.descricao, 200)}
            ${postagem.descricao.length > 200 ? `
                <a href="#" onclick="abrirModalPostagem('${postagem.id}'); return false;" 
                   style="color: var(--verde-principal); text-decoration: none;">
                    Ver mais
                </a>
            ` : ''}
        </div>

        ${postagem.transcricao_audio ? `
            <div class="post-transcription" style="padding: 1rem; background: var(--background-hover); margin: 0 1rem 1rem; border-radius: var(--radius-md); border-left: 3px solid var(--verde-principal);">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem; color: var(--verde-principal);">
                    <i class="fas fa-closed-captioning"></i>
                    <strong>Transcrição:</strong>
                </div>
                <p style="color: var(--texto-secundario); font-size: 0.9rem;">
                    ${window.muralIFSP.truncarTexto(postagem.transcricao_audio, 150)}
                </p>
            </div>
        ` : ''}

        <div class="post-actions">
            <button class="post-action-btn" onclick="visualizarPostagem('${postagem.id}')">
                <i class="fas fa-eye"></i>
                <span>${postagem.visualizacoes || 0}</span>
            </button>
            <button class="post-action-btn" onclick="abrirComentarios('${postagem.id}')">
                <i class="fas fa-comment"></i>
                <span>${postagem.num_comentarios || 0}</span>
            </button>
            <button class="post-action-btn" onclick="denunciarPostagem('${postagem.id}')">
                <i class="fas fa-flag"></i>
                <span>Denunciar</span>
            </button>
        </div>
    `;

    return card;
}

// ===== RENDERIZAR MÍDIA DA POSTAGEM =====

function renderizarMidiaPostagem(postagem) {
    if (!postagem.url_midia && postagem.tipo_midia !== 'texto') {
        return '';
    }

    const urlMiniatura = postagem.url_miniatura || postagem.url_midia;

    switch (postagem.tipo_midia) {
        case 'imagem':
        case 'gif':
            return `
                <div class="post-media-container" onclick="abrirModalPostagem('${postagem.id}')" style="cursor: pointer;">
                    <img src="${urlMiniatura}" alt="Imagem da postagem" class="post-media">
                </div>
            `;

        case 'video':
            return `
                <div class="post-media-container" onclick="abrirModalPostagem('${postagem.id}')" style="cursor: pointer; position: relative;">
                    <img src="${urlMiniatura}" alt="Miniatura do vídeo" class="post-media">
                    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                                background: rgba(0, 150, 64, 0.9); border-radius: 50%; width: 60px; height: 60px; 
                                display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-play" style="color: white; font-size: 1.5rem; margin-left: 5px;"></i>
                    </div>
                </div>
            `;

        case 'audio':
            return `
                <div class="post-media-container" style="padding: 2rem; background: var(--background-hover); margin: 1rem; border-radius: var(--radius-md);">
                    <div style="text-align: center; margin-bottom: 1rem;">
                        <i class="fas fa-music" style="font-size: 3rem; color: var(--verde-principal);"></i>
                    </div>
                    <audio controls style="width: 100%;" preload="metadata">
                        <source src="${postagem.url_midia}" type="audio/mpeg">
                        Seu navegador não suporta o elemento de áudio.
                    </audio>
                    ${postagem.duracao_midia ? `
                        <p style="text-align: center; color: var(--texto-secundario); margin-top: 0.5rem; font-size: 0.9rem;">
                            Duração: ${formatarDuracao(postagem.duracao_midia)}
                        </p>
                    ` : ''}
                </div>
            `;

        case 'pdf':
            return `
                <div class="post-media-container" onclick="abrirModalPostagem('${postagem.id}')" style="cursor: pointer; position: relative;">
                    <img src="${urlMiniatura}" alt="Miniatura do PDF" class="post-media">
                    <div style="position: absolute; bottom: 1rem; right: 1rem; 
                                background: var(--vermelho-alerta); color: white; padding: 0.5rem 1rem; 
                                border-radius: var(--radius-sm); font-weight: 600;">
                        <i class="fas fa-file-pdf"></i> PDF
                    </div>
                </div>
            `;

        case 'texto':
            return `
                <div class="post-media-container" style="padding: 2rem; background: linear-gradient(135deg, var(--verde-escuro) 0%, var(--verde-principal) 100%); 
                            margin: 1rem; border-radius: var(--radius-md); text-align: center;">
                    <i class="fas fa-align-left" style="font-size: 3rem; color: white; opacity: 0.8;"></i>
                </div>
            `;

        default:
            return '';
    }
}

// ===== FORMATTAR DURAÇÃO =====

function formatarDuracao(segundos) {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
}

// ===== PAGINAÇÃO =====

function renderizarPaginacao(paginacao) {
    const container = document.getElementById('paginacao');
    if (!container || !paginacao) return;

    container.innerHTML = '';

    // Botão anterior
    if (paginacao.tem_anterior) {
        const btnAnterior = document.createElement('button');
        btnAnterior.className = 'btn btn-secondary';
        btnAnterior.innerHTML = '<i class="fas fa-chevron-left"></i> Anterior';
        btnAnterior.onclick = () => carregarPostagens(paginacao.pagina_atual - 1);
        container.appendChild(btnAnterior);
    }

    // Números das páginas
    for (let i = 1; i <= paginacao.total_paginas; i++) {
        if (i === 1 || i === paginacao.total_paginas || 
            (i >= paginacao.pagina_atual - 2 && i <= paginacao.pagina_atual + 2)) {
            
            const btnPagina = document.createElement('button');
            btnPagina.className = i === paginacao.pagina_atual ? 'btn btn-primary' : 'btn btn-secondary';
            btnPagina.textContent = i;
            btnPagina.onclick = () => carregarPostagens(i);
            container.appendChild(btnPagina);
        } else if (i === paginacao.pagina_atual - 3 || i === paginacao.pagina_atual + 3) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '0.75rem';
            ellipsis.style.color = 'var(--texto-secundario)';
            container.appendChild(ellipsis);
        }
    }

    // Botão próxima
    if (paginacao.tem_proxima) {
        const btnProxima = document.createElement('button');
        btnProxima.className = 'btn btn-secondary';
        btnProxima.innerHTML = 'Próxima <i class="fas fa-chevron-right"></i>';
        btnProxima.onclick = () => carregarPostagens(paginacao.pagina_atual + 1);
        container.appendChild(btnProxima);
    }
}

// ===== MODAL NOVA POSTAGEM =====

function abrirModalNovaPostagem() {
    const user = window.muralIFSP.currentUser();
    
    if (!user) {
        window.muralIFSP.showToast('Faça login para criar postagens', 'warning');
        window.location.href = '/login';
        return;
    }

    if (user.tipo_usuario !== 'estudante') {
        window.muralIFSP.showToast('Apenas estudantes podem criar postagens', 'error');
        return;
    }

    const modal = document.getElementById('modalNovaPostagem');
    modal.classList.add('active');
    
    configurarFormNovaPostagem();
}

function fecharModalNovaPostagem() {
    const modal = document.getElementById('modalNovaPostagem');
    modal.classList.remove('active');
    document.getElementById('formNovaPostagem').reset();
    document.getElementById('uploadContainer').style.display = 'none';
    document.getElementById('previewContainer').style.display = 'none';
}

function configurarFormNovaPostagem() {
    const tipoMidia = document.getElementById('tipoMidia');
    const uploadContainer = document.getElementById('uploadContainer');
    const transcricaoContainer = document.getElementById('transcricaoContainer');
    const arquivoUpload = document.getElementById('arquivoUpload');
    const uploadArea = document.getElementById('uploadArea');
    const descricao = document.getElementById('descricao');
    const formatosPermitidos = document.getElementById('formatosPermitidos');

    // Contador de caracteres
    descricao.addEventListener('input', () => {
        document.getElementById('contadorCaracteres').textContent = descricao.value.length;
    });

    // Mudança de tipo de mídia
    tipoMidia.addEventListener('change', () => {
        const tipo = tipoMidia.value;
        
        if (tipo === 'texto') {
            uploadContainer.style.display = 'none';
            transcricaoContainer.style.display = 'none';
        } else if (tipo) {
            uploadContainer.style.display = 'block';
            transcricaoContainer.style.display = tipo === 'audio' ? 'block' : 'none';
            
            // Configurar formatos aceitos
            const formatos = {
                imagem: '.jpg,.jpeg,.png,.gif,.webp',
                video: '.mp4,.webm,.mov',
                audio: '.mp3,.wav,.ogg',
                pdf: '.pdf',
                gif: '.gif'
            };
            
            arquivoUpload.accept = formatos[tipo] || '*';
            formatosPermitidos.textContent = `Formatos: ${formatos[tipo] || 'Todos'}`;
        }
    });

    // Upload de arquivo
    uploadArea.addEventListener('click', () => arquivoUpload.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--verde-principal)';
        uploadArea.style.background = 'var(--verde-transparente)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = 'var(--borda)';
        uploadArea.style.background = 'transparent';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--borda)';
        uploadArea.style.background = 'transparent';
        
        if (e.dataTransfer.files.length > 0) {
            arquivoUpload.files = e.dataTransfer.files;
            previewArquivo(e.dataTransfer.files[0]);
        }
    });
    
    arquivoUpload.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            previewArquivo(e.target.files[0]);
        }
    });

    // Submit do formulário
    document.getElementById('formNovaPostagem').onsubmit = async (e) => {
        e.preventDefault();
        await enviarPostagem();
    };
}

function previewArquivo(arquivo) {
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.style.display = 'block';
    previewContainer.innerHTML = '';

    const tipo = document.getElementById('tipoMidia').value;

    if (tipo === 'imagem' || tipo === 'gif') {
        const reader = new FileReader();
        reader.onload = (e) => {
            previewContainer.innerHTML = `
                <img src="${e.target.result}" alt="Preview" 
                     style="max-width: 100%; border-radius: var(--radius-md); border: 1px solid var(--borda);">
            `;
        };
        reader.readAsDataURL(arquivo);
    } else {
        previewContainer.innerHTML = `
            <div style="padding: 1rem; background: var(--background-hover); border-radius: var(--radius-md); 
                        display: flex; align-items: center; gap: 1rem;">
                <i class="fas fa-file" style="font-size: 2rem; color: var(--verde-principal);"></i>
                <div>
                    <p style="font-weight: 600;">${arquivo.name}</p>
                    <p style="color: var(--texto-secundario); font-size: 0.9rem;">
                        ${(arquivo.size / 1048576).toFixed(2)} MB
                    </p>
                </div>
            </div>
        `;
    }
}

async function enviarPostagem() {
    // Implementação será feita no próximo arquivo
    window.muralIFSP.showToast('Funcionalidade em desenvolvimento', 'info');
}

// ===== VISUALIZAR POSTAGEM =====

async function visualizarPostagem(id) {
    await abrirModalPostagem(id);
}

async function abrirModalPostagem(id) {
    window.muralIFSP.showToast('Abrindo postagem...', 'info');
    // Implementação completa será feita posteriormente
}

// ===== DENUNCIAR =====

function denunciarPostagem(id) {
    const user = window.muralIFSP.currentUser();
    
    if (!user) {
        window.muralIFSP.showToast('Faça login para denunciar', 'warning');
        return;
    }

    window.muralIFSP.criarModal(
        'Denunciar Postagem',
        `
            <form id="formDenuncia">
                <div class="form-group">
                    <label class="form-label">Motivo da denúncia</label>
                    <select class="form-select" id="motivoDenuncia" required>
                        <option value="">Selecione um motivo</option>
                        <option value="conteudo_inapropriado">Conteúdo inapropriado</option>
                        <option value="spam">Spam</option>
                        <option value="assedio">Assédio ou bullying</option>
                        <option value="violencia">Violência</option>
                        <option value="informacao_falsa">Informação falsa</option>
                        <option value="outro">Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Descrição (opcional)</label>
                    <textarea class="form-textarea" id="descricaoDenuncia" rows="3" 
                              placeholder="Descreva o problema..."></textarea>
                </div>
            </form>
        `,
        [
            { texto: 'Cancelar', classe: 'btn-secondary', onclick: 'this.closest(".modal-overlay").remove()' },
            { texto: 'Enviar Denúncia', classe: 'btn-danger', onclick: `enviarDenuncia('${id}')` }
        ]
    );
}

async function enviarDenuncia(postagemId) {
    // Implementação será feita posteriormente
    window.muralIFSP.showToast('Denúncia enviada com sucesso', 'success');
}

// ===== COMENTÁRIOS =====

function abrirComentarios(id) {
    window.muralIFSP.showToast('Abrindo comentários...', 'info');
    // Implementação será feita posteriormente
}

function fecharModalVisualizacao() {
    const modal = document.getElementById('modalVisualizarPostagem');
    modal.classList.remove('active');
}