/**
 * Nesty Landing Page - JavaScript
 * Smooth interactions and animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initCounters();
    initScrollAnimations();
    initProgressAnimation();
});

/**
 * Navbar scroll effect
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
    const toggle = document.querySelector('.mobile-toggle');
    const menu = document.querySelector('.mobile-menu');
    const links = document.querySelectorAll('.mobile-menu-content a');

    if (!toggle || !menu) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Animated number counters
 */
function initCounters() {
    const counters = document.querySelectorAll('.proof-number');
    let animated = false;

    const animateCounters = () => {
        if (animated) return;

        const proofBar = document.querySelector('.proof-bar');
        if (!proofBar) return;

        const rect = proofBar.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

        if (isVisible) {
            animated = true;
            counters.forEach(counter => {
                const target = parseInt(counter.dataset.count, 10);
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const updateCounter = () => {
                    current += step;
                    if (current < target) {
                        counter.textContent = formatNumber(Math.floor(current));
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = formatNumber(target);
                        // Add + sign for large numbers
                        if (target >= 1000) {
                            counter.textContent += '+';
                        }
                        // Add % sign for percentage
                        if (counter.closest('.proof-item').querySelector('.proof-label').textContent.includes('%')) {
                            counter.textContent += '%';
                        }
                    }
                };

                updateCounter();
            });
        }
    };

    window.addEventListener('scroll', animateCounters);
    animateCounters(); // Check on load
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Scroll-triggered animations
 */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add animation class to elements
    const animateElements = document.querySelectorAll(
        '.step-card, .feature-card, .category-card-new, .testimonial-card, .problem-item, .solution-item'
    );

    animateElements.forEach((el, index) => {
        el.classList.add('animate-on-scroll');
        el.style.transitionDelay = `${index % 4 * 100}ms`;
        observer.observe(el);
    });
}

/**
 * Progress ring animation
 */
function initProgressAnimation() {
    const progressFill = document.querySelector('.progress-fill');
    if (!progressFill) return;

    // Re-trigger animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                progressFill.style.animation = 'none';
                progressFill.offsetHeight; // Trigger reflow
                progressFill.style.animation = 'progressFill 2s ease-out forwards';
            }
        });
    }, { threshold: 0.5 });

    observer.observe(progressFill);

    // Animate category bars
    const catBars = document.querySelectorAll('.cat-fill');
    const barObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'none';
                entry.target.offsetHeight;
                entry.target.style.animation = 'barFill 1.5s ease-out forwards';
            }
        });
    }, { threshold: 0.5 });

    catBars.forEach(bar => barObserver.observe(bar));
}

/**
 * Add subtle parallax effect to floating cards
 */
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.floating-card');
    const mouseX = e.clientX / window.innerWidth - 0.5;
    const mouseY = e.clientY / window.innerHeight - 0.5;

    cards.forEach((card, index) => {
        const speed = (index + 1) * 10;
        const x = mouseX * speed;
        const y = mouseY * speed;
        card.style.transform = `translate(${x}px, ${y}px)`;
    });
});

/**
 * Add hover effect to CTA buttons
 */
document.querySelectorAll('.btn-hero, .btn-secondary').forEach(btn => {
    btn.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
    });

    btn.addEventListener('mouseleave', function() {
        this.style.transition = 'all 0.25s ease';
    });
});

/**
 * Lazy load images
 */
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * Add stagger animation to sections
 */
function addStaggerAnimation(selector, delay = 100) {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
        el.style.animationDelay = `${index * delay}ms`;
    });
}

// Apply stagger to grid items
addStaggerAnimation('.categories-grid .category-card-new', 50);
addStaggerAnimation('.steps-grid .step-card', 150);
addStaggerAnimation('.features-grid .feature-card', 100);
addStaggerAnimation('.testimonials-grid .testimonial-card', 100);
