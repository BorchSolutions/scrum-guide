/**
 * Navigation.js - Sistema de navegación para SCRUM Pro Guide
 * Funcionalidades: Smooth scroll, navbar effects, mobile menu, progress tracking
 */

class Navigation {
    constructor() {
        this.navbar = null;
        this.menuToggle = null;
        this.navMenu = null;
        this.scrollProgress = null;
        this.lastScroll = 0;
        this.isScrolling = false;
        
        this.init();
    }

    /**
     * Inicializa todos los componentes de navegación
     */
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupProgressIndicator();
    }

    /**
     * Configura las referencias a elementos del DOM
     */
    setupElements() {
        this.navbar = document.getElementById('navbar') || document.querySelector('.navbar');
        this.menuToggle = document.getElementById('menuToggle') || document.querySelector('.menu-toggle');
        this.navMenu = document.querySelector('.nav-menu') || document.querySelector('.nav-links');
        this.scrollProgress = document.getElementById('scroll-progress') || document.querySelector('.scroll-progress');
    }

    /**
     * Configura todos los event listeners
     */
    setupEventListeners() {
        this.setupSmoothScrolling();
        this.setupScrollEffects();
        this.setupHashNavigation();
        
        // Handle window resize
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    /**
     * Configura smooth scrolling para enlaces internos
     */
    setupSmoothScrolling() {
        document.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (anchor) {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                
                if (target) {
                    this.scrollToElement(target);
                    this.closeMobileMenu();
                    this.updateActiveNavigation(anchor);
                }
            }
        });
    }

    /**
     * Scroll suave a un elemento específico
     * @param {HTMLElement} element - Elemento de destino
     */
    scrollToElement(element) {
        const navbarHeight = this.navbar ? this.navbar.offsetHeight : 0;
        const targetPosition = element.offsetTop - navbarHeight - 20;
        
        this.isScrolling = true;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Reset scrolling flag after animation
        setTimeout(() => {
            this.isScrolling = false;
        }, 1000);
    }

    /**
     * Configura efectos de scroll
     */
    setupScrollEffects() {
        let scrollTimer = null;
        
        window.addEventListener('scroll', () => {
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            
            scrollTimer = setTimeout(() => {
                this.handleScroll();
            }, 10);
        });
    }

    /**
     * Maneja el evento de scroll
     */
    handleScroll() {
        const currentScroll = window.pageYOffset;
        
        // Update navbar appearance
        this.updateNavbarAppearance(currentScroll);
        
        // Update scroll progress
        this.updateScrollProgress(currentScroll);
        
        // Update active section
        if (!this.isScrolling) {
            this.updateActiveSectionOnScroll();
        }
        
        this.lastScroll = currentScroll;
    }

    /**
     * Actualiza la apariencia del navbar según scroll
     */
    updateNavbarAppearance(currentScroll) {
        if (!this.navbar) return;
        
        // Add/remove scrolled class
        if (currentScroll > 100) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar on scroll direction
        if (currentScroll > this.lastScroll && currentScroll > 200) {
            // Scrolling down
            this.navbar.classList.add('hidden');
        } else {
            // Scrolling up
            this.navbar.classList.remove('hidden');
        }
    }

    /**
     * Actualiza el indicador de progreso de scroll
     */
    updateScrollProgress(currentScroll) {
        if (!this.scrollProgress) return;
        
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollableHeight = documentHeight - windowHeight;
        const scrolled = (currentScroll / scrollableHeight) * 100;
        
        this.scrollProgress.style.transform = `scaleX(${Math.min(scrolled / 100, 1)})`;
    }

    /**
     * Actualiza la sección activa basada en scroll
     */
    updateActiveSectionOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.pageYOffset + 150;
        
        let activeSection = null;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                activeSection = section.id;
            }
        });
        
        if (activeSection) {
            this.updateActiveNavigationById(activeSection);
        }
    }

    /**
     * Configura el menú móvil
     */
    setupMobileMenu() {
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileMenu();
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.navMenu && 
                !this.navMenu.contains(e.target) && 
                !this.menuToggle?.contains(e.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        if (this.navMenu) {
            this.navMenu.classList.toggle('active');
            this.menuToggle?.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (this.navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        if (this.navMenu) {
            this.navMenu.classList.remove('active');
            this.menuToggle?.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * Configura navegación por hash
     */
    setupHashNavigation() {
        // Handle initial hash
        if (window.location.hash) {
            setTimeout(() => {
                const target = document.querySelector(window.location.hash);
                if (target) {
                    this.scrollToElement(target);
                }
            }, 100);
        }
        
        // Handle hash changes
        window.addEventListener('hashchange', () => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                this.scrollToElement(target);
            }
        });
    }

    /**
     * Configura el indicador de progreso
     */
    setupProgressIndicator() {
        if (!this.scrollProgress) {
            // Create progress indicator if it doesn't exist
            this.scrollProgress = document.createElement('div');
            this.scrollProgress.className = 'scroll-progress';
            this.scrollProgress.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 3px;
                background: linear-gradient(90deg, var(--primary), var(--secondary));
                transform: scaleX(0);
                transform-origin: left;
                transition: transform 0.1s ease;
                z-index: 1000;
            `;
            
            document.body.appendChild(this.scrollProgress);
        }
    }

    /**
     * Actualiza navegación activa
     */
    updateActiveNavigation(activeLink) {
        // Remove active from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active to current link
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Actualiza navegación activa por ID de sección
     */
    updateActiveNavigationById(sectionId) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    }

    /**
     * Maneja el redimensionamiento de ventana
     */
    handleResize() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768) {
            this.closeMobileMenu();
        }
    }

    /**
     * Utility: debounce function
     */
    debounce(func, wait, immediate) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func(...args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func(...args);
        };
    }
}

/**
 * Navigation utilities
 */
const NavigationUtils = {
    /**
     * Calcula la posición de scroll para un elemento
     */
    getScrollPosition(element) {
        const navbar = document.getElementById('navbar');
        const navbarHeight = navbar ? navbar.offsetHeight : 0;
        return element.offsetTop - navbarHeight - 20;
    },

    /**
     * Verifica si un elemento está visible en el viewport
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
     */
    getNavigableSections() {
        return document.querySelectorAll('section[id]');
    },

    /**
     * Obtiene la sección actualmente visible
     */
    getCurrentSection() {
        const sections = this.getNavigableSections();
        const scrollPos = window.pageYOffset + 150;
        
        for (let section of sections) {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                return section;
            }
        }
        
        return null;
    }
};

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Navigation, NavigationUtils };
}

// Exportar para ES6 modules
if (typeof window !== 'undefined') {
    window.Navigation = Navigation;
    window.NavigationUtils = NavigationUtils;
}