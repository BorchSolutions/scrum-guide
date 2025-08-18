/**
 * SCRUM Guide - Content Loader
 * Dynamic content loading system for modular HTML sections
 */

class ContentLoader {
    constructor() {
        this.sections = new Map();
        this.currentSection = null;
        this.loadingIndicator = null;
        this.cache = new Map();
        this.init();
    }

    init() {
        this.createLoadingIndicator();
        this.setupNavigationHandlers();
        this.loadInitialContent();
        this.setupHistoryManagement();
    }

    /**
     * Section configuration with metadata
     */
    getSectionConfig() {
        return {
            'intro': {
                file: 'sections/scrum-foundations.html',
                title: 'SCRUM Foundations',
                description: 'Fundamentos del framework ágil más utilizado',
                preload: true
            },
            'estimacion': {
                file: 'sections/estimacion-agil.html',
                title: 'Estimación Ágil',
                description: 'Dominando el arte de la estimación con Fibonacci',
                preload: true
            },
            'metricas': {
                file: 'sections/medicion-metricas.html',
                title: 'Medición & Métricas',
                description: 'Cómo medimos el éxito y progreso del equipo',
                preload: false
            },
            'aplicacion': {
                file: 'sections/aplicacion-practica.html',
                title: 'Aplicación Práctica',
                description: 'De la teoría a la implementación real',
                preload: false
            },
            'herramientas': {
                file: 'sections/recursos-herramientas.html',
                title: 'Recursos & Herramientas',
                description: 'Herramientas para gestionar proyectos ágiles',
                preload: false
            }
        };
    }

