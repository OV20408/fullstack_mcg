document.addEventListener('DOMContentLoaded', function() {
    const loader = document.querySelector('.page-transition-loader');
    const links = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"]):not([href^="javascript:"]):not([href*=".pdf"]):not([href*=".doc"]):not([href*=".docx"])');
    
    if (loader) {
        loader.classList.remove('active');
    }
    
    function hideLoader() {
        if (loader) {
            loader.classList.remove('active');
        }
    }
    
    function showLoader() {
        if (loader) {
            loader.classList.add('active');
        }
    }
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            // Solo activar para enlaces que llevan a otras páginas del mismo sitio
            if (this.href && this.href.indexOf(window.location.hostname) !== -1 &&
                this.href !== window.location.href) {
                e.preventDefault();
                showLoader();
                
                sessionStorage.setItem('navigationInProgress', 'true');
                
                setTimeout(() => {
                    window.location.href = this.href;
                }, 1000);
            }
        });
    });
    
    window.addEventListener('load', function() {
        setTimeout(hideLoader, 300);
    });
    
    window.addEventListener('pageshow', function(event) {
        if (event.persisted) {
            hideLoader();
        }
    });
    
    window.addEventListener('popstate', function() {
        hideLoader();
    });
    
    document.addEventListener('DOMContentLoaded', function() {
        if (sessionStorage.getItem('navigationInProgress') !== 'true') {
            hideLoader();
        }
        sessionStorage.removeItem('navigationInProgress');
    });
    
    // SOLUCIÓN DE RESERVA: Ocultar loader si está visible después de cierto tiempo
    setTimeout(function() {
        if (loader && loader.classList.contains('active')) {
            hideLoader();
        }
    }, 3000);
    
    // SOLUCIÓN EXTRA: Detectar visibilidad de la página
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
            hideLoader();
        }
    });
});