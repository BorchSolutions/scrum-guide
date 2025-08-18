/**
 * TabManager - Gestor de tabs interactivos para SCRUM Guide
 * Funcionalidades: navegación por tabs, carga dinámica, estados de error
 */

class TabManager {
    constructor(container, config = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
            
        if (!this.container) {
            throw new Error('TabManager: Container element not found');
        }

        this.config = {
            activeIndex: 0,
            keyboard: true,
            autoHeight: true,
            fadeTransition: true,
            lazy: true,
            cache: true,
            contentSelector: '.tab-content',
            buttonSelector: '.tab-button',
            loadingText: 'Cargando...',
            errorText: 'Error al cargar contenido',
            ...config
        };

        this.tabs = [];
        this.contents = [];
        this.activeIndex = this.config.activeIndex;
        this.loadedTabs = new Set();
        this.cache = new Map();
        this.eventListeners = [];

        this.init();
    }

    /**
     * Inicializa el sistema de tabs
     */
    init() {
        this.setupTabs();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.activateTab(this.activeIndex);
        
        console.log(`📄 TabManager initialized with ${this.tabs.length} tabs`);
    }

    /**
     * Configura los tabs y contenidos
     */
    setupTabs() {
        this.tabs = Array.from(this.container.querySelectorAll(this.config.buttonSelector));
        this.contents = Array.from(this.container.querySelectorAll(this.config.contentSelector));

        if (this.tabs.length === 0) {
            console.warn('TabManager: No tab buttons found');
            return;
        }

        // Setup ARIA attributes
        this.tabs.forEach((tab, index) => {
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', 'false');
            tab.setAttribute('aria-controls', `tab-panel-${index}`);
            tab.setAttribute('tabindex', '-1');
            tab.dataset.tabIndex = index;
        });

        this.contents.forEach((content, index) => {
            content.setAttribute('role', 'tabpanel');
            content.setAttribute('aria-labelledby', `tab-${index}`);
            content.id = `tab-panel-${index}`;
            content.style.display = 'none';
        });
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        this.tabs.forEach((tab, index) => {
            this.addEventListener(tab, 'click', (e) => {
                e.preventDefault();
                this.activateTab(index);
            });

            this.addEventListener(tab, 'keydown', (e) => {
                this.handleKeydown(e, index);
            });
        });

        // Handle window resize for responsive behavior
        this.addEventListener(window, 'resize', this.debounce(() => {
            this.handleResize();
        }, 250));
    }

    /**
     * Utility para agregar event listeners con cleanup
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    /**
     * Activa un tab específico
     */
    async activateTab(index) {
        if (index < 0 || index >= this.tabs.length) {
            console.warn(`TabManager: Invalid tab index ${index}`);
            return;
        }

        const previousIndex = this.activeIndex;
        this.activeIndex = index;

        try {
            // Load content if needed
            if (this.config.lazy && !this.loadedTabs.has(index)) {
                await this.loadTabContent(index);
            }

            // Update UI
            this.updateTabUI(index);
            this.showTabContent(index, previousIndex);

            // Trigger events
            this.triggerEvent('tabChange', {
                index,
                previousIndex,
                tab: this.tabs[index],
                content: this.contents[index]
            });

            console.log(`📄 Tab ${index} activated`);

        } catch (error) {
            console.error(`TabManager: Error activating tab ${index}:`, error);
            this.showTabError(index, error);
        }
    }

    /**
     * Carga contenido de un tab
     */
    async loadTabContent(index) {
        const tab = this.tabs[index];
        const content = this.contents[index];
        
        if (!tab || !content) {
            throw new Error(`Tab or content at index ${index} not found`);
        }

        try {
            // Show loading state
            this.showLoadingState(content);

            let htmlContent = '';

            // Check if content has data-src attribute for external loading
            const dataSrc = content.dataset.src;
            if (dataSrc) {
                // Load from external file
                if (this.cache.has(dataSrc)) {
                    htmlContent = this.cache.get(dataSrc);
                } else {
                    const response = await fetch(dataSrc);
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    htmlContent = await response.text();
                    
                    if (this.config.cache) {
                        this.cache.set(dataSrc, htmlContent);
                    }
                }
                
            } else if (this.config.contentLoader) {
                // Loader personalizado
                htmlContent = await this.config.contentLoader(tab, index);
                
            } else {
                // Content is already in DOM
                this.loadedTabs.add(index);
                return;
            }

            // Inyectar contenido
            content.innerHTML = htmlContent;

            // Procesar scripts si existen
            this.processTabScripts(content);

            // Marcar como cargado
            this.loadedTabs.add(index);

            // Callback
            if (this.config.onTabLoad) {
                this.config.onTabLoad(index, tab, content);
            }

            console.log(`📄 Tab ${index} content loaded`);

        } catch (error) {
            console.error(`TabManager: Error loading content for tab ${index}:`, error);
            content.innerHTML = this.createErrorContent(error);
            throw error;
        }
    }

    /**
     * Procesa scripts en el contenido del tab
     */
    processTabScripts(content) {
        const scripts = content.querySelectorAll('script');
        scripts.forEach(script => {
            const newScript = document.createElement('script');
            if (script.src) {
                newScript.src = script.src;
            } else {
                newScript.textContent = script.textContent;
            }
            script.parentNode.replaceChild(newScript, script);
        });
    }

