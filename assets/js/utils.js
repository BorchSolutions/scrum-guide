/**
 * Utils.js - Utilidades generales para SCRUM Pro Guide
 * Funciones helper, validaciones, formateo y utilidades comunes
 */

// Namespace para todas las utilidades
window.Utils = {
    
    /**
     * DOM Utilities
     */
    DOM: {
        /**
         * Selecciona un elemento del DOM de forma segura
         * @param {string} selector - Selector CSS
         * @param {HTMLElement} context - Contexto de búsqueda (opcional)
         * @returns {HTMLElement|null}
         */
        select(selector, context = document) {
            try {
                return context.querySelector(selector);
            } catch (error) {
                console.warn(`Invalid selector: ${selector}`, error);
                return null;
            }
        },

        /**
         * Selecciona múltiples elementos del DOM
         * @param {string} selector - Selector CSS
         * @param {HTMLElement} context - Contexto de búsqueda (opcional)
         * @returns {NodeList}
         */
        selectAll(selector, context = document) {
            try {
                return context.querySelectorAll(selector);
            } catch (error) {
                console.warn(`Invalid selector: ${selector}`, error);
                return [];
            }
        },

        /**
         * Crea un elemento con atributos y contenido
         * @param {string} tag - Tipo de elemento
         * @param {Object} attributes - Atributos del elemento
         * @param {string} content - Contenido del elemento
         * @returns {HTMLElement}
         */
        createElement(tag, attributes = {}, content = '') {
            const element = document.createElement(tag);
            
            Object.entries(attributes).forEach(([key, value]) => {
                if (key === 'className') {
                    element.className = value;
                } else if (key === 'dataset') {
                    Object.entries(value).forEach(([dataKey, dataValue]) => {
                        element.dataset[dataKey] = dataValue;
                    });
                } else {
                    element.setAttribute(key, value);
                }
            });
            
            if (content) {
                element.innerHTML = content;
            }
            
            return element;
        },

        /**
         * Verifica si un elemento es visible en el viewport
         * @param {HTMLElement} element - Elemento a verificar
         * @param {number} threshold - Umbral de visibilidad (0-1)
         * @returns {boolean}
         */
        isInViewport(element, threshold = 0) {
            if (!element) return false;
            
            const rect = element.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            
            const verticalVisible = rect.top < windowHeight * (1 - threshold) && 
                                  rect.bottom > windowHeight * threshold;
            const horizontalVisible = rect.left < windowWidth * (1 - threshold) && 
                                    rect.right > windowWidth * threshold;
            
            return verticalVisible && horizontalVisible;
        },

        /**
         * Obtiene la posición de un elemento relativa al documento
         * @param {HTMLElement} element - Elemento
         * @returns {Object} Objeto con top y left
         */
        getOffset(element) {
            if (!element) return { top: 0, left: 0 };
            
            const rect = element.getBoundingClientRect();
            return {
                top: rect.top + window.pageYOffset,
                left: rect.left + window.pageXOffset
            };
        }
    },

    /**
     * String Utilities
     */
    String: {
        /**
         * Capitaliza la primera letra de un string
         * @param {string} str - String a capitalizar
         * @returns {string}
         */
        capitalize(str) {
            if (!str) return '';
            return str.charAt(0).toUpperCase() + str.slice(1);
        },

        /**
         * Convierte un string a slug (URL-friendly)
         * @param {string} str - String a convertir
         * @returns {string}
         */
        slugify(str) {
            if (!str) return '';
            
            return str
                .toLowerCase()
                .trim()
                .replace(/[\s_]+/g, '-')
                .replace(/[^\w\-]+/g, '')
                .replace(/\-\-+/g, '-')
                .replace(/^-+/, '')
                .replace(/-+$/, '');
        },

        /**
         * Trunca un string a una longitud específica
         * @param {string} str - String a truncar
         * @param {number} length - Longitud máxima
         * @param {string} suffix - Sufijo a agregar (por defecto '...')
         * @returns {string}
         */
        truncate(str, length, suffix = '...') {
            if (!str || str.length <= length) return str;
            return str.substring(0, length - suffix.length) + suffix;
        },

        /**
         * Escapa caracteres HTML
         * @param {string} str - String a escapar
         * @returns {string}
         */
        escapeHtml(str) {
            if (!str) return '';
            
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }
    },

    /**
     * Number Utilities
     */
    Number: {
        /**
         * Formatea un número con separadores de miles
         * @param {number} num - Número a formatear
         * @param {string} locale - Locale para formateo
         * @returns {string}
         */
        format(num, locale = 'es-ES') {
            if (isNaN(num)) return '0';
            return new Intl.NumberFormat(locale).format(num);
        },

        /**
         * Convierte un número a porcentaje
         * @param {number} num - Número a convertir
         * @param {number} decimals - Número de decimales
         * @returns {string}
         */
        toPercentage(num, decimals = 0) {
            if (isNaN(num)) return '0%';
            return (num * 100).toFixed(decimals) + '%';
        },

        /**
         * Clamp un número entre un mínimo y máximo
         * @param {number} num - Número a clampear
         * @param {number} min - Valor mínimo
         * @param {number} max - Valor máximo
         * @returns {number}
         */
        clamp(num, min, max) {
            return Math.min(Math.max(num, min), max);
        },

        /**
         * Genera un número aleatorio entre min y max
         * @param {number} min - Valor mínimo
         * @param {number} max - Valor máximo
         * @returns {number}
         */
        random(min = 0, max = 1) {
            return Math.random() * (max - min) + min;
        }
    },

    /**
     * Array Utilities
     */
    Array: {
        /**
         * Agrupa elementos de un array por una propiedad
         * @param {Array} array - Array a agrupar
         * @param {string|Function} key - Propiedad o función para agrupar
         * @returns {Object}
         */
        groupBy(array, key) {
            if (!Array.isArray(array)) return {};
            
            return array.reduce((result, item) => {
                const group = typeof key === 'function' ? key(item) : item[key];
                if (!result[group]) {
                    result[group] = [];
                }
                result[group].push(item);
                return result;
            }, {});
        },

        /**
         * Elimina duplicados de un array
         * @param {Array} array - Array con posibles duplicados
         * @param {string} key - Propiedad para comparar objetos (opcional)
         * @returns {Array}
         */
        unique(array, key = null) {
            if (!Array.isArray(array)) return [];
            
            if (key) {
                const seen = new Set();
                return array.filter(item => {
                    const value = item[key];
                    if (seen.has(value)) {
                        return false;
                    }
                    seen.add(value);
                    return true;
                });
            }
            
            return [...new Set(array)];
        },

        /**
         * Mezcla un array aleatoriamente
         * @param {Array} array - Array a mezclar
         * @returns {Array}
         */
        shuffle(array) {
            if (!Array.isArray(array)) return [];
            
            const shuffled = [...array];
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }
            return shuffled;
        }
    },

    /**
     * Date Utilities
     */
    Date: {
        /**
         * Formatea una fecha
         * @param {Date|string} date - Fecha a formatear
         * @param {string} locale - Locale para formateo
         * @param {Object} options - Opciones de formateo
         * @returns {string}
         */
        format(date, locale = 'es-ES', options = {}) {
            const dateObj = new Date(date);
            if (isNaN(dateObj.getTime())) return '';
            
            const defaultOptions = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            
            return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options });
        },

        /**
         * Calcula la diferencia entre dos fechas
         * @param {Date|string} date1 - Primera fecha
         * @param {Date|string} date2 - Segunda fecha
         * @param {string} unit - Unidad de tiempo (days, hours, minutes)
         * @returns {number}
         */
        diff(date1, date2, unit = 'days') {
            const d1 = new Date(date1);
            const d2 = new Date(date2);
            const diffMs = Math.abs(d2.getTime() - d1.getTime());
            
            switch (unit) {
                case 'days':
                    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
                case 'hours':
                    return Math.floor(diffMs / (1000 * 60 * 60));
                case 'minutes':
                    return Math.floor(diffMs / (1000 * 60));
                default:
                    return diffMs;
            }
        }
    },

    /**
     * Storage Utilities
     */
    Storage: {
        /**
         * Guarda un valor en localStorage de forma segura
         * @param {string} key - Clave
         * @param {*} value - Valor a guardar
         * @returns {boolean} Éxito de la operación
         */
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('Error saving to localStorage:', error);
                return false;
            }
        },

        /**
         * Obtiene un valor de localStorage
         * @param {string} key - Clave
         * @param {*} defaultValue - Valor por defecto
         * @returns {*}
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('Error reading from localStorage:', error);
                return defaultValue;
            }
        },

        /**
         * Elimina un valor de localStorage
         * @param {string} key - Clave a eliminar
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.warn('Error removing from localStorage:', error);
            }
        }
    },

    /**
     * Event Utilities
     */
    Event: {
        /**
         * Debounce function - retrasa la ejecución de una función
         * @param {Function} func - Función a ejecutar
         * @param {number} wait - Tiempo de espera en ms
         * @param {boolean} immediate - Ejecutar inmediatamente
         * @returns {Function}
         */
        debounce(func, wait, immediate = false) {
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
        },

        /**
         * Throttle function - limita la frecuencia de ejecución
         * @param {Function} func - Función a ejecutar
         * @param {number} limit - Límite de tiempo en ms
         * @returns {Function}
         */
        throttle(func, limit) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        /**
         * Dispara un evento personalizado
         * @param {string} eventName - Nombre del evento
         * @param {*} detail - Datos del evento
         * @param {HTMLElement} target - Elemento target
         */
        trigger(eventName, detail = null, target = document) {
            const event = new CustomEvent(eventName, {
                detail,
                bubbles: true,
                cancelable: true
            });
            target.dispatchEvent(event);
        }
    },

    /**
     * URL Utilities
     */
    URL: {
        /**
         * Obtiene parámetros de la URL
         * @param {string} url - URL a parsear (opcional, usa current URL)
         * @returns {Object}
         */
        getParams(url = window.location.href) {
            const urlObj = new URL(url);
            const params = {};
            urlObj.searchParams.forEach((value, key) => {
                params[key] = value;
            });
            return params;
        },

        /**
         * Actualiza parámetros de la URL sin recargar
         * @param {Object} params - Parámetros a actualizar
         * @param {boolean} replace - Usar replaceState en lugar de pushState
         */
        updateParams(params, replace = false) {
            const url = new URL(window.location);
            
            Object.entries(params).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    url.searchParams.delete(key);
                } else {
                    url.searchParams.set(key, value);
                }
            });
            
            const method = replace ? 'replaceState' : 'pushState';
            window.history[method]({}, '', url);
        }
    },

    /**
     * Validation Utilities
     */
    Validation: {
        /**
         * Valida un email
         * @param {string} email - Email a validar
         * @returns {boolean}
         */
        isEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        /**
         * Valida una URL
         * @param {string} url - URL a validar
         * @returns {boolean}
         */
        isUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        },

        /**
         * Verifica si un string está vacío o solo contiene espacios
         * @param {string} str - String a verificar
         * @returns {boolean}
         */
        isEmpty(str) {
            return !str || str.trim().length === 0;
        }
    },

    /**
     * Performance Utilities
     */
    Performance: {
        /**
         * Ejecuta una función y mide su tiempo de ejecución
         * @param {Function} func - Función a medir
         * @param {string} label - Etiqueta para el log
         * @returns {*} Resultado de la función
         */
        measure(func, label = 'Function') {
            const start = performance.now();
            const result = func();
            const end = performance.now();
            console.log(`${label} took ${(end - start).toFixed(2)}ms`);
            return result;
        },

        /**
         * Crea un timer simple
         * @param {string} name - Nombre del timer
         */
        startTimer(name) {
            console.time(name);
        },

        /**
         * Termina un timer
         * @param {string} name - Nombre del timer
         */
        endTimer(name) {
            console.timeEnd(name);
        }
    },

    /**
     * Color Utilities
     */
    Color: {
        /**
         * Convierte HEX a RGB
         * @param {string} hex - Color en formato HEX
         * @returns {Object|null} Objeto con r, g, b
         */
        hexToRgb(hex) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        },

        /**
         * Convierte RGB a HEX
         * @param {number} r - Rojo (0-255)
         * @param {number} g - Verde (0-255)
         * @param {number} b - Azul (0-255)
         * @returns {string}
         */
        rgbToHex(r, g, b) {
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }
    }
};

// Funciones de conveniencia globales
window.$ = Utils.DOM.select;
window.$$ = Utils.DOM.selectAll;

// Log de inicialización
console.log('🛠️ Utils library loaded successfully');

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}