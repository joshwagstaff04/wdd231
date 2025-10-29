(() => {
const courses = [
{ code: 'WDD 130', name: 'Web Fundamentals', credits: 2, type: 'WDD', completed: true },
{ code: 'WDD 131', name: 'Dynamic Web Fundamentals', credits: 2, type: 'WDD', completed: true },
{ code: 'WDD 231', name: 'Web Frontend Development I', credits: 3, type: 'WDD', completed: false },
{ code: 'CSE 110', name: 'Intro to Programming', credits: 2, type: 'CSE', completed: true },
{ code: 'CSE 111', name: 'Programming with Functions', credits: 2, type: 'CSE', completed: true },
{ code: 'CSE 210', name: 'Programming with Classes', credits: 2, type: 'CSE', completed: true },
{ code: 'CSE 230', name: 'Discrete Math', credits: 3, type: 'CSE', completed: false }
];
const list = document.getElementById('course-list');
const creditEl = document.getElementById('credit-total');
const filterBtns = document.querySelectorAll('.filter-btn');


function render(items) {
if (!list) return;
list.innerHTML = '';
items.forEach(c => {
const card = document.createElement('article');
card.className = `course ${c.completed ? 'completed' : ''}`;
card.innerHTML = `
<div>
<div class="title"><strong>${c.code}</strong> — ${c.name}</div>
<div class="meta">${c.credits} credit${c.credits!==1?'s':''}</div>
</div>
<span class="badge ${c.type}">${c.type}</span>
`;
list.appendChild(card);
});
}


function updateCredits(items) {
const total = items.reduce((sum, c) => sum + Number(c.credits || 0), 0);
if (creditEl) creditEl.textContent = total;
}


function applyFilter(type) {
let items = courses;
if (type === 'WDD' || type === 'CSE') items = courses.filter(c => c.type === type);
render(items);
updateCredits(items);
}


filterBtns.forEach(btn => {
btn.addEventListener('click', () => {
filterBtns.forEach(b => b.classList.remove('is-active'));
btn.classList.add('is-active');
applyFilter(btn.dataset.filter);
});
});



applyFilter('all');
})();