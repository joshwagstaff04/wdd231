import { fetchHabits } from './data.js';
import { getFavoriteHabits, getTheme, setTheme } from './storage.js';

document.addEventListener('DOMContentLoaded', async () => {
  const savedContainer = document.querySelector('#saved-habits');
  const themeToggle = document.querySelector('#theme-toggle');

  const currentTheme = getTheme();
  document.documentElement.dataset.theme = currentTheme;
  if (themeToggle) {
    themeToggle.checked = currentTheme === 'dark';
    themeToggle.addEventListener('change', () => {
      const newTheme = themeToggle.checked ? 'dark' : 'light';
      document.documentElement.dataset.theme = newTheme;
      setTheme(newTheme);
    });
  }

  try {
    const habits = await fetchHabits();
    const favoriteIds = getFavoriteHabits();
    const savedHabits = habits.filter(habit => favoriteIds.includes(habit.id));

    if (!savedHabits.length) {
      savedContainer.textContent = 'You have no saved habits yet. Visit the Habit Library to add some.';
      return;
    }

    const list = document.createElement('ul');
    savedHabits.forEach(habit => {
      const li = document.createElement('li');
      li.textContent = `${habit.name} (${habit.pillar}) – ${habit.time_required}`;
      list.appendChild(li);
    });

    savedContainer.appendChild(list);
  } catch (error) {
    savedContainer.textContent = 'Sorry, could not load your saved habits.';
  }
});
