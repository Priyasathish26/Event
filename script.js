'use strict';

/* ===== DATA ===== */
const FEST_START = new Date('2026-11-20T09:00:00');

const EVENTS = [
  { id: 1, title: 'Hackathon 24', cat: 'technical', day: 1, date: '20 Nov', time: '09:30', venue: 'CS Lab Block' },
  { id: 2, title: 'Robo Wars',    cat: 'technical', day: 2, date: '21 Nov', time: '11:00', venue: 'Engineering Arena' },
  { id: 3, title: 'Code Golf',    cat: 'technical', day: 3, date: '22 Nov', time: '10:00', venue: 'Seminar Hall B' },
  { id: 4, title: 'Battle of Bands', cat: 'cultural', day: 1, date: '20 Nov', time: '17:00', venue: 'Open Air Theatre' },
  { id: 5, title: 'Classical Dance Showcase', cat: 'cultural', day: 2, date: '21 Nov', time: '15:30', venue: 'Main Auditorium' },
  { id: 6, title: 'Street Play',  cat: 'cultural', day: 3, date: '22 Nov', time: '14:00', venue: 'Central Lawn' },
  { id: 7, title: 'Inter-Dept Football', cat: 'sports', day: 2, date: '21 Nov', time: '08:00', venue: 'College Ground' },
  { id: 8, title: 'Esports Finals', cat: 'sports', day: 3, date: '22 Nov', time: '16:00', venue: 'Student Centre' },
];

const GALLERY = [
  ['🎸', 'Battle of Bands 2025'], ['🤖', 'Robo Wars arena'], ['💃', 'Dance night'],
  ['🏆', 'Prize ceremony'],       ['💻', 'Hackathon crunch time'], ['🎭', 'Street play'],
  ['⚽', 'Football finals'],      ['🎤', 'Open mic'],
];

const ANNOUNCEMENTS = [
  'Hackathon problem statements are now live!',
  'Early-bird registrations close in 5 days.',
  'Battle of Bands auditions moved to Auditorium 2.',
  'Free shuttle from the metro station on all fest days.',
  'Esports bracket has been published.',
];

/* ===== HELPERS ===== */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const pad = n => String(n).padStart(2, '0');
const gradient = i => `linear-gradient(135deg, hsl(${(i * 47) % 360} 80% 45%), hsl(${(i * 47 + 60) % 360} 80% 35%))`;

/* ===== MOBILE NAV ===== */
const navToggle = $('.nav-toggle');
const navLinks = $('#nav-links');
const setNav = open => {
  navLinks.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', open);
};
navToggle.addEventListener('click', () => setNav(!navLinks.classList.contains('open')));
navLinks.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });

/* ===== COUNTDOWN ===== */
function updateCountdown() {
  const diff = Math.max(0, FEST_START - Date.now());
  const parts = {
    days: Math.floor(diff / 864e5),
    hours: Math.floor(diff / 36e5) % 24,
    minutes: Math.floor(diff / 6e4) % 60,
    seconds: Math.floor(diff / 1e3) % 60,
  };
  for (const [unit, val] of Object.entries(parts)) $(`[data-unit="${unit}"]`).textContent = pad(val);
}
updateCountdown();
setInterval(updateCountdown, 1000);

/* ===== EVENT LISTING + FILTER ===== */
const grid = $('#event-grid');
grid.innerHTML = EVENTS.map(ev => `
  <article class="card" data-cat="${ev.cat}">
    <span class="badge">${ev.cat}</span>
    <h3>${ev.title}</h3>
    <p class="muted">📅 ${ev.date} · 🕒 ${ev.time}<br>📍 ${ev.venue}</p>
    <button class="btn btn-small" data-register="${ev.id}">Register</button>
  </article>`).join('');

$$('.tab[data-filter]').forEach(tab => tab.addEventListener('click', () => {
  $$('.tab[data-filter]').forEach(t => {
    const on = t === tab;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on);
  });
  const f = tab.dataset.filter;
  $$('.card', grid).forEach(c => c.classList.toggle('hide', f !== 'all' && c.dataset.cat !== f));
}));

// "Register" on a card preselects the event in the form
const eventSelect = $('#event');
EVENTS.forEach(ev => eventSelect.add(new Option(ev.title, ev.title)));
grid.addEventListener('click', e => {
  const btn = e.target.closest('[data-register]');
  if (!btn) return;
  eventSelect.value = EVENTS.find(ev => ev.id === +btn.dataset.register).title;
  clearError(eventSelect);
  $('#register').scrollIntoView();
  $('#name').focus({ preventScroll: true });
});

/* ===== SCHEDULE (by day) ===== */
const dayTabs = $('#day-tabs');
const timeline = $('#timeline');
const days = [1, 2, 3];
dayTabs.innerHTML = days.map(d => `<button class="tab" role="tab" data-day="${d}">Day ${d}</button>`).join('');

