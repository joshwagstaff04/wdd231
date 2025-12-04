const directoryEl = document.getElementById('directory');
const gridBtn = document.getElementById('gridBtn');
const listBtn = document.getElementById('listBtn');
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');

document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('lastModified').textContent = new Date(document.lastModified).toLocaleString();

navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});


const savedLayout = localStorage.getItem('directoryLayout') || 'grid';
applyLayout(savedLayout);

gridBtn.addEventListener('click', () => setLayout('grid'));
listBtn.addEventListener('click', () => setLayout('list'));

function setLayout(mode){
  localStorage.setItem('directoryLayout', mode);
  applyLayout(mode);
}

function applyLayout(mode){
  directoryEl.classList.remove('grid','list');
  directoryEl.classList.add(mode);
  gridBtn.classList.toggle('active', mode === 'grid');
  listBtn.classList.toggle('active', mode === 'list');
  gridBtn.setAttribute('aria-pressed', String(mode === 'grid'));
  listBtn.setAttribute('aria-pressed', String(mode === 'list'));
}


(async function loadMembers(){
  try {
    const res = await fetch('data/members.json');
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    const members = await res.json();

   
    members.sort((a, b) => (b.membershipLevel ?? 1) - (a.membershipLevel ?? 1));

    const frag = document.createDocumentFragment();
    for(const m of members){
      frag.appendChild(renderCard(m));
    }
    directoryEl.innerHTML = '';
    directoryEl.appendChild(frag);
  } catch (err) {
    console.error('Failed to load members:', err);
    directoryEl.innerHTML = `<p role="alert">Unable to load directory right now. Please refresh.</p>`;
  }
})();

function renderCard(m){
  const card = document.createElement('article');
  card.className = 'card';

  const imgSrc = m.image ? escapeAttr(m.image) : 'images/favicon.svg';
  const websiteHTML = m.website
    ? `<a class="website" href="${escapeAttr(m.website)}" target="_blank" rel="noopener">${escapeHTML(m.website)}</a>`
    : '';

  card.innerHTML = `
    <div class="media">
      <img src="${imgSrc}" alt="${escapeAttr(m.name)} logo" loading="lazy" width="640" height="360" />
    </div>
    <div class="body">
      <h3 class="name">${escapeHTML(m.name)}</h3>
      <span class="meta address">${escapeHTML(m.address)}</span>
      <span class="meta phone"><a href="tel:${digits(m.phone)}">${escapeHTML(m.phone)}</a></span>
      <span class="link">${websiteHTML}</span>
    </div>
  `;
  return card;
}

function escapeHTML(s=''){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s=''){ return escapeHTML(s).replace(/"/g, '&quot;'); }
function digits(t=''){ return String(t).replace(/\D+/g,''); }
