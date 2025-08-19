
document.addEventListener('DOMContentLoaded', function() {
    // Delegación de eventos para manejar clics en botones de pestañas
    document.body.addEventListener('click', function(e) {
        // Asegurarse de que el clic fue en un botón de pestaña
        if (e.target.matches('.tab-button')) {
            const tabButton = e.target;
            const tabContainer = tabButton.closest('.example-tabs');
            const contentContainer = tabContainer.nextElementSibling.parentElement;

            // Remover la clase 'active' de todos los botones de la misma sección
            tabContainer.querySelectorAll('.tab-button').forEach(button => {
                button.classList.remove('active');
            });

            // Añadir 'active' al botón presionado
            tabButton.classList.add('active');

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
