/**
 * Sprint Board Component
 * assets/js/components/sprint-board.js
 */

class SprintBoard {
    constructor(props = {}) {
        this.container = null;
        this.tasks = [];
        this.columns = [];
        this.draggedTask = null;
        this.editingTask = null;
        
        this.config = {
            title: props.title || 'Sprint Board Interactivo',
            subtitle: props.subtitle || 'Arrastra las tarjetas entre columnas para simular el flujo de trabajo',
            sprintName: props.sprintName || 'Sprint 1',
            sprintDates: props.sprintDates || '1 Nov - 15 Nov 2024',
            storageKey: props.storageKey || 'sprint-board-data',
            autoSave: props.autoSave !== false,
            defaultColumns: props.columns || [
                { id: 'backlog', title: '📋 Sprint Backlog', color: '#6366F1' },
                { id: 'progress', title: '🚧 En Progreso', color: '#F59E0B' },
                { id: 'review', title: '🔍 Code Review', color: '#EC4899' },
                { id: 'done', title: '✅ Done', color: '#10B981' }
            ],
            maxTasksPerColumn: props.maxTasksPerColumn || null,
            showMetrics: props.showMetrics !== false,
            allowTaskCreation: props.allowTaskCreation !== false,
            allowTaskEditing: props.allowTaskEditing !== false,
            onTaskMove: props.onTaskMove || null,
            onTaskCreate: props.onTaskCreate || null,
            onTaskEdit: props.onTaskEdit || null,
            onTaskDelete: props.onTaskDelete || null
        };
        
        this.eventListeners = [];
        this.observers = [];
        this.metrics = {
            totalSP: 0,
            completedSP: 0,
            progressPercentage: 0,
            daysRemaining: 7
        };
        
        this.init();
    }

    /**
     * Inicializa el componente
     */
    init() {
        this.findContainer();
        this.loadData();
        this.setupColumns();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.updateMetrics();
        this.updateUI();
        
        console.log('📋 Sprint Board initialized with', this.tasks.length, 'tasks');
    }

    /**
     * Encuentra el contenedor del componente
     */
    findContainer() {
        this.container = document.querySelector('[data-component="sprint-board"]');
        if (!this.container) {
            throw new Error('SprintBoard: Container not found');
        }
    }

    /**
     * Configura las columnas del board
     */
    setupColumns() {
        this.columns = [...this.config.defaultColumns];
        
        const columnsContainer = this.container.querySelector('#boardColumns');
        columnsContainer.innerHTML = '';

        this.columns.forEach(column => {
            const columnElement = this.createColumnElement(column);
            columnsContainer.appendChild(columnElement);
        });
    }

    /**
     * Crea un elemento de columna
     */
    createColumnElement(column) {
        const columnEl = document.createElement('div');
        columnEl.className = 'board-column';
        columnEl.dataset.columnId = column.id;
        
        const tasksInColumn = this.tasks.filter(task => task.status === column.id);
        
        columnEl.innerHTML = `
            <div class="column-header" style="border-color: ${column.color}">
                <span>${column.title}</span>
                <span class="column-count">${tasksInColumn.length}</span>
            </div>
            <div class="column-content" data-column="${column.id}">
                ${tasksInColumn.map(task => this.createTaskHTML(task)).join('')}
            </div>
        `;

        return columnEl;
    }

