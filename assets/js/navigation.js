/**
 * Navigation.js - Sistema de navegación para SCRUM Pro Guide
 * Funcionalidades: Smooth scroll, navbar effects, mobile menu, loader
 */

class Navigation {
    constructor() {
        this.navbar = null;
        this.menuToggle = null;
        this.navMenu = null;
        this.loader = null;
        this.lastScroll = 0;
        
        this.init();
    }

    /**
     * Inicializa todos los componentes de navegación
     */
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupLoader();
        this.setupRevealAnimations();
        console.log('🚀 Navigation system initialized successfully!');
    }

    /**
     * Configura las referencias a elementos del DOM
     */
    setupElements() {
        this.navbar = document.getElementById('navbar');
        this.menuToggle = document.getElementById('menuToggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.loader = document.getElementById('loader');
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        this.setupSmoothScrolling();
        this.setupScrollEffects();
        this.setupMobileMenu();
    }

    /**
     * Configura smooth scrolling para enlaces internos
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    this.scrollToElement(target);
                    // Cerrar menú móvil si está abierto
                    this.closeMobileMenu();
                }
            });
        });
    }

    /**
     * Scroll suave a un elemento específico
     * @param {HTMLElement} element - Elemento de destino
     */
    scrollToElement(element) {
        const navbarHeight = this.navbar ? this.navbar.offsetHeight : 0;
        const targetPosition = element.offsetTop - navbarHeight - 20;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Configura efectos de scroll en la navbar
     */
    setupScrollEffects() {
        window.addEventListener('scroll', () => {
            this.handleNavbarScroll();
        }, { passive: true });
    }

    /**
     * Maneja los efectos de scroll en la navbar
     */
    handleNavbarScroll() {
        if (!this.navbar) return;

        const currentScroll = window.pageYOffset;
        
        // Agregar/quitar clase scrolled
        if (currentScroll > 100) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }

        // Actualizar último scroll para futuras funcionalidades
        this.lastScroll = currentScroll;
    }

    /**
     * Configura el menú móvil
     */
    setupMobileMenu() {
        if (!this.menuToggle) return;

        this.menuToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Cerrar menú al hacer click en enlaces
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!this.navbar.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Toggle del menú móvil
     */
    toggleMobileMenu() {
        if (!this.navMenu) return;

        const isOpen = this.navMenu.style.display === 'flex';
        
        if (isOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    /**
     * Abre el menú móvil
     */
    openMobileMenu() {
        if (!this.navMenu) return;
        
        this.navMenu.style.display = 'flex';
        this.menuToggle?.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll
    }

    /**
     * Cierra el menú móvil
     */
    closeMobileMenu() {
        if (!this.navMenu) return;
        
        this.navMenu.style.display = 'none';
        this.menuToggle?.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll
    }

    /**
     * Configura el loader de la página
     */
    setupLoader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.hideLoader();
            }, 1000);
        });
    }

    /**
     * Oculta el loader
     */
    hideLoader() {
        if (this.loader) {
            this.loader.classList.add('hidden');
            // Remover del DOM después de la transición
            setTimeout(() => {
                this.loader.remove();
            }, 500);
        }
    }

    /**
     * Configura animaciones de reveal para elementos
     */
    setupRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal');
        
        if (revealElements.length === 0) return;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }

    /**
     * Navega programáticamente a una sección
     * @param {string} sectionId - ID de la sección (sin #)
     */
    navigateToSection(sectionId) {
        const target = document.getElementById(sectionId);
        if (target) {
            this.scrollToElement(target);
        }
    }

    /**
     * Obtiene la sección actualmente visible
     * @returns {string} ID de la sección activa
     */
    getCurrentSection() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.pageYOffset + 100;

        for (let section of sections) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPosition >= sectionTop && 
                scrollPosition < sectionTop + sectionHeight) {
                return section.id;
            }
        }
        
        return '';
    }

    /**
     * Actualiza la navegación activa basada en scroll
     */
    updateActiveNavigation() {
        const currentSection = this.getCurrentSection();
        
        // Remover clase active de todos los enlaces
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Agregar clase active al enlace correspondiente
        if (currentSection) {
            const activeLink = document.querySelector(`a[href="#${currentSection}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }

    /**
     * Destruye la instancia y limpia event listeners
     */
    destroy() {
        // Remover event listeners específicos si es necesario
        // Útil para SPAs como Angular
        console.log('Navigation system destroyed');
    }
}

// Utilidades adicionales para navegación
const NavigationUtils = {
    /**
     * Obtiene el offset de un elemento considerando la navbar
     * @param {HTMLElement} element 
     * @returns {number}
     */
    getElementOffset(element) {
        const navbar = document.getElementById('navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        return element.offsetTop - navbarHeight - 20;
    },

    /**
     * Verifica si un elemento está visible en el viewport
     * @param {HTMLElement} element 
     * @returns {boolean}
     */
    isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
    },

    /**
     * Scroll suave a top de página
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    },

    /**
     * Obtiene todas las secciones navegables
     * @returns {NodeList}
     */
    getNavigableSections() {
        return document.querySelectorAll('section[id]');
    }
};

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});

// Exportar para uso en módulos (compatible con Angular)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Navigation, NavigationUtils };
}

// Exportar para ES6 modules
if (typeof window !== 'undefined') {
    window.Navigation = Navigation;
    window.NavigationUtils = NavigationUtils;
}