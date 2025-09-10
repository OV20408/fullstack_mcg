// js/slider.js
document.addEventListener('DOMContentLoaded', () => {
  /* -----------  CONSTANTES  ----------- */
  const DELAY          = 5000;           // ms entre cambios automáticos
  const FADE_TIME      = 1000;           // ms de la transición CSS (opacity)
  const PAUSE_ON_HOVER = true;           // ponlo en false si no lo quieres
  const MAX_LOAD_WAIT  = 2000;           // tiempo máximo de espera para las imágenes

  /* -----------  ELEMENTOS  ------------ */
  const slides      = [...document.querySelectorAll('.hero-slide')];
  const indicators  = [...document.querySelectorAll('.indicator')];
  const subtitles   = [...document.querySelectorAll('.hero-subtitle')];
  const prevBtn     = document.querySelector('.hero-control.prev');
  const nextBtn     = document.querySelector('.hero-control.next');
  const playPauseBtn= document.querySelector('.hero-control.pause-play');
  
  if (!slides.length || !prevBtn || !nextBtn) return;   // no hay carrusel

  let index          = 0;      // slide actual
  let autoTimer      = null;   // id del setInterval
  let locked         = false;  // evita clics durante la animación
  let playing        = true;   // estado de autoplay
  let initialized    = false;  // control de inicialización

  const checkImageLoaded = (img) => {
    return img.complete && img.naturalHeight !== 0;
  };

  const preloadImages = () => {
    return new Promise((resolve) => {
      const images = slides.map(slide => slide.querySelector('img')).filter(img => img);
      
      if (images.length === 0) {
        resolve();
        return;
      }

      let loadedCount = 0;
      const totalImages = images.length;
      
      // Timeout de seguridad
      const timeoutId = setTimeout(() => {
        console.warn('Timeout alcanzado, iniciando carrusel de todas formas');
        resolve();
      }, MAX_LOAD_WAIT);

      const checkAllLoaded = () => {
        loadedCount++;
        if (loadedCount >= totalImages) {
          clearTimeout(timeoutId);
          resolve();
        }
      };

      images.forEach(img => {
        if (checkImageLoaded(img)) {
          checkAllLoaded();
        } else {
          const onLoad = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            checkAllLoaded();
          };
          
          const onError = () => {
            img.removeEventListener('load', onLoad);
            img.removeEventListener('error', onError);
            console.warn('Error cargando imagen:', img.src);
            checkAllLoaded(); // Continuar aunque falle una imagen
          };
          
          img.addEventListener('load', onLoad);
          img.addEventListener('error', onError);
          
          if (!img.src) {
            console.warn('Imagen sin src válida:', img);
            checkAllLoaded();
          }
        }
      });
    });
  };

  const lock = () => { 
    locked = true; 
    setTimeout(() => locked = false, FADE_TIME); 
  };

  const updateUI = () => {
    // Actualizar slides
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === index);
    });
    
    // Actualizar indicadores
    indicators.forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
    
    // Actualizar textos dinámicos
    subtitles.forEach((subtitle, i) => {
      subtitle.classList.toggle('active', i === index);
    });
  };

  const goTo = i => {
    if (locked || i === index || !initialized) return;
    lock();
    index = (i + slides.length) % slides.length;
    updateUI();
  };

  const next  = () => goTo(index + 1);
  const prev  = () => goTo(index - 1);

  const startAuto = () => {
    if (!initialized) return;
    clearInterval(autoTimer);
    autoTimer = setInterval(next, DELAY);
    playing = true;
    togglePlayPauseIcon();
  };

  const stopAuto = () => {
    clearInterval(autoTimer);
    playing = false;
    togglePlayPauseIcon();
  };

  const resetAuto = () => {
    if (playing && initialized) {
      startAuto();
    }
  };

  const togglePlayPauseIcon = () => {
    if (!playPauseBtn) return;
    const icon = playPauseBtn.querySelector('i');
    if (playing) {
      icon.className = 'fas fa-pause';
      playPauseBtn.setAttribute('aria-label', 'Pausar carrusel');
    } else {
      icon.className = 'fas fa-play';
      playPauseBtn.setAttribute('aria-label', 'Reanudar carrusel');
    }
  };

  const isOnHeroPage = () => {
    return document.querySelector('.hero') !== null;
  };

  const initCarousel = async () => {
    if (!isOnHeroPage()) {
      console.log('No se encontró elemento hero, saltando inicialización');
      return;
    }

    const hero = document.querySelector('.hero');
    
    try {
      updateUI();
      
      await preloadImages();
      
      // Marcar como inicializado
      initialized = true;
      
      setTimeout(() => {
        if (initialized && isOnHeroPage()) {
          startAuto();
          hero.classList.remove('loading');
          console.log('Carrusel inicializado correctamente');
        }
      }, 100);
      
    } catch (error) {
      console.warn('Error durante la inicialización:', error);
      initialized = true;
      updateUI();
      startAuto();
      hero.classList.remove('loading');
    }
  };

  const setupEventListeners = () => {
    nextBtn.addEventListener('click', e => { 
      e.preventDefault(); 
      if (initialized) {
        next(); 
        resetAuto(); 
      }
    });
    
    prevBtn.addEventListener('click', e => { 
      e.preventDefault(); 
      if (initialized) {
        prev(); 
        resetAuto(); 
      }
    });

    // Indicadores
    indicators.forEach((dot, i) =>
      dot.addEventListener('click', e => { 
        e.preventDefault(); 
        if (initialized) {
          goTo(i); 
          resetAuto(); 
        }
      })
    );

    // Play/pause opcional
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', e => {
        e.preventDefault();
        if (initialized) {
          playing ? stopAuto() : startAuto();
        }
      });
    }

    // Teclado (← → y barra espaciadora)
    document.addEventListener('keydown', e => {
      if (!initialized || !isOnHeroPage()) return;
      
      if (e.key === 'ArrowLeft')  { prev(); resetAuto(); }
      if (e.key === 'ArrowRight') { next(); resetAuto(); }
      if (e.code === 'Space' && playPauseBtn) { 
        e.preventDefault(); 
        playPauseBtn.click(); 
      }
    });

    // Pausa/reanuda al cambiar de pestaña
    document.addEventListener('visibilitychange', () => {
      if (!initialized || !isOnHeroPage()) return;
      document.hidden ? stopAuto() : startAuto();
    });

    // Pausa/reanuda al pasar el ratón
    if (PAUSE_ON_HOVER) {
      const hero = document.querySelector('.hero');
      if (hero) {
        hero.addEventListener('mouseenter', () => {
          if (initialized) stopAuto();
        });
        hero.addEventListener('mouseleave', () => {
          if (initialized) startAuto();
        });
      }
    }

    // Manejar cambio de tamaño de ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (initialized && isOnHeroPage()) {
          updateUI();
        }
      }, 250);
    });
  };

  // Limpiar al salir de la página
  const cleanup = () => {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
    initialized = false;
    playing = false;
  };

  window.addEventListener('beforeunload', cleanup);
  
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cleanup();
    }
  });

  /* -------- INICIALIZACIÓN ------------ */
  // Configurar event listeners una sola vez
  setupEventListeners();
  
  // Inicializar el carrusel
  initCarousel();
  
  /* ---- DEBUG INFO (remover en producción) ---- */
  window.carouselDebug = {
    getIndex: () => index,
    getInitialized: () => initialized,
    getPlaying: () => playing,
    forceInit: initCarousel,
    cleanup: cleanup
  };
});