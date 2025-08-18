/**
 * Content Loader - Sistema de carga dinámica de contenido
 * Maneja la carga de secciones, cache y navegación
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
        console.log('📄 Content Loader initialized');
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
     * Render section content
     */
    async renderSection(sectionId, content, config) {
        const mainContainer = document.getElementById('main-content');
        if (!mainContainer) {
            throw new Error('Main content container not found');
        }

        // Clear current content
        mainContainer.innerHTML = '';
        
        // Create section wrapper
        const sectionWrapper = document.createElement('section');
        sectionWrapper.id = sectionId;
        sectionWrapper.className = 'content-section';
        sectionWrapper.innerHTML = content;
        
        // Add section to DOM
        mainContainer.appendChild(sectionWrapper);
        
        // Process any scripts in the content
        this.processScripts(sectionWrapper);
        
        // Trigger reveal animations
        this.triggerRevealAnimations(sectionWrapper);
        
        console.log(`✅ Section ${sectionId} rendered successfully`);
    }

    /**
     * Process scripts in loaded content
     */
    processScripts(container) {
        const scripts = container.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
            }
            
            // Replace old script with new one to execute it
            script.parentNode.replaceChild(newScript, script);
        });
    }

    /**
     * Trigger reveal animations for elements
     */
    triggerRevealAnimations(container) {
        const revealElements = container.querySelectorAll('.reveal');
        
        revealElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('active');
            }, index * 100);
        });
    }

    /**
     * Initialize section-specific features
     */
    initializeSectionFeatures(sectionId) {
        switch (sectionId) {
            case 'estimacion-agil':
                this.initializeEstimationFeatures();
                break;
            case 'medicion-metricas':
                this.initializeMetricsFeatures();
                break;
            case 'aplicacion-practica':
                this.initializePracticalFeatures();
                break;
        }
    }

    /**
     * Initialize estimation features
     */
    initializeEstimationFeatures() {
        // Initialize planning poker if present
        const pokerContainer = document.querySelector('.planning-poker');
        if (pokerContainer && window.PlanningPoker) {
            new window.PlanningPoker(pokerContainer);
        }

        // Initialize calculators
        const calculators = document.querySelectorAll('.calculator');
        calculators.forEach(calc => {
            if (window.Calculator) {
                new window.Calculator(calc);
            }
        });
    }

    /**
     * Initialize metrics features
     */
    initializeMetricsFeatures() {
        // Initialize charts
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            if (window.ChartManager) {
                window.ChartManager.initializeChart(container);
            }
        });

        // Initialize metrics dashboard
        if (window.MetricsDashboard) {
            window.MetricsDashboard.init();
        }
    }

    /**
     * Initialize practical features
     */
    initializePracticalFeatures() {
        // Initialize tab managers
        const tabContainers = document.querySelectorAll('.example-tabs');
        tabContainers.forEach(container => {
            if (window.TabManager) {
                new window.TabManager(container);
            }
        });

        // Initialize code highlighters
        if (window.hljs) {
            window.hljs.highlightAll();
        }
    }

    /**
     * Update active navigation
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
     * Update browser history
     */
    updateHistory(sectionId) {
        const newUrl = `${window.location.pathname}#${sectionId}`;
        window.history.pushState({ section: sectionId }, '', newUrl);
    }

    /**
     * Scroll to section
     */
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
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
     * Show error message
     */
    showError(error) {
        this.hideLoading();
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'content-error';
        errorDiv.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: var(--gray);">
                <h3>⚠️ Error al cargar contenido</h3>
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

    /**
     * Clear cache (useful for development)
     */
    clearCache() {
        this.cache.clear();
        console.log('🗑️ Content cache cleared');
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
}

// Global error handler function
window.showError = function(message) {
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
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
};

// Initialize content loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contentLoader = new ContentLoader();
    console.log('📄 Content loader initialized');
});