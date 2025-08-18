
document.addEventListener('DOMContentLoaded', function() {
    // Solo inicializar si el tablero de sprint está presente
    if (document.querySelector('.sprint-board')) {
        setupSprintBoard();
    }
});

function setupSprintBoard() {
    const taskCards = document.querySelectorAll('.task-card[draggable="true"]');
    const columns = document.querySelectorAll('.board-column');

    taskCards.forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
        column.addEventListener('dragenter', handleDragEnter);
        column.addEventListener('dragleave', handleDragLeave);
    });

    // Inicializar progreso al cargar
    updateSprintProgress();
}

function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.outerHTML);
    e.dataTransfer.setData('source-column', e.target.closest('.board-column').dataset.column);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
}

function handleDragEnter(e) {
    if (e.target.classList.contains('board-column')) {
        e.target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (e.target.classList.contains('board-column')) {
        e.target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const column = e.target.closest('.board-column');
    if (!column) return;

    column.classList.remove('drag-over');
    
    const cardHTML = e.dataTransfer.getData('text/plain');
    const sourceColumn = e.dataTransfer.getData('source-column');
    const targetColumn = column.dataset.column;
    
    if (sourceColumn !== targetColumn) {
        const draggingCard = document.querySelector('.task-card.dragging');
        if (draggingCard) {
            draggingCard.remove();
        }
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = cardHTML;
        const newCard = tempDiv.firstChild;
        newCard.classList.remove('dragging');
        
        newCard.addEventListener('dragstart', handleDragStart);
        newCard.addEventListener('dragend', handleDragEnd);
        
        column.appendChild(newCard);
        
        updateSprintProgress();
        showMoveNotification(newCard.querySelector('.task-title').textContent, targetColumn);
    }
}

function updateSprintProgress() {
    let totalSP = 0;
    document.querySelectorAll('.task-card').forEach(card => {
        totalSP += parseInt(card.dataset.storyPoints) || 0;
    });

    let completedSP = 0;
    document.querySelectorAll('[data-column="done"] .task-card').forEach(card => {
        completedSP += parseInt(card.dataset.storyPoints) || 0;
    });

    const percentage = totalSP > 0 ? Math.round((completedSP / totalSP) * 100) : 0;
    
    document.getElementById('total-sp').textContent = totalSP;
    document.getElementById('completed-sp').textContent = completedSP;
    document.getElementById('progress-percentage').textContent = percentage + '%';
}

function showMoveNotification(taskTitle, targetColumn) {
    const columnNames = {
        'backlog': 'Sprint Backlog',
        'progress': 'En Progreso',
        'review': 'Code Review',
        'done': 'Done'
    };
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <strong>✅ Tarea movida</strong><br>
        <span>"${taskTitle}" → ${columnNames[targetColumn]}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}
