// Utilidades básicas para el proyecto
const Utils = {
    // Cargar contenido HTML
    async loadHTML(url, containerId) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Error loading ${url}`);
            const html = await response.text();
            document.getElementById(containerId).innerHTML = html;
            return true;
        } catch (error) {
            console.error('Error loading HTML:', error);
            return false;
        }
    },

    // Scroll suave
    smoothScroll(targetId) {
        const target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    },

    // Mostrar/ocultar elementos
    toggle(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        }
    }
};

// Exportar para uso global
window.Utils = Utils;