    /**
     * Crea HTML para una tarea
     */
    createTaskHTML(task) {
        const priorityClass = `priority ${task.priority}`;
        const typeIndicator = task.type || 'task';
        const tags = task.tags || [];
        
        return `
            <div class="task-card" 
                 draggable="true" 
                 data-task-id="${task.id}"
                 data-story-points="${task.storyPoints}">
                <div class="task-type-indicator ${typeIndicator}"></div>
                <div class="task-title">${this.escapeHtml(task.title)}</div>
                ${task.description ? `<div class="task-description">${this.escapeHtml(task.description)}</div>` : ''}
                <div class="task-meta">
                    <div class="task-meta-left">
                        <span class="story-points">${task.storyPoints} SP</span>
                        <span class="${priorityClass}">${this.getPriorityLabel(task.priority)}</span>
                    </div>
                    <div class="task-meta-right">
                        ${task.assignee ? `<span class="task-assignee">${this.escapeHtml(task.assignee)}</span>` : ''}
                    </div>
                </div>
                ${tags.length > 0 ? `
                    <div class="task-tags">
                        ${tags.map(tag => `<span class="task-tag">${this.escapeHtml(tag)}</span>`).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Configura event listeners principales
     */
    setupEventListeners() {
        // Botón agregar tarea
        const addTaskBtn = this.container.querySelector('#addTaskBtn');
        if (addTaskBtn) {
            this.addEventListener(addTaskBtn, 'click', () => {
                this.showTaskModal();
            });
        }

        // Botón reset board
        const resetBtn = this.container.querySelector('#resetBoardBtn');
        if (resetBtn) {
            this.addEventListener(resetBtn, 'click', () => {
                this.resetBoard();
            });
        }

        // Botón exportar
        const exportBtn = this.container.querySelector('#exportBoardBtn');
        if (exportBtn) {
            this.addEventListener(exportBtn, 'click', () => {
                this.exportBoardData();
            });
        }

        // Modal event listeners
        this.setupModalListeners();

        // Task click listeners (se configuran dinámicamente)
        this.setupTaskClickListeners();
    }

    /**
     * Configura listeners de los modals
     */
    setupModalListeners() {
        // Task creation modal
        const taskModal = this.container.querySelector('#taskModal');
        const taskForm = this.container.querySelector('#taskForm');
        const modalClose = this.container.querySelector('#modalClose');
        const cancelBtn = this.container.querySelector('#cancelTaskBtn');

        if (modalClose) {
            this.addEventListener(modalClose, 'click', () => {
                this.hideTaskModal();
            });
        }

        if (cancelBtn) {
            this.addEventListener(cancelBtn, 'click', () => {
                this.hideTaskModal();
            });
        }

        if (taskForm) {
            this.addEventListener(taskForm, 'submit', (e) => {
                e.preventDefault();
                this.handleTaskSubmit();
            });
        }

        // Task detail modal
        const detailModal = this.container.querySelector('#taskDetailModal');
        const detailClose = this.container.querySelector('#detailModalClose');
        const closeDetailBtn = this.container.querySelector('#closeDetailBtn');
        const editTaskBtn = this.container.querySelector('#editTaskBtn');
        const deleteTaskBtn = this.container.querySelector('#deleteTaskBtn');

        if (detailClose) {
            this.addEventListener(detailClose, 'click', () => {
                this.hideTaskDetailModal();
            });
        }

        if (closeDetailBtn) {
            this.addEventListener(closeDetailBtn, 'click', () => {
                this.hideTaskDetailModal();
            });
        }

        if (editTaskBtn) {
            this.addEventListener(editTaskBtn, 'click', () => {
                this.editCurrentTask();
            });
        }

        if (deleteTaskBtn) {
            this.addEventListener(deleteTaskBtn, 'click', () => {
                this.deleteCurrentTask();
            });
        }

        // Click outside modal to close
        if (taskModal) {
            this.addEventListener(taskModal, 'click', (e) => {
                if (e.target === taskModal || e.target.classList.contains('modal-overlay')) {
                    this.hideTaskModal();
                }
            });
        }

        if (detailModal) {
            this.addEventListener(detailModal, 'click', (e) => {
                if (e.target === detailModal || e.target.classList.contains('modal-overlay')) {
                    this.hideTaskDetailModal();
                }
            });
        }
    }

    /**
     * Configura drag and drop
     */
    setupDragAndDrop() {
        // Event listeners para todas las columnas
        this.container.querySelectorAll('.column-content').forEach(column => {
            this.addEventListener(column, 'dragover', this.handleDragOver.bind(this));
            this.addEventListener(column, 'drop', this.handleDrop.bind(this));
            this.addEventListener(column, 'dragenter', this.handleDragEnter.bind(this));
            this.addEventListener(column, 'dragleave', this.handleDragLeave.bind(this));
        });

        // Se configurarán listeners de tasks dinámicamente
        this.setupTaskDragListeners();
    }

    /**
     * Configura listeners de drag para tasks
     */
    setupTaskDragListeners() {
        this.container.querySelectorAll('.task-card').forEach(task => {
            this.addEventListener(task, 'dragstart', this.handleDragStart.bind(this));
            this.addEventListener(task, 'dragend', this.handleDragEnd.bind(this));
        });
    }

    /**
     * Configura listeners de click para tasks
     */
    setupTaskClickListeners() {
        this.container.querySelectorAll('.task-card').forEach(task => {
            this.addEventListener(task, 'click', (e) => {
                if (!e.target.closest('.task-actions')) {
                    const taskId = task.dataset.taskId;
                    this.showTaskDetail(taskId);
                }
            });
        });
    }

    /**
     * Maneja inicio de drag
     */
    handleDragStart(e) {
        this.draggedTask = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);
        e.dataTransfer.setData('text/plain', e.target.dataset.taskId);
    }

    /**
     * Maneja fin de drag
     */
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedTask = null;
        
        // Limpiar efectos visuales
        this.container.querySelectorAll('.board-column').forEach(col => {
            col.classList.remove('drag-over');
        });
    }

