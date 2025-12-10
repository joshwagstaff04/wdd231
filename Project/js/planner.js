import { initializeHamburger } from './navigation.js';
import { getSavedFavorites } from './favorites.js';
import { safelyFetch, formatPillarName, showNotification } from './utils.js';

const PLANNER_STORAGE_KEY = 'hpl_schedule';
const HABIT_NUMBERING_KEY = 'hpl_habit_numbering';
const CUSTOM_ACTIVITIES_KEY = 'hpl_custom_activities';
let habitLibrary = [];

document.addEventListener('DOMContentLoaded', async () => {
    initializeHamburger();
    await loadHabitLibrary();
    displaySavedHabits();
    setupEnergySlider();
    setupFormSubmit();
    setupCustomActivijwties();
    setupExportButtons();
    loadScheduleIfExists();
});

async function loadHabitLibrary() {
    try {
        const data = await safelyFetch('habits.json');
        if (data && data.habits) {
            habitLibrary = data.habits;
        }
    } catch (error) {
        console.error('Failed to load habit library:', error);
        showNotification('Could not load habits. Please refresh the page.', 'error');
    }
}

function displaySavedHabits() {
    const savedIds = getSavedFavorites();
    const container = document.getElementById('saved-habits-list');
    const noMessage = document.getElementById('no-habits-message');

    if (!container) {
        console.error('saved-habits-list container not found');
        return;
    }

    if (!habitLibrary || habitLibrary.length === 0 || savedIds.length === 0) {
        container.innerHTML = '';
        if (noMessage) noMessage.style.display = 'block';
        return;
    }

    if (noMessage) noMessage.style.display = 'none';

    const savedHabits = habitLibrary.filter(h => savedIds.includes(h.id));
    const habitNumbering = JSON.parse(localStorage.getItem(HABIT_NUMBERING_KEY) || '{}');

    container.innerHTML = `
		<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
			${savedHabits.map(habit => {
        const habitNumber = habitNumbering[habit.id] || '';
        return `
					<div style="background-color: var(--surface); border: 1px solid var(--border); border-radius: 8px; padding: 1.5rem;">
						<div style="display: flex; align-items: flex-start; gap: 1rem; margin-bottom: 1rem;">
							<div style="flex: 1;">
								<h4 style="color: var(--text-light); margin: 0 0 0.5rem 0;">${habit.title}</h4>
								<p class="pillar-tag ${habit.pillar}" style="margin-bottom: 0.75rem; display: inline-block;">${formatPillarName(habit.pillar)}</p>
							</div>
						</div>
						<p style="font-size: 0.9rem; color: var(--text-muted); margin: 0 0 1rem 0; line-height: 1.5;">${habit.description}</p>
						<div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background-color: var(--primary-dark); border-radius: 6px;">
							<label style="color: var(--accent-green); font-weight: 600; margin: 0; flex-shrink: 0;">Sequence #:</label>
							<input type="number" class="habit-number-input" data-habit-id="${habit.id}" value="${habitNumber}" min="1" placeholder="Optional" style="width: 60px; padding: 0.5rem; background-color: var(--surface); border: 1px solid var(--border); border-radius: 4px; color: var(--text-light); font-weight: 600;">
						</div>
					</div>
				`;
    }).join('')}
		</div>
	`;

    document.querySelectorAll('.habit-number-input').forEach(input => {
        input.addEventListener('change', (e) => {
            const habitId = e.target.dataset.habitId;
            let numbering = JSON.parse(localStorage.getItem(HABIT_NUMBERING_KEY) || '{}');

            if (e.target.value) {
                numbering[habitId] = parseInt(e.target.value);
            } else {
                delete numbering[habitId];
            }

            localStorage.setItem(HABIT_NUMBERING_KEY, JSON.stringify(numbering));
        });
    });
}

function setupEnergySlider() {
    const slider = document.getElementById('energy-baseline');
    const value = document.getElementById('energy-value');

    if (slider && value) {
        slider.addEventListener('input', (e) => {
            value.textContent = e.target.value;
        });
    }
}

function setupFormSubmit() {
    const form = document.getElementById('planner-form');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            generateSchedule();
        });
    }
}

function setupCustomActivities() {
    const inputField = document.getElementById('custom-activity-input');
    const timeField = document.getElementById('custom-activity-time');
    const addBtn = document.getElementById('add-activity-btn');

    loadCustomActivities();

    addBtn.addEventListener('click', () => {
        const activity = inputField.value.trim();
        const time = timeField.value;
        if (activity) {
            addCustomActivity(activity, time);
            inputField.value = '';
            timeField.value = '';
            inputField.focus();
        }
    });

    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addBtn.click();
        }
    });
}

