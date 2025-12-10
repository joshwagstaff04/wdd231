const FAVORITES_KEY = 'hpl_favorite_habits';
const THEME_KEY = 'hpl_theme';

export function getFavoriteHabits() {
  const raw = localStorage.getItem(FAVORITES_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function toggleFavoriteHabit(id) {
  const favorites = getFavoriteHabits();
  const index = favorites.indexOf(id);

  if (index === -1) {
    favorites.push(id);
  } else {
    favorites.splice(index, 1);
  }

  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  return favorites;
}

export function isFavorite(id) {
  const favorites = getFavoriteHabits();
  return favorites.includes(id);
}

export function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark'; // your default is dark navy
}

export function setTheme(theme) {
  localStorage.setItem(THEME_KEY, theme);
}
