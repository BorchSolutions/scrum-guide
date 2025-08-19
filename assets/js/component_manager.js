/**
 * Component Manager - Sistema de gestión de componentes modulares
 * Maneja carga, inicialización y cleanup de componentes
 */

class ComponentManager {
    constructor() {
        this.components = new Map();
        this.loadedComponents = new Set();
        this.componentCache = new Map();
        this.eventListeners = new Map();
        this.observers = new Map();
    }

    /**
     * Inicializa el component manager y carga los componentes estáticos
     */
    async init() {
        this.setupGlobalErrorHandler();
        this.setupPerformanceMonitoring();
        await this.loadStaticComponents();
    }

    /**
     * Carga componentes estáticos como la navegación y el pie de página.
     */
    async loadStaticComponents() {
        try {
            // Registrar componentes estáticos
            this.registerComponent('navigation', {
                htmlPath: 'components/navigation.html',
                singleton: true
            });
            this.registerComponent('footer', {
                htmlPath: 'components/footer.html',
                singleton: true
            });

            // Cargar componentes en sus contenedores
            await this.loadComponent('navigation', '#navigation-container');

        } catch (error) {
            console.error("Error loading static components:", error);
        }
    }
    
    /**
     * Registra un componente en el sistema
     * @param {string} name - Nombre del componente
     * @param {Object} config - Configuración del componente
     */
    registerComponent(name, config) {
        this.components.set(name, {
            name,
            htmlPath: config.htmlPath,
            jsPath: config.jsPath,
            cssPath: config.cssPath,
            dependencies: config.dependencies || [],
            props: config.props || {},
            singleton: config.singleton || false,
            lazy: config.lazy || false,
            retryCount: 0,
            maxRetries: config.maxRetries || 3
        });
    }

    /**
     * Carga un componente en un contenedor específico
     * @param {string} name - Nombre del componente
     * @param {string|HTMLElement} container - Selector o elemento contenedor
     * @param {Object} props - Propiedades a pasar al componente
     */
    async loadComponent(name, container, props = {}) {
        try {
            const startTime = performance.now();
            
            // Validar componente
            if (!this.components.has(name)) {
                throw new Error(`Component ${name} not registered`);
            }

            const config = this.components.get(name);
            const containerElement = typeof container === 'string' 
                ? document.querySelector(container) 
                : container;

            if (!containerElement) {
                throw new Error(`Container not found for component ${name}`);
            }

            // Verificar singleton
            if (config.singleton && this.loadedComponents.has(name)) {
                console.warn(`Component ${name} is singleton and already loaded`);
                return this.getComponentInstance(name);
            }

            // Cargar dependencias primero
            await this.loadDependencies(config.dependencies);

            // Cargar HTML del componente
            const html = await this.loadComponentHTML(config.htmlPath, name);
            
            // Inyectar HTML en el contenedor
            containerElement.innerHTML = html;

            // Cargar CSS si existe
            if (config.cssPath) {
                await this.loadComponentCSS(config.cssPath, name);
            }

            // Cargar e inicializar JavaScript
            let componentInstance = null;
            if (config.jsPath) {
                componentInstance = await this.loadComponentJS(config.jsPath, name, props);
            }

            // Procesar props
            this.injectProps(containerElement, { ...config.props, ...props });

            // Registrar como cargado
            this.loadedComponents.add(name);

            // Configurar cleanup automático
            this.setupComponentCleanup(name, containerElement);

            const loadTime = performance.now() - startTime;

            // Trigger evento de carga
            this.triggerComponentEvent(name, 'loaded', { 
                container: containerElement, 
                props, 
                loadTime,
                instance: componentInstance 
            });

            return componentInstance;

        } catch (error) {
            console.error(`Error loading component ${name}:`, error);
            return this.handleComponentError(name, container, error, props);
        }
    }

    /**
     * Carga el HTML de un componente
     */
    async loadComponentHTML(htmlPath, componentName) {
        // Verificar cache
        if (this.componentCache.has(htmlPath)) {
            return this.componentCache.get(htmlPath);
        }

        try {
            const response = await fetch(htmlPath);
            if (!response.ok) {
                throw new Error(`Failed to load HTML: ${response.statusText}`);
            }

            const html = await response.text();
            this.componentCache.set(htmlPath, html);
            return html;

        } catch (error) {
            console.error(`Error loading HTML for ${componentName}:`, error);
            return this.getComponentFallback(componentName);
        }
    }