    /**
     * Create loading indicator
     */
    createLoadingIndicator() {
        this.loadingIndicator = document.createElement('div');
        this.loadingIndicator.className = 'content-loading';
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
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                const href = link.getAttribute('href');
                const sectionId = href.replace('#', '');
                
                if (sectionId && sectionId !== this.currentSection) {
                    await this.loadSection(sectionId);
                    this.updateActiveNavigation(link);
                    this.updateHistory(sectionId);
                }
            });
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
            
            // Update page metadata
            this.updatePageMetadata(config);
            
            console.log(`📄 Section '${sectionId}' loaded successfully`);
            
        } catch (error) {
            console.error(`Error loading section ${sectionId}:`, error);
            this.showError(error);
        }
    }

    /**
     * Fetch section content from file
     */
    async fetchSectionContent(filePath) {
        const response = await fetch(filePath);
        
        if (!response.ok) {
            throw new Error(`Failed to load ${filePath}: ${response.statusText}`);
        }
        
        return await response.text();
    }

    /**
     * Render section content
     */
    async renderSection(sectionId, content, config) {
        const mainContainer = document.getElementById('main-content');
        if (!mainContainer) {
            throw new Error('Main content container not found');
        }

        // Add fade out effect
        mainContainer.style.opacity = '0';
        
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Clear existing content
        mainContainer.innerHTML = '';
        
        // Create section wrapper
        const sectionWrapper = document.createElement('div');
        sectionWrapper.className = 'section-wrapper';
        sectionWrapper.setAttribute('data-section', sectionId);
        sectionWrapper.innerHTML = content;
        
        mainContainer.appendChild(sectionWrapper);
        
        // Add fade in effect
        mainContainer.style.opacity = '1';
        
        // Re-initialize reveal animations for new content
        this.reinitializeAnimations();
    }

    /**
     * Reinitialize animations for new content
     */
    reinitializeAnimations() {
        // Trigger reveal animations
        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => {
            el.classList.remove('active');
        });

        // Re-observe new elements
        if (window.scrumGuide && window.scrumGuide.setupRevealAnimations) {
            window.scrumGuide.setupRevealAnimations();
        }

        // Re-initialize tabs if present
        if (window.tabManager && window.tabManager.setupTabListeners) {
            window.tabManager.setupTabListeners();
        }

        // Re-initialize charts if present
        if (window.chartManager && window.chartManager.setupCharts) {
            setTimeout(() => {
                window.chartManager.setupCharts();
            }, 300);
        }
    }

    /**
     * Initialize section-specific features
     */
    initializeSectionFeatures(sectionId) {
        switch(sectionId) {
            case 'estimacion':
                this.initializePlanningPokerFeatures();
                break;
            case 'metricas':
                this.initializeMetricsFeatures();
                break;
            case 'aplicacion':
                this.initializeProjectFeatures();
                break;
        }
    }

    /**
     * Initialize Planning Poker features
     */
    initializePlanningPokerFeatures() {
        // Re-setup poker cards if they exist
        const pokerCards = document.querySelectorAll('.poker-card-interactive');
        pokerCards.forEach(card => {
            if (!card.hasEventListener) {
                card.addEventListener('click', this.handlePokerCardClick.bind(this));
                card.hasEventListener = true;
            }
        });
    }

    /**
     * Handle poker card clicks
     */
    handlePokerCardClick(event) {
        const card = event.target;
        const value = card.textContent.trim();
        
        // Remove selection from other cards
        document.querySelectorAll('.poker-card-interactive').forEach(c => {
            c.classList.remove('selected');
            c.style.transform = 'scale(1)';
        });
        
        // Add selection to clicked card
        card.classList.add('selected');
        card.style.transform = 'scale(1.1)';
        
        // Show feedback
        this.showPokerSelection(value);
    }

    /**
     * Show poker selection feedback
     */
    showPokerSelection(value) {
        // Create or update selection indicator
        let indicator = document.getElementById('poker-selection');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'poker-selection';
            indicator.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: var(--gradient-primary);
                color: white;
                padding: 1rem 2rem;
                border-radius: 50px;
                font-weight: bold;
                z-index: 1000;
                animation: slideInRight 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = `Tu estimación: ${value} SP`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => indicator.remove(), 300);
            }
        }, 3000);
    }

    /**
     * Initialize metrics features
     */
    initializeMetricsFeatures() {
        // Trigger metric animations
        setTimeout(() => {
            const metricValues = document.querySelectorAll('.metric-value');
            metricValues.forEach(metric => {
                if (!metric.classList.contains('animated')) {
                    metric.classList.add('animated');
                    this.animateMetricValue(metric);
                }
            });
        }, 500);
    }

    /**
     * Animate metric value
     */
    animateMetricValue(element) {
        const finalValue = element.textContent;
        const numericValue = parseInt(finalValue);
        
        if (isNaN(numericValue)) return;
        
        let current = 0;
        const increment = numericValue / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= numericValue) {
                current = numericValue;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (finalValue.includes('%') ? '%' : '');
        }, 30);
    }

    /**
     * Initialize project features
     */
    initializeProjectFeatures() {
        // Setup timeline animations
        const timelineItems = document.querySelectorAll('.timeline-item');
        timelineItems.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    /**
     * Update active navigation
     */
    updateActiveNavigation(activeLink) {
        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current link
        activeLink.classList.add('active');
    }

    /**
     * Setup browser history management
     */
    setupHistoryManagement() {
        window.addEventListener('popstate', (event) => {
            const sectionId = this.getSectionFromURL();
            if (sectionId && sectionId !== this.currentSection) {
                this.loadSection(sectionId);
            }
        });
    }

    /**
     * Update browser history
     */
    updateHistory(sectionId) {
        const config = this.getSectionConfig()[sectionId];
        const newURL = `${window.location.pathname}#${sectionId}`;
        
        history.pushState(
            { section: sectionId }, 
            config.title, 
            newURL
        );
    }

    /**
     * Get section ID from current URL
     */
    getSectionFromURL() {
        const hash = window.location.hash.replace('#', '');
        return hash || 'intro'; // Default to intro
    }

    /**
     * Update page metadata
     */
    updatePageMetadata(config) {
        document.title = `${config.title} - SCRUM Pro Guide`;
        
        // Update meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.content = config.description;
        }
    }

    /**
     * Scroll to section
     */
    scrollToSection(sectionId) {
        const element = document.getElementById(sectionId) || document.querySelector(`[data-section="${sectionId}"]`);
        if (element) {
            element.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }

    /**
     * Load initial content based on URL
     */
    async loadInitialContent() {
        const sectionId = this.getSectionFromURL();
        await this.loadSection(sectionId);
        
        // Update navigation
        const activeLink = document.querySelector(`[href="#${sectionId}"]`);
        if (activeLink) {
            this.updateActiveNavigation(activeLink);
        }

        // Preload critical sections
        this.preloadSections();
    }

    /**
     * Preload sections for faster navigation
     */
    async preloadSections() {
        const config = this.getSectionConfig();
        const preloadPromises = [];

        Object.entries(config).forEach(([sectionId, sectionConfig]) => {
            if (sectionConfig.preload && !this.cache.has(sectionId)) {
                preloadPromises.push(
                    this.fetchSectionContent(sectionConfig.file)
                        .then(content => this.cache.set(sectionId, content))
                        .catch(error => console.warn(`Failed to preload ${sectionId}:`, error))
                );
            }
        });

        await Promise.all(preloadPromises);
        console.log('🚀 Critical sections preloaded');
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

// Initialize content loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.contentLoader = new ContentLoader();
    console.log('📄 Content loader initialized');
});