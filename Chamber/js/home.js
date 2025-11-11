
const navToggle = document.getElementById('navToggle');
const siteNav = document.getElementById('siteNav');
navToggle.addEventListener('click', () => {
  const open = siteNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});
document.getElementById('year').textContent = new Date().getFullYear();
document.getElementById('lastModified').textContent = new Date(document.lastModified).toLocaleString();


const infoBanner = document.getElementById('infoBanner');
const dismissBanner = document.getElementById('dismissBanner');
const day = new Date().getDay(); 
if ((day === 1 || day === 2) && !localStorage.getItem('bannerDismissed')) {
  infoBanner.hidden = false;
}
dismissBanner?.addEventListener('click', () => {
  infoBanner.hidden = true;
  localStorage.setItem('bannerDismissed', '1');
});


const todayDate = document.getElementById('todayDate');
todayDate.textContent = new Date().toLocaleDateString(undefined, {
  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
});
const lastVisitEl = document.getElementById('lastVisit');
const now = Date.now();
const last = Number(localStorage.getItem('lastVisitTs') || 0);
if (last) {
  const diffDays = Math.floor((now - last) / 86400000);
  lastVisitEl.textContent = diffDays === 0 ? 'Earlier today' : `${diffDays} day(s) ago`;
}
localStorage.setItem('lastVisitTs', String(now));




const OWM_KEY = localStorage.getItem('owmKey') || 'YOUR_OPENWEATHERMAP_KEY';

const LAT = 40.9805;
const LON = -111.8874;

async function loadWeather(){
  const wxSummary = document.getElementById('wxSummary');
  const wxDetails = document.getElementById('wxDetails');
  const forecastList = document.getElementById('forecastList');

  if (!OWM_KEY || OWM_KEY === 'YOUR_OPENWEATHERMAP_KEY') {
    wxSummary.textContent = 'Set your OpenWeatherMap API key to see current conditions.';
    wxDetails.textContent = 'Tip: localStorage.setItem("owmKey", "YOUR_KEY")';
    forecastList.innerHTML = '<li>Add your API key to load the 3‑day forecast.</li>';
    return;
  }
  try {
    
    const curUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${OWM_KEY}&units=imperial`;
    const curRes = await fetch(curUrl);
    if (!curRes.ok) throw new Error('Weather HTTP ' + curRes.status);
    const cur = await curRes.json();
    const desc = cur.weather?.[0]?.description ?? '—';
    const t = Math.round(cur.main?.temp ?? 0);
    const hum = Math.round(cur.main?.humidity ?? 0);
    const ws = Math.round(cur.wind?.speed ?? 0);
    wxSummary.textContent = `${t}°F • ${desc}`;
    wxDetails.textContent = `Humidity ${hum}% • Wind ${ws} mph`;

    
    const fcUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${OWM_KEY}&units=imperial`;
    const fcRes = await fetch(fcUrl);
    if (!fcRes.ok) throw new Error('Forecast HTTP ' + fcRes.status);
    const fc = await fcRes.json();

    const byDay = new Map();
    for (const item of fc.list) {
      const dt = new Date(item.dt * 1000);
      
      const key = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      const dayId = dt.toISOString().slice(0,10);
      if (!byDay.has(dayId)) {
        byDay.set(dayId, { label: key, hi: -Infinity, lo: Infinity, icon: item.weather?.[0]?.icon, desc: item.weather?.[0]?.description });
      }
      const d = byDay.get(dayId);
      const temp = item.main?.temp ?? 0;
      d.hi = Math.max(d.hi, temp);
      d.lo = Math.min(d.lo, temp);
      
      const hour = dt.getHours();
      if (hour === 12) {
        d.icon = item.weather?.[0]?.icon;
        d.desc = item.weather?.[0]?.description;
      }
    }

    
    const todayId = new Date().toISOString().slice(0,10);
    const days = [...byDay.keys()].filter(id => id > todayId).sort().slice(0,3);
    forecastList.innerHTML = days.map(id => {
      const d = byDay.get(id);
      const hi = Math.round(d.hi);
      const lo = Math.round(d.lo);
      const icon = d.icon ? `https://openweathermap.org/img/wn/${d.icon}.png` : '';
      const alt = d.desc ? d.desc : 'weather icon';
      return `<li class="forecast-item">
        <span class="f-label">${d.label}</span>
        <span class="f-temps"><strong>${hi}°</strong>/<span class="muted">${lo}°</span></span>
        ${icon ? `<img src="${icon}" alt="${alt}" width="42" height="42" loading="lazy">` : ''}
      </li>`;
    }).join('');

  } catch (e) {
    console.error(e);
    wxSummary.textContent = 'Weather unavailable right now.';
    wxDetails.textContent = '';
  }
}
loadWeather();



async function loadSpotlights(){
  const grid = document.getElementById('spotGrid');
  try {
    const res = await fetch('data/members.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const members = await res.json();

    const silverGold = members.filter(m => Number(m.membershipLevel ?? 1) >= 2);
    if (silverGold.length === 0) {
      grid.innerHTML = '<p class="meta">No spotlight members yet.</p>';
      return;
    }

    const picks = shuffle(silverGold).slice(0, Math.min(3, Math.max(2, silverGold.length)));
    grid.innerHTML = picks.map(toSpotlightCard).join('');
  } catch (e) {
    console.error('Spotlights error:', e);
    grid.innerHTML = `<article class="card"><div class="body"><h3>Spotlights unavailable</h3><p class="meta">Please try again later.</p></div></article>`;
  }
}
loadSpotlights();

function toSpotlightCard(m){
  const imgSrc = m.image || 'images/favicon.svg';
  const site = m.website ? `<a href="${escapeAttr(m.website)}" target="_blank" rel="noopener">Visit Website</a>` : '';
  const phone = m.phone ? `<a href="tel:${digits(m.phone)}">${escapeHTML(m.phone)}</a>` : '';
  const tier = levelName(m.membershipLevel);
  return `
  <article class="card">
    <div class="media">
      <img src="${escapeAttr(imgSrc)}" alt="${escapeAttr(m.name)} logo" loading="lazy" width="640" height="360">
    </div>
    <div class="body">
      <h3>${escapeHTML(m.name)}</h3>
      <p class="meta">${escapeHTML(m.address ?? '')}</p>
      <p class="meta">Phone: ${phone || '—'}</p>
      <p class="meta">Tier: ${tier}</p>
      ${site}
    </div>
  </article>`;
}

function levelName(n){
  const lvl = Number(n ?? 1);
  return lvl >= 3 ? 'Gold' : (lvl === 2 ? 'Silver' : 'Member');
}
function shuffle(arr){
  const a = arr.slice();
  for (let i=a.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}
function escapeHTML(s=''){ return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
function escapeAttr(s=''){ return escapeHTML(s).replace(/"/g, '&quot;'); }
function digits(t=''){ return String(t).replace(/\D+/g,''); }
