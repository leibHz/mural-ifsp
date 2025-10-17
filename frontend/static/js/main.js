/**
 * MURAL IFSP - JavaScript Principal
 * Funcionalidades gerais da aplicação
 */

// ===== CONFIGURAÇÃO GLOBAL =====
const API_BASE_URL = '/api';
let currentUser = null;

// ===== UTILITÁRIOS =====

/**
 * Fazer requisição à API
 */
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Adicionar token de autenticação se existir
    const token = localStorage.getItem('token');
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.erro || 'Erro na requisição');
        }

        return data;
    } catch (error) {
        console.error('Erro na API:', error);
        throw error;
    }
}

/**
 * Mostrar toast de notificação
 */
function showToast(message, type = 'info', duration = 5000) {
    const container = document.getElementById('toastContainer');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type} fade-in`;
    toast.innerHTML = `
        <i class="fas ${icons[type]} toast-icon"></i>
        <div class="toast-content">
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;

    container.appendChild(toast);

    // Remover automaticamente
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Mostrar/esconder loading overlay
 */
function toggleLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('active');
    } else {
        overlay.classList.remove('active');
    }
}

/**
 * Formatar data relativa (ex: "há 2 horas")
 */
function formatarDataRelativa(dataString) {
    const data = new Date(dataString);
    const agora = new Date();
    const segundos = Math.floor((agora - data) / 1000);

    if (segundos < 60) return 'agora mesmo';
    if (segundos < 3600) return `há ${Math.floor(segundos / 60)} minutos`;
    if (segundos < 86400) return `há ${Math.floor(segundos / 3600)} horas`;
    if (segundos < 604800) return `há ${Math.floor(segundos / 86400)} dias`;
    if (segundos < 2592000) return `há ${Math.floor(segundos / 604800)} semanas`;
    if (segundos < 31536000) return `há ${Math.floor(segundos / 2592000)} meses`;
    return `há ${Math.floor(segundos / 31536000)} anos`;
}

/**
 * Validar email
 */
function validarEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Truncar texto
 */
function truncarTexto(texto, maxLength = 100) {
    if (texto.length <= maxLength) return texto;
    return texto.substr(0, maxLength) + '...';
}

// ===== AUTENTICAÇÃO =====

/**
 * Verificar se usuário está autenticado
 */
async function verificarAutenticacao() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        currentUser = null;
        atualizarUIUsuario();
        return false;
    }

    try {
        const data = await apiRequest('/auth/me');
        currentUser = data.usuario;
        atualizarUIUsuario();
        return true;
    } catch (error) {
        // Token inválido ou expirado
        localStorage.removeItem('token');
        currentUser = null;
        atualizarUIUsuario();
        return false;
    }
}

/**
 * Fazer login
 */
async function fazerLogin(identificador, senha) {
    try {
        toggleLoading(true);
        
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ identificador, senha })
        });

        // Salvar token
        localStorage.setItem('token', data.token);
        currentUser = data.usuario;
        
        showToast('Login realizado com sucesso!', 'success');
        atualizarUIUsuario();
        
        return true;
    } catch (error) {
        showToast(error.message, 'error');
        return false;
    } finally {
        toggleLoading(false);
    }
}

/**
 * Fazer logout
 */
