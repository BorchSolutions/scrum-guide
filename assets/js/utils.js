/**
 * SCRUM Guide - Utilities and Helpers
 * Common functions, data management, and utility classes
 */

class Utils {
    /**
     * Debounce function execution
     */
    static debounce(func, wait, immediate = false) {
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
    }

    /**
     * Throttle function execution
     */
    static throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Check if element is in viewport
     */
    static isInViewport(element, threshold = 0) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= -threshold &&
            rect.left >= -threshold &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth) + threshold
        );
    }

    /**
     * Get random number between min and max
     */
    static random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Format number with commas
     */
    static formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    /**
     * Copy text to clipboard
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                return true;
            } catch (fallbackErr) {
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    /**
     * Local storage wrapper with error handling
     */
    static storage = {
        set: (key, value) => {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('LocalStorage not available:', error);
                return false;
            }
        },
        
        get: (key, defaultValue = null) => {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (error) {
                console.warn('Error reading from localStorage:', error);
                return defaultValue;
            }
        },
        
        remove: (key) => {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('Error removing from localStorage:', error);
                return false;
            }
        }
    };
}

/**
 * Data management for SCRUM examples and configurations
 */
class DataManager {
    static fibonacciScale = [1, 2, 3, 5, 8, 13, 21, 34];
    
    static storyPointExamples = {
        1: ['Cambiar texto UI', 'Actualizar constante', 'Corregir typo'],
        2: ['Validación required', 'Pipe simple Angular', 'Endpoint GET básico'],
        3: ['Formulario 3-4 campos', 'Paginación tabla', 'Loading spinner'],
        5: ['CRUD entidad simple', 'Auth JWT Angular', 'Reporte con filtros'],
        8: ['Upload con preview', 'Dashboard gráficos', 'API externa'],
        13: ['Migrar Angular 15→17', 'Permisos granular', 'Wizard complejo'],
        21: ['i18n completa', 'Reportes dinámicos', 'PWA offline']
    };

    static sprintData = {
        current: {
            committed: 42,
            completed: 28,
            remaining: 5,
            velocity: 39,
            bugs: 2.3,
            satisfaction: 4.5
        },
        historical: [
            { sprint: 1, committed: 35, completed: 32, velocity: 32 },
            { sprint: 2, committed: 40, completed: 38, velocity: 38 },
            { sprint: 3, committed: 45, completed: 42, velocity: 42 },
            { sprint: 4, committed: 42, completed: 39, velocity: 39 },
            { sprint: 5, committed: 44, completed: 42, velocity: 44 }
        ]
    };

    /**
     * Get story point examples for a specific value
     */
    static getExamplesForStoryPoints(points) {
        return this.storyPointExamples[points] || [];
    }

    /**
     * Calculate velocity trend
     */
    static getVelocityTrend() {
        const velocities = this.sprintData.historical.map(s => s.velocity);
        const recent = velocities.slice(-3);
        const average = recent.reduce((a, b) => a + b, 0) / recent.length;
        return Math.round(average * 10) / 10;
    }

    /**
     * Get next fibonacci number
     */
    static getNextFibonacci(current) {
        const index = this.fibonacciScale.indexOf(current);
        return index !== -1 && index < this.fibonacciScale.length - 1 
            ? this.fibonacciScale[index + 1] 
            : null;
    }

    /**
     * Validate if number is in fibonacci scale
     */
    static isValidFibonacci(number) {
        return this.fibonacciScale.includes(number);
    }
}

/**
 * Planning Poker utilities
 */
class PlanningPoker {
    constructor() {
        this.participants = [];
        this.currentStory = null;
        this.votes = new Map();
    }

    /**
     * Add participant to poker session
     */
    addParticipant(name) {
        if (!this.participants.includes(name)) {
            this.participants.push(name);
            return true;
        }
        return false;
    }

    /**
     * Remove participant from poker session
     */
    removeParticipant(name) {
        const index = this.participants.indexOf(name);
        if (index > -1) {
            this.participants.splice(index, 1);
            this.votes.delete(name);
            return true;
        }
        return false;
    }

    /**
     * Start a new voting round
     */
    startVoting(storyTitle, storyDescription) {
        this.currentStory = { title: storyTitle, description: storyDescription };
        this.votes.clear();
        return true;
    }

