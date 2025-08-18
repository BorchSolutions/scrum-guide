/**
 * TabManager Component - Sistema de tabs reutilizable
 * assets/js/components/tab-manager.js
 */

class TabManager {
    constructor(props = {}) {
        this.container = null;
        this.tabs = [];
        this.activeTab = null;
        this.config = {
            title: props.title || 'Contenido con Tabs',
            subtitle: props.subtitle || '',
            tabs: props.tabs || [],
            defaultTab: props.defaultTab || 0,
            lazy: props.lazy || false,
            animation: props.animation !== false,
            keyboard: props.keyboard !== false,
            autoHeight: props.autoHeight || false,
            onTabChange: props.onTabChange || null,
            onTabLoad: props.onTabLoad || null,
            contentLoader: props.contentLoader || null
        };
        
        this.eventListeners = [];
        this.observers = [];
        this.loadedTabs = new Set();
        
        this.init();
    }

    /**
     * Inicializa el componente
     */
    init() {
        this.findContainer();
        this.setupTabs();
        this.setupEventListeners();
        this.setupKeyboardNavigation();
        this.setupAccessibility();
        
        // Activar tab por defecto
        if (this.tabs.length > 0) {
            this.activateTab(this.config.defaultTab);
        }
        
        console.log('📑 TabManager initialized with', this.tabs.length, 'tabs');
    }

    /**
     * Encuentra el contenedor del componente
     */
    findContainer() {
        this.container = document.querySelector('[data-component="tabs"]');
        if (!this.container) {
            throw new Error('TabManager: Container not found');
        }
    }

    /**
     * Configura los tabs basado en la configuración
     */
    setupTabs() {
        this.createTabNavigation();
        this.createTabContent();
        this.updateTitle();
    }

    /**
     * Actualiza el título del componente
     */
    updateTitle() {
        const titleElement = this.container.querySelector('.tabs-title');
        const subtitleElement = this.container.querySelector('.tabs-subtitle');
        
        if (titleElement) titleElement.textContent = this.config.title;
        if (subtitleElement) subtitleElement.textContent = this.config.subtitle;
    }

    /**
     * Crea la navegación de tabs
     */
    createTabNavigation() {
        const navigation = this.container.querySelector('.tabs-navigation');
        navigation.innerHTML = '';

        this.config.tabs.forEach((tab, index) => {
            const button = document.createElement('button');
            button.className = 'tab-button';
            button.textContent = tab.label || tab.title || `Tab ${index + 1}`;
            button.setAttribute('role', 'tab');
            button.setAttribute('aria-selected', 'false');
            button.setAttribute('aria-controls', `tab-content-${index}`);
            button.setAttribute('id', `tab-${index}`);
            button.setAttribute('tabindex', index === 0 ? '0' : '-1');
            button.dataset.tabIndex = index;

            // Icono opcional
            if (tab.icon) {
                const icon = document.createElement('span');
                icon.innerHTML = tab.icon;
                icon.style.marginRight = '0.5rem';
                button.insertBefore(icon, button.firstChild);
            }

            // Badge opcional
            if (tab.badge) {
                const badge = document.createElement('span');
                badge.className = 'tab-badge';
                badge.textContent = tab.badge;
                badge.style.cssText = `
                    background: var(--accent);
                    color: white;
                    font-size: 0.7rem;
                    padding: 0.2rem 0.5rem;
                    border-radius: 10px;
                    margin-left: 0.5rem;
                `;
                button.appendChild(badge);
            }

            // Event listener
            this.addEventListener(button, 'click', () => {
                this.activateTab(index);
            });

            navigation.appendChild(button);
        });
    }

    /**
     * Crea el contenedor de contenido de tabs
     */
    createTabContent() {
        const contentContainer = this.container.querySelector('.tabs-content');
        contentContainer.innerHTML = '';

        this.config.tabs.forEach((tab, index) => {
            const content = document.createElement('div');
            content.className = 'tab-content';
            content.setAttribute('role', 'tabpanel');
            content.setAttribute('aria-labelledby', `tab-${index}`);
            content.setAttribute('id', `tab-content-${index}`);
            content.setAttribute('aria-hidden', 'true');
            content.dataset.tabIndex = index;

            // Agregar contenido inicial si existe
            if (tab.content) {
                content.innerHTML = tab.content;
                this.loadedTabs.add(index);
            } else if (!this.config.lazy) {
                // Cargar contenido inmediatamente si no es lazy
                this.loadTabContent(index, content);
            } else {
                // Placeholder para carga lazy
                content.innerHTML = this.createLoadingPlaceholder();
            }

            contentContainer.appendChild(content);
        });
    }

