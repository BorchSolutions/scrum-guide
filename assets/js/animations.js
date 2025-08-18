/**
 * SCRUM Guide - Advanced Animations
 * Special effects, transitions, and interactive animations
 */

class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupParallaxEffects();
        this.setupHoverEffects();
        this.setupScrollAnimations();
        this.setupTypingEffects();
        this.setupParticleBackground();
        this.setupInteractiveElements();
    }

    /**
     * Setup parallax scrolling effects
     */
    setupParallaxEffects() {
        const parallaxElements = document.querySelectorAll('.hero-bg, .hierarchy-icon');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                if (element.classList.contains('hero-bg')) {
                    const rate = scrolled * -0.5;
                    element.style.transform = `translateY(${rate}px)`;
                } else if (element.classList.contains('hierarchy-icon')) {
                    const rect = element.getBoundingClientRect();
                    const rate = (rect.top - window.innerHeight) * 0.1;
                    element.style.transform = `translateY(${rate}px) rotateY(${rate * 0.1}deg)`;
                }
            });
        });
    }

    /**
     * Setup advanced hover effects
     */
    setupHoverEffects() {
        // Card tilt effect
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            });
        });

        // Button ripple effect
        document.querySelectorAll('.hero-cta, .tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });

        // Metric card pulse on hover
        document.querySelectorAll('.metric-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.animation = 'pulse 1s ease infinite';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.animation = '';
            });
        });
    }

    /**
     * Create ripple effect on button click
     */
    createRipple(event, element) {
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - element.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - element.offsetTop - radius}px`;
        circle.classList.add('ripple');

        // Add CSS for ripple if not exists
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                .ripple {
                    position: absolute;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    pointer-events: none;
                }
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        const ripple = element.querySelector('.ripple');
        if (ripple) {
            ripple.remove();
        }

        element.appendChild(circle);
    }

    /**
     * Setup scroll-triggered animations
     */
    setupScrollAnimations() {
        // Stagger animations for lists
        const staggerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const items = entry.target.querySelectorAll('.task-card, .hierarchy-item, .metric-card');
                    items.forEach((item, index) => {
                        setTimeout(() => {
                            item.style.animation = 'slideInUp 0.6s ease forwards';
                            item.style.opacity = '1';
                        }, index * 100);
                    });
                }
            });
        }, { threshold: 0.2 });

        document.querySelectorAll('.board-columns, .hierarchy, .metrics-grid').forEach(container => {
            staggerObserver.observe(container);
        });

        // Counter animations
        this.setupCounterAnimations();
    }

    /**
     * Setup counter animations for metrics
     */
    setupCounterAnimations() {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    this.animateCounter(entry.target);
                }
            });
        }, { threshold: 0.8 });

        document.querySelectorAll('.metric-value').forEach(counter => {
            counterObserver.observe(counter);
        });
    }

    /**
     * Animate counter with easing
     */
    animateCounter(element) {
        const target = parseInt(element.textContent);
        if (isNaN(target)) return;

        const duration = 2000;
        const start = performance.now();
        const startValue = 0;

        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out-cubic)
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(startValue + (target - startValue) * ease);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = target;
            }
        };

        requestAnimationFrame(animate);
    }

    /**
     * Setup typing effect for hero title
     */
    setupTypingEffects() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '3px solid var(--primary)';

        let index = 0;
        const typeSpeed = 150;

        const type = () => {
            if (index < text.length) {
                heroTitle.textContent += text.charAt(index);
                index++;
                setTimeout(type, typeSpeed);
            } else {
                // Remove cursor after typing is complete
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                }, 500);
            }
        };

        // Start typing after a delay
        setTimeout(type, 1500);
    }

    /**
     * Setup particle background effect
     */
    setupParticleBackground() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        const canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '1';
        
        hero.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let particles = [];

        const resize = () => {
            canvas.width = hero.offsetWidth;
            canvas.height = hero.offsetHeight;
        };

        const createParticle = () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5
        });

        const init = () => {
            particles = [];
            for (let i = 0; i < 50; i++) {
                particles.push(createParticle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Wrap around edges
                if (particle.x > canvas.width) particle.x = 0;
                if (particle.x < 0) particle.x = canvas.width;
                if (particle.y > canvas.height) particle.y = 0;
                if (particle.y < 0) particle.y = canvas.height;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
                ctx.fill();
            });

            requestAnimationFrame(animate);
        };

        resize();
        init();
        animate();

        window.addEventListener('resize', resize);
    }

    /**
     * Setup interactive elements
     */
    setupInteractiveElements() {
        // Interactive task cards
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', '');
                card.style.opacity = '0.5';
            });

            card.addEventListener('dragend', () => {
                card.style.opacity = '1';
            });
        });

        // Drop zones for task cards
        document.querySelectorAll('.board-column').forEach(column => {
            column.addEventListener('dragover', (e) => {
                e.preventDefault();
                column.style.background = 'rgba(99, 102, 241, 0.1)';
            });

            column.addEventListener('dragleave', () => {
                column.style.background = '';
            });

            column.addEventListener('drop', (e) => {
                e.preventDefault();
                column.style.background = '';
                // Here you could implement actual task moving logic
                console.log('Task dropped in:', column.querySelector('.column-header').textContent);
            });
        });

        // Progress bars animation
        this.setupProgressBars();
    }

    /**
     * Setup animated progress bars
     */
    setupProgressBars() {
        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBars = entry.target.querySelectorAll('.progress-bar');
                    progressBars.forEach(bar => {
                        const width = bar.getAttribute('data-width');
                        bar.style.width = width + '%';
                    });
                }
            });
        });

        // You can add progress bars to metrics sections
        document.querySelectorAll('.metrics-dashboard').forEach(dashboard => {
            progressObserver.observe(dashboard);
        });
    }

    /**
     * Add loading animation to elements
     */
    addLoadingAnimation(element) {
        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        
        const shimmer = document.createElement('div');
        shimmer.className = 'shimmer';
        shimmer.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shimmer 1.5s infinite;
        `;
        
        element.appendChild(shimmer);
        
        // Add shimmer animation CSS if not exists
        if (!document.getElementById('shimmer-styles')) {
            const style = document.createElement('style');
            style.id = 'shimmer-styles';
            style.textContent = `
                @keyframes shimmer {
                    0% { left: -100%; }
                    100% { left: 100%; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Remove loading animation
     */
    removeLoadingAnimation(element) {
        const shimmer = element.querySelector('.shimmer');
        if (shimmer) {
            shimmer.remove();
        }
    }
}

// Initialize animations
document.addEventListener('DOMContentLoaded', () => {
    new AnimationManager();
});