function showDay(d) {
  $$('.tab', dayTabs).forEach(t => {
    const on = +t.dataset.day === d;
    t.classList.toggle('active', on);
    t.setAttribute('aria-selected', on);
  });
  timeline.innerHTML = EVENTS.filter(e => e.day === d)
    .sort((a, b) => a.time.localeCompare(b.time))
    .map(e => `<li><time>${e.time}</time><strong>${e.title}</strong> <span class="muted">· ${e.venue}</span></li>`)
    .join('');
}
dayTabs.addEventListener('click', e => { const t = e.target.closest('[data-day]'); if (t) showDay(+t.dataset.day); });
showDay(1);

/* ===== MODAL (gallery lightbox + success) ===== */
const modal = $('#modal');
const modalBody = $('#modal-body');
const openModal = html => { modalBody.innerHTML = html; modal.showModal(); };
$('.modal-close').addEventListener('click', () => modal.close());
modal.addEventListener('click', e => { if (e.target === modal) modal.close(); }); // backdrop click

/* ===== GALLERY ===== */
const galleryGrid = $('#gallery-grid');
galleryGrid.innerHTML = GALLERY.map(([icon, caption], i) =>
  `<button class="tile" style="background:${gradient(i)}" data-i="${i}" aria-label="Preview: ${caption}">${icon}</button>`).join('');
galleryGrid.addEventListener('click', e => {
  const tile = e.target.closest('.tile');
  if (!tile) return;
  const i = +tile.dataset.i;
  openModal(`<div class="lightbox-img" style="background:${gradient(i)}">${GALLERY[i][0]}</div>
             <h3 id="modal-title">${GALLERY[i][1]}</h3>`);
});

/* ===== FORM VALIDATION ===== */
const form = $('#reg-form');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ID_RE = /^[A-Za-z]{2,4}\d{4,8}$/;

// One rule per field: returns an error message or '' when valid
const rules = {
  name: v => (v.trim().length < 2 ? 'Please enter your full name (min 2 characters).' : ''),
  email: v => (!v.trim() ? 'Email is required.' : !EMAIL_RE.test(v) ? 'Enter a valid email like you@college.edu.' : ''),
  department: v => (v ? '' : 'Please select your department.'),
  studentId: v => (!v.trim() ? 'Student ID is required.' : !ID_RE.test(v.trim()) ? 'Use letters then digits, e.g. CS2026042.' : ''),
  event: v => (v ? '' : 'Please choose an event.'),
  size: v => (v ? '' : 'Please pick a T-shirt size.'),
};

function clearError(input) {
  input.closest('.field').classList.remove('invalid');
  $(`[data-error-for="${input.name}"]`).textContent = '';
}
function validateField(input) {
  const msg = rules[input.name](input.value);
  input.closest('.field').classList.toggle('invalid', !!msg);
  $(`[data-error-for="${input.name}"]`).textContent = msg;
  input.setAttribute('aria-invalid', !!msg);
  return !msg;
}

// Live feedback: validate on blur, clear as the user fixes it
$$('input, select', form).forEach(el => {
  el.addEventListener('blur', () => validateField(el));
  el.addEventListener('input', () => el.closest('.field').classList.contains('invalid') && validateField(el));
});

form.addEventListener('submit', e => {
  e.preventDefault();
  const fields = $$('input, select', form);
  const results = fields.map(validateField);       // run all so every error shows
  if (results.includes(false)) { fields[results.indexOf(false)].focus(); return; }

  const name = form.name.value.trim();
  openModal(`<h3 id="modal-title">🎉 You're in, ${name.replace(/</g, '&lt;')}!</h3>
             <p>Registered for <strong>${form.event.value}</strong>. A confirmation will be sent to your email. See you at ApexFest 2026!</p>`);
  form.reset();
});

/* ===== ANNOUNCEMENTS: ticker + live feed ===== */
$('#ticker-track').innerHTML = ANNOUNCEMENTS.map(a => `<span>📢 ${a}</span>`).join('');
const feed = $('#feed');
let feedIndex = 0;

function pushUpdate() {
  const card = document.createElement('article');
  card.className = 'card feed-card';
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  card.innerHTML = `<span class="badge">${time}</span><p>${ANNOUNCEMENTS[feedIndex++ % ANNOUNCEMENTS.length]}</p>`;
  feed.prepend(card);
  while (feed.children.length > 3) feed.lastElementChild.remove(); // keep the latest 3
}
pushUpdate();
setInterval(pushUpdate, 8000);

/* ===== MAP PLACEHOLDER (lazy-load iframe on click) ===== */
$('#load-map').addEventListener('click', () => {
  $('#map').innerHTML = '<iframe title="Campus map" loading="lazy" src="https://www.google.com/maps?q=college+campus&output=embed"></iframe>';
});