function addCustomActivity(activity, time) {
    let activities = JSON.parse(localStorage.getItem(CUSTOM_ACTIVITIES_KEY) || '[]');
    const id = Date.now().toString();
    activities.push({ id, name: activity, time: time || null });
    localStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(activities));
    loadCustomActivities();
}

function removeCustomActivity(id) {
    let activities = JSON.parse(localStorage.getItem(CUSTOM_ACTIVITIES_KEY) || '[]');
    activities = activities.filter(a => a.id !== id);
    localStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(activities));
    loadCustomActivities();
}

function loadCustomActivities() {
    const activities = JSON.parse(localStorage.getItem(CUSTOM_ACTIVITIES_KEY) || '[]');
    const listContainer = document.getElementById('custom-activities-list');

    listContainer.innerHTML = activities.map(activity => `
		<div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background-color: var(--primary-dark); border-radius: 6px; border-left: 3px solid var(--accent-green);">
			<span style="flex: 1; color: var(--text-muted);">✓ ${activity.name}${activity.time ? ` at ${activity.time}` : ' (auto)'}</span>
			<button type="button" class="remove-activity-btn" data-id="${activity.id}" style="background: none; border: none; color: var(--accent-green); cursor: pointer; font-weight: bold; font-size: 1.2rem;">×</button>
		</div>
	`).join('');

    document.querySelectorAll('.remove-activity-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            removeCustomActivity(btn.dataset.id);
        });
    });
}

function generateSchedule() {
    try {
        const wakeTime = document.getElementById('wake-time').value;
        const bedtime = document.getElementById('bedtime').value;
        const energyBaseline = parseInt(document.getElementById('energy-baseline').value);
        const workFocus = parseInt(document.getElementById('work-focus').value);
        const includeMorning = document.getElementById('include-morning').checked;
        const includeBreaks = document.getElementById('include-breaks').checked;
        const includeWindDown = document.getElementById('include-wind-down').checked;

        const habitNumbering = JSON.parse(localStorage.getItem(HABIT_NUMBERING_KEY) || '{}');
        const numberedHabits = habitLibrary
            .filter(h => habitNumbering[h.id])
            .sort((a, b) => habitNumbering[a.id] - habitNumbering[b.id]);

        const customActivities = JSON.parse(localStorage.getItem(CUSTOM_ACTIVITIES_KEY) || '[]');

        const schedule = buildSchedule({
            wakeTime,
            bedtime,
            energyBaseline,
            workFocus,
            includeMorning,
            includeBreaks,
            includeWindDown,
            numberedHabits,
            customActivities
        });

        saveScheduleToStorage(schedule);
        displaySchedule(schedule);
        displayScheduleSummary(schedule, numberedHabits.length);
        showNotification(`Schedule generated with ${numberedHabits.length} habits!`, 'success');
    } catch (error) {
        console.error('Error generating schedule:', error);
        showNotification('Error generating schedule. Please try again.', 'error');
    }
}

function displayScheduleSummary(schedule, habitCount) {
    const summaryDiv = document.getElementById('schedule-summary');
    if (!summaryDiv) return;

    const totalWork = schedule
        .filter(item => item.type === 'work')
        .reduce((sum, item) => sum + item.duration, 0);

    const dayDuration = schedule[schedule.length - 1]?.time || '0:00';
    const [endHour, endMin] = dayDuration.split(':').map(Number);

    summaryDiv.style.display = 'block';
    document.getElementById('total-work').textContent = `${totalWork} min`;
    document.getElementById('habits-count').textContent = habitCount;
    document.getElementById('day-duration').textContent = `${endHour}h ${endMin}m`;
}