    /**
     * Carga el CSS de un componente
     */
    async loadComponentCSS(cssPath, componentName) {
        const linkId = `component-css-${componentName}`;
        
        // Verificar si ya está cargado
        if (document.getElementById(linkId)) {
            return;
        }

        try {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'stylesheet';
            link.href = cssPath;
            
            return new Promise((resolve, reject) => {
                link.onload = () => {
                    resolve();
                };
                link.onerror = () => reject(new Error(`Failed to load CSS: ${cssPath}`));
                document.head.appendChild(link);
            });

        } catch (error) {
            console.warn(`Error loading CSS for ${componentName}:`, error);
        }
    }

    /**
     * Carga e inicializa el JavaScript de un componente
     */
    async loadComponentJS(jsPath, componentName, props) {
        try {
            // Cargar módulo dinámicamente
            const module = await import(jsPath);
            
            // Buscar clase principal del componente
            const ComponentClass = module.default || module[componentName] || module[`${componentName}Component`];
            
            if (ComponentClass && typeof ComponentClass === 'function') {
                // Inicializar componente
                const instance = new ComponentClass(props);
                
                // Registrar instancia
                this.registerComponentInstance(componentName, instance);
                
                return instance;
            } else {
                console.warn(`No component class found in ${jsPath}`);
                return null;
            }

        } catch (error) {
            console.error(`Error loading JS for ${componentName}:`, error);
            return null;
        }
    }

    /**
     * Inyecta props en el HTML del componente
     */
    injectProps(container, props) {
        // Buscar elementos con data-prop
        container.querySelectorAll('[data-prop]').forEach(element => {
            const propName = element.getAttribute('data-prop');
            if (props.hasOwnProperty(propName)) {
                const value = props[propName];
                
                // Inyectar según el tipo de elemento
                if (element.tagName === 'INPUT') {
                    element.value = value;
                } else if (element.tagName === 'IMG') {
                    element.src = value;
                } else {
                    element.textContent = value;
                }
            }
        });

        // Procesar templates con {{prop}}
        this.processTemplates(container, props);
    }

    /**
     * Procesa templates con sintaxis {{prop}}
     */
    processTemplates(container, props) {
        const templateRegex = /\{\{(\w+)\}\}/g;
        
        const walk = (node) => {
            if (node.nodeType === Node.TEXT_NODE) {
                node.textContent = node.textContent.replace(templateRegex, (match, propName) => {
                    return props.hasOwnProperty(propName) ? props[propName] : match;
                });
            } else if (node.nodeType === Node.ELEMENT_NODE) {
                Array.from(node.childNodes).forEach(walk);
            }
        };

        walk(container);
    }

    /**
     * Carga dependencias de un componente
     */
    async loadDependencies(dependencies) {
        if (!dependencies || dependencies.length === 0) {
            return;
        }

        const loadPromises = dependencies.map(dep => {
            if (!this.loadedComponents.has(dep)) {
                return this.loadComponent(dep, document.body);
            }
            return Promise.resolve();
        });

        await Promise.all(loadPromises);
    }

    /**
     * Maneja errores de carga de componentes
     */
    async handleComponentError(name, container, error, props) {
        const config = this.components.get(name);
        
        // Reintentar si no se ha alcanzado el límite
        if (config.retryCount < config.maxRetries) {
            config.retryCount++;
            console.warn(`Retrying component ${name} (attempt ${config.retryCount})`);
            
            // Delay progresivo
            await new Promise(resolve => setTimeout(resolve, config.retryCount * 1000));
            
            return this.loadComponent(name, container, props);
        }

        // Mostrar fallback
        const containerElement = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;

        if (containerElement) {
            containerElement.innerHTML = this.getComponentFallback(name, error);
        }

        this.triggerComponentEvent(name, 'error', { error, container, props });
        return null;
    }

    /**
     * Genera HTML de fallback para componentes que fallan
     */
    getComponentFallback(componentName, error = null) {
        return `
            <div class="component-fallback" style="
                padding: 2rem;
                background: rgba(239, 68, 68, 0.1);
                border: 1px solid rgba(239, 68, 68, 0.3);
                border-radius: 10px;
                text-align: center;
                color: var(--light);
            ">
                <div style="font-size: 2rem; margin-bottom: 1rem;">⚠️</div>
                <h3>Componente No Disponible</h3>
                <p>El componente "${componentName}" no pudo cargarse.</p>
                ${error ? `<details style="margin-top: 1rem; text-align: left;">
                    <summary>Detalles del error</summary>
                    <code style="font-size: 0.8rem; color: #EF4444;">${error.message}</code>
                </details>` : ''}
                <button onclick="window.componentManager.retryComponent('${componentName}')" 
                        style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--gradient-primary); color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        `;
    }

