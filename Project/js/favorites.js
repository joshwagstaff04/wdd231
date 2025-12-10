import { showNotification } from './utils.js';

const STORAGE_KEY = 'hpl_favorites';

export function initializeFavorites() {
    const buttons = document.querySelectorAll('.favorite-btn');
    const savedFavorites = getSavedFavorites();

    buttons.forEach(btn => {
        const habitId = btn.dataset.habitId.toString();
        if (savedFavorites.includes(habitId)) {
            btn.classList.add('saved');
            btn.textContent = '♥ Saved';
        }
    });
}

export function getSavedFavorites() {
    const raw = localStorage.getItem(STORAGE_KEY) || '[]';
    return JSON.parse(raw);
}

export function saveFavorite(habitId) {
    const favorites = getSavedFavorites();
    const idStr = habitId.toString();
    if (!favorites.includes(idStr)) {
        favorites.push(idStr);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
        showNotification('Habit saved to favorites!', 'success');
    }
}

export function removeFavorite(habitId) {
    let favorites = getSavedFavorites();
    const idStr = habitId.toString();
    favorites = favorites.filter(id => id !== idStr);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    showNotification('Habit removed from favorites', 'info');
}

export function attachFavoriteListeners() {
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        btn.removeEventListener('click', handleFavoriteClick);
        btn.addEventListener('click', handleFavoriteClick);
    });
}

function handleFavoriteClick(event) {
    const habitId = event.currentTarget.dataset.habitId.toString();
    const isSaved = event.currentTarget.classList.contains('saved');

    if (isSaved) {
        removeFavorite(habitId);
        event.currentTarget.classList.remove('saved');
        event.currentTarget.textContent = '♡ Save';
    } else {
        saveFavorite(habitId);
        event.currentTarget.classList.add('saved');
        event.currentTarget.textContent = '♥ Saved';
    }
}
