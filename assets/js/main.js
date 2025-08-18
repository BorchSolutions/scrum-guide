/**
 * SCRUM Guide - Main JavaScript
 * Core functionality and initialization
 */

class ScrumGuide {
    constructor() {
        this.init();
    }

    init() {
        this.setupLoader();
        this.setupSmoothScrolling();
        this.setupNavbar();
        this.setupRevealAnimations();
        this.setupMetricAnimations();
        this.setupMobileMenu();
        
        console.log('🚀 SCRUM Pro Guide loaded successfully!');
    }

    /**
     * Loader functionality
     */
    setupLoader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loader = document.getElementById('loader');
                if (loader) {
                    loader.classList.add('hidden');
                }
            }, 1000);
        });
    }

    /**
     * Smooth scrolling for navigation links
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    /**
     * Navbar scroll effects
     */
    setupNavbar() {
        let lastScroll = 0;
        
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (!navbar) return;
            
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }

    /**
     * Reveal animations on scroll
     */
    setupRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal');
        
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    }

    /**
     * Animate metric values when they come into view
     */
    setupMetricAnimations() {
        const animateValue = (element, start, end, duration) => {
            const startTime = performance.now();
            
            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const current = start + (end - start) * progress;
                
                // Format based on content type
                if (element.textContent.includes('%')) {
                    element.textContent = Math.floor(current) + '%';
                } else if (element.textContent.includes('★')) {
                    element.textContent = (current / 10).toFixed(1) + '★';
                } else if (element.textContent.includes('.')) {
                    element.textContent = current.toFixed(1);
                } else if (element.textContent.includes('x')) {
                    element.textContent = Math.floor(current) + 'x';
                } else {
                    element.textContent = Math.floor(current);
                }
                
                if (currentTime < startTime + duration) {
                    requestAnimationFrame(step);
                }
            };
            
            requestAnimationFrame(step);
        };

        // Observer for metric cards
        const metricObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    entry.target.classList.add('animated');
                    const text = entry.target.textContent;
                    let end = 0;
                    
                    // Parse the end value based on format
                    if (text.includes('%')) {
                        end = parseInt(text);
                    } else if (text.includes('★')) {
                        end = parseFloat(text) * 10;
                    } else if (text.includes('.')) {
                        end = parseFloat(text);
                    } else if (text.includes('x')) {
                        end = parseInt(text);
                    } else {
                        end = parseInt(text);
                    }
                    
                    if (!isNaN(end)) {
                        animateValue(entry.target, 0, end, 1500);
                    }
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.metric-value').forEach(el => {
            metricObserver.observe(el);
        });
    }

    /**
     * Mobile menu toggle
     */
    setupMobileMenu() {
        const menuToggle = document.getElementById('menuToggle');
        const navMenu = document.querySelector('.nav-menu');
        
        if (menuToggle && navMenu) {
            menuToggle.addEventListener('click', () => {
                navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
                
                // Animate hamburger menu
                menuToggle.classList.toggle('active');
            });

            // Close mobile menu when clicking on a link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth <= 768) {
                        navMenu.style.display = 'none';
                        menuToggle.classList.remove('active');
                    }
                });
            });

            // Close mobile menu on window resize
            window.addEventListener('resize', () => {
                if (window.innerWidth > 768) {
                    navMenu.style.display = 'flex';
                    menuToggle.classList.remove('active');
                }
            });
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScrumGuide();
});