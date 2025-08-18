/**
 * WSJF Calculator Component
 * assets/js/components/wsjf-calculator.js
 */

class WSJFCalculator {
    constructor(props = {}) {
        this.container = null;
        this.values = {
            businessValue: 8,
            urgency: 5,
            riskReduction: 3,
            effort: 8
        };
        
        this.config = {
            title: props.title || 'Calculadora WSJF',
            subtitle: props.subtitle || 'Weighted Shortest Job First - Priorización basada en valor y costo',
            fibonacciScale: [1, 2, 3, 5, 8, 13, 21],
            storageKey: props.storageKey || 'wsjf-calculator-history',
            maxHistory: props.maxHistory || 10,
            precision: props.precision || 1,
            showHistory: props.showHistory !== false,
            showBreakdown: props.showBreakdown !== false,
            onCalculate: props.onCalculate || null,
            onChange: props.onChange || null
        };
        
        this.history = [];
        this.eventListeners = [];
        this.debounceTimeout = null;
        
        this.init();
    }

    /**
     * Inicializa el componente
     */
    init() {
        this.findContainer();
        this.loadHistory();
        this.setupSliders();
        this.setupEventListeners();
        this.setupFibonacciMarkers();
        this.calculateWSJF();
        
        console.log('🧮 WSJF Calculator initialized');
    }

    /**
     * Encuentra el contenedor del componente
     */
    findContainer() {
        this.container = document.querySelector('[data-component="wsjf-calculator"]');
        if (!this.container) {
            throw new Error('WSJFCalculator: Container not found');
        }
    }

    /**
     * Configura los sliders con valores de Fibonacci
     */
    setupSliders() {
        const sliders = this.container.querySelectorAll('.slider[data-fibonacci="true"]');
        
        sliders.forEach(slider => {
            // Configurar valores discretos de Fibonacci
            this.setupFibonacciSlider(slider);
            
            // Event listeners
            this.addEventListener(slider, 'input', () => {
                this.handleSliderChange(slider);
            });
            
            this.addEventListener(slider, 'change', () => {
                this.handleSliderChange(slider);
            });
        });
    }

    /**
     * Configura un slider para usar valores de Fibonacci
     */
    setupFibonacciSlider(slider) {
        const currentValue = parseInt(slider.value);
        const fibIndex = this.config.fibonacciScale.indexOf(currentValue);
        
        if (fibIndex === -1) {
            // Si el valor actual no está en Fibonacci, usar el más cercano
            const closestFib = this.getClosestFibonacci(currentValue);
            slider.value = closestFib;
        }
        
        // Actualizar display
        this.updateSliderDisplay(slider);
    }

    /**
     * Configura marcadores visuales de Fibonacci en sliders
     */
    setupFibonacciMarkers() {
        const markers = this.container.querySelectorAll('.fibonacci-markers');
        
        markers.forEach(marker => {
            const sliderId = marker.dataset.for;
            const slider = this.container.querySelector(`#${sliderId}`);
            
            if (slider) {
                this.createFibonacciMarkers(marker, slider);
            }
        });
    }

    /**
     * Crea marcadores visuales para valores de Fibonacci
     */
    createFibonacciMarkers(container, slider) {
        container.innerHTML = '';
        
        this.config.fibonacciScale.forEach(value => {
            const marker = document.createElement('span');
            marker.textContent = value;
            marker.className = 'fib-marker';
            marker.style.cssText = `
                font-size: 0.7rem;
                color: var(--gray);
                cursor: pointer;
                padding: 0.2rem 0.3rem;
                border-radius: 3px;
                transition: all 0.2s ease;
            `;
            
            // Click en marcador cambia el valor
            marker.addEventListener('click', () => {
                slider.value = value;
                this.handleSliderChange(slider);
                marker.style.background = 'rgba(99, 102, 241, 0.3)';
                setTimeout(() => {
                    marker.style.background = '';
                }, 200);
            });
            
            container.appendChild(marker);
        });
    }

