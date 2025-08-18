/**
 * Sections.js - Gestión de secciones para SCRUM Pro Guide
 * Funcionalidades: Reveal animations, section tracking, scroll effects, metrics animation
 */

class SectionManager {
    constructor() {
        this.sections = [];
        this.observers = new Map();
        this.animatedElements = new Set();
        this.metricsAnimated = new Set();
        
        this.init();
    }

    /**
     * Inicializa el gestor de secciones
     */
    init() {
        this.setupSections();
        this.setupRevealAnimations();
        this.setupMetricsAnimation();
        this.setupScrollEffects();
        console.log('📋 Section Manager initialized successfully!');
    }

    /**
     * Configura las secciones disponibles
     */
    setupSections() {
        this.sections = Array.from(document.querySelectorAll('section[id]')).map(section => ({
            id: section.id,
            element: section,
            title: this.getSectionTitle(section),
            visible: false,
            animated: false
        }));
    }

    /**
     * Obtiene el título de una sección
     * @param {HTMLElement} section - Elemento de la sección
     * @returns {string} Título de la sección
     */
    getSectionTitle(section) {
        const titleElement = section.querySelector('.section-title, h1, h2, h3');
        return titleElement ? titleElement.textContent.trim() : section.id;
    }

    /**
     * Configura las animaciones de reveal para elementos
     */
    setupRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal');
        
