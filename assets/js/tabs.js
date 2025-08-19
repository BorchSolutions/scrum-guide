
document.addEventListener('DOMContentLoaded', function() {
    // Delegación de eventos para manejar clics en botones de pestañas
    document.body.addEventListener('click', function(e) {
        // Asegurarse de que el clic fue en un botón de pestaña
        if (e.target.matches('.tab-button')) {
            const tabButton = e.target;
            const tabContainer = tabButton.closest('.example-tabs');
            
            // Si no se encuentra un contenedor, salir
            if (!tabContainer) return;

            const contentContainer = tabContainer.nextElementSibling.parentElement;

            // Actualizar estado de los botones
            tabContainer.querySelectorAll('.tab-button').forEach(button => {
                const isSelected = button === tabButton;
                button.classList.toggle('active', isSelected);
                button.setAttribute('aria-selected', isSelected);
            });

            // Ocultar todo el contenido de las pestañas de esa sección
            contentContainer.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });

            // Mostrar el contenido de la pestaña seleccionada
            const tabId = tabButton.getAttribute('data-tab');
            const targetContent = contentContainer.querySelector(`#${tabId}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        }
    });
});