    /**
     * Actualiza la UI del tab activo
     */
    updateTabUI(index) {
        // Actualizar botones
        this.tabs.forEach((button, i) => {
            const isActive = i === index;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive.toString());
            button.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // Focus en el tab activo para accesibilidad
        this.tabs[index].focus();
    }

    /**
     * Muestra el contenido del tab
     */
    showTabContent(index, previousIndex) {
        // Hide previous content
        if (previousIndex !== undefined && this.contents[previousIndex]) {
            if (this.config.fadeTransition) {
                this.fadeOut(this.contents[previousIndex]);
            } else {
                this.contents[previousIndex].style.display = 'none';
            }
        }

        // Show new content
        const currentContent = this.contents[index];
        if (currentContent) {
            if (this.config.fadeTransition) {
                this.fadeIn(currentContent);
            } else {
                currentContent.style.display = 'block';
            }

            // Auto height adjustment
            if (this.config.autoHeight) {
                this.adjustHeight(currentContent);
            }
        }
    }

    /**
     * Fade in animation
     */
    fadeIn(element) {
        element.style.display = 'block';
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.3s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    }

    /**
     * Fade out animation
     */
    fadeOut(element) {
        element.style.transition = 'opacity 0.3s ease';
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, 300);
    }

    /**
     * Ajusta altura automáticamente
     */
    adjustHeight(content) {
        const container = this.container.querySelector('.tabs-content');
        if (container && content) {
            container.style.height = 'auto';
            const height = content.scrollHeight;
            container.style.height = `${height}px`;
        }
    }

    /**
     * Muestra estado de loading
     */
    showLoadingState(content) {
        content.innerHTML = `
            <div class="tab-loading" style="text-align: center; padding: 2rem; color: var(--gray);">
                <div class="loading-spinner" style="width: 40px; height: 40px; border: 3px solid rgba(99, 102, 241, 0.3); border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                <p>${this.config.loadingText}</p>
            </div>
        `;
    }

    /**
     * Muestra error en tab
     */
    showTabError(index, error) {
        const content = this.contents[index];
        if (content) {
            content.innerHTML = this.createErrorContent(error);
            
            // Add retry functionality
            const retryButton = content.querySelector('.retry-button');
            if (retryButton) {
                this.addEventListener(retryButton, 'click', () => {
                    this.loadedTabs.delete(index);
                    this.activateTab(index);
                });
            }
        }
    }

    /**
     * Crea contenido de error
     */
    createErrorContent(error) {
        return `
            <div class="tab-error" style="text-align: center; padding: 2rem; color: var(--gray);">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                <h4>${this.config.errorText}</h4>
                <p style="color: #EF4444; font-size: 0.9rem;">${error.message}</p>
                <button class="retry-button" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--gradient-primary); color: white; border: none; border-radius: 5px; cursor: pointer;">
                    🔄 Reintentar
                </button>
            </div>
        `;
    }

    /**
     * Configura navegación por teclado
     */
    setupKeyboardNavigation() {
        if (!this.config.keyboard) return;

        this.tabs.forEach((button, index) => {
            this.addEventListener(button, 'keydown', (e) => {
                this.handleKeydown(e, index);
            });
        });
    }

    /**
     * Maneja eventos de teclado
     */
    handleKeydown(e, currentIndex) {
        let targetIndex = currentIndex;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowDown':
                e.preventDefault();
                targetIndex = (currentIndex + 1) % this.tabs.length;
                break;
            case 'ArrowLeft':
            case 'ArrowUp':
                e.preventDefault();
                targetIndex = currentIndex === 0 ? this.tabs.length - 1 : currentIndex - 1;
                break;
            case 'Home':
                e.preventDefault();
                targetIndex = 0;
                break;
            case 'End':
                e.preventDefault();
                targetIndex = this.tabs.length - 1;
                break;
            case 'Enter':
            case ' ':
                e.preventDefault();
                this.activateTab(currentIndex);
                return;
        }

        if (targetIndex !== currentIndex) {
            this.tabs[targetIndex].focus();
        }
    }

    /**
     * Maneja redimensionamiento
     */
    handleResize() {
        if (this.config.autoHeight) {
            const activeContent = this.contents[this.activeIndex];
            if (activeContent && activeContent.style.display !== 'none') {
                this.adjustHeight(activeContent);
            }
        }
    }

    /**
     * Trigger custom events
     */
    triggerEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.container.dispatchEvent(event);
    }

    /**
     * Utility: debounce function
     */
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
    }

    /**
     * Get current active tab
     */
    getActiveTab() {
        return {
            index: this.activeIndex,
            tab: this.tabs[this.activeIndex],
            content: this.contents[this.activeIndex]
        };
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        this.loadedTabs.clear();
    }

    /**
     * Destroy tab manager
     */
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];

        // Clear cache
        this.clearCache();

        console.log('TabManager destroyed');
    }
}

// Auto-initialize tabs when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all tab containers
    const tabContainers = document.querySelectorAll('.tabs-component, .example-tabs');
    
    tabContainers.forEach(container => {
        if (!container.dataset.tabManager) {
            const tabManager = new TabManager(container);
            container.dataset.tabManager = 'initialized';
            
            // Store reference for later access
            container.tabManager = tabManager;
        }
    });
    
    console.log(`📄 Auto-initialized ${tabContainers.length} tab containers`);
});

// Export TabManager
window.TabManager = TabManager;