    /**
     * Maneja cambios en los sliders
     */
    handleSliderChange(slider) {
        const parameterId = slider.id;
        let value = parseInt(slider.value);
        
        // Ajustar a valor de Fibonacci más cercano
        value = this.getClosestFibonacci(value);
        slider.value = value;
        
        // Actualizar valor interno
        this.values[parameterId] = value;
        
        // Actualizar display
        this.updateSliderDisplay(slider);
        
        // Recalcular con debounce
        this.debouncedCalculate();
        
        // Trigger callback
        if (this.config.onChange) {
            this.config.onChange(parameterId, value, this.values);
        }
    }

    /**
     * Actualiza el display de un slider
     */
    updateSliderDisplay(slider) {
        const displayId = slider.id + 'Display';
        const display = this.container.querySelector(`#${displayId}`);
        
        if (display) {
            display.textContent = slider.value;
            
            // Efecto visual al cambiar
            display.style.transform = 'scale(1.1)';
            display.style.color = 'var(--primary)';
            
            setTimeout(() => {
                display.style.transform = 'scale(1)';
                display.style.color = '';
            }, 200);
        }
        
        // Actualizar ejemplos dinámicos
        this.updateExamples(slider.id, parseInt(slider.value));
    }

    /**
     * Actualiza ejemplos dinámicos basados en el valor
     */
    updateExamples(parameterId, value) {
        const examplesId = parameterId + 'Examples';
        const examplesElement = this.container.querySelector(`#${examplesId}`);
        
        if (!examplesElement) return;
        
        const examples = this.getExamplesForValue(parameterId, value);
        examplesElement.innerHTML = `<small>${examples}</small>`;
    }

    /**
     * Obtiene ejemplos basados en el parámetro y valor
     */
    getExamplesForValue(parameter, value) {
        const examplesByParameter = {
            businessValue: {
                1: 'Bug menor, mejora cosmética',
                2: 'Small UX improvement, documentación',
                3: 'Feature request menor, optimización',
                5: 'Nueva funcionalidad útil, integración',
                8: 'Feature importante, API nueva',
                13: 'Feature crítica, gran diferenciador',
                21: 'Game changer, ventaja competitiva'
            },
            urgency: {
                1: 'Puede esperar meses, nice-to-have',
                2: 'No urgente, próximo quarter',
                3: 'Moderadamente importante',
                5: 'Necesario pronto, 1-2 sprints',
                8: 'Urgente, stakeholders esperando',
                13: 'Muy urgente, blocking others',
                21: 'Crítico, parando producción'
            },
            riskReduction: {
                1: 'Riesgo muy bajo, refactoring menor',
                2: 'Mejora código, tech debt menor',
                3: 'Estabilidad, performance menor',
                5: 'Security issue, dependency update',
                8: 'Major security, architectural risk',
                13: 'Critical security, compliance',
                21: 'Existential risk, legal issues'
            },
            effort: {
                1: 'Cambio trivial, 1-2 horas',
                2: 'Task simple, medio día',
                3: 'Feature pequeña, 1 día',
                5: 'CRUD completo, 2-3 días',
                8: 'Feature compleja, 1 semana',
                13: 'Integración mayor, 2 semanas',
                21: 'Epic grande, 1 mes+'
            }
        };
        
        return examplesByParameter[parameter]?.[value] || 
               `Valor ${value} en escala Fibonacci`;
    }

    /**
     * Obtiene el valor de Fibonacci más cercano
     */
    getClosestFibonacci(value) {
        return this.config.fibonacciScale.reduce((prev, curr) => 
            Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
        );
    }

