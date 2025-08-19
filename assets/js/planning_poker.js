
function setupPlanningPoker() {
    const pokerCards = document.querySelectorAll('.poker-card');
    const overlay = document.getElementById('card-overlay');
    const selectedCard = document.getElementById('selected-card');

    if (!overlay || !selectedCard) return;

    pokerCards.forEach(card => {
        card.addEventListener('click', () => {
            const value = card.dataset.value;
            selectedCard.textContent = value;
            overlay.classList.add('visible');
        });
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('visible');
        }
    });
}
