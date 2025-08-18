/**
 * SCRUM Guide - Tabs Functionality
 * Handles all tab switching and content management
 */

class TabManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupTabListeners();
        this.setupKeyboardNavigation();
    }

    /**
     * Setup click listeners for all tab buttons
     */
    setupTabListeners() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target);
            });
        });
    }

    /**
     * Setup keyboard navigation for tabs (accessibility)
     */
    setupKeyboardNavigation() {
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('keydown', (e) => {
                const tabContainer = button.closest('.example-tabs');
                const tabs = tabContainer.querySelectorAll('.tab-button');
                const currentIndex = Array.from(tabs).indexOf(button);

                switch(e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
                        this.switchTab(tabs[prevIndex]);
                        tabs[prevIndex].focus();
                        break;
                    
                    case 'ArrowRight':
                        e.preventDefault();
                        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
                        this.switchTab(tabs[nextIndex]);
                        tabs[nextIndex].focus();
                        break;
                    
                    case 'Home':
                        e.preventDefault();
                        this.switchTab(tabs[0]);
                        tabs[0].focus();
                        break;
                    
                    case 'End':
                        e.preventDefault();
                        this.switchTab(tabs[tabs.length - 1]);
                        tabs[tabs.length - 1].focus();
                        break;
                }
            });
        });
    }

    /**
     * Switch to the specified tab
     * @param {HTMLElement} clickedButton - The tab button that was clicked
     */
    switchTab(clickedButton) {
        const tabName = clickedButton.getAttribute('data-tab');
        const tabContainer = clickedButton.closest('.example-container');
        
        if (!tabName || !tabContainer) return;

        // Remove active class from all buttons in this container
        tabContainer.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-selected', 'false');
        });
        
        // Remove active class from all content in this container
        tabContainer.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.setAttribute('aria-hidden', 'true');
        });
        
        // Add active class to clicked button
        clickedButton.classList.add('active');
        clickedButton.setAttribute('aria-selected', 'true');
        
        // Show corresponding content
        const targetContent = document.getElementById(tabName);
        if (targetContent) {
            targetContent.classList.add('active');
            targetContent.setAttribute('aria-hidden', 'false');
            
            // Trigger any animations or special handling for the new tab
            this.handleTabSpecialContent(tabName, targetContent);
        }

        // Analytics tracking (if needed)
        this.trackTabChange(tabName);
    }

    /**
     * Handle special content when tabs are switched
     * @param {string} tabName - Name of the activated tab
     * @param {HTMLElement} content - The content element
     */
    handleTabSpecialContent(tabName, content) {
        switch(tabName) {
            case 'code':
                // Trigger syntax highlighting if needed
                this.highlightCode(content);
                break;
            
            case 'metricas-proyecto':
                // Trigger metric animations
                this.animateMetrics(content);
                break;
            
            case 'planning-poker':
                // Initialize any interactive elements
                this.initializePlanningPoker(content);
                break;
        }
    }

    /**
     * Highlight code blocks in the tab content
     * @param {HTMLElement} content - The tab content
     */
    highlightCode(content) {
        const codeBlocks = content.querySelectorAll('.code-block pre');
        codeBlocks.forEach(block => {
            // Add syntax highlighting class if not already present
            if (!block.classList.contains('highlighted')) {
                block.classList.add('highlighted');
                
                // You could integrate with libraries like Prism.js or highlight.js here
                this.applySyntaxHighlighting(block);
            }
        });
    }

    /**
     * Apply basic syntax highlighting
     * @param {HTMLElement} codeBlock - The code block element
     */
    applySyntaxHighlighting(codeBlock) {
        let html = codeBlock.innerHTML;
        
        // Basic highlighting patterns
        const patterns = [
            { regex: /\/\*[\s\S]*?\*\/|\/\/.*$/gm, class: 'comment' },
            { regex: /\b(using|namespace|class|public|private|var|await|async|return|if|else|for|while|function|const|let)\b/g, class: 'keyword' },
            { regex: /"[^"]*"/g, class: 'string' },
            { regex: /\b\w+(?=\()/g, class: 'function' }
        ];
        
        patterns.forEach(pattern => {
            html = html.replace(pattern.regex, `<span class="${pattern.class}">$&</span>`);
        });
        
        codeBlock.innerHTML = html;
    }

    /**
     * Animate metrics when metrics tab is shown
     * @param {HTMLElement} content - The tab content
     */
    animateMetrics(content) {
        const metricCards = content.querySelectorAll('.metric-card');
        metricCards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transform = 'scale(1.05)';
                setTimeout(() => {
                    card.style.transform = 'scale(1)';
                }, 200);
            }, index * 100);
        });
    }

    /**
     * Initialize planning poker interactive elements
     * @param {HTMLElement} content - The tab content
     */
    initializePlanningPoker(content) {
        const cards = content.querySelectorAll('[style*="background: var(--gradient-primary)"]');
        
        cards.forEach(card => {
            if (!card.classList.contains('poker-card-interactive')) {
                card.classList.add('poker-card-interactive');
                card.style.cursor = 'pointer';
                card.style.transition = 'all 0.3s ease';
                
                card.addEventListener('click', () => {
                    // Remove selection from other cards
                    cards.forEach(c => c.classList.remove('selected'));
                    
                    // Add selection to clicked card
                    card.classList.add('selected');
                    card.style.transform = 'scale(1.1)';
                    
                    // Show selection feedback
                    this.showPokerSelection(card.textContent.trim());
                });
                
                card.addEventListener('mouseover', () => {
                    if (!card.classList.contains('selected')) {
                        card.style.transform = 'scale(1.05)';
                    }
                });
                
                card.addEventListener('mouseout', () => {
                    if (!card.classList.contains('selected')) {
                        card.style.transform = 'scale(1)';
                    }
                });
            }
        });
    }

    /**
     * Show poker card selection feedback
     * @param {string} value - Selected card value
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
                animation: fadeInUp 0.3s ease;
            `;
            document.body.appendChild(indicator);
        }
        
        indicator.textContent = `Tu estimación: ${value}`;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.style.animation = 'fadeOut 0.3s ease';
                setTimeout(() => {
                    indicator.remove();
                }, 300);
            }
        }, 3000);
    }

    /**
     * Track tab changes for analytics
     * @param {string} tabName - Name of the tab
     */
    trackTabChange(tabName) {
        // You can integrate with Google Analytics or other tracking here
        if (typeof gtag !== 'undefined') {
            gtag('event', 'tab_change', {
                'event_category': 'engagement',
                'event_label': tabName
            });
        }
        
        console.log(`📊 Tab switched to: ${tabName}`);
    }

    /**
     * Get the currently active tab in a container
     * @param {HTMLElement} container - The tab container
     * @returns {string|null} - The active tab name
     */
    getActiveTab(container) {
        const activeButton = container.querySelector('.tab-button.active');
        return activeButton ? activeButton.getAttribute('data-tab') : null;
    }

    /**
     * Programmatically switch to a specific tab
     * @param {string} tabName - Name of the tab to switch to
     * @param {HTMLElement} container - Optional container to search in
     */
    switchToTab(tabName, container = document) {
        const button = container.querySelector(`[data-tab="${tabName}"]`);
        if (button) {
            this.switchTab(button);
        }
    }
}

// Initialize tabs when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TabManager();
});