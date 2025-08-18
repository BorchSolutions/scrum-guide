/**
 * Main.js - Controlador principal de SCRUM Pro Guide
 * Coordina todos los componentes y gestiona el estado global de la aplicación
 */

class AppController {
    constructor() {
        this.isInitialized = false;
        this.components = new Map();
        this.config = {
            version: '2.0.0',
            environment: 'production',
            features: {
                lazyLoading: true,
                errorTracking: true,
                analytics: false
            }
        };
        
        this.state = {
            currentSection: null,
            isLoading: false,
            isMobile: false,
            components: {
                navigation: null,
                contentLoader: null,
                sectionManager: null
            }
        };
        
        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            
            // 1. Setup global error handling
            this.setupErrorHandling();
            
            // 2. Detect device and environment
            this.detectEnvironment();
            
            // 3. Initialize core utilities
            this.initializeUtilities();
            
            // 4. Load and setup components
            await this.loadComponents();
            
            // 5. Initialize main systems
            await this.initializeSystems();
            
            // 6. Setup event listeners
            this.setupEventListeners();
            
            // 7. Load initial content
            await this.loadInitialContent();
            
            // 8. Hide loader and show app
            this.finalizeInitialization();
            
            this.isInitialized = true;
            
        } catch (error) {
            console.error('❌ Error initializing app:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Configura manejo global de errores
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            this.handleError('JavaScript Error', event.error, {
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled Promise Rejection', event.reason);
        });

        // Custom error handler
        window.addEventListener('apperror', (event) => {
            this.handleError('Application Error', event.detail.error, event.detail.context);
        });
    }

    /**
     * Detecta entorno y capacidades del dispositivo
     */
    detectEnvironment() {
        // Device detection
        this.state.isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        // Feature detection
        const features = {
            intersectionObserver: 'IntersectionObserver' in window,
            fetch: 'fetch' in window,
            localStorage: this.testLocalStorage(),
            webAnimations: 'animate' in document.createElement('div')
        };
        
        // Log capabilities

        
        // Apply device-specific classes
        document.documentElement.classList.toggle('mobile', this.state.isMobile);
        document.documentElement.classList.toggle('desktop', !this.state.isMobile);
    }

    /**
     * Test localStorage availability
     */
    testLocalStorage() {
        try {
            const test = '__localStorage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Inicializa utilidades core
     */
    initializeUtilities() {
        // Ensure Utils is available
        if (!window.Utils) {
            console.warn('Utils library not loaded, some features may not work');
            return;
        }
        
        // Set global utilities
        this.utils = window.Utils;
        
        // Initialize global helpers
        this.debounce = this.utils.Event.debounce;
        this.throttle = this.utils.Event.throttle;
    }

    /**
     * Carga componentes de la aplicación
     */
    async loadComponents() {
        const loadingMessages = [
            'Cargando componentes...',
            'Configurando navegación...',
            'Preparando contenido...',
            'Inicializando sistemas...'
        ];
        
        try {
            // Update loading status
            this.updateLoadingStatus(loadingMessages[0]);
            
            // Load navigation component
            await this.loadComponent('navigation', 'components/navigation.html', 'navigation-container');
            
            this.updateLoadingStatus(loadingMessages[1]);
            
            // Load footer component
            await this.loadComponent('footer', 'components/footer.html', 'footer-container');
            
            this.updateLoadingStatus(loadingMessages[2]);
            
            
        } catch (error) {
            console.error('Error loading components:', error);
            throw new Error('Failed to load application components');
        }
    }

    /**
     * Carga un componente individual
     */
    async loadComponent(name, url, containerId) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const html = await response.text();
            const container = document.getElementById(containerId);
            
            if (container) {
                container.innerHTML = html;
                this.components.set(name, { url, containerId, loaded: true });
            } else {
                console.warn(`Container '${containerId}' not found for component '${name}'`);
            }
            
        } catch (error) {
            console.error(`Failed to load component '${name}':`, error);
            this.components.set(name, { url, containerId, loaded: false, error });
        }
    }

    /**
     * Inicializa sistemas principales
     */
    async initializeSystems() {
        try {
            // Initialize ContentLoader
            if (window.ContentLoader) {
                this.state.components.contentLoader = new window.ContentLoader();
            }
            
            // Initialize Navigation
            if (window.Navigation) {
                this.state.components.navigation = new window.Navigation();
            }
            
            // Initialize SectionManager
            if (window.SectionManager) {
                this.state.components.sectionManager = new window.SectionManager();
            }
            
            // Initialize TabManager for any existing tab containers
            this.initializeTabManagers();
            
        } catch (error) {
            throw error;
        }
    }

    /**
     * Inicializa gestores de tabs
     */
    initializeTabManagers() {
        if (!window.TabManager) return;
        
        const tabContainers = document.querySelectorAll('.tabs-component, .example-tabs');
        let initialized = 0;
        
        tabContainers.forEach(container => {
            if (!container.dataset.tabManager) {
                try {
                    const tabManager = new window.TabManager(container);
                    container.dataset.tabManager = 'initialized';
                    container.tabManager = tabManager;
                    initialized++;
                } catch (error) {
                    console.warn('Failed to initialize TabManager for container:', error);
                }
            }
        });
        
        if (initialized > 0) {
        }
    }

    /**
     * Configura event listeners globales
     */
    setupEventListeners() {
        // Resize handler
        window.addEventListener('resize', this.debounce(() => {
            this.handleResize();
        }, 250));
        
        // Scroll handler
        window.addEventListener('scroll', this.throttle(() => {
            this.handleScroll();
        }, 16)); // ~60fps
        
        // Hash change handler
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });
        
