/**
 * SCRUM Guide - Unified Tab System
 * Solución unificada para navegación de tabs
 */

class ScrumTabManager {
    constructor() {
        this.activeTab = null;
        this.init();
    }

    init() {
        this.setupTabListeners();
        this.setupKeyboardNavigation();
        this.setupAccessibility();
    }

    setupTabListeners() {
        // Seleccionar TODOS los botones de tab en la página
        const tabButtons = document.querySelectorAll('.tab-button');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(button);
            });
        });

    }

    switchTab(clickedButton) {
        const tabName = clickedButton.getAttribute('data-tab');
        if (!tabName) return;

        // Encontrar el contenedor padre para evitar conflictos entre diferentes sets de tabs
        const container = clickedButton.closest('.example-container');
        if (!container) return;

        // Remover active de todos los botones en ESTE contenedor
        container.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
            btn.setAttribute('tabindex', '-1');
        });

        // Remover active de todos los contenidos en ESTE contenedor  
        container.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.setAttribute('aria-hidden', 'true');
        });

        // Activar el botón clickeado
        clickedButton.classList.add('active');
        clickedButton.setAttribute('aria-selected', 'true');
        clickedButton.setAttribute('tabindex', '0');

        // Mostrar el contenido correspondiente
        const targetContent = document.getElementById(tabName);
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.setAttribute('aria-hidden', 'false');
            
            // Trigger animation
            this.animateTabContent(targetContent);
        }

        this.activeTab = tabName;
    }

    animateTabContent(content) {
        // Reset animation
        content.style.animation = 'none';
        content.offsetHeight; // Force reflow
        content.style.animation = 'fadeIn 0.5s ease';

        // Animate child elements with stagger effect
        const children = content.querySelectorAll('div, ul, p, h4, h5, h6');
        children.forEach((child, index) => {
            if (index < 10) { // Limit to first 10 elements for performance
                child.style.opacity = '0';
                child.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    child.style.transition = 'all 0.3s ease';
                    child.style.opacity = '1';
                    child.style.transform = 'translateY(0)';
                }, index * 50);
            }
        });
    }

    setupKeyboardNavigation() {
        document.querySelectorAll('.tab-button').forEach((button, index, buttons) => {
            button.addEventListener('keydown', (e) => {
                // Solo procesar si es parte del mismo contenedor
                const container = button.closest('.example-container');
                const containerButtons = Array.from(container.querySelectorAll('.tab-button'));
                const currentIndex = containerButtons.indexOf(button);
                let targetIndex = currentIndex;

                switch(e.key) {
                    case 'ArrowRight':
                        e.preventDefault();
                        targetIndex = currentIndex < containerButtons.length - 1 ? currentIndex + 1 : 0;
                        break;
                    case 'ArrowLeft':
                        e.preventDefault();
                        targetIndex = currentIndex > 0 ? currentIndex - 1 : containerButtons.length - 1;
                        break;
                    case 'Home':
                        e.preventDefault();
                        targetIndex = 0;
                        break;
                    case 'End':
                        e.preventDefault();
                        targetIndex = containerButtons.length - 1;
                        break;
                    default:
                        return;
                }

                containerButtons[targetIndex].focus();
                this.switchTab(containerButtons[targetIndex]);
            });
        });
    }

    setupAccessibility() {
        document.querySelectorAll('.tab-button').forEach((button, index) => {
            button.setAttribute('role', 'tab');
            button.setAttribute('tabindex', button.classList.contains('active') ? '0' : '-1');
        });

        document.querySelectorAll('.tab-content').forEach((content, index) => {
            content.setAttribute('role', 'tabpanel');
            content.setAttribute('aria-labelledby', `tab-${index}`);
        });
    }

    // Método público para cambiar tabs programáticamente
    activateTab(tabName) {
        const button = document.querySelector(`[data-tab="${tabName}"]`);
        if (button) {
            this.switchTab(button);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.scrumTabManager = new ScrumTabManager();
    });
} else {
    window.scrumTabManager = new ScrumTabManager();
}

// Export for use in other modules
window.ScrumTabManager = ScrumTabManager;