async function fazerLogout() {
    try {
        await apiRequest('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    } finally {
        localStorage.removeItem('token');
        currentUser = null;
        atualizarUIUsuario();
        showToast('Logout realizado com sucesso', 'success');
        window.location.href = '/';
    }
}

/**
 * Atualizar UI com dados do usuário
 */
function atualizarUIUsuario() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    
    if (!userMenuBtn) return;

    if (currentUser) {
        const avatar = currentUser.foto_perfil_url || 
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nome_usuario)}&background=009640&color=fff`;
        
        userMenuBtn.innerHTML = `
            <img src="${avatar}" alt="Avatar" class="user-avatar">
            <span class="user-name">${currentUser.nome_usuario}</span>
            <i class="fas fa-chevron-down"></i>
        `;

        // Atualizar dropdown
        const dropdownHeader = document.querySelector('.dropdown-header');
        if (dropdownHeader) {
            dropdownHeader.innerHTML = `
                <img src="${avatar}" alt="Avatar" class="dropdown-avatar">
                <div>
                    <p class="dropdown-name">${currentUser.nome_real || currentUser.nome_usuario}</p>
                    <p class="dropdown-email">${currentUser.email}</p>
                </div>
            `;
        }
    } else {
        userMenuBtn.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=User&background=009640&color=fff" 
                 alt="Avatar" class="user-avatar">
            <span class="user-name">Visitante</span>
            <i class="fas fa-chevron-down"></i>
        `;
    }
}

// ===== MENU DO USUÁRIO =====

function setupUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.getElementById('userMenu');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userMenuBtn) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            fazerLogout();
        });
    }

    // Fechar menu ao clicar fora
    document.addEventListener('click', (e) => {
        if (userMenu && !userMenu.contains(e.target)) {
            userMenu.classList.remove('active');
        }
    });
}

// ===== MENU MOBILE =====

function setupMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
        });
    }

    if (mobileLogoutBtn) {
        mobileLogoutBtn.addEventListener('click', () => {
            fazerLogout();
        });
    }

    // Fechar ao clicar no overlay
    if (mobileMenu) {
        mobileMenu.addEventListener('click', (e) => {
            if (e.target === mobileMenu) {
                mobileMenu.classList.remove('active');
            }
        });
    }
}

// ===== SCROLL REVEAL =====

function setupScrollReveal() {
    const revealElements = document.querySelectorAll('.scroll-reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, {
        threshold: 0.1
    });

    revealElements.forEach(el => observer.observe(el));
}

// ===== NAVBAR SCROLL =====

function setupNavbarScroll() {
    let lastScroll = 0;
    const navbar = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll <= 0) {
            navbar.style.boxShadow = 'none';
        } else {
            navbar.style.boxShadow = 'var(--shadow-md)';
        }

        lastScroll = currentScroll;
    });
}

// ===== RIPPLE EFFECT =====

function addRippleEffect() {
    const rippleButtons = document.querySelectorAll('.btn-ripple');

    rippleButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');

            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';

            this.appendChild(ripple);

            setTimeout(() => ripple.remove(), 600);
        });
    });
}

// ===== BUSCA =====

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    
    if (searchInput) {
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            
            searchTimeout = setTimeout(() => {
                const query = e.target.value.trim();
                if (query.length >= 3) {
                    realizarBusca(query);
                }
            }, 500);
        });
    }
}

async function realizarBusca(query) {
    console.log('Buscando:', query);
    // Implementar busca de postagens
    // TODO: Criar endpoint de busca
}

// ===== MODAL HELPER =====

function criarModal(titulo, conteudo, botoes = []) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2 class="modal-title">${titulo}</h2>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${conteudo}
            </div>
            <div class="modal-footer">
                ${botoes.map(btn => `
                    <button class="btn ${btn.classe || 'btn-secondary'}" 
                            onclick="${btn.onclick || ''}">
                        ${btn.texto}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('active'), 10);

    // Fechar ao clicar no overlay
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        }
    });

    return overlay;
}

// ===== INICIALIZAÇÃO =====

document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎓 Mural IFSP iniciado!');

    // Verificar autenticação
    await verificarAutenticacao();

    // Configurar componentes
    setupUserMenu();
    setupMobileMenu();
    setupScrollReveal();
    setupNavbarScroll();
    addRippleEffect();
    setupSearch();

    console.log('✅ Sistema pronto!');
});

// Exportar funções para uso global
window.muralIFSP = {
    apiRequest,
    showToast,
    toggleLoading,
    fazerLogin,
    fazerLogout,
    verificarAutenticacao,
    criarModal,
    currentUser: () => currentUser,
    formatarDataRelativa,
    validarEmail,
    truncarTexto
};