        // Visibility change handler
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Custom app events
        document.addEventListener('sectionActive', (event) => {
            this.handleSectionChange(event.detail.sectionId);
        });
        
    }

    /**
     * Carga contenido inicial
     */
    async loadInitialContent() {
        try {
            this.updateLoadingStatus('Cargando contenido inicial...');
            
            // Determine initial section from URL hash or default
            const hash = window.location.hash.replace('#', '');
            const initialSection = hash || 'scrum-foundations';
            
            // Load initial section
            if (this.state.components.contentLoader) {
                await this.state.components.contentLoader.loadSection(initialSection);
                this.state.currentSection = initialSection;
            }
            
            
        } catch (error) {
            console.error('Error loading initial content:', error);
            // Don't throw - app can still function
        }
    }

    /**
     * Finaliza la inicialización
     */
    finalizeInitialization() {
        // Hide loader with animation
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(() => {
                loader.style.opacity = '0';
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 800);
        }
        
        // Add loaded class to body
        document.body.classList.add('app-loaded');
        
        // Trigger app ready event
        this.utils?.Event?.trigger('appReady', {
            version: this.config.version,
            timestamp: Date.now()
        });
        
    }

    /**
     * Maneja errores de inicialización
     */
    handleInitializationError(error) {
        console.error('Initialization failed:', error);
        
        const loader = document.getElementById('loader');
        const errorContainer = document.getElementById('loader-error');
        const errorMessage = document.getElementById('error-message');
        
        if (loader && errorContainer && errorMessage) {
            errorMessage.textContent = error.message || 'Error desconocido al inicializar la aplicación';
            errorContainer.style.display = 'block';
            
            // Setup retry button
            const retryButton = document.getElementById('retry-button');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    location.reload();
                });
            }
        }
    }

    /**
     * Actualiza el estado de carga
     */
    updateLoadingStatus(message) {
        const statusElement = document.getElementById('loading-status');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }

    /**
     * Maneja cambios de tamaño de ventana
     */
    handleResize() {
        const wasMobile = this.state.isMobile;
        this.state.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.state.isMobile) {
            document.documentElement.classList.toggle('mobile', this.state.isMobile);
            document.documentElement.classList.toggle('desktop', !this.state.isMobile);
            
            // Reinitialize components that depend on viewport
            this.reinitializeViewportDependentComponents();
        }
    }

    /**
     * Maneja eventos de scroll
     */
    handleScroll() {
        // Let individual components handle their own scroll logic
        // This is just for global scroll state
        const scrollPercent = Math.min(100, 
            (window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        
        document.documentElement.style.setProperty('--scroll-percent', scrollPercent + '%');
    }

    /**
     * Maneja cambios de hash en URL
     */
    async handleHashChange() {
        const hash = window.location.hash.replace('#', '');
        if (hash && hash !== this.state.currentSection) {
            if (this.state.components.contentLoader) {
                await this.state.components.contentLoader.loadSection(hash);
                this.state.currentSection = hash;
            }
        }
    }

    /**
     * Maneja cambios de visibilidad de la página
     */
    handleVisibilityChange() {
        if (document.hidden) {
        } else {
        }
    }

    /**
     * Maneja cambios de sección activa
     */
    handleSectionChange(sectionId) {
        if (sectionId !== this.state.currentSection) {
            this.state.currentSection = sectionId;
        }
    }

    /**
     * Reincializa componentes que dependen del viewport
     */
    reinitializeViewportDependentComponents() {
        // Reinitialize SectionManager
        if (this.state.components.sectionManager) {
            this.state.components.sectionManager.reinitialize();
        }
        
    }

    /**
     * Maneja errores globales
     */
    handleError(type, error, context = {}) {
        const errorInfo = {
            type,
            message: error?.message || String(error),
            stack: error?.stack,
            context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        console.error(`${type}:`, errorInfo);
        
        // Show user-friendly error message
        if (window.showError) {
            window.showError(`Error en la aplicación: ${errorInfo.message}`);
        }
        
        // Track error if analytics enabled
        if (this.config.features.errorTracking) {
            this.trackError(errorInfo);
        }
    }

    /**
     * Rastrea errores para analytics
     */
    trackError(errorInfo) {
        // Placeholder for error tracking
    }

    /**
     * Obtiene estado actual de la aplicación
     */
    getAppState() {
        return {
            ...this.state,
            config: this.config,
            isInitialized: this.isInitialized,
            components: Array.from(this.components.keys())
        };
    }

    /**
     * Destruye la aplicación (cleanup)
     */
    destroy() {
        // Destroy component instances
        Object.values(this.state.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        // Clear state
        this.components.clear();
        this.state = {};
        this.isInitialized = false;
        
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.appController = new AppController();
});

// Export for global access
window.AppController = AppController;