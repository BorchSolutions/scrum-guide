/**
 * SCRUM Pro Guide - JavaScript Principal Simplificado
 * Versión corregida sin dependencias complejas
 */

// Configuración global
const APP_CONFIG = {
    name: 'SCRUM Pro Guide',
    version: '1.0.0',
    debug: true
};

// Utilidad para logging
const Logger = {
    info: (message) => console.log(`ℹ️ ${message}`),
    success: (message) => console.log(`✅ ${message}`),
    error: (message) => console.error(`❌ ${message}`),
    warn: (message) => console.warn(`⚠️ ${message}`)
};

// Clase principal de la aplicación
class ScrumGuideApp {
    constructor() {
        this.isInitialized = false;
        this.loadedSections = new Set();
        this.currentSection = null;
    }

    // Inicializar aplicación
    async init() {
        try {
            Logger.info('Inicializando SCRUM Pro Guide...');
            
            // Cargar componentes principales
            await this.loadComponents();
            
            // Configurar navegación
            this.setupNavigation();
            
            // Configurar sistema de tabs
            this.setupTabs();
            
            // Configurar efectos y animaciones
            this.setupEffects();
            
            // Cargar contenido principal
            await this.loadMainContent();
            
            this.isInitialized = true;
            Logger.success('Aplicación inicializada correctamente');
            
            // Disparar evento de inicialización completa
            this.triggerEvent('app:initialized');
            
        } catch (error) {
            Logger.error(`Error inicializando aplicación: ${error.message}`);
            this.showErrorMessage('Error cargando la aplicación. Por favor, recarga la página.');
        }
    }

    // Cargar componentes básicos
    async loadComponents() {
        const components = [
            { url: 'components/navigation.html', container: 'navigation-container' },
            { url: 'components/footer.html', container: 'footer-container' }
        ];

        for (const component of components) {
            try {
                const success = await Utils.loadHTML(component.url, component.container);
                if (success) {
                    Logger.success(`Componente ${component.url} cargado`);
                } else {
                    Logger.warn(`Falló carga de ${component.url}`);
                }
            } catch (error) {
                Logger.error(`Error cargando ${component.url}: ${error.message}`);
            }
        }
    }

    // Cargar contenido principal
    async loadMainContent() {
        const sections = [
            { url: 'sections/scrum-foundations.html', container: 'scrum-foundations' },
            { url: 'sections/estimacion-agil.html', container: 'estimacion' },
            { url: 'sections/medicion-metricas.html', container: 'metricas' },
            { url: 'sections/aplicacion-practica.html', container: 'practica' },
            { url: 'sections/recursos-herramientas.html', container: 'recursos' }
        ];

        for (const section of sections) {
            try {
                const success = await Utils.loadHTML(section.url, section.container);
                if (success) {
                    this.loadedSections.add(section.container);
                    Logger.success(`Sección ${section.container} cargada`);
                }
            } catch (error) {
                Logger.error(`Error cargando sección ${section.url}: ${error.message}`);
            }
        }
    }

