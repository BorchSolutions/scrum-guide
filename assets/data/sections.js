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
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Inicializa el gestor de secciones
     */
    init() {
        if (this.isInitialized) return;
        
        this.setupSections();
        this.setupRevealAnimations();
        this.setupMetricsAnimation();
        this.setupScrollEffects();
        this.setupIntersectionObserver();
        
        this.isInitialized = true;
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
            animated: false,
            progress: 0
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
     * Configura las animaciones de reveal
     */
    setupRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal');
        
        if (revealElements.length === 0) return;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.animatedElements.has(entry.target)) {
                    this.animateElement(entry.target);
                    this.animatedElements.add(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });

        this.observers.set('reveal', revealObserver);
    }

    /**
     * Anima un elemento
     * @param {HTMLElement} element - Elemento a animar
     */
    animateElement(element) {
        const animationType = element.dataset.animation || 'fadeInUp';
        const delay = parseInt(element.dataset.delay) || 0;
        
        setTimeout(() => {
            element.classList.add('active');
            element.style.animationName = animationType;
        }, delay);
    }

    /**
     * Configura animaciones de métricas
     */
    setupMetricsAnimation() {
        const metricElements = document.querySelectorAll('.metric-number, .counter');
        
        if (metricElements.length === 0) return;

        const metricsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !this.metricsAnimated.has(entry.target)) {
                    this.animateMetric(entry.target);
                    this.metricsAnimated.add(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        metricElements.forEach(element => {
            metricsObserver.observe(element);
        });

        this.observers.set('metrics', metricsObserver);
    }

    /**
     * Anima una métrica con contador
     * @param {HTMLElement} element - Elemento de métrica
     */
    animateMetric(element) {
        const finalValue = element.textContent.trim();
        const isPercentage = finalValue.includes('%');
        const isMultiplier = finalValue.includes('x');
        const numericValue = parseFloat(finalValue.replace(/[^\d.]/g, ''));
        
        if (isNaN(numericValue)) return;

        let currentValue = 0;
        const increment = numericValue / 60; // 60 frames for smooth animation
        const duration = 2000; // 2 seconds
        const frameTime = duration / 60;

        element.textContent = isPercentage ? '0%' : isMultiplier ? '0x' : '0';

        const animate = () => {
            currentValue += increment;
            
            if (currentValue >= numericValue) {
                element.textContent = finalValue;
                return;
            }

            const displayValue = Math.floor(currentValue);
            if (isPercentage) {
                element.textContent = `${displayValue}%`;
            } else if (isMultiplier) {
                element.textContent = `${displayValue}x`;
            } else {
                element.textContent = displayValue.toString();
            }

            setTimeout(animate, frameTime);
        };

        animate();
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
                this.handleScrollEffects();
            }, 10);
        });
    }

    /**
     * Maneja efectos basados en scroll
     */
    handleScrollEffects() {
        this.updateSectionProgress();
        this.updateParallaxElements();
        this.updateScrollIndicators();
    }

    /**
     * Actualiza el progreso de cada sección
     */
    updateSectionProgress() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;

        this.sections.forEach(section => {
            const rect = section.element.getBoundingClientRect();
            const elementTop = rect.top + scrollTop;
            const elementHeight = rect.height;
            
            // Calculate progress (0 to 1)
            const progress = Math.max(0, Math.min(1, 
                (scrollTop + windowHeight - elementTop) / (windowHeight + elementHeight)
            ));
            
            section.progress = progress;
            
            // Update custom CSS property for advanced animations
            section.element.style.setProperty('--scroll-progress', progress);
        });
    }

    /**
     * Actualiza elementos con efecto parallax
     */
    updateParallaxElements() {
        const parallaxElements = document.querySelectorAll('.parallax');
        const scrolled = window.pageYOffset;

        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallaxSpeed) || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    }

    /**
     * Actualiza indicadores de scroll
     */
    updateScrollIndicators() {
        const indicators = document.querySelectorAll('.scroll-indicator');
        const scrollPercent = Math.min(100, 
            (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );

        indicators.forEach(indicator => {
            indicator.style.setProperty('--scroll-percent', `${scrollPercent}%`);
        });
    }

    /**
     * Configura el Intersection Observer para secciones
     */
    setupIntersectionObserver() {
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const sectionData = this.sections.find(s => s.element === entry.target);
                if (sectionData) {
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
        sectionData.visible = true;
        
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
        sectionData.visible = false;
        this.dispatchSectionEvent('sectionLeave', sectionData);
    }

    /**
     * Aplica efectos específicos a cada sección
     * @param {Object} sectionData - Datos de la sección
     */
    applySectionEffects(sectionData) {
        switch (sectionData.id) {
            case 'hero':
            case 'scrum-foundations':
                this.animateHeroElements();
                break;
            case 'estimacion-agil':
                this.animateEstimationElements();
                break;
            case 'medicion-metricas':
                this.animateMetricsElements();
                break;
            case 'aplicacion-practica':
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
            if (!element.classList.contains('animated')) {
                setTimeout(() => {
                    element.style.animation = 'fadeInUp 0.8s ease forwards';
                    element.classList.add('animated');
                }, index * 200);
            }
        });
    }

    /**
     * Anima elementos de estimación
     */
    animateEstimationElements() {
        const cards = document.querySelectorAll('#estimacion-agil .card, .fibonacci-card');
        cards.forEach((card, index) => {
            if (!card.classList.contains('animated')) {
                setTimeout(() => {
                    card.style.animation = 'slideInUp 0.6s ease forwards';
                    card.classList.add('animated');
                }, index * 100);
            }
        });
    }

    /**
     * Anima elementos de métricas
     */
    animateMetricsElements() {
        const charts = document.querySelectorAll('.chart-container');
        charts.forEach((chart, index) => {
            if (!chart.classList.contains('animated')) {
                setTimeout(() => {
                    chart.style.animation = 'zoomIn 0.8s ease forwards';
                    chart.classList.add('animated');
                    
                    // Initialize chart if ChartManager is available
                    if (window.ChartManager) {
                        window.ChartManager.initializeChart(chart);
                    }
                }, index * 200);
            }
        });
    }

    /**
     * Anima elementos de ejemplo
     */
    animateExampleElements() {
        const examples = document.querySelectorAll('.example-container, .code-example');
        examples.forEach((example, index) => {
            if (!example.classList.contains('animated')) {
                setTimeout(() => {
                    example.style.animation = 'fadeInLeft 0.7s ease forwards';
                    example.classList.add('animated');
                }, index * 150);
            }
        });
    }

    /**
     * Actualiza la navegación activa
     * @param {string} sectionId - ID de la sección activa
     */
    updateActiveNavigation(sectionId) {
        // Update navigation if Navigation class is available
        if (window.navigation && window.navigation.updateActiveNavigationById) {
            window.navigation.updateActiveNavigationById(sectionId);
        }
        
        // Custom event for other components
        document.dispatchEvent(new CustomEvent('sectionActive', {
            detail: { sectionId }
        }));
    }

    /**
     * Dispara evento personalizado de sección
     * @param {string} eventName - Nombre del evento
     * @param {Object} sectionData - Datos de la sección
     */
    dispatchSectionEvent(eventName, sectionData) {
        const event = new CustomEvent(eventName, {
            detail: {
                section: sectionData,
                id: sectionData.id,
                title: sectionData.title,
                visible: sectionData.visible,
                progress: sectionData.progress
            }
        });
        
        document.dispatchEvent(event);
    }

    /**
     * Obtiene secciones visibles
     * @returns {Array} Array de secciones visibles
     */
    getVisibleSections() {
        return this.sections.filter(section => section.visible);
    }

    /**
     * Obtiene la sección actual (más visible)
     * @returns {Object|null} Sección actual
     */
    getCurrentSection() {
        const visibleSections = this.getVisibleSections();
        if (visibleSections.length === 0) return null;
        
        // Return the section with highest progress
        return visibleSections.reduce((current, section) => 
            section.progress > current.progress ? section : current
        );
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
            const elements = section.element.querySelectorAll('.reveal, .animated');
            elements.forEach(el => {
                this.animatedElements.delete(el);
                el.classList.remove('active', 'animated');
                el.style.animation = '';
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
     * Re-inicializa el gestor (útil para contenido dinámico)
     */
    reinitialize() {
        this.destroy();
        this.isInitialized = false;
        this.init();
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
        return visibleHeight / rect.height;
    },

    /**
     * Verifica si una sección está completamente visible
     * @param {HTMLElement} section - Elemento de sección
     * @returns {boolean}
     */
    isSectionFullyVisible(section) {
        const rect = section.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        return rect.top >= 0 && rect.bottom <= windowHeight;
    },

    /**
     * Obtiene la sección más cercana al viewport
     * @returns {HTMLElement|null}
     */
    getClosestSection() {
        const sections = document.querySelectorAll('section[id]');
        let closestSection = null;
        let closestDistance = Infinity;
        
        const viewportCenter = window.innerHeight / 2;
        
        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionCenter = rect.top + rect.height / 2;
            const distance = Math.abs(sectionCenter - viewportCenter);
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestSection = section;
            }
        });
        
        return closestSection;
    }
};

// Inicialización automática cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.sectionManager = new SectionManager();
});

// Re-inicializar cuando se carga contenido dinámico
document.addEventListener('contentLoaded', () => {
    if (window.sectionManager) {
        window.sectionManager.reinitialize();
    }
});

// Exportar para uso global
window.SectionManager = SectionManager;
window.SectionUtils = SectionUtils;