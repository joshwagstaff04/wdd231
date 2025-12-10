import { initializeFavorites, attachFavoriteListeners, getSavedFavorites } from './favorites.js';
import { initializeHamburger } from './navigation.js';
import { safelyFetch, formatPillarName } from './utils.js';

let habitLibrary = [];

document.addEventListener('DOMContentLoaded', async () => {
    initializeHamburger();
    initializeFavorites();
    attachFavoriteListeners();
    setActiveNavLink();
    await loadHabitLibrary();
    setupDetailListeners();
    setupModal();
});

async function loadHabitLibrary() {
    const data = await safelyFetch('habits.json');
    if (data && data.habits) {
        habitLibrary = data.habits;
    }
}

function setActiveNavLink() {
    const currentLocation = location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentLocation) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupDetailListeners() {
    const detailBtns = document.querySelectorAll('.habit-detail-btn');
    detailBtns.forEach(btn => {
        btn.removeEventListener('click', handleDetailClick);
        btn.addEventListener('click', handleDetailClick);
    });
}

function handleDetailClick() {
    const habitId = this.dataset.habitId;
    const habit = habitLibrary.find(h => h.id === habitId);
    if (habit) openModal(habit);
}

function setupModal() {
    let modal = document.getElementById('habit-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'habit-modal';
        modal.className = 'modal';
        modal.setAttribute('aria-hidden', 'true');
        modal.innerHTML = `
			<div class="modal-content">
				<button class="modal-close" id="modal-close" aria-label="Close modal">&times;</button>
				<div id="modal-body"></div>
			</div>
		`;
        document.body.appendChild(modal);
    }

    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
        closeBtn.removeEventListener('click', closeModal);
        closeBtn.addEventListener('click', closeModal);
    }

    modal.removeEventListener('click', handleModalClick);
    modal.addEventListener('click', handleModalClick);

    document.removeEventListener('keydown', handleEscapeKey);
    document.addEventListener('keydown', handleEscapeKey);
}

function handleModalClick(e) {
    if (e.target.id === 'habit-modal') closeModal();
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') closeModal();
}

function openModal(habit) {
    const modal = document.getElementById('habit-modal');
    const modalBody = document.getElementById('modal-body');
    const savedFavorites = getSavedFavorites();
    const isSaved = savedFavorites.includes(habit.id);

    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
		<h3>${habit.title}</h3>
		<p class="pillar-tag ${habit.pillar}">${formatPillarName(habit.pillar)}</p>
		<div class="modal-details">
			<p><strong>Duration:</strong> ${habit.duration}</p>
			<p><strong>Difficulty:</strong> ${habit.difficulty}</p>
			<p><strong>Primary Benefit:</strong> ${habit.benefit}</p>
		</div>
		<p>${habit.description}</p>
		<button class="favorite-btn ${isSaved ? 'saved' : ''}" data-habit-id="${habit.id}">
			${isSaved ? '♥ Saved' : '♡ Save'}
		</button>
	`;

    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';

    attachFavoriteListeners();
}

function closeModal() {
    const modal = document.getElementById('habit-modal');
    if (!modal) return;

    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('open');
    document.body.style.overflow = '';
}