    /**
     * Reintenta cargar un componente
     */
    async retryComponent(name) {
        const config = this.components.get(name);
        if (config) {
            config.retryCount = 0;
            const containers = document.querySelectorAll(`[data-component="${name}"]`);
            
            for (const container of containers) {
                await this.loadComponent(name, container);
            }
        }
    }

    /**
     * Descarga un componente
     */
    unloadComponent(name) {
        try {
            // Cleanup de instancia
            const instance = this.getComponentInstance(name);
            if (instance && typeof instance.destroy === 'function') {
                instance.destroy();
            }

            // Remover event listeners
            this.cleanupComponentListeners(name);

            // Remover del DOM
            document.querySelectorAll(`[data-component="${name}"]`).forEach(element => {
                element.innerHTML = '';
            });

            // Cleanup de registros
            this.loadedComponents.delete(name);
            this.removeComponentInstance(name);

            this.triggerComponentEvent(name, 'unloaded');

        } catch (error) {
            console.error(`Error unloading component ${name}:`, error);
        }
    }

    /**
     * Configura cleanup automático del componente
     */
    setupComponentCleanup(name, container) {
        // Observer para detectar cuando el componente se remueve del DOM
        const observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.removedNodes.forEach(node => {
                    if (node === container || (node.contains && node.contains(container))) {
                        this.unloadComponent(name);
                        observer.disconnect();
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
        this.observers.set(name, observer);
    }

    /**
     * Registra instancia de componente
     */
    registerComponentInstance(name, instance) {
        if (!this.componentInstances) {
            this.componentInstances = new Map();
        }
        this.componentInstances.set(name, instance);
    }

    /**
     * Obtiene instancia de componente
     */
    getComponentInstance(name) {
        return this.componentInstances ? this.componentInstances.get(name) : null;
    }

    /**
     * Remueve instancia de componente
     */
    removeComponentInstance(name) {
        if (this.componentInstances) {
            this.componentInstances.delete(name);
        }
    }

    /**
     * Cleanup de event listeners de componente
     */
    cleanupComponentListeners(name) {
        const listeners = this.eventListeners.get(name);
        if (listeners) {
            listeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.eventListeners.delete(name);
        }
    }

    /**
     * Registra event listener de componente para cleanup automático
     */
    addComponentListener(componentName, element, event, handler) {
        if (!this.eventListeners.has(componentName)) {
            this.eventListeners.set(componentName, []);
        }
        
        this.eventListeners.get(componentName).push({ element, event, handler });
        element.addEventListener(event, handler);
    }

    /**
     * Trigger evento de componente
     */
    triggerComponentEvent(componentName, eventType, detail = {}) {
        const event = new CustomEvent(`component:${eventType}`, {
            detail: { componentName, ...detail }
        });
        document.dispatchEvent(event);
    }

    /**
     * Configura manejo global de errores
     */
    setupGlobalErrorHandler() {
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('/components/')) {
                console.error('Component error:', event.error);
                this.triggerComponentEvent('unknown', 'error', { error: event.error });
            }
        });
    }

    /**
     * Configura monitoreo de performance
     */
    setupPerformanceMonitoring() {
        // Monitorear performance de carga de componentes
        this.componentLoadTimes = new Map();
        
        document.addEventListener('component:loaded', (event) => {
            const { componentName, loadTime } = event.detail;
            this.componentLoadTimes.set(componentName, loadTime);
        });
    }

    /**
     * Obtiene estadísticas de componentes
     */
    getComponentStats() {
        return {
            registered: this.components.size,
            loaded: this.loadedComponents.size,
            cached: this.componentCache.size,
            loadTimes: Object.fromEntries(this.componentLoadTimes),
            instances: this.componentInstances ? this.componentInstances.size : 0
        };
    }

    /**
     * Preload componentes críticos
     */
    async preloadComponents(componentNames) {
        const preloadPromises = componentNames.map(async name => {
            try {
                const config = this.components.get(name);
                if (config && config.htmlPath) {
                    await this.loadComponentHTML(config.htmlPath, name);
                }
            } catch (error) {
            }
        });

        await Promise.all(preloadPromises);
    }

    /**
     * Destructor para cleanup completo
     */
    destroy() {
        // Unload todos los componentes
        for (const name of this.loadedComponents) {
            this.unloadComponent(name);
        }

        // Cleanup observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();

        // Cleanup maps
        this.components.clear();
        this.componentCache.clear();
        this.eventListeners.clear();
        
    }
}