    /**
     * Crea placeholder de carga
     */
    createLoadingPlaceholder() {
        return `
            <div class="tab-loading-placeholder" style="
                text-align: center;
                padding: 2rem;
                color: var(--gray);
            ">
                <div style="font-size: 2rem; margin-bottom: 1rem;">📄</div>
                <p>Contenido se cargará al activar el tab</p>
            </div>
        `;
    }

    /**
     * Activa un tab específico
     */
    async activateTab(index) {
        if (index < 0 || index >= this.config.tabs.length) {
            console.warn('TabManager: Invalid tab index', index);
            return;
        }

        const tab = this.config.tabs[index];
        const previousTab = this.activeTab;

        try {
            // Mostrar loading si es necesario
            if (!this.loadedTabs.has(index)) {
                this.showTabLoading();
            }

            // Cargar contenido si es necesario
            if (!this.loadedTabs.has(index)) {
                await this.loadTabContent(index);
            }

            // Actualizar UI
            this.updateTabUI(index);
            
            // Actualizar estado
            this.activeTab = index;

            // Trigger callbacks
            if (this.config.onTabChange) {
                this.config.onTabChange(index, tab, previousTab);
            }

            // Trigger evento DOM
            this.triggerEvent('tabChanged', {
                index,
                tab,
                previousTab,
                tabManager: this
            });

            // Analytics
            this.trackTabActivation(index, tab);

            console.log(`📑 Tab ${index} (${tab.label}) activated`);

        } catch (error) {
            console.error('TabManager: Error activating tab', index, error);
            this.showTabError(index, error);
        } finally {
            this.hideTabLoading();
        }
    }