        if (revealElements.length === 0) return;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateRevealElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });

        this.observers.set('reveal', revealObserver);
    }

    /**
     * Anima un elemento reveal
     * @param {HTMLElement} element - Elemento a animar
     */
    animateRevealElement(element) {
        element.classList.add('active');
        
        // Agregar delay secuencial para elementos hermanos
        const siblings = Array.from(element.parentElement?.children || [])
            .filter(el => el.classList.contains('reveal'));
        
        const index = siblings.indexOf(element);
        if (index > 0) {
            element.style.animationDelay = `${index * 0.1}s`;
        }
    }

    /**
     * Configura la animación de métricas
     */
    setupMetricsAnimation() {
        const metricElements = document.querySelectorAll('.metric-value');
        
        if (metricElements.length === 0) return;

        const metricObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.metricsAnimated.has(entry.target)) {
                    this.animateMetric(entry.target);
                    this.metricsAnimated.add(entry.target);
                }
            });
        }, { 
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });

        metricElements.forEach(el => {
            metricObserver.observe(el);
        });

        this.observers.set('metrics', metricObserver);
    }

    /**
     * Anima una métrica con efecto contador
     * @param {HTMLElement} element - Elemento de métrica
     */
    animateMetric(element) {
        const text = element.textContent;
        let endValue = 0;
        let isPercentage = false;
        let isDecimal = false;
        let isStar = false;
        let suffix = '';

        // Detectar tipo de métrica
        if (text.includes('%')) {
            endValue = parseInt(text);
            isPercentage = true;
            suffix = '%';
        } else if (text.includes('★')) {
            endValue = parseFloat(text) * 10;
            isStar = true;
            suffix = '★';
        } else if (text.includes('.')) {
            endValue = parseFloat(text);
            isDecimal = true;
        } else if (text.includes('x')) {
            endValue = parseInt(text);
            suffix = 'x';
        } else {
            endValue = parseInt(text) || 0;
        }

        this.animateValue(element, 0, endValue, 1500, {
            isPercentage,
            isDecimal,
            isStar,
            suffix
        });
    }

    /**
     * Anima un valor numérico
     * @param {HTMLElement} element - Elemento a animar
     * @param {number} start - Valor inicial
     * @param {number} end - Valor final
     * @param {number} duration - Duración en ms
     * @param {Object} options - Opciones de formato
     */
    animateValue(element, start, end, duration, options = {}) {
        const startTime = performance.now();
        
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const current = start + (end - start) * easedProgress;
            
            // Formatear valor según tipo
            let displayValue;
            if (options.isStar) {
                displayValue = (current / 10).toFixed(1) + options.suffix;
            } else if (options.isDecimal) {
                displayValue = current.toFixed(1);
            } else if (options.isPercentage || options.suffix) {
                displayValue = Math.floor(current) + options.suffix;
            } else {
                displayValue = Math.floor(current);
            }
            
            element.textContent = displayValue;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }

    /**
     * Configura efectos de scroll para secciones
     */
    setupScrollEffects() {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionData = this.sections.find(s => s.element === entry.target);
                if (sectionData) {
                    sectionData.visible = entry.isIntersecting;
                    
                    if (entry.isIntersecting) {
                        this.onSectionEnter(sectionData);
                    } else {
                        this.onSectionLeave(sectionData);
                    }
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -20% 0px'
        });

        this.sections.forEach(section => {
            sectionObserver.observe(section.element);
        });

        this.observers.set('sections', sectionObserver);
    }

    /**
     * Maneja cuando una sección entra en vista
     * @param {Object} sectionData - Datos de la sección
     */
    onSectionEnter(sectionData) {
        // Actualizar navegación activa
        this.updateActiveNavigation(sectionData.id);
        
        // Disparar evento personalizado
        this.dispatchSectionEvent('sectionEnter', sectionData);
        
        // Efectos específicos por sección
        this.applySectionEffects(sectionData);
    }

    /**
     * Maneja cuando una sección sale de vista
     * @param {Object} sectionData - Datos de la sección
     */
    onSectionLeave(sectionData) {
        this.dispatchSectionEvent('sectionLeave', sectionData);
    }

    /**
     * Aplica efectos específicos a cada sección
     * @param {Object} sectionData - Datos de la sección
     */
    applySectionEffects(sectionData) {
        switch (sectionData.id) {
            case 'intro':
                this.animateHeroElements();
                break;
            case 'framework':
                this.animateFrameworkCards();
                break;
            case 'metricas':
                this.animateCharts();
                break;
            case 'ejemplo':
                this.animateExampleElements();
                break;
        }
    }

    /**
     * Anima elementos del hero
     */
    animateHeroElements() {
        const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-cta');
        heroElements.forEach((element, index) => {
            setTimeout(() => {
                element.style.animation = 'fadeInUp 0.8s ease forwards';
            }, index * 200);
        });
    }

    /**
     * Anima tarjetas del framework
     */
    animateFrameworkCards() {
        const cards = document.querySelectorAll('#framework .card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.animation = 'slideInUp 0.6s ease forwards';
            }, index * 150);
        });
    }

    /**
     * Anima gráficos y métricas
     */
    animateCharts() {
        // Animar canvas charts si existen
        const charts = document.querySelectorAll('#burndownChart, #velocityChart');
        charts.forEach(chart => {
            if (chart && typeof this.animateChart === 'function') {
                this.animateChart(chart);
            }
        });
    }

    /**
     * Anima elementos de ejemplo
     */
    animateExampleElements() {
        const timelineItems = document.querySelectorAll('#ejemplo .timeline-item');
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.animation = 'slideInLeft 0.7s ease forwards';
            }, index * 200);
        });
    }

    /**
     * Actualiza la navegación activa
     * @param {string} activeSectionId - ID de la sección activa
     */
    updateActiveNavigation(activeSectionId) {
        // Remover clase active de todos los enlaces
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Agregar clase active al enlace correspondiente
        const activeLink = document.querySelector(`a[href="#${activeSectionId}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Dispara evento personalizado de sección
     * @param {string} eventType - Tipo de evento
     * @param {Object} sectionData - Datos de la sección
     */
    dispatchSectionEvent(eventType, sectionData) {
        const event = new CustomEvent(eventType, {
            detail: {
                section: sectionData,
                timestamp: Date.now()
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Obtiene la sección actualmente visible
     * @returns {Object|null} Datos de la sección activa
     */
    getCurrentSection() {
        return this.sections.find(section => section.visible) || null;
    }

    /**
     * Obtiene todas las secciones visibles
     * @returns {Array} Array de secciones visibles
     */
    getVisibleSections() {
        return this.sections.filter(section => section.visible);
    }

    /**
     * Navega a una sección específica
     * @param {string} sectionId - ID de la sección
     */
    navigateToSection(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (section) {
            const navbarHeight = document.getElementById('navbar')?.offsetHeight || 0;
            const targetPosition = section.element.offsetTop - navbarHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Refresca las animaciones de una sección
     * @param {string} sectionId - ID de la sección
     */
    refreshSectionAnimations(sectionId) {
        const section = this.sections.find(s => s.id === sectionId);
        if (section) {
            const elements = section.element.querySelectorAll('.reveal');
            elements.forEach(el => {
                this.animatedElements.delete(el);
                el.classList.remove('active');
            });
        }
    }

    /**
     * Obtiene estadísticas de las secciones
     * @returns {Object} Estadísticas
     */
    getSectionStats() {
        return {
            totalSections: this.sections.length,
            visibleSections: this.getVisibleSections().length,
            animatedElements: this.animatedElements.size,
            animatedMetrics: this.metricsAnimated.size,
            currentSection: this.getCurrentSection()?.id || null
        };
    }

    /**
     * Destruye el gestor y limpia observers
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.animatedElements.clear();
        this.metricsAnimated.clear();
        console.log('📋 Section Manager destroyed');
    }
}

/**
 * Utilidades para trabajar con secciones
 */
const SectionUtils = {
    /**
     * Obtiene el progreso de scroll de una sección
     * @param {HTMLElement} section - Elemento de sección
     * @returns {number} Progreso entre 0 y 1
     */
    getSectionScrollProgress(section) {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        if (rect.bottom < 0 || rect.top > windowHeight) {
            return 0;
        }
        
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        return visibleHeight / section.offsetHeight;
    },

    /**
     * Verifica si una sección está completamente visible
     * @param {HTMLElement} section - Elemento de sección
     * @returns {boolean}
     */
    isSectionFullyVisible(section) {
        const rect = section.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
    },

    /**
     * Obtiene la siguiente sección
     * @param {string} currentSectionId - ID de la sección actual
     * @returns {HTMLElement|null}
     */
    getNextSection(currentSectionId) {
        const sections = Array.from(document.querySelectorAll('section[id]'));
        const currentIndex = sections.findIndex(s => s.id === currentSectionId);
        return sections[currentIndex + 1] || null;
    },

    /**
     * Obtiene la sección anterior
     * @param {string} currentSectionId - ID de la sección actual
     * @returns {HTMLElement|null}
     */
    getPreviousSection(currentSectionId) {
        const sections = Array.from(document.querySelectorAll('section[id]'));
        const currentIndex = sections.findIndex(s => s.id === currentSectionId);
        return sections[currentIndex - 1] || null;
    },

    /**
     * Calcula el tiempo estimado de lectura de una sección
     * @param {HTMLElement} section - Elemento de sección
     * @returns {number} Tiempo en minutos
     */
    estimateReadingTime(section) {
        const text = section.textContent || '';
        const wordsPerMinute = 200;
        const wordCount = text.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }
};

// Eventos personalizados para secciones
document.addEventListener('sectionEnter', (event) => {
    console.log(`📍 Entered section: ${event.detail.section.id}`);
});

document.addEventListener('sectionLeave', (event) => {
    console.log(`📤 Left section: ${event.detail.section.id}`);
});

// Inicialización automática
document.addEventListener('DOMContentLoaded', () => {
    window.sectionManager = new SectionManager();
});

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SectionManager, SectionUtils };
}

if (typeof window !== 'undefined') {
    window.SectionManager = SectionManager;
    window.SectionUtils = SectionUtils;
}