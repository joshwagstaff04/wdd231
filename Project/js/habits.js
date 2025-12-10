import { fetchHabits } from './data.js';
import { initModal, openModal } from './modal.js';
import { getFavoriteHabits, toggleFavoriteHabit, isFavorite } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  initModal();

  const container = document.querySelector('#habit-list');
  const filterSelect = document.querySelector('#pillar-filter');
  const status = document.querySelector('#habit-status');

  let allHabits = [];

  try {
    allHabits = await fetchHabits();
    renderHabits(allHabits, container);
    if (status) status.textContent = `${allHabits.length} habits loaded`;
  } catch (error) {
    container.textContent = 'Sorry, there was a problem loading the habits.';
    if (status) status.textContent = 'Error loading habits.';
    return;
  }

  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      const value = filterSelect.value;
      const filtered = value === 'all'
        ? allHabits
        : allHabits.filter(habit => habit.pillar === value);

      renderHabits(filtered, container);
    });
  }

  container.addEventListener('click', (event) => {
    const detailsBtn = event.target.closest('[data-action="details"]');
    const favoriteBtn = event.target.closest('[data-action="favorite"]');

    if (detailsBtn) {
      const id = Number(detailsBtn.dataset.id);
      const habit = allHabits.find(h => h.id === id);
      if (habit) openHabitModal(habit);
    }

    if (favoriteBtn) {
      const id = Number(favoriteBtn.dataset.id);
      toggleFavoriteHabit(id);
      updateFavoriteButton(favoriteBtn, id);
    }
  });
});

function renderHabits(habits, container) {
  container.innerHTML = '';

  habits.forEach(habit => {
    const article = document.createElement('article');
    article.classList.add('habit-card');

    const favoriteLabel = isFavorite(habit.id) ? 'Saved' : 'Save';

    article.innerHTML = `
      <header>
        <h3>${habit.name}</h3>
        <span class="habit-pill">${habit.pillar}</span>
      </header>
      <p class="habit-description">${habit.description}</p>
      <dl class="habit-meta">
        <div>
          <dt>Time Required</dt>
          <dd>${habit.time_required}</dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>${habit.difficulty}</dd>
        </div>
        <div>
          <dt>Best Time</dt>
          <dd>${habit.best_time}</dd>
        </div>
      </dl>
      <div class="habit-actions">
        <button type="button" data-action="details" data-id="${habit.id}">
          View Details
        </button>
        <button type="button"
                class="favorite-btn ${isFavorite(habit.id) ? 'is-favorite' : ''}"
                data-action="favorite"
                data-id="${habit.id}">
          ${favoriteLabel}
        </button>
      </div>
    `;

    container.appendChild(article);
  });
}

function openHabitModal(habit) {
  const html = `
    <h2>${habit.name}</h2>
    <p><strong>Pillar:</strong> ${habit.pillar}</p>
    <p><strong>Time Required:</strong> ${habit.time_required}</p>
    <p><strong>Difficulty:</strong> ${habit.difficulty}</p>
    <p><strong>Best Time:</strong> ${habit.best_time}</p>
    <p class="modal-description">${habit.description}</p>
  `;
  openModal(html);
}

function updateFavoriteButton(button, id) {
  const favoriteNow = isFavorite(id);
  button.classList.toggle('is-favorite', favoriteNow);
  button.textContent = favoriteNow ? 'Saved' : 'Save';
}