function buildSchedule(config) {
    const schedule = [];
    const [wakeHour, wakeMin] = config.wakeTime.split(':').map(Number);

    let currentHour = wakeHour;
    let currentMin = wakeMin;

    const allActivities = [
        ...config.numberedHabits.map((h, i) => ({ ...h, type: 'habit', sequence: i + 1, specifiedTime: null })),
        ...config.customActivities.map((a, i) => ({
            name: a.name,
            duration: 30,
            type: 'custom',
            sequence: config.numberedHabits.length + i + 1,
            specifiedTime: a.time // Store the specified time
        }))
    ];

    const activitiesWithTime = allActivities.filter(a => a.specifiedTime);
    const activitiesWithoutTime = allActivities.filter(a => !a.specifiedTime);

    let activityIndex = 0;

    if (activityIndex < allActivities.length && config.includeMorning) {
        const activity = allActivities[activityIndex];
        const duration = parseInt(activity.duration) || 10;
        schedule.push({
            time: formatTime(currentHour, currentMin),
            duration: duration,
            activity: activity.type === 'habit' ? `${activity.title} (Habit #${activity.sequence})` : `${activity.name} (Custom)`,
            type: activity.type === 'habit' ? 'habit' : 'work',
            description: activity.description || activity.name,
            benefit: activity.benefit || 'Custom activity'
        });
        currentMin += duration;
        if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
        }
        activityIndex++;
    }

    schedule.push({
        time: formatTime(currentHour, currentMin),
        duration: 30,
        activity: 'Breakfast',
        type: 'meal',
        description: 'Balanced meal with protein',
        benefit: 'Fuel your body for sustained energy'
    });
    currentMin += 30;
    if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
    }

    schedule.push({
        time: formatTime(currentHour, currentMin),
        duration: config.workFocus,
        activity: 'Deep Work Session 1',
        type: 'work',
        description: `Focused work block (${config.workFocus} min)`,
        benefit: 'Maximize productivity during peak focus hours'
    });
    currentMin += config.workFocus;
    if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
    }

    if (config.includeBreaks) {
        schedule.push({
            time: formatTime(currentHour, currentMin),
            duration: 5,
            activity: 'Movement Break',
            type: 'break',
            description: 'Stretch or short walk',
            benefit: 'Maintain circulation and mental clarity'
        });
        currentMin += 5;
        if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
        }
    }

    schedule.push({
        time: formatTime(currentHour, currentMin),
        duration: config.workFocus,
        activity: 'Deep Work Session 2',
        type: 'work',
        description: `Focused work block (${config.workFocus} min)`,
        benefit: 'Capture momentum from your first session'
    });
    currentMin += config.workFocus;
    if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
    }

    schedule.push({
        time: formatTime(currentHour, currentMin),
        duration: 45,
        activity: 'Lunch & Rest',
        type: 'meal',
        description: 'Nutrition and recovery time',
        benefit: 'Recharge for the afternoon'
    });
    currentMin += 45;
    if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
    }

    if (activityIndex < activitiesWithoutTime.length) {
        const activity = activitiesWithoutTime[activityIndex];
        const duration = parseInt(activity.duration) || 5;
        schedule.push({
            time: formatTime(currentHour, currentMin),
            duration: duration,
            activity: activity.type === 'habit' ? `${activity.title} (Habit #${activity.sequence})` : `${activity.name} (Custom)`,
            type: activity.type === 'habit' ? 'habit' : 'work',
            description: activity.description || activity.name,
            benefit: activity.benefit || 'Custom activity'
        });
        currentMin += duration;
        if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
        }
        activityIndex++;
    }

    schedule.push({
        time: formatTime(currentHour, currentMin),
        duration: 120,
        activity: 'Afternoon Focus',
        type: 'work',
        description: 'Task completion and admin',
        benefit: 'Use remaining energy for important tasks'
    });
    currentMin += 120;
    if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
    }

    schedule.push({
        time: formatTime(currentHour, currentMin),
        duration: 15,
        activity: 'Afternoon Break',
        type: 'break',
        description: 'Rest and recharge before evening',
        benefit: 'Prepare for final push of the day'
    });
    currentMin += 15;
    if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
    }

    schedule.push({
        time: formatTime(currentHour, currentMin),
        duration: 60,
        activity: 'Final Focus Session',
        type: 'work',
        description: 'Wrap up and prepare for end of day',
        benefit: 'Finish strong and close out tasks'
    });
    currentMin += 60;
    if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
    }

    while (activityIndex < activitiesWithoutTime.length && config.includeWindDown) {
        const activity = activitiesWithoutTime[activityIndex];
        const duration = parseInt(activity.duration) || 30;
        schedule.push({
            time: formatTime(currentHour, currentMin),
            duration: duration,
            activity: activity.type === 'habit' ? `${activity.title} (Habit #${activity.sequence})` : `${activity.name} (Custom)`,
            type: activity.type === 'habit' ? 'habit' : 'work',
            description: activity.description || activity.name,
            benefit: activity.benefit || 'Custom activity'
        });
        currentMin += duration;
        if (currentMin >= 60) {
            currentHour += Math.floor(currentMin / 60);
            currentMin = currentMin % 60;
        }
        activityIndex++;
    }

    activitiesWithTime.forEach(activity => {
        const [specHour, specMin] = activity.specifiedTime.split(':').map(Number);
        const duration = parseInt(activity.duration) || 30;
        schedule.push({
            time: activity.specifiedTime,
            duration: duration,
            activity: activity.type === 'habit' ? `${activity.title} (Habit #${activity.sequence})` : `${activity.name} (Custom - Scheduled)`,
            type: activity.type === 'habit' ? 'habit' : 'work',
            description: activity.description || activity.name,
            benefit: activity.benefit || 'Custom activity'
        });
    });

    schedule.sort((a, b) => {
        const [aHour, aMin] = a.time.split(':').map(Number);
        const [bHour, bMin] = b.time.split(':').map(Number);
        return aHour * 60 + aMin - (bHour * 60 + bMin);
    });

    return schedule;
}

