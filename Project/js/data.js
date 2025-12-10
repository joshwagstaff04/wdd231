const HABITS_URL = './data/habits.json';

export async function fetchHabits() {
  try {
    const response = await fetch(HABITS_URL);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return data.habits;
  } catch (error) {
    console.error('Error fetching habits:', error);
    throw error; // let the caller handle this too
  }
}