    /**
     * Calcula WSJF con debounce
     */
    debouncedCalculate() {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.calculateWSJF();
        }, 300);
    }

    /**
     * Calcula el score WSJF y actualiza la UI
     */
    calculateWSJF() {
        try {
            this.showLoading();
            
            const { businessValue, urgency, riskReduction, effort } = this.values;
            
            // Validaciones
            if (effort === 0) {
                throw new Error('El esfuerzo no puede ser 0');
            }
            
            // Cálculo WSJF
            const numerator = businessValue + urgency + riskReduction;
            const wsjf = numerator / effort;
            const roundedWSJF = parseFloat(wsjf.toFixed(this.config.precision));
            
            // Actualizar UI
            this.updateResults(roundedWSJF, numerator);
            this.updateFormula(numerator, effort, roundedWSJF);
            this.updateBreakdown();
            this.updatePriorityIndicator(roundedWSJF);
            
            // Trigger callback
            if (this.config.onCalculate) {
                this.config.onCalculate(roundedWSJF, this.values);
            }
            
            // Analytics
            this.trackCalculation(roundedWSJF);
            
            console.log(`🧮 WSJF calculated: ${roundedWSJF}`, this.values);
            
        } catch (error) {
            console.error('WSJF Calculation error:', error);
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    /**
     * Actualiza los resultados principales
     */
    updateResults(wsjf, numerator) {
        const resultElement = this.container.querySelector('#wsjfResult');
        if (resultElement) {
            // Animación del resultado
            resultElement.style.transform = 'scale(0.8)';
            resultElement.style.opacity = '0.5';
            
            setTimeout(() => {
                resultElement.textContent = wsjf;
                resultElement.style.transform = 'scale(1)';
                resultElement.style.opacity = '1';
                resultElement.style.transition = 'all 0.3s ease';
            }, 150);
        }
    }

    /**
     * Actualiza la fórmula visual
     */
    updateFormula(numerator, effort, wsjf) {
        const updates = {
            formulaBV: this.values.businessValue,
            formulaU: this.values.urgency,
            formulaRR: this.values.riskReduction,
            formulaE: effort,
            formulaSum: numerator,
            formulaEffort: effort,
            formulaResult: wsjf
        };
        
        Object.entries(updates).forEach(([id, value]) => {
            const element = this.container.querySelector(`#${id}`);
            if (element) {
                element.textContent = value;
            }
        });
    }

    /**
     * Actualiza el desglose visual
     */
    updateBreakdown() {
        const total = this.values.businessValue + this.values.urgency + this.values.riskReduction;
        
        const breakdowns = [
            { id: 'breakdownBV', value: this.values.businessValue, valueId: 'breakdownBVValue' },
            { id: 'breakdownUrgency', value: this.values.urgency, valueId: 'breakdownUrgencyValue' },
            { id: 'breakdownRisk', value: this.values.riskReduction, valueId: 'breakdownRiskValue' }
        ];
        
        breakdowns.forEach(({ id, value, valueId }) => {
            const percentage = (value / total) * 100;
            const fillElement = this.container.querySelector(`#${id}`);
            const valueElement = this.container.querySelector(`#${valueId}`);
            
            if (fillElement) {
                fillElement.style.width = `${percentage}%`;
            }
            
            if (valueElement) {
                valueElement.textContent = value;
            }
        });
    }

    /**
     * Actualiza el indicador de prioridad
     */
    updatePriorityIndicator(wsjf) {
        const badge = this.container.querySelector('#priorityBadge');
        const description = this.container.querySelector('#priorityDescription');
        
        let priority, text, desc;
        
        if (wsjf >= 4) {
            priority = 'very-high';
            text = '🔥 Prioridad MUY ALTA';
            desc = 'Incluir en próximo sprint inmediatamente';
        } else if (wsjf >= 2.5) {
            priority = 'high';
            text = '⚡ Prioridad ALTA';
            desc = 'Considerar para próximos 1-2 sprints';
        } else if (wsjf >= 1.5) {
            priority = 'medium';
            text = '📋 Prioridad MEDIA';
            desc = 'Backlog prioritario, planificar pronto';
        } else {
            priority = 'low';
            text = '🔻 Prioridad BAJA';
            desc = 'Reconsiderar necesidad o dividir en tasks menores';
        }
        
        if (badge) {
            badge.className = `priority-badge ${priority}`;
            badge.textContent = text;
        }
        
        if (description) {
            description.textContent = desc;
        }
    }

    /**
     * Configura event listeners principales
     */
    setupEventListeners() {
        // Botón reset
        const resetButton = this.container.querySelector('#resetButton');
        if (resetButton) {
            this.addEventListener(resetButton, 'click', () => {
                this.resetValues();
            });
        }
        
        // Botón guardar
        const saveButton = this.container.querySelector('#saveButton');
        if (saveButton) {
            this.addEventListener(saveButton, 'click', () => {
                this.saveCalculation();
            });
        }
        
        // Botón compartir
        const shareButton = this.container.querySelector('#shareButton');
        if (shareButton) {
            this.addEventListener(shareButton, 'click', () => {
                this.shareCalculation();
            });
        }
        
        // Botón limpiar historial
        const clearHistoryButton = this.container.querySelector('#clearHistoryButton');
        if (clearHistoryButton) {
            this.addEventListener(clearHistoryButton, 'click', () => {
                this.clearHistory();
            });
        }
        
        // Botón retry
        const retryButton = this.container.querySelector('#retryButton');
        if (retryButton) {
            this.addEventListener(retryButton, 'click', () => {
                this.calculateWSJF();
            });
        }
    }

    /**
     * Resetea todos los valores a defaults
     */
    resetValues() {
        const defaults = {
            businessValue: 8,
            urgency: 5,
            riskReduction: 3,
            effort: 8
        };
        
        Object.entries(defaults).forEach(([key, value]) => {
            this.values[key] = value;
            const slider = this.container.querySelector(`#${key}`);
            if (slider) {
                slider.value = value;
                this.updateSliderDisplay(slider);
            }
        });
        
        this.calculateWSJF();
        this.showFeedback('🔄 Valores reseteados');
    }

    /**
     * Guarda el cálculo actual en el historial
     */
    saveCalculation() {
        const calculation = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            values: { ...this.values },
            wsjf: parseFloat(this.container.querySelector('#wsjfResult').textContent),
            description: this.generateCalculationDescription()
        };
        
        this.history.unshift(calculation);
        
        // Mantener solo los últimos N cálculos
        if (this.history.length > this.config.maxHistory) {
            this.history = this.history.slice(0, this.config.maxHistory);
        }
        
        this.saveHistory();
        this.updateHistoryUI();
        this.showFeedback('💾 Cálculo guardado');
    }

    /**
     * Genera descripción del cálculo
     */
    generateCalculationDescription() {
        const { businessValue, urgency, riskReduction, effort } = this.values;
        return `BV:${businessValue} + U:${urgency} + RR:${riskReduction} / E:${effort}`;
    }

    /**
     * Comparte el cálculo actual
     */
    async shareCalculation() {
        const wsjf = this.container.querySelector('#wsjfResult').textContent;
        const description = this.generateCalculationDescription();
        
        const shareData = {
            title: 'Cálculo WSJF',
            text: `Score WSJF: ${wsjf} (${description})`,
            url: window.location.href
        };
        
        try {
            if (navigator.share) {
                await navigator.share(shareData);
                this.showFeedback('📤 Compartido exitosamente');
            } else {
                // Fallback: copiar al clipboard
                await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
                this.showFeedback('📋 Copiado al clipboard');
            }
        } catch (error) {
            console.error('Error sharing:', error);
            this.showFeedback('❌ Error al compartir', 'error');
        }
    }

    /**
     * Carga historial desde localStorage
     */
    loadHistory() {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            this.history = stored ? JSON.parse(stored) : [];
            this.updateHistoryUI();
        } catch (error) {
            console.warn('Error loading history:', error);
            this.history = [];
        }
    }

    /**
     * Guarda historial en localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(this.history));
        } catch (error) {
            console.warn('Error saving history:', error);
        }
    }

    /**
     * Actualiza la UI del historial
     */
    updateHistoryUI() {
        if (!this.config.showHistory) return;
        
        const historyContainer = this.container.querySelector('#calculatorHistory');
        const historyList = this.container.querySelector('#historyList');
        
        if (!historyContainer || !historyList) return;
        
        if (this.history.length === 0) {
            historyContainer.style.display = 'none';
            return;
        }
        
        historyContainer.style.display = 'block';
        historyList.innerHTML = '';
        
        this.history.forEach(calc => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>WSJF: ${calc.wsjf}</strong>
                        <small style="display: block; color: var(--gray);">${calc.description}</small>
                    </div>
                    <div style="text-align: right;">
                        <small style="color: var(--gray);">${this.formatDate(calc.timestamp)}</small>
                    </div>
                </div>
            `;
            
            // Click para restaurar cálculo
            item.addEventListener('click', () => {
                this.loadCalculation(calc);
            });
            
            historyList.appendChild(item);
        });
    }

    /**
     * Carga un cálculo del historial
     */
    loadCalculation(calculation) {
        Object.entries(calculation.values).forEach(([key, value]) => {
            this.values[key] = value;
            const slider = this.container.querySelector(`#${key}`);
            if (slider) {
                slider.value = value;
                this.updateSliderDisplay(slider);
            }
        });
        
        this.calculateWSJF();
        this.showFeedback('📂 Cálculo restaurado');
    }

    /**
     * Limpia el historial
     */
    clearHistory() {
        if (confirm('¿Estás seguro de que quieres limpiar todo el historial?')) {
            this.history = [];
            this.saveHistory();
            this.updateHistoryUI();
            this.showFeedback('🗑️ Historial limpiado');
        }
    }

    /**
     * Formatea fecha para mostrar
     */
    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Muestra feedback al usuario
     */
    showFeedback(message, type = 'success') {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#EF4444' : 'var(--gradient-primary)'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
        `;
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }

    /**
     * Muestra estado de loading
     */
    showLoading() {
        const loading = this.container.querySelector('#calculatorLoading');
        if (loading) {
            loading.style.display = 'block';
        }
    }

    /**
     * Oculta estado de loading
     */
    hideLoading() {
        const loading = this.container.querySelector('#calculatorLoading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    /**
     * Muestra error
     */
    showError(message) {
        const error = this.container.querySelector('#calculatorError');
        if (error) {
            const errorMessage = error.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.textContent = message;
            }
            error.style.display = 'block';
        }
    }

    /**
     * Oculta error
     */
    hideError() {
        const error = this.container.querySelector('#calculatorError');
        if (error) {
            error.style.display = 'none';
        }
    }

    /**
     * Tracking de analytics
     */
    trackCalculation(wsjf) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'wsjf_calculation', {
                event_category: 'calculator',
                event_label: 'calculation_completed',
                value: Math.round(wsjf * 10) // Convert to integer for GA
            });
        }
    }

    /**
     * Helper para agregar event listeners con cleanup
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    /**
     * API pública para obtener valores actuales
     */
    getValues() {
        return { ...this.values };
    }

    /**
     * API pública para establecer valores
     */
    setValues(newValues) {
        Object.entries(newValues).forEach(([key, value]) => {
            if (this.values.hasOwnProperty(key)) {
                this.values[key] = this.getClosestFibonacci(value);
                const slider = this.container.querySelector(`#${key}`);
                if (slider) {
                    slider.value = this.values[key];
                    this.updateSliderDisplay(slider);
                }
            }
        });
        
        this.calculateWSJF();
    }

    /**
     * API pública para obtener resultado WSJF actual
     */
    getWSJF() {
        const resultElement = this.container.querySelector('#wsjfResult');
        return resultElement ? parseFloat(resultElement.textContent) : 0;
    }

    /**
     * Destructor para cleanup
     */
    destroy() {
        // Cleanup event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        
        // Clear timeouts
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
        
        // Clear arrays
        this.eventListeners = [];
        this.history = [];
        
        console.log('🧮 WSJF Calculator destroyed');
    }
}

// Export para uso como módulo
export default WSJFCalculator;