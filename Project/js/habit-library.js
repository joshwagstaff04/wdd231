import { initializeFavorites, attachFavoriteListeners } from './favorites.js';
import { safelyFetch, showNotification } from './utils.js';
import { initializeHamburger } from './navigation.js';

let habitData = [];

document.addEventListener('DOMContentLoaded', async () => {
    initializeHamburger();
    await loadHabits();
    initializeFavorites();
    setupFilterButtons();
    attachFavoriteListeners();
});

async function loadHabits() {
    try {
        const data = await safelyFetch('habits.json');
        if (data && data.habits) {
            habitData = data.habits;
            renderHabits(habitData);
        } else {
            throw new Error('No habits data found');
        }
    } catch (error) {
        console.error('Error loading habit library:', error);
        showNotification('Failed to load habit library. Please refresh the page.', 'error');
    }
}

function renderHabits(habits) {
    const container = document.getElementById('habits-library');

    container.innerHTML = habits.map(habit => `
        <div class="habit-card" data-pillar="${habit.pillar}" data-id="${habit.id}">
            <h4>${habit.title}</h4>
            <p class="pillar-tag ${habit.pillar}">
                ${habit.pillar.replace('-', ' ').toUpperCase()}
            </p>
            <p>${habit.description}</p>
            <div class="habit-meta">
                <span class="habit-duration">⏱ ${habit.duration}</span>
                <span class="habit-difficulty">${habit.difficulty}</span>
            </div>
            <button class="favorite-btn" data-habit-id="${habit.id}">♡ Save</button>
        </div>
    `).join('');
}

function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.target.dataset.filter;
            filterHabits(filter);

            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
}

function filterHabits(pillar) {
    if (pillar === 'all') {
        renderHabits(habitData);
    } else {
        const filtered = habitData.filter(habit => habit.pillar === pillar);
        renderHabits(filtered);
    }
}