function formatTime(hour, min) {
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function saveScheduleToStorage(schedule) {
    localStorage.setItem(PLANNER_STORAGE_KEY, JSON.stringify(schedule));
}

function displaySchedule(schedule) {
    const display = document.getElementById('schedule-display');

    if (!display) {
        console.error('Schedule display container not found');
        return;
    }

    const scheduleHTML = `
		<div class="schedule-timeline">
			${schedule.map((item) => `
				<div class="schedule-item ${item.type}">
					<div class="schedule-time">${item.time}</div>
					<div class="schedule-content">
						<h4>${item.activity}</h4>
						<p>${item.description}</p>
						${item.benefit ? `<p style="font-size: 0.85rem; color: var(--accent-green); font-weight: 500; margin: 0.5rem 0 0 0;">💡 ${item.benefit}</p>` : ''}
						<span class="schedule-duration">⏱ ${item.duration} min</span>
					</div>
				</div>
			`).join('')}
		</div>
	`;

    display.innerHTML = scheduleHTML;
}

function loadScheduleIfExists() {
    const saved = localStorage.getItem(PLANNER_STORAGE_KEY);
    if (saved) {
        try {
            const schedule = JSON.parse(saved);
            displaySchedule(schedule);
            const selectedHabits = JSON.parse(localStorage.getItem(HABIT_NUMBERING_KEY) || '[]');
            displayScheduleSummary(schedule, Object.keys(selectedHabits).length);
        } catch (error) {
            console.error('Error parsing saved schedule:', error);
            localStorage.removeItem(PLANNER_STORAGE_KEY);
        }
    } else {
        const summary = document.getElementById('schedule-summary');
        const display = document.getElementById('schedule-display');
        if (summary) {
            summary.style.display = 'none';
        }
        if (display) {
            display.innerHTML = '<p style="text-align: center; color: var(--muted-gray);">No schedule yet. Complete the form above to generate your ideal day.</p>';
        }
    }
}

function setupExportButtons() {
    const exportBtn = document.getElementById('export-btn');
    const clearBtn = document.getElementById('clear-btn');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const saved = localStorage.getItem(PLANNER_STORAGE_KEY);
            if (saved) {
                try {
                    const schedule = JSON.parse(saved);
                    const text = generateTextExport(schedule);
                    downloadText(text, 'daily-schedule.txt');
                    showNotification('Schedule downloaded!', 'success');
                } catch (error) {
                    console.error('Error exporting schedule:', error);
                    showNotification('Error exporting schedule.', 'error');
                }
            } else {
                showNotification('Please generate a schedule first.', 'error');
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            if (confirm('Clear your schedule? This cannot be undone.')) {
                localStorage.removeItem(PLANNER_STORAGE_KEY);
                const display = document.getElementById('schedule-display');
                const summary = document.getElementById('schedule-summary');
                if (display) {
                    display.innerHTML = '<p style="text-align: center; color: var(--muted-gray);">No schedule yet. Complete the form above to generate your ideal day.</p>';
                }
                if (summary) {
                    summary.style.display = 'none';
                }
                showNotification('Schedule cleared', 'info');
            }
        });
    }
}

function generateTextExport(schedule) {
    let text = `HIGH PERFORMANCE DAILY SCHEDULE\nDate: ${new Date().toLocaleDateString()}\n\n`;
    text += `• Follow your numbered habits in sequence for optimal results\n`;
    text += `• Protect your deep work blocks from distractions\n`;
    text += `• Take regular movement breaks for sustained energy\n`;
    text += `• Adjust times as needed to fit your schedule\n`;
    text += `\n\nTips for success:\n`;
    schedule.forEach(item => {
        text += '─'.repeat(90) + '\n';
        text += `${'TIME'.padEnd(8)} ${'ACTIVITY'.padEnd(25)} ${'DURATION'.padEnd(10)} DESCRIPTION\n`;
        text += `${item.time.padEnd(8)} ${item.activity.padEnd(25)} ${item.duration}min${' '.repeat(6)} ${item.description}\n`;
        if (item.benefit) {
            text += `${' '.repeat(8)} 💡 ${item.benefit}\n`;
        }
    });

    return text;
}

function downloadText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