    /**
     * Cast a vote
     */
    vote(participant, points) {
        if (!this.participants.includes(participant)) {
            return false;
        }
        
        if (!DataManager.isValidFibonacci(points) && points !== '?' && points !== '☕') {
            return false;
        }

        this.votes.set(participant, points);
        return true;
    }

    /**
     * Check if all participants have voted
     */
    allVoted() {
        return this.votes.size === this.participants.length;
    }

    /**
     * Get voting results
     */
    getResults() {
        const votes = Array.from(this.votes.values());
        const numericVotes = votes.filter(v => typeof v === 'number');
        
        if (numericVotes.length === 0) {
            return { consensus: false, needsDiscussion: true };
        }

        const uniqueVotes = [...new Set(numericVotes)];
        
        if (uniqueVotes.length === 1) {
            return { 
                consensus: true, 
                result: uniqueVotes[0],
                needsDiscussion: false 
            };
        }

        const min = Math.min(...numericVotes);
        const max = Math.max(...numericVotes);
        const spread = max - min;
        
        return {
            consensus: false,
            needsDiscussion: spread > 5, // If spread is more than 5 points
            suggested: Math.max(...numericVotes), // Conservative approach
            votes: Object.fromEntries(this.votes)
        };
    }

    /**
     * Reset poker session
     */
    reset() {
        this.currentStory = null;
        this.votes.clear();
    }
}

/**
 * Theme manager for dark/light mode
 */
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.createThemeToggle();
    }

    getStoredTheme() {
        return Utils.storage.get('scrumGuideTheme');
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        Utils.storage.set('scrumGuideTheme', theme);
        this.currentTheme = theme;
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        return newTheme;
    }

    createThemeToggle() {
        const toggle = document.createElement('button');
        toggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
        toggle.className = 'theme-toggle';
        toggle.style.cssText = `
            position: fixed;
            top: 50%;
            right: 20px;
            z-index: 1000;
            background: var(--gradient-primary);
            border: none;
            border-radius: 50px;
            padding: 0.8rem;
            font-size: 1.2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            transform: translateY(-50%);
        `;

        toggle.addEventListener('click', () => {
            this.toggleTheme();
            toggle.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
        });

        document.body.appendChild(toggle);
    }
}

/**
 * Performance monitor
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        this.measurePageLoad();
        this.measureInteractions();
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            this.metrics.pageLoad = {
                domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
                totalTime: perfData.loadEventEnd - perfData.fetchStart
            };
        });
    }

    measureInteractions() {
        let clickCount = 0;
        let scrollCount = 0;

        document.addEventListener('click', () => {
            clickCount++;
        });

        window.addEventListener('scroll', Utils.throttle(() => {
            scrollCount++;
        }, 100));

        setInterval(() => {
            this.metrics.interactions = { clickCount, scrollCount };
        }, 30000); // Update every 30 seconds
    }

    getMetrics() {
        return this.metrics;
    }
}

/**
 * Export utilities
 */
class ExportManager {
    /**
     * Export content as PDF (using browser print)
     */
    static exportAsPDF() {
        // Hide navigation and non-essential elements
        const elementsToHide = document.querySelectorAll('.nav, .hero, .loader');
        elementsToHide.forEach(el => el.style.display = 'none');

        // Trigger print dialog
        window.print();

        // Restore hidden elements
        setTimeout(() => {
            elementsToHide.forEach(el => el.style.display = '');
        }, 1000);
    }

    /**
     * Export sprint data as JSON
     */
    static exportSprintData() {
        const data = {
            exportDate: new Date().toISOString(),
            sprintData: DataManager.sprintData,
            storyPointExamples: DataManager.storyPointExamples
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scrum-data-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize utilities when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme manager
    window.themeManager = new ThemeManager();
    
    // Initialize performance monitoring
    window.performanceMonitor = new PerformanceMonitor();
    
    // Make utilities globally available
    window.Utils = Utils;
    window.DataManager = DataManager;
    window.PlanningPoker = PlanningPoker;
    window.ExportManager = ExportManager;
    
    console.log('🛠️ SCRUM Guide utilities loaded');
});