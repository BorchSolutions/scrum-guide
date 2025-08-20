/**
 * Content Loader - Sistema de carga dinámica de contenido
 * VERSIÓN SIMPLIFICADA - Sin re-ejecución de scripts problemática
 */

class ContentLoader {
    constructor() {
        this.cache = new Map();
        this.currentSection = null;
        this.loadingIndicator = null;
        this.config = {
            sections: {
                'scrum-foundations': {
                    title: 'Fundamentos SCRUM',
                    file: 'sections/scrum-foundations.html',
                    icon: '📋'
                },
                'estimacion-agil': {
                    title: 'Estimación Ágil',
                    file: 'sections/estimacion-agil.html',
                    icon: '📊'
                },
                'medicion-metricas': {
                    title: 'Medición & Métricas',
                    file: 'sections/medicion-metricas.html',
                    icon: '📈'
                },
                'aplicacion-practica': {
                    title: 'Aplicación Práctica',
                    file: 'sections/aplicacion-practica.html',
                    icon: '⚡'
                },
                'recursos-herramientas': {
                    title: 'Recursos & Herramientas',
                    file: 'sections/recursos-herramientas.html',
                    icon: '🛠️'
                }
            }
        };
        
        this.init();
    }

    /**
     * Initialize content loader
     */
    async init() {
        this.createLoadingIndicator();
        this.setupNavigationHandlers();
    }

    /**
     * Get section configuration
     */
    getSectionConfig() {
        return this.config.sections;
    }

    /**
     * Create loading indicator
     */
    createLoadingIndicator() {
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'content-loading-indicator';
        this.loadingIndicator.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Cargando contenido...</p>
        `;
        this.loadingIndicator.style.cssText = `
            display: none;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(20px);
            padding: 2rem;
            border-radius: 20px;
            text-align: center;
            z-index: 9999;
            color: var(--light);
        `;
        
        document.body.appendChild(this.loadingIndicator);
    }

    /**
     * Setup navigation click handlers
     */
    setupNavigationHandlers() {
        document.addEventListener('click', async (e) => {
            const link = e.target.closest('.nav-link, a[href^="#"]');
            if (link) {
                e.preventDefault();
                const href = link.getAttribute('href');
                const sectionId = href.replace('#', '');
                
                if (sectionId && sectionId !== this.currentSection) {
                    await this.loadSection(sectionId);
                    this.updateActiveNavigation(link);
                    this.updateHistory(sectionId);
                }
            }
        });
    }

    /**
     * Load section content
     */
    async loadSection(sectionId) {
        const config = this.getSectionConfig()[sectionId];
        if (!config) {
            console.warn(`Section ${sectionId} not found in configuration`);
            return;
        }

        this.showLoading();

        try {
            let content = this.cache.get(sectionId);
            
            if (!content) {
                content = await this.fetchSectionContent(config.file);
                this.cache.set(sectionId, content);
            }

            await this.renderSection(sectionId, content, config);
            this.currentSection = sectionId;
            this.hideLoading();
            
            // Scroll to section
            this.scrollToSection(sectionId);
            
            // Initialize section-specific functionality
            this.initializeSectionFeatures(sectionId);
            
        } catch (error) {
            console.error(`Error loading section ${sectionId}:`, error);
            this.showError(error);
            this.hideLoading();
        }
    }

    /**
     * Fetch section content from server
     */
    async fetchSectionContent(file) {
        try {
            const response = await fetch(file);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const content = await response.text();
            return content;
            
        } catch (error) {
            console.error(`Failed to fetch ${file}:`, error);
            throw new Error(`No se pudo cargar la sección: ${error.message}`);
        }
    }

    /**
     * 🔧 SIMPLIFICADO: Render section content sin procesar scripts
     */
    async renderSection(sectionId, content, config) {
        const mainContainer = document.getElementById('main-content');
        if (!mainContainer) {
            throw new Error('Main content container not found');
        }

        // Clear current content
        mainContainer.innerHTML = '';
        
        // 🔧 CLAVE: Remover todos los scripts ANTES de insertar el HTML
        const cleanContent = this.removeScripts(content);
        
        // Create section wrapper
        const sectionWrapper = document.createElement('section');
        sectionWrapper.id = sectionId;
        sectionWrapper.className = 'content-section';
        sectionWrapper.innerHTML = cleanContent;
        
        // Add section to DOM
        mainContainer.appendChild(sectionWrapper);
        
        // Trigger reveal animations
        this.triggerRevealAnimations(sectionWrapper);
    }

    /**
     * 🔧 NUEVO: Remover scripts del HTML para evitar re-ejecución
     */
    removeScripts(htmlContent) {
        // Crear un parser temporal para limpiar scripts
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        
        // Remover todos los scripts
        const scripts = tempDiv.querySelectorAll('script');
        scripts.forEach(script => script.remove());
        
        return tempDiv.innerHTML;
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'flex';
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Update active navigation state
     */
    updateActiveNavigation(activeLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current link
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    /**
     * Update browser history
     */
    updateHistory(sectionId) {
        const newUrl = `${window.location.pathname}#${sectionId}`;
        history.pushState({ section: sectionId }, '', newUrl);
    }

