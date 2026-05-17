/* ═══════════════════════════════════════════════
   CREATIVE TECH STUDIO — Main JS
   ═══════════════════════════════════════════════ */

// ── Custom Cursor ─────────────────────────────
const cursor = document.getElementById('cursor');
const follower = document.getElementById('cursorFollower');
if (cursor) {
  let mx = 0, my = 0, fx = 0, fy = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.transform = `translate(${mx}px,${my}px)`; });
  const animFollower = () => { fx += (mx - fx) * 0.12; fy += (my - fy) * 0.12; follower.style.transform = `translate(${fx}px,${fy}px)`; requestAnimationFrame(animFollower); };
  animFollower();
  document.querySelectorAll('a,button,.module-card,.pay-method,.course-card').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hover'); follower.classList.add('hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hover'); follower.classList.remove('hover'); });
  });
}

// ── Navbar Scroll ─────────────────────────────
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ── Hamburger / Mobile Menu ───────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ── Scroll Reveal ─────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ── Counter Animation ─────────────────────────
const counters = document.querySelectorAll('.stat-num[data-target]');
let counted = false;
const counterObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !counted) {
    counted = true;
    counters.forEach(counter => {
      const target = parseInt(counter.dataset.target);
      let current = 0;
      const step = target / 50;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { counter.textContent = target; clearInterval(timer); }
        else counter.textContent = Math.floor(current);
      }, 30);
    });
  }
}, { threshold: 0.5 });
const heroStats = document.querySelector('.hero-stats');
if (heroStats) counterObserver.observe(heroStats);

// ── Module Card Toggle ────────────────────────
document.querySelectorAll('.card-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    const topicsList = document.getElementById(targetId);
    const cardTopics = topicsList?.closest('.card-topics');
    if (!cardTopics) return;
    const isOpen = cardTopics.classList.contains('open');
    cardTopics.classList.toggle('open', !isOpen);
    btn.classList.toggle('active', !isOpen);
    btn.querySelector('span').textContent = isOpen ? 'View Topics' : 'Hide Topics';
  });
});

// ── Smooth Scroll for anchor links ───────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id === '#') return;
    const el = document.querySelector(id);
    if (el) { e.preventDefault(); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ── Toast Notification ────────────────────────
function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span><span class="toast-message">${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => { setTimeout(() => toast.classList.add('show'), 10); });
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 3500);
}
window.showToast = showToast;
