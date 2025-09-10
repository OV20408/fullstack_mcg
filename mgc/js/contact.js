// js/contact.js

document.addEventListener('DOMContentLoaded', function () {
  // --- Utilidades
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // Loader (por si queda activo)
  function hideLoader() {
    const loader = $('.page-transition-loader');
    if (loader) {
      loader.classList.remove('active');
      loader.style.display = 'none';
    }
  }

  // CORREGIDO: Funciones para bloquear/desbloquear scroll del body
  function lockBodyScroll() { 
    document.body.classList.add('modal-open'); 
  }
  
  function unlockBodyScroll() { 
    document.body.classList.remove('modal-open'); 
  }

  // --- Referencias formulario
  const form = $('#contactForm');
  const telefonoInput = $('#telefono');
  const errorMsg = $('#error-msg');
  const successMsg = $('#success-msg');

  // --- Validación teléfono (mantengo tu lógica)
  function validarTelefono(valor) {
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    return soloNumeros.length >= 7 && soloNumeros.length <= 12;
  }

  if (telefonoInput && errorMsg && successMsg) {
    // Input
    telefonoInput.addEventListener('input', function (e) {
      const valorLimpio = e.target.value.replace(/[^0-9]/g, '');
      e.target.value = valorLimpio;

      if (valorLimpio.length === 0) {
        telefonoInput.classList.remove('valid', 'invalid');
        errorMsg.style.display = 'none';
        successMsg.style.display = 'none';
      } else if (validarTelefono(valorLimpio)) {
        telefonoInput.classList.remove('invalid');
        telefonoInput.classList.add('valid');
        errorMsg.style.display = 'none';
        successMsg.style.display = 'block';
      } else {
        telefonoInput.classList.remove('valid');
        telefonoInput.classList.add('invalid');
        errorMsg.style.display = 'block';
        successMsg.style.display = 'none';
      }
    });

    // Paste
    telefonoInput.addEventListener('paste', function (e) {
      e.preventDefault();
      const paste = (e.clipboardData || window.clipboardData).getData('text');
      const soloNumeros = paste.replace(/[^0-9]/g, '');
      if (soloNumeros.length <= 12) {
        e.target.value = soloNumeros;
        e.target.dispatchEvent(new Event('input'));
      }
    });

    // Keypress
    telefonoInput.addEventListener('keypress', function (e) {
      const char = String.fromCharCode(e.which);
      if (!/[0-9]/.test(char) && !isSpecialKey(e)) {
        e.preventDefault();
      }
    });

    function isSpecialKey(e) {
      return (
        e.key === 'Backspace' ||
        e.key === 'Delete' ||
        e.key === 'Tab' ||
        e.key === 'Enter' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        (e.ctrlKey && (e.key === 'a' || e.key === 'c' || e.key === 'v' || e.key === 'x'))
      );
    }
  }

  // --- Modales (éxito / error) - CORREGIDO
  const successOverlay = $('#modal-contacto-success');
  const errorOverlay = $('#modal-contacto-error');

  function showSuccessModal() {
    console.log("Showing success modal...");
    hideLoader();
    if (!successOverlay) return;
    successOverlay.classList.add('show');
    lockBodyScroll(); // Bloquear scroll
    setTimeout(hideSuccessModal, 3000); // Auto-cierre en 3 segundos
  }

  function showErrorModal() {
    console.log("Showing error modal...");
    hideLoader();
    if (!errorOverlay) return;
    errorOverlay.classList.add('show');
    lockBodyScroll(); // Bloquear scroll
    setTimeout(hideErrorModal, 3000); // Auto-cierre en 3 segundos
  }

  function hideSuccessModal() {
    if (!successOverlay) return;
    successOverlay.classList.remove('show');
    unlockBodyScroll(); // CORREGIDO: Desbloquear scroll
  }

  function hideErrorModal() {
    if (!errorOverlay) return;
    errorOverlay.classList.remove('show');
    unlockBodyScroll(); // CORREGIDO: Desbloquear scroll
  }

  // CORREGIDO: Remover código duplicado y mejorar eventos
  // Cerrar clickeando el overlay
  if (successOverlay) {
    successOverlay.addEventListener('click', (e) => {
      if (e.target === successOverlay) {
        hideSuccessModal();
      }
    });
  }
  
  if (errorOverlay) {
    errorOverlay.addEventListener('click', (e) => {
      if (e.target === errorOverlay) {
        hideErrorModal();
      }
    });
  }

  // Cerrar con Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (successOverlay && successOverlay.classList.contains('show')) {
        hideSuccessModal();
      }
      if (errorOverlay && errorOverlay.classList.contains('show')) {
        hideErrorModal();
      }
    }
  });

  // --- Envío del formulario
  async function handleSubmit(event) {
    event.preventDefault();
    if (!form) return;

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando...';
    }

    const payload = {
      nombreCompleto: form.nombre_completo.value,
      correoElectronico: form.email.value,
      telefono: form.telefono.value,
      asunto: form.asunto.value,
      mensaje: form.mensaje.value
    };

    try {
      const resp = await fetch('/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || 'Error al enviar el mensaje');
      }

      // Éxito
      showSuccessModal();
      form.reset();
      
      // CORREGIDO: Resetear también los estados de validación del teléfono
      if (telefonoInput) {
        telefonoInput.classList.remove('valid', 'invalid');
      }
      if (errorMsg) errorMsg.style.display = 'none';
      if (successMsg) successMsg.style.display = 'none';
      
    } catch (err) {
      console.error('FAILED...', err);
      showErrorModal();
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Enviar Mensaje';
      }
    }
  }

  if (form) form.addEventListener('submit', handleSubmit);
});