    // Configurar navegación
    setupNavigation() {
        // Enlaces de navegación suave
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                this.navigateToSection(targetId);
            }
        });

        // Toggle menú móvil
        this.setupMobileMenu();

        // Actualizar navegación en scroll
        this.setupScrollNavigation();
    }

    // Configurar menú móvil
    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            // Cerrar menú al hacer click en enlace
            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            });
        }
    }

    // Configurar navegación por scroll
    setupScrollNavigation() {
        let lastScrollTop = 0;
        const navbar = document.getElementById('navbar');

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Ocultar/mostrar navbar en scroll
            if (navbar) {
                if (scrollTop > lastScrollTop && scrollTop > 100) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
                lastScrollTop = scrollTop;
            }

            // Actualizar sección activa
            this.updateActiveSection();
        });
    }

    // Actualizar sección activa en navegación
    updateActiveSection() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let currentSection = null;
        const scrollPos = window.pageYOffset + 150;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });

        // Actualizar enlaces activos
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });

        this.currentSection = currentSection;
    }

    // Navegar a sección específica
    navigateToSection(sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            const navbar = document.getElementById('navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            const targetPosition = target.offsetTop - navbarHeight - 20;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            this.triggerEvent('navigation:changed', { section: sectionId });
        }
    }

    // Configurar sistema de tabs
    setupTabs() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-button')) {
                const tabId = e.target.getAttribute('data-tab');
                const container = e.target.closest('.example-container') || e.target.closest('.tabs-container');
                if (container) {
                    this.showTab(tabId, container);
                }
            }
        });
    }

    // Mostrar tab específico
    showTab(tabId, container) {
        // Ocultar todos los contenidos
        container.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Remover active de todos los botones
        container.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });

        // Mostrar contenido seleccionado
        const targetContent = container.querySelector(`#${tabId}`);
        const targetButton = container.querySelector(`[data-tab="${tabId}"]`);

        if (targetContent) {
            targetContent.classList.add('active');
            this.triggerEvent('tab:changed', { tabId, container });
        }
        
        if (targetButton) {
            targetButton.classList.add('active');
        }
    }

    // Configurar efectos y animaciones
    setupEffects() {
        // Animaciones de scroll reveal
        this.setupScrollReveal();
        
        // Botón de scroll to top
        this.setupScrollToTop();
        
        // Efectos de hover en cards
        this.setupCardEffects();
    }

    // Animaciones de revelado en scroll
    setupScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // Botón scroll to top
    setupScrollToTop() {
        // Crear botón si no existe
        let scrollTopBtn = document.getElementById('scroll-top-btn');
        if (!scrollTopBtn) {
            scrollTopBtn = document.createElement('button');
            scrollTopBtn.id = 'scroll-top-btn';
            scrollTopBtn.className = 'scroll-top-btn';
            scrollTopBtn.innerHTML = '↑';
            scrollTopBtn.setAttribute('aria-label', 'Volver al inicio');
            document.body.appendChild(scrollTopBtn);
        }

        // Mostrar/ocultar en base al scroll
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });

        // Funcionalidad de click
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Efectos en cards
    setupCardEffects() {
        const cards = document.querySelectorAll('.card, .metric-card, .feature-card');
        
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    // Mostrar mensaje de error
    showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-notification';
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #f87171 0%, #ef4444 100%);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                z-index: 10000;
                font-family: system-ui, -apple-system, sans-serif;
                max-width: 300px;
                animation: slideInRight 0.3s ease-out;
            ">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-size: 1.2rem;">⚠️</span>
                    <span>${message}</span>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorDiv);

        // Remover después de 5 segundos
        setTimeout(() => {
            errorDiv.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => errorDiv.remove(), 300);
        }, 5000);
    }

    // Disparar eventos personalizados
    triggerEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: { ...detail, timestamp: Date.now() }
        });
        document.dispatchEvent(event);
        
        if (APP_CONFIG.debug) {
            Logger.info(`Evento disparado: ${eventName}`);
        }
    }

    // Obtener estadísticas de la aplicación
    getStats() {
        return {
            name: APP_CONFIG.name,
            version: APP_CONFIG.version,
            isInitialized: this.isInitialized,
            loadedSections: Array.from(this.loadedSections),
            currentSection: this.currentSection,
            timestamp: new Date().toISOString()
        };
    }
}

// Utilidades globales simplificadas
const Utils = {
    // Cargar contenido HTML
    async loadHTML(url, containerId) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            const container = document.getElementById(containerId);
            
            if (!container) {
                throw new Error(`Container #${containerId} not found`);
            }
            
            container.innerHTML = html;
            return true;
            
        } catch (error) {
            Logger.error(`Error loading ${url}: ${error.message}`);
            return false;
        }
    },

    // Scroll suave a elemento
    smoothScroll(targetId, offset = 0) {
        const target = document.getElementById(targetId);
        if (target) {
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            return true;
        }
        return false;
    },

    // Alternar visibilidad de elemento
    toggle(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            const isHidden = element.style.display === 'none';
            element.style.display = isHidden ? 'block' : 'none';
            return !isHidden;
        }
        return false;
    },

    // Debounce para eventos
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Formatear números
    formatNumber(num) {
        return new Intl.NumberFormat('es-ES').format(num);
    }
};

// Instancia global de la aplicación
let scrumGuideApp;

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    scrumGuideApp = new ScrumGuideApp();
    scrumGuideApp.init();
});

// Manejo de errores globales
window.addEventListener('error', (event) => {
    Logger.error(`Error global: ${event.error?.message || event.message}`);
});

window.addEventListener('unhandledrejection', (event) => {
    Logger.error(`Promise rechazada: ${event.reason}`);
});

// Exportar para uso global
window.ScrumGuideApp = ScrumGuideApp;
window.Utils = Utils;
window.Logger = Logger;

// CSS para animaciones inline
const animationStyles = `
<style>
@keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.scroll-top-btn {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    border: none;
    color: white;
    font-size: 1.2rem;
    cursor: pointer;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
}

.scroll-top-btn.visible {
    opacity: 1;
    visibility: visible;
}

.scroll-top-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 25px rgba(99, 102, 241, 0.4);
}

.reveal {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s ease-out;
}

.reveal.revealed {
    opacity: 1;
    transform: translateY(0);
}

#navbar {
    transition: transform 0.3s ease;
}
</style>
`;

// Inyectar estilos
document.head.insertAdjacentHTML('beforeend', animationStyles);