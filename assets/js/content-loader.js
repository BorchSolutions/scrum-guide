/**
 * Content Loader - Sistema de carga dinámica de contenido
 */
class ContentLoader {
    // ... (constructor y otros métodos sin cambios) ...

    async loadSection(sectionId) {
        // ... (lógica de carga existente) ...

        try {
            // ... (fetch y render) ...

            // Llamar a inicializadores específicos de la sección
            this.initializeSectionScripts(sectionId);

        } catch (error) {
            // ... (manejo de errores) ...
        }
    }

    initializeSectionScripts(sectionId) {
        if (sectionId === 'scrum-foundations' && typeof setupSprintBoard === 'function') {
            setupSprintBoard();
        }
        
        if (sectionId === 'recursos-herramientas' && typeof setupPlanningPoker === 'function') {
            setupPlanningPoker();
        }
    }

    // ... (resto de la clase) ...
}

// ... (inicialización) ...
