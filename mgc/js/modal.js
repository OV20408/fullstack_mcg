// Funciones principales del modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = "block";
    setTimeout(() => {
        modal.classList.add("active");
    }, 10);
    document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove("active");
    setTimeout(() => {
        modal.style.display = "none";
        const mainImage = modal.querySelector('.main-image img');
        if (mainImage) {
            mainImage.classList.remove('zoomed');
        }
    }, 300);
    document.body.style.overflow = "auto";
}

function changeImage(mainId, src, element) {
    document.getElementById(mainId).src = src;
    
    // Actualizar miniaturas activas
    const thumbnails = element.parentElement.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumb => thumb.classList.remove('active'));
    element.classList.add('active');
    
    const mainImage = document.getElementById(mainId);
    mainImage.classList.remove('zoomed');
}

function toggleZoom(element) {
    const img = element.querySelector('img');
    img.classList.toggle('zoomed');
}

// Event listeners que se ejecutan cuando el DOM está listo
document.addEventListener('DOMContentLoaded', function() {
    
    // Event listeners para abrir modales (client cards)
    const clientCards = document.querySelectorAll('.client-card');
    clientCards.forEach(card => {
        card.addEventListener('click', function() {
            const modalId = this.getAttribute('data-modal');
            if (modalId) {
                openModal(modalId);
            }
        });
    });

    const modalLinks = document.querySelectorAll('[data-modal]');
    modalLinks.forEach(link => {
        // Solo procesar si NO es una client-card (para no duplicar funcionalidad)
        if (!link.classList.contains('client-card')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const modalId = this.getAttribute('data-modal');
                if (modalId) {
                    openModal(modalId);
                }
            });
        }
    });



    


    
// Event listeners para cerrar modales (botones de cierre)
const closeButtons = document.querySelectorAll('.modal .close, .modal-construccion-clientes .close');
closeButtons.forEach(button => {
    button.addEventListener('click', function() {
        const modal = this.closest('.modal') || this.closest('.modal-construccion-clientes');
        if (modal) {
            closeModal(modal.id);
        }
    });
});

    
    // Event listeners para cambiar imágenes (thumbnails)
    const thumbnails = document.querySelectorAll('.thumbnail');
    thumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            const mainImageId = this.getAttribute('data-main-image');
            const imageSrc = this.getAttribute('data-image-src');
            
            if (mainImageId && imageSrc) {
                changeImage(mainImageId, imageSrc, this);
            }
        });
    });
    
    // Event listeners para zoom en imágenes principales
    const mainImages = document.querySelectorAll('.main-image');
    mainImages.forEach(mainImage => {
        mainImage.addEventListener('click', function() {
            toggleZoom(this);
        });
    });
    
    // Event listener para cerrar modal al hacer clic fuera de él
    window.addEventListener('click', function(event) {
        document.querySelectorAll('.modal').forEach(modal => {
            if (event.target === modal) {
                closeModal(modal.id);
            }
        });
    });
    
    // Event listener para cerrar modal con tecla Escape
    document.addEventListener('keydown', function(evt) {
        evt = evt || window.event;
        if (evt.key === "Escape") {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.style.display === "block") {
                    closeModal(modal.id);
                }
            });
        }
    });
});

// Mantener compatibilidad con funciones globales (por si se usan en otro lugar)
window.openModal = openModal;
window.closeModal = closeModal;
window.changeImage = changeImage;
window.toggleZoom = toggleZoom;