    /**
     * Carga el contenido de un tab
     */
    async loadTabContent(index, contentElement = null) {
        const tab = this.config.tabs[index];
        const content = contentElement || this.container.querySelector(`#tab-content-${index}`);

        try {
            let htmlContent = '';

            // Diferentes fuentes de contenido
            if (tab.url) {
                // Cargar desde URL
                const response = await fetch(tab.url);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                htmlContent = await response.text();
                
            } else if (tab.component) {
                // Cargar componente
                if (window.componentManager) {
                    await window.componentManager.loadComponent(tab.component, content, tab.props);
                    this.loadedTabs.add(index);
                    return;
                } else {
                    throw new Error('Component manager not available');
                }
                
            } else if (tab.content) {
                // Contenido directo
                htmlContent = tab.content;
                
            } else if (this.config.contentLoader) {
                // Loader personalizado
                htmlContent = await this.config.contentLoader(tab, index);
                
            } else {
                throw new Error('No content source defined for tab');
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
        this.container.querySelectorAll('.tab-button').forEach((button, i) => {
            const isActive = i === index;
            button.classList.toggle('active', isActive);
            button.setAttribute('aria-selected', isActive.toString());
            button.setAttribute('tabindex', isActive ? '0' : '-1');
        });

        // Actualizar contenido
        this.container.querySelectorAll('.tab-content').forEach((content, i) => {
            const isActive = i === index;
            content.classList.toggle('active', isActive);
            content.setAttribute('aria-hidden', (!isActive).toString());
        });

        // Auto height
        if (this.config.autoHeight) {
            this.adjustHeight();
        }
    }

    /**
     * Ajusta la altura automáticamente
     */
    adjustHeight() {
        const activeContent = this.container.querySelector('.tab-content.active');
        const contentContainer = this.container.querySelector('.tabs-content');
        
        if (activeContent && contentContainer) {
            const height = activeContent.scrollHeight;
            contentContainer.style.height = `${height}px`;
        }
    }

    /**
     * Muestra estado de carga
     */
    showTabLoading() {
        const loading = this.container.querySelector('.tabs-loading');
        if (loading) {
            loading.style.display = 'block';
        }
    }

    /**
     * Oculta estado de carga
     */
    hideTabLoading() {
        const loading = this.container.querySelector('.tabs-loading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    /**
     * Muestra error de tab
     */
    showTabError(index, error) {
        const errorContainer = this.container.querySelector('.tabs-error');
        if (errorContainer) {
            errorContainer.style.display = 'block';
            
            const retryButton = errorContainer.querySelector('.retry-button');
            if (retryButton) {
                this.addEventListener(retryButton, 'click', () => {
                    errorContainer.style.display = 'none';
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
            <div style="text-align: center; padding: 2rem; color: var(--gray);">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                <h4>Error al cargar contenido</h4>
                <p style="color: #EF4444; font-size: 0.9rem;">${error.message}</p>
                <button onclick="this.closest('.tab-content').previousElementSibling.click()" 
                        style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--gradient-primary); color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
    }

    /**
     * Configura navegación por teclado
     */
    setupKeyboardNavigation() {
        if (!this.config.keyboard) return;

        this.container.querySelectorAll('.tab-button').forEach((button, index) => {
            this.addEventListener(button, 'keydown', (e) => {
                const buttons = Array.from(this.container.querySelectorAll('.tab-button'));
                const currentIndex = buttons.indexOf(button);

                switch (e.key) {
                    case 'ArrowRight':
                    case 'ArrowDown':
                        e.preventDefault();
                        const nextIndex = (currentIndex + 1) % buttons.length;
                        buttons[nextIndex].focus();
                        this.activateTab(nextIndex);
                        break;

                    case 'ArrowLeft':
                    case 'ArrowUp':
                        e.preventDefault();
                        const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                        buttons[prevIndex].focus();
                        this.activateTab(prevIndex);
                        break;

                    case 'Home':
                        e.preventDefault();
                        buttons[0].focus();
                        this.activateTab(0);
                        break;

                    case 'End':
                        e.preventDefault();
                        const lastIndex = buttons.length - 1;
                        buttons[lastIndex].focus();
                        this.activateTab(lastIndex);
                        break;

                    case 'Enter':
                    case ' ':
                        e.preventDefault();
                        this.activateTab(currentIndex);
                        break;
                }
            });
        });
    }

    /**
     * Configura accesibilidad
     */
    setupAccessibility() {
        const navigation = this.container.querySelector('.tabs-navigation');
        if (navigation) {
            navigation.setAttribute('role', 'tablist');
        }
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Observer para cambios de tamaño
        if (this.config.autoHeight && window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                this.adjustHeight();
            });
            
            const activeContent = this.container.querySelector('.tab-content.active');
            if (activeContent) {
                resizeObserver.observe(activeContent);
            }
            
            this.observers.push(resizeObserver);
        }
    }

    /**
     * Agrega event listener con cleanup automático
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    /**
     * Trigger evento personalizado
     */
    triggerEvent(name, detail) {
        const event = new CustomEvent(`tab:${name}`, { detail });
        this.container.dispatchEvent(event);
        document.dispatchEvent(event);
    }

    /**
     * Analytics de activación de tabs
     */
    trackTabActivation(index, tab) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tab_activation', {
                event_category: 'engagement',
                event_label: tab.label || `Tab ${index}`,
                value: index
            });
        }
    }

    /**
     * API pública para activar tab por nombre
     */
    activateTabByLabel(label) {
        const index = this.config.tabs.findIndex(tab => tab.label === label);
        if (index !== -1) {
            this.activateTab(index);
        } else {
            console.warn('TabManager: Tab not found with label:', label);
        }
    }

    /**
     * API pública para agregar nuevo tab
     */
    addTab(tab, index = null) {
        const insertIndex = index !== null ? index : this.config.tabs.length;
        this.config.tabs.splice(insertIndex, 0, tab);
        this.setupTabs();
    }

    /**
     * API pública para remover tab
     */
    removeTab(index) {
        if (index >= 0 && index < this.config.tabs.length) {
            this.config.tabs.splice(index, 1);
            this.loadedTabs.delete(index);
            this.setupTabs();
            
            // Activar tab anterior si el activo fue removido
            if (this.activeTab === index) {
                const newIndex = Math.max(0, index - 1);
                this.activateTab(newIndex);
            }
        }
    }

    /**
     * Obtiene el tab activo
     */
    getActiveTab() {
        return {
            index: this.activeTab,
            tab: this.config.tabs[this.activeTab],
            element: this.container.querySelector(`#tab-content-${this.activeTab}`)
        };
    }

    /**
     * Obtiene estadísticas
     */
    getStats() {
        return {
            totalTabs: this.config.tabs.length,
            activeTab: this.activeTab,
            loadedTabs: Array.from(this.loadedTabs),
            config: this.config
        };
    }

    /**
     * Destructor para cleanup
     */
    destroy() {
        // Cleanup event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });

        // Cleanup observers
        this.observers.forEach(observer => observer.disconnect());

        // Clear arrays
        this.eventListeners = [];
        this.observers = [];
        this.loadedTabs.clear();

        console.log('📑 TabManager destroyed');
    }
}

// Export para uso como módulo
export default TabManager;