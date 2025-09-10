    //this is main.js
    document.addEventListener('DOMContentLoaded', function() {
        // Mobile menu toggle
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', function() {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }
        
        // Close mobile menu when clicking on links
        const navLinks = document.querySelectorAll('.nav-menu a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            });
        });
        
        // // Hero slider functionality
        // const heroSlides = document.querySelectorAll('.hero-slide');
        // if (heroSlides.length > 1) {
        //     let currentSlide = 0;
            
        //     function nextSlide() {
        //         heroSlides[currentSlide].classList.remove('active');
        //         currentSlide = (currentSlide + 1) % heroSlides.length;
        //         heroSlides[currentSlide].classList.add('active');
        //     }
            
        //     // Auto-advance slides every 5 seconds
        //     setInterval(nextSlide, 5000);
        // }
        
        const anchorLinks = document.querySelectorAll('a[href^="#"]');
        anchorLinks.forEach(link => {
            link.addEventListener('click', function(e) {
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
        
        const header = document.querySelector('.header');
        if (header) {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 100) {
                    header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                    header.style.backdropFilter = 'blur(10px)';
                } else {
                    header.style.backgroundColor = 'var(--white)';
                    header.style.backdropFilter = 'none';
                }
            });
        }
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'fadeInUp 0.8s ease-out forwards';
                }
            });
        }, observerOptions);
        
        const animatedElements = document.querySelectorAll('.service-card, .footer-section');
        animatedElements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            observer.observe(el);
        });
    });

    // Form validation for contact forms
    function validateForm(form) {
        const inputs = form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });
        
        // Email validation
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput && emailInput.value) {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailPattern.test(emailInput.value)) {
                isValid = false;
                emailInput.classList.add('error');
            }
        }
        
        return isValid;
    }

    // Modal functionality for client cards
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }



    function changeImage(mainId, imageName, element) {
        const mainImage = document.getElementById(mainId);
        if (mainImage) {
            mainImage.src = imageName;
        }
        if (element && element.parentElement) {
            const siblings = element.parentElement.querySelectorAll('.thumbnail');
            siblings.forEach(thumb => thumb.classList.remove('active'));
            element.classList.add('active');
        }
    }


    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const openModals = document.querySelectorAll('.modal[style*="block"]');
            openModals.forEach(modal => {
                closeModal(modal.id);
            });
        }
    });




    document.addEventListener('DOMContentLoaded', function() {
        // Opciones del observer
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        // Callback para el observer
        const fadeInCallback = function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Opcional: dejar de observar después de la primera vez
                    // observer.unobserve(entry.target);
                } 
                
                else {
                }
            });
        };

        const fadeObserver = new IntersectionObserver(fadeInCallback, observerOptions);

        const elementsToFade = document.querySelectorAll(
            '.company-profile, .values-section, .experience-section, .team-member, .value-card'
        );

        elementsToFade.forEach(element => {
            element.classList.add('scroll-fade', 'scroll-fade-up');
            fadeObserver.observe(element);
        });
    });

// Botón back to top
document.addEventListener('DOMContentLoaded', function() {
    const backToTopButton = document.getElementById('backToTop');
    
    // Mostrar/ocultar botón según scroll
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    });
    
    // Función para volver al tope
    backToTopButton.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});