    /**
     * Scroll to section
     */
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start' 
            });
        } else {
            // Scroll to top if section not found
            window.scrollTo({ 
                top: 0, 
                behavior: 'smooth' 
            });
        }
    }

    /**
     * Initialize section-specific features
     */
    initializeSectionFeatures(sectionId) {
        // Initialize tabs if present
        this.initializeTabs();
        
        // Initialize charts if present  
        this.initializeCharts();

        // Initialize any interactive elements
        this.initializeInteractiveElements();

        // Trigger section loaded event
        document.dispatchEvent(new CustomEvent('sectionLoaded', {
            detail: { sectionId, timestamp: Date.now() }
        }));
    }

    /**
     * 🔧 NUEVO: Inicializar tabs sin scripts
     */
    initializeTabs() {
        const tabContainers = document.querySelectorAll('.example-tabs');
        
        tabContainers.forEach(container => {
            const buttons = container.querySelectorAll('.tab-button');
            const contents = document.querySelectorAll('.tab-content');
            
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    const targetTab = button.getAttribute('data-tab');
                    
                    // Remove active class from all buttons and contents
                    buttons.forEach(btn => btn.classList.remove('active'));
                    contents.forEach(content => content.classList.remove('active'));
                    
                    // Add active class to clicked button and target content
                    button.classList.add('active');
                    const targetContent = document.getElementById(targetTab);
                    if (targetContent) {
                        targetContent.classList.add('active');
                    }
                });
            });
        });
    }

    /**
     * 🔧 NUEVO: Inicializar charts básicos sin scripts complejos
     */
    initializeCharts() {
        const chartContainers = document.querySelectorAll('.chart-container, .metrics-dashboard');
        
        chartContainers.forEach(container => {
            // Agregar animación CSS básica a las métricas
            const metrics = container.querySelectorAll('.metric-value');
            metrics.forEach((metric, index) => {
                setTimeout(() => {
                    metric.style.animation = 'countUp 1s ease forwards';
                }, index * 200);
            });
        });
    }

    /**
     * 🔧 NUEVO: Inicializar elementos interactivos básicos
     */
    initializeInteractiveElements() {
        // Manejar calculadoras WSJF si existen
        const calculators = document.querySelectorAll('.wsjf-calculator');
        calculators.forEach(calc => this.setupWSJFCalculator(calc));
        
        // Manejar sliders si existen
        const sliders = document.querySelectorAll('input[type="range"]');
        sliders.forEach(slider => this.setupSlider(slider));
    }

    /**
     * 🔧 NUEVO: Setup WSJF Calculator
     */
    setupWSJFCalculator(calculator) {
        const inputs = calculator.querySelectorAll('input[type="number"], input[type="range"]');
        const resultElement = calculator.querySelector('.wsjf-result');
        
        if (!resultElement) return;
        
        const calculateWSJF = () => {
            const values = Array.from(inputs).map(input => parseFloat(input.value) || 0);
            if (values.length >= 4) {
                const [businessValue, urgency, riskReduction, effort] = values;
                const wsjf = effort > 0 ? ((businessValue + urgency + riskReduction) / effort).toFixed(2) : 0;
                resultElement.textContent = wsjf;
            }
        };
        
        inputs.forEach(input => {
            input.addEventListener('input', calculateWSJF);
        });
        
        // Calcular inicial
        calculateWSJF();
    }

    /**
     * 🔧 NUEVO: Setup slider displays
     */
    setupSlider(slider) {
        const updateDisplay = () => {
            const value = slider.value;
            const display = slider.nextElementSibling;
            if (display && display.classList.contains('slider-display')) {
                display.textContent = value;
            }
        };
        
        slider.addEventListener('input', updateDisplay);
        updateDisplay(); // Initial update
    }

    /**
     * Trigger reveal animations
     */
    triggerRevealAnimations(container) {
        const reveals = container.querySelectorAll('.reveal');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        reveals.forEach(reveal => {
            observer.observe(reveal);
        });
    }

    /**
     * Show error message
     */
    showError(error) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'content-error';
        errorDiv.innerHTML = `
            <div style="text-align: center; padding: 4rem 2rem; color: var(--gray);">
                <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                <h3>Error al cargar contenido</h3>
                <p>No se pudo cargar la sección solicitada.</p>
                <p style="font-size: 0.9rem; color: #EF4444; margin-top: 1rem;">${error.message}</p>
                <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--gradient-primary); color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Recargar página
                </button>
            </div>
        `;
        
        const mainContainer = document.getElementById('main-content');
        if (mainContainer) {
            mainContainer.innerHTML = '';
            mainContainer.appendChild(errorDiv);
        }
    }

    /**
     * Clear cache (useful for development)
     */
    clearCache() {
        this.cache.clear();
    }

    /**
     * Get analytics data
     */
    getAnalytics() {
        return {
            currentSection: this.currentSection,
            cacheSize: this.cache.size,
            loadingProgress: this.getLoadingProgress()
        };
    }

    /**
     * Get section loading progress
     */
    getLoadingProgress() {
        const totalSections = Object.keys(this.getSectionConfig()).length;
        const cachedSections = this.cache.size;
        return {
            total: totalSections,
            loaded: cachedSections,
            percentage: Math.round((cachedSections / totalSections) * 100)
        };
    }
}

// Simplified error handler
window.showError = function(message, details = null) {
    console.error('Error:', message, details);
    
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #EF4444;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
    `;
    errorDiv.innerHTML = `
        <strong>Error:</strong> ${message}
        ${details ? `<br><small style="opacity: 0.8">${details}</small>` : ''}
        <br><small style="opacity: 0.6">Click para cerrar</small>
    `;
    
    document.body.appendChild(errorDiv);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
    
    // Click to dismiss
    errorDiv.addEventListener('click', () => {
        errorDiv.remove();
    });
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.contentLoader = new ContentLoader();
        console.log('✅ ContentLoader initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize ContentLoader:', error);
        window.showError('Error al inicializar el sistema de navegación', error.message);
    }
});