    /**
     * Maneja drag over
     */
    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }

    /**
     * Maneja drag enter
     */
    handleDragEnter(e) {
        const column = e.target.closest('.board-column');
        if (column) {
            column.classList.add('drag-over');
        }
    }

    /**
     * Maneja drag leave
     */
    handleDragLeave(e) {
        const column = e.target.closest('.board-column');
        if (column && !column.contains(e.relatedTarget)) {
            column.classList.remove('drag-over');
        }
    }

    /**
     * Maneja drop
     */
    handleDrop(e) {
        e.preventDefault();
        
        const column = e.target.closest('.column-content');
        const boardColumn = e.target.closest('.board-column');
        
        if (!column || !this.draggedTask) return;

        const targetColumnId = column.dataset.column;
        const taskId = this.draggedTask.dataset.taskId;
        const task = this.findTaskById(taskId);

        if (!task || task.status === targetColumnId) return;

        // Verificar límites de columna
        if (this.config.maxTasksPerColumn) {
            const tasksInTarget = this.tasks.filter(t => t.status === targetColumnId);
            if (tasksInTarget.length >= this.config.maxTasksPerColumn) {
                this.showFeedback('❌ Columna llena', 'error');
                return;
            }
        }

        // Actualizar estado de la tarea
        const oldStatus = task.status;
        task.status = targetColumnId;
        task.movedAt = new Date().toISOString();

        // Actualizar UI
        this.updateColumns();
        this.updateMetrics();
        this.saveData();

        // Limpiar efectos visuales
        boardColumn.classList.remove('drag-over');

        // Mostrar feedback
        const columnTitle = this.columns.find(c => c.id === targetColumnId)?.title || targetColumnId;
        this.showFeedback(`📋 "${task.title}" movida a ${columnTitle}`);

        // Trigger callback
        if (this.config.onTaskMove) {
            this.config.onTaskMove(task, oldStatus, targetColumnId);
        }

        // Analytics
        this.trackTaskMove(task, oldStatus, targetColumnId);

        console.log(`📋 Task ${taskId} moved from ${oldStatus} to ${targetColumnId}`);
    }

    /**
     * Muestra modal de creación/edición de tarea
     */
    showTaskModal(taskId = null) {
        const modal = this.container.querySelector('#taskModal');
        const modalTitle = this.container.querySelector('#modalTitle');
        const form = this.container.querySelector('#taskForm');

        if (!modal || !form) return;

        this.editingTask = taskId;

        if (taskId) {
            // Editar tarea existente
            const task = this.findTaskById(taskId);
            if (!task) return;

            modalTitle.textContent = 'Editar Tarea';
            this.populateTaskForm(task);
        } else {
            // Crear nueva tarea
            modalTitle.textContent = 'Crear Nueva Tarea';
            form.reset();
        }

        modal.style.display = 'flex';
        modal.style.animation = 'fadeIn 0.3s ease';
        
        // Focus en primer campo
        const firstInput = form.querySelector('input[type="text"]');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    /**
     * Oculta modal de tarea
     */
    hideTaskModal() {
        const modal = this.container.querySelector('#taskModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.style.display = 'none';
                this.editingTask = null;
            }, 300);
        }
    }

    /**
     * Popula formulario con datos de tarea
     */
    populateTaskForm(task) {
        const form = this.container.querySelector('#taskForm');
        if (!form) return;

        form.querySelector('#taskTitle').value = task.title || '';
        form.querySelector('#taskDescription').value = task.description || '';
        form.querySelector('#taskStoryPoints').value = task.storyPoints || 5;
        form.querySelector('#taskPriority').value = task.priority || 'medium';
        form.querySelector('#taskAssignee').value = task.assignee || '';
        form.querySelector('#taskType').value = task.type || 'task';
        form.querySelector('#taskTags').value = (task.tags || []).join(', ');
    }

    /**
     * Maneja envío del formulario de tarea
     */
    handleTaskSubmit() {
        const form = this.container.querySelector('#taskForm');
        if (!form) return;

        const formData = new FormData(form);
        const taskData = {
            title: form.querySelector('#taskTitle').value.trim(),
            description: form.querySelector('#taskDescription').value.trim(),
            storyPoints: parseInt(form.querySelector('#taskStoryPoints').value),
            priority: form.querySelector('#taskPriority').value,
            assignee: form.querySelector('#taskAssignee').value.trim(),
            type: form.querySelector('#taskType').value,
            tags: form.querySelector('#taskTags').value
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0)
        };

        // Validaciones
        if (!taskData.title) {
            this.showFeedback('❌ El título es obligatorio', 'error');
            return;
        }

        if (taskData.storyPoints < 1 || taskData.storyPoints > 21) {
            this.showFeedback('❌ Story Points debe estar entre 1 y 21', 'error');
            return;
        }

        try {
            if (this.editingTask) {
                // Editar tarea existente
                this.updateTask(this.editingTask, taskData);
                this.showFeedback('✅ Tarea actualizada');
            } else {
                // Crear nueva tarea
                this.createTask(taskData);
                this.showFeedback('✅ Tarea creada');
            }

            this.hideTaskModal();
        } catch (error) {
            console.error('Error saving task:', error);
            this.showFeedback('❌ Error al guardar tarea', 'error');
        }
    }

    /**
     * Crea nueva tarea
     */
    createTask(taskData) {
        const task = {
            id: this.generateTaskId(),
            ...taskData,
            status: 'backlog',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.updateColumns();
        this.updateMetrics();
        this.saveData();

        // Trigger callback
        if (this.config.onTaskCreate) {
            this.config.onTaskCreate(task);
        }

        // Analytics
        this.trackTaskCreation(task);

        console.log('📋 Task created:', task.id);
        return task;
    }

    /**
     * Actualiza tarea existente
     */
    updateTask(taskId, taskData) {
        const task = this.findTaskById(taskId);
        if (!task) {
            throw new Error('Task not found');
        }

        Object.assign(task, taskData, {
            updatedAt: new Date().toISOString()
        });

        this.updateColumns();
        this.updateMetrics();
        this.saveData();

        // Trigger callback
        if (this.config.onTaskEdit) {
            this.config.onTaskEdit(task);
        }

        console.log('📋 Task updated:', taskId);
        return task;
    }

    /**
     * Muestra detalle de tarea
     */
    showTaskDetail(taskId) {
        const task = this.findTaskById(taskId);
        if (!task) return;

        const modal = this.container.querySelector('#taskDetailModal');
        const title = modal.querySelector('#detailModalTitle');
        const content = modal.querySelector('#taskDetailContent');

        title.textContent = task.title;
        content.innerHTML = this.createTaskDetailHTML(task);

        modal.style.display = 'flex';
        modal.style.animation = 'fadeIn 0.3s ease';

        // Almacenar ID para acciones
        modal.dataset.currentTaskId = taskId;
    }

    /**
     * Crea HTML del detalle de tarea
     */
    createTaskDetailHTML(task) {
        const createdDate = new Date(task.createdAt).toLocaleDateString('es-ES');
        const updatedDate = new Date(task.updatedAt).toLocaleDateString('es-ES');
        const columnTitle = this.columns.find(c => c.id === task.status)?.title || task.status;

        return `
            <div class="task-detail-content">
                <div class="detail-section">
                    <h5>📝 Descripción</h5>
                    <p>${task.description || 'Sin descripción'}</p>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Story Points</label>
                        <span class="story-points">${task.storyPoints} SP</span>
                    </div>
                    <div class="detail-item">
                        <label>Prioridad</label>
                        <span class="priority ${task.priority}">${this.getPriorityLabel(task.priority)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Estado</label>
                        <span>${columnTitle}</span>
                    </div>
                    <div class="detail-item">
                        <label>Tipo</label>
                        <span class="task-type-label ${task.type}">${this.getTypeLabel(task.type)}</span>
                    </div>
                    <div class="detail-item">
                        <label>Asignado a</label>
                        <span>${task.assignee || 'Sin asignar'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Creado</label>
                        <span>${createdDate}</span>
                    </div>
                </div>
                
                ${task.tags && task.tags.length > 0 ? `
                    <div class="detail-section">
                        <h5>🏷️ Tags</h5>
                        <div class="task-tags">
                            ${task.tags.map(tag => `<span class="task-tag">${this.escapeHtml(tag)}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Oculta modal de detalle
     */
    hideTaskDetailModal() {
        const modal = this.container.querySelector('#taskDetailModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                modal.style.display = 'none';
                delete modal.dataset.currentTaskId;
            }, 300);
        }
    }

    /**
     * Edita tarea actual
     */
    editCurrentTask() {
        const modal = this.container.querySelector('#taskDetailModal');
        const taskId = modal?.dataset.currentTaskId;
        
        if (taskId) {
            this.hideTaskDetailModal();
            setTimeout(() => {
                this.showTaskModal(taskId);
            }, 300);
        }
    }

    /**
     * Elimina tarea actual
     */
    deleteCurrentTask() {
        const modal = this.container.querySelector('#taskDetailModal');
        const taskId = modal?.dataset.currentTaskId;
        
        if (!taskId) return;

        const task = this.findTaskById(taskId);
        if (!task) return;

        if (confirm(`¿Estás seguro de que quieres eliminar "${task.title}"?`)) {
            this.deleteTask(taskId);
            this.hideTaskDetailModal();
            this.showFeedback('🗑️ Tarea eliminada');
        }
    }

    /**
     * Elimina una tarea
     */
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        const task = this.tasks[taskIndex];
        this.tasks.splice(taskIndex, 1);

        this.updateColumns();
        this.updateMetrics();
        this.saveData();

        // Trigger callback
        if (this.config.onTaskDelete) {
            this.config.onTaskDelete(task);
        }

        console.log('📋 Task deleted:', taskId);
    }

    /**
     * Actualiza columnas en la UI
     */
    updateColumns() {
        this.columns.forEach(column => {
            const columnElement = this.container.querySelector(`[data-column-id="${column.id}"]`);
            if (!columnElement) return;

            const contentElement = columnElement.querySelector('.column-content');
            const countElement = columnElement.querySelector('.column-count');

            const tasksInColumn = this.tasks.filter(task => task.status === column.id);

            // Actualizar contenido
            contentElement.innerHTML = tasksInColumn.map(task => this.createTaskHTML(task)).join('');

            // Actualizar contador
            countElement.textContent = tasksInColumn.length;
        });

        // Re-configurar event listeners para nuevos elementos
        this.setupTaskDragListeners();
        this.setupTaskClickListeners();
    }

    /**
     * Actualiza métricas del sprint
     */
    updateMetrics() {
        if (!this.config.showMetrics) return;

        // Calcular métricas
        this.metrics.totalSP = this.tasks.reduce((sum, task) => sum + task.storyPoints, 0);
        this.metrics.completedSP = this.tasks
            .filter(task => task.status === 'done')
            .reduce((sum, task) => sum + task.storyPoints, 0);
        
        this.metrics.progressPercentage = this.metrics.totalSP > 0 
            ? Math.round((this.metrics.completedSP / this.metrics.totalSP) * 100)
            : 0;

        // Actualizar UI
        this.updateMetricsUI();
    }

    /**
     * Actualiza la UI de métricas
     */
    updateMetricsUI() {
        const updates = {
            totalSP: this.metrics.totalSP,
            completedSP: this.metrics.completedSP,
            progressPercentage: this.metrics.progressPercentage,
            daysRemaining: this.metrics.daysRemaining
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = this.container.querySelector(`#${id}`);
            if (element) {
                // Animación al cambiar
                element.style.transform = 'scale(1.1)';
                element.textContent = id === 'progressPercentage' ? `${value}%` : value;
                
                setTimeout(() => {
                    element.style.transform = 'scale(1)';
                }, 200);
            }
        });

        // Actualizar barra de progreso
        const progressFill = this.container.querySelector('#progressFill');
        if (progressFill) {
            progressFill.style.width = `${this.metrics.progressPercentage}%`;
        }

        // Actualizar color de progreso
        const progressElement = this.container.querySelector('#progressPercentage');
        if (progressElement) {
            progressElement.style.color = this.getProgressColor(this.metrics.progressPercentage);
        }
    }

    /**
     * Obtiene color de progreso basado en porcentaje
     */
    getProgressColor(percentage) {
        if (percentage >= 75) return 'var(--accent)';
        if (percentage >= 50) return 'var(--warning)';
        if (percentage >= 25) return 'var(--secondary)';
        return 'var(--gray)';
    }

    /**
     * Actualiza toda la UI
     */
    updateUI() {
        this.updateColumns();
        this.updateMetrics();
        this.updateTitle();
        this.checkEmptyState();
    }

    /**
     * Actualiza título y subtitle
     */
    updateTitle() {
        const titleElement = this.container.querySelector('.board-title');
        const subtitleElement = this.container.querySelector('.board-subtitle');
        const sprintNameElement = this.container.querySelector('#sprintName');
        const sprintDatesElement = this.container.querySelector('#sprintDates');

        if (titleElement) titleElement.textContent = this.config.title;
        if (subtitleElement) subtitleElement.textContent = this.config.subtitle;
        if (sprintNameElement) sprintNameElement.textContent = this.config.sprintName;
        if (sprintDatesElement) sprintDatesElement.textContent = this.config.sprintDates;
    }

    /**
     * Verifica estado vacío
     */
    checkEmptyState() {
        const isEmpty = this.tasks.length === 0;
        const emptyState = this.container.querySelector('#boardEmpty');
        const boardContainer = this.container.querySelector('.board-container');

        if (emptyState && boardContainer) {
            emptyState.style.display = isEmpty ? 'block' : 'none';
            boardContainer.style.display = isEmpty ? 'none' : 'block';
        }
    }

    /**
     * Reset completo del board
     */
    resetBoard() {
        if (!confirm('¿Estás seguro de que quieres resetear todo el board?')) {
            return;
        }

        this.tasks = [];
        this.loadDefaultTasks();
        this.updateUI();
        this.saveData();
        this.showFeedback('🔄 Board reseteado');
    }

    /**
     * Exporta datos del board
     */
    exportBoardData() {
        const exportData = {
            sprintName: this.config.sprintName,
            sprintDates: this.config.sprintDates,
            exportDate: new Date().toISOString(),
            metrics: this.metrics,
            tasks: this.tasks,
            columns: this.columns
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sprint-board-${this.config.sprintName.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showFeedback('📊 Datos exportados');
    }

    /**
     * Carga datos por defecto
     */
    loadDefaultTasks() {
        this.tasks = [
            {
                id: this.generateTaskId(),
                title: 'Implementar Login OAuth',
                description: 'Integración con Azure AD para autenticación',
                storyPoints: 8,
                priority: 'high',
                status: 'backlog',
                type: 'feature',
                assignee: 'Juan Pérez',
                tags: ['frontend', 'auth', 'azure'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: this.generateTaskId(),
                title: 'API de Productos',
                description: 'CRUD completo con Entity Framework',
                storyPoints: 5,
                priority: 'medium',
                status: 'backlog',
                type: 'feature',
                assignee: 'María González',
                tags: ['backend', 'api', 'dotnet'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: this.generateTaskId(),
                title: 'Componente Angular Cart',
                description: 'Carrito de compras con persistencia',
                storyPoints: 3,
                priority: 'high',
                status: 'progress',
                type: 'feature',
                assignee: 'Carlos López',
                tags: ['frontend', 'angular', 'ecommerce'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: this.generateTaskId(),
                title: 'Unit Tests Productos',
                description: 'Testing con xUnit y Moq',
                storyPoints: 2,
                priority: 'medium',
                status: 'review',
                type: 'task',
                assignee: 'Ana Silva',
                tags: ['testing', 'backend'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: this.generateTaskId(),
                title: 'Setup .NET Core API',
                description: 'Proyecto base con Clean Architecture',
                storyPoints: 3,
                priority: 'high',
                status: 'done',
                type: 'task',
                assignee: 'Luis Martín',
                tags: ['backend', 'architecture'],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }

    /**
     * Carga datos desde localStorage
     */
    loadData() {
        try {
            const stored = localStorage.getItem(this.config.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.tasks = data.tasks || [];
                if (data.sprintName) this.config.sprintName = data.sprintName;
                if (data.sprintDates) this.config.sprintDates = data.sprintDates;
            } else {
                this.loadDefaultTasks();
            }
        } catch (error) {
            console.warn('Error loading board data:', error);
            this.loadDefaultTasks();
        }
    }

    /**
     * Guarda datos en localStorage
     */
    saveData() {
        if (!this.config.autoSave) return;

        try {
            const data = {
                tasks: this.tasks,
                sprintName: this.config.sprintName,
                sprintDates: this.config.sprintDates,
                lastSaved: new Date().toISOString()
            };
            localStorage.setItem(this.config.storageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Error saving board data:', error);
        }
    }

    /**
     * Utilidades
     */
    findTaskById(taskId) {
        return this.tasks.find(task => task.id === taskId);
    }

    generateTaskId() {
        return 'task-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getPriorityLabel(priority) {
        const labels = {
            low: 'Baja',
            medium: 'Media',
            high: 'Alta'
        };
        return labels[priority] || priority;
    }

    getTypeLabel(type) {
        const labels = {
            feature: 'Feature',
            bug: 'Bug',
            task: 'Task',
            spike: 'Spike'
        };
        return labels[type] || type;
    }

    /**
     * Muestra feedback al usuario
     */
    showFeedback(message, type = 'success') {
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#EF4444' : 'var(--gradient-primary)'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            font-weight: 600;
            max-width: 300px;
        `;
        feedback.textContent = message;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => feedback.remove(), 300);
        }, 3000);
    }

    /**
     * Analytics tracking
     */
    trackTaskMove(task, fromStatus, toStatus) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'task_moved', {
                event_category: 'sprint_board',
                event_label: `${fromStatus}_to_${toStatus}`,
                value: task.storyPoints
            });
        }
    }

    trackTaskCreation(task) {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'task_created', {
                event_category: 'sprint_board',
                event_label: task.type,
                value: task.storyPoints
            });
        }
    }

    /**
     * Helper para event listeners con cleanup
     */
    addEventListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.eventListeners.push({ element, event, handler });
    }

    /**
     * API pública
     */
    getTasks() {
        return [...this.tasks];
    }

    getTasksByStatus(status) {
        return this.tasks.filter(task => task.status === status);
    }

    getMetrics() {
        return { ...this.metrics };
    }

    addTask(taskData) {
        return this.createTask(taskData);
    }

    removeTask(taskId) {
        this.deleteTask(taskId);
    }

    moveTask(taskId, newStatus) {
        const task = this.findTaskById(taskId);
        if (task) {
            const oldStatus = task.status;
            task.status = newStatus;
            this.updateColumns();
            this.updateMetrics();
            this.saveData();
            
            if (this.config.onTaskMove) {
                this.config.onTaskMove(task, oldStatus, newStatus);
            }
        }
    }

    /**
     * Destructor
     */
    destroy() {
        // Cleanup event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });

        // Cleanup observers
        this.observers.forEach(observer => observer.disconnect());

        // Clear arrays
        this.eventListeners = [];
        this.observers = [];
        this.tasks = [];

        console.log('📋 Sprint Board destroyed');
    }
}

// Export para uso como módulo
